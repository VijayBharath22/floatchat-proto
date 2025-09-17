import xarray as xr
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import gsw
import logging

logger = logging.getLogger(__name__)

class ArgoNetCDFProcessor:
    """Process ARGO NetCDF files and extract structured data"""
    
    def __init__(self):
        self.quality_flags = {
            1: 'good',
            2: 'probably_good', 
            3: 'probably_bad',
            4: 'bad',
            5: 'changed',
            8: 'estimated',
            9: 'missing'
        }
    
    def process_argo_file(self, file_path: str) -> Dict:
        """Process single ARGO NetCDF file"""
        try:
            # Open dataset with proper time decoding
            ds = xr.open_dataset(file_path, decode_times=False)
            
            # Extract basic profile information
            profile_data = {
                'platform_number': self._extract_platform_number(ds),
                'cycle_number': int(ds.CYCLE_NUMBER.values[0]) if 'CYCLE_NUMBER' in ds else 0,
                'latitude': float(ds.LATITUDE.values[0]),
                'longitude': float(ds.LONGITUDE.values[0]),
                'measurement_date': self._extract_date(ds),
                'pressure_levels': ds.PRES.values[0].tolist(),
                'temperature': ds.TEMP.values[0].tolist(),
                'salinity': ds.PSAL.values[0].tolist(),
                'temp_qc': ds.TEMP_QC.values[0].tolist() if 'TEMP_QC' in ds else [],
                'psal_qc': ds.PSAL_QC.values[0].tolist() if 'PSAL_QC' in ds else [],
            }
            
            # Calculate derived parameters
            derived_params = self._calculate_derived_parameters(profile_data)
            profile_data.update(derived_params)
            
            # Determine ocean region
            profile_data['ocean_region'] = self._determine_ocean_region(
                profile_data['latitude'], profile_data['longitude']
            )
            
            # Clean data
            profile_data = self._clean_profile_data(profile_data)
            
            return profile_data
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
            return None
    
    def _extract_platform_number(self, ds: xr.Dataset) -> str:
        """Extract platform number from dataset"""
        if 'PLATFORM_NUMBER' in ds:
            return str(ds.PLATFORM_NUMBER.values[0]).strip()
        return "UNKNOWN"
    
    def _extract_date(self, ds: xr.Dataset) -> pd.Timestamp:
        """Extract measurement date from dataset"""
        if 'JULD' in ds:
            # JULD is days since 1950-01-01
            reference_date = pd.Timestamp('1950-01-01')
            days_since = float(ds.JULD.values[0])
            return reference_date + pd.Timedelta(days=days_since)
        return pd.Timestamp.now()
    
    def _calculate_derived_parameters(self, profile_data: Dict) -> Dict:
        """Calculate derived oceanographic parameters"""
        try:
            temp = np.array(profile_data['temperature'])
            sal = np.array(profile_data['salinity'])
            pres = np.array(profile_data['pressure_levels'])
            lat = profile_data['latitude']
            lon = profile_data['longitude']
            
            # Remove NaN values for calculations
            valid_mask = ~(np.isnan(temp) | np.isnan(sal) | np.isnan(pres))
            
            if np.sum(valid_mask) < 3:
                return {'max_depth': 0, 'mixed_layer_depth': 0}
            
            temp_clean = temp[valid_mask]
            sal_clean = sal[valid_mask]
            pres_clean = pres[valid_mask]
            
            # Calculate absolute salinity and conservative temperature
            SA = gsw.SA_from_SP(sal_clean, pres_clean, lon, lat)
            CT = gsw.CT_from_t(SA, temp_clean, pres_clean)
            
            # Calculate potential density
            sigma0 = gsw.sigma0(SA, CT)
            
            # Calculate mixed layer depth (simple gradient method)
            mld = self._calculate_mld(temp_clean, pres_clean)
            
            return {
                'absolute_salinity': SA.tolist(),
                'conservative_temperature': CT.tolist(),
                'potential_density': sigma0.tolist(),
                'mixed_layer_depth': float(mld),
                'max_depth': float(np.max(pres_clean))
            }
            
        except Exception as e:
            logger.warning(f"Error calculating derived parameters: {e}")
            return {'max_depth': 0, 'mixed_layer_depth': 0}
    
    def _calculate_mld(self, temperature: np.ndarray, pressure: np.ndarray, 
                      threshold: float = 0.2) -> float:
        """Calculate mixed layer depth using temperature criterion"""
        if len(temperature) < 2:
            return 0.0
        
        surface_temp = temperature[0]
        
        for i, (temp, depth) in enumerate(zip(temperature, pressure)):
            if abs(temp - surface_temp) > threshold:
                return depth
        
        return pressure[-1] if len(pressure) > 0 else 0.0
    
    def _determine_ocean_region(self, lat: float, lon: float) -> str:
        """Determine ocean region based on coordinates"""
        # Convert longitude to 0-360 if needed
        if lon < 0:
            lon += 360
            
        if lat >= -60 and lat <= 30 and lon >= 20 and lon <= 120:
            return 'Indian Ocean'
        elif ((lon >= 120 and lon <= 290) or (lon >= 290 and lon <= 360) or 
              (lon >= 0 and lon <= 70)):
            return 'Pacific Ocean'
        elif lon >= 290 or lon <= 20:
            return 'Atlantic Ocean'
        elif lat < -60:
            return 'Southern Ocean'
        elif lat > 66:
            return 'Arctic Ocean'
        else:
            return 'Unknown'
    
    def _clean_profile_data(self, profile_data: Dict) -> Dict:
        """Clean and validate profile data"""
        # Replace NaN values with None for JSON serialization
        for key, value in profile_data.items():
            if isinstance(value, list):
                profile_data[key] = [None if pd.isna(x) else x for x in value]
            elif pd.isna(value):
                profile_data[key] = None
        
        return profile_data

