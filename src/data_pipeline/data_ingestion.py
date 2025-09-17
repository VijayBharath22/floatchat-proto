import os
import glob
from typing import List, Dict
import logging
from .netcdf_processor import ArgoNetCDFProcessor
from .vector_db import ArgoVectorDatabase
from ..database.connection import DatabaseClient
from ..database.models import ArgoProfile
from sqlalchemy.orm import sessionmaker
from ..config import settings

logger = logging.getLogger(__name__)

class DataIngestionPipeline:
    """Main data ingestion pipeline for ARGO data"""
    
    def __init__(self):
        self.processor = ArgoNetCDFProcessor()
        self.vector_db = ArgoVectorDatabase()
        self.db_client = DatabaseClient()
        self.engine = self.db_client.engine
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def ingest_directory(self, directory_path: str) -> Dict:
        """Ingest all NetCDF files from a directory"""
        try:
            # Find all NetCDF files
            netcdf_files = glob.glob(os.path.join(directory_path, "*.nc"))
            
            if not netcdf_files:
                logger.warning(f"No NetCDF files found in {directory_path}")
                return {"processed": 0, "errors": 0, "files": []}
            
            processed_count = 0
            error_count = 0
            processed_files = []
            
            for file_path in netcdf_files:
                try:
                    result = self.ingest_single_file(file_path)
                    if result:
                        processed_count += 1
                        processed_files.append(file_path)
                    else:
                        error_count += 1
                        
                except Exception as e:
                    logger.error(f"Error processing {file_path}: {e}")
                    error_count += 1
            
            return {
                "processed": processed_count,
                "errors": error_count,
                "files": processed_files
            }
            
        except Exception as e:
            logger.error(f"Error ingesting directory {directory_path}: {e}")
            return {"processed": 0, "errors": 1, "files": []}
    
    def ingest_single_file(self, file_path: str) -> bool:
        """Ingest a single NetCDF file"""
        try:
            # Process NetCDF file
            profile_data = self.processor.process_argo_file(file_path)
            
            if not profile_data:
                logger.warning(f"Failed to process {file_path}")
                return False
            
            # Add to vector database
            vector_success = self.vector_db.add_profile(profile_data)
            
            # Add to SQL database
            sql_success = self._save_to_database(profile_data)
            
            if vector_success and sql_success:
                logger.info(f"Successfully ingested {file_path}")
                return True
            else:
                logger.warning(f"Partial success for {file_path}")
                return False
                
        except Exception as e:
            logger.error(f"Error ingesting {file_path}: {e}")
            return False
    
    def _save_to_database(self, profile_data: Dict) -> bool:
        """Save profile data to SQL database"""
        try:
            db = self.SessionLocal()
            
            # Create ArgoProfile instance
            argo_profile = ArgoProfile(
                platform_number=profile_data['platform_number'],
                cycle_number=profile_data['cycle_number'],
                latitude=profile_data['latitude'],
                longitude=profile_data['longitude'],
                measurement_date=profile_data['measurement_date'],
                pressure_levels=profile_data['pressure_levels'],
                temperature=profile_data['temperature'],
                salinity=profile_data['salinity'],
                temp_qc=profile_data.get('temp_qc', []),
                psal_qc=profile_data.get('psal_qc', []),
                mixed_layer_depth=profile_data.get('mixed_layer_depth'),
                max_depth=profile_data.get('max_depth'),
                ocean_region=profile_data.get('ocean_region'),
                data_source=profile_data.get('data_source', 'ARGO'),
                metadata=profile_data.get('metadata', {})
            )
            
            db.add(argo_profile)
            db.commit()
            db.close()
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving to database: {e}")
            return False
    
    def get_ingestion_stats(self) -> Dict:
        """Get statistics about ingested data"""
        try:
            # Get SQL database stats
            db = self.SessionLocal()
            total_profiles = db.query(ArgoProfile).count()
            
            # Get vector database stats
            vector_stats = self.vector_db.get_collection_stats()
            
            # Get regional distribution
            regional_stats = db.query(
                ArgoProfile.ocean_region,
                db.func.count(ArgoProfile.profile_id)
            ).group_by(ArgoProfile.ocean_region).all()
            
            db.close()
            
            return {
                "total_profiles": total_profiles,
                "vector_db_profiles": vector_stats.get('total_profiles', 0),
                "regional_distribution": dict(regional_stats),
                "embedding_model": vector_stats.get('embedding_model', 'unknown')
            }
            
        except Exception as e:
            logger.error(f"Error getting ingestion stats: {e}")
            return {"total_profiles": 0, "vector_db_profiles": 0}
    
    def cleanup_duplicates(self) -> int:
        """Remove duplicate profiles based on platform_number and cycle_number"""
        try:
            db = self.SessionLocal()
            
            # Find duplicates
            duplicates = db.query(
                ArgoProfile.platform_number,
                ArgoProfile.cycle_number,
                db.func.count(ArgoProfile.profile_id)
            ).group_by(
                ArgoProfile.platform_number,
                ArgoProfile.cycle_number
            ).having(
                db.func.count(ArgoProfile.profile_id) > 1
            ).all()
            
            removed_count = 0
            
            for platform, cycle, count in duplicates:
                # Keep the most recent profile, remove others
                profiles = db.query(ArgoProfile).filter(
                    ArgoProfile.platform_number == platform,
                    ArgoProfile.cycle_number == cycle
                ).order_by(ArgoProfile.measurement_date.desc()).all()
                
                # Remove all but the first (most recent)
                for profile in profiles[1:]:
                    db.delete(profile)
                    removed_count += 1
            
            db.commit()
            db.close()
            
            logger.info(f"Removed {removed_count} duplicate profiles")
            return removed_count
            
        except Exception as e:
            logger.error(f"Error cleaning up duplicates: {e}")
            return 0

