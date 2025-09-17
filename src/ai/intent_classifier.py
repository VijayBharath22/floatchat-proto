import re
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class IntentClassifier:
    """Classify user intents for ocean data queries"""
    
    def __init__(self):
        self.intent_patterns = {
            'temperature_query': [
                r'temperature', r'temp', r'warm', r'cold', r'heat',
                r'thermal', r'°c', r'celsius', r'warming', r'cooling'
            ],
            'salinity_query': [
                r'salinity', r'salt', r'fresh', r'brackish', r'psu',
                r'conductivity', r'density'
            ],
            'location_query': [
                r'near', r'location', r'where', r'find', r'float',
                r'coordinates', r'latitude', r'longitude', r'region'
            ],
            'time_query': [
                r'when', r'time', r'date', r'year', r'month',
                r'recent', r'latest', r'historical', r'trend'
            ],
            'comparison_query': [
                r'compare', r'versus', r'vs', r'difference', r'between',
                r'contrast', r'relative', r'ratio'
            ],
            'anomaly_query': [
                r'anomaly', r'unusual', r'extreme', r'outlier',
                r'abnormal', r'deviation', r'exceptional'
            ],
            'depth_query': [
                r'depth', r'deep', r'surface', r'bottom', r'layer',
                r'profile', r'vertical', r'column'
            ],
            'ocean_region': [
                r'indian ocean', r'pacific ocean', r'atlantic ocean',
                r'arabian sea', r'bay of bengal', r'equatorial',
                r'southern ocean', r'arctic ocean'
            ]
        }
        
        self.user_mode_patterns = {
            'scientist': [
                r'analysis', r'statistical', r'correlation', r'hypothesis',
                r'research', r'data', r'parameters', r'measurements'
            ],
            'student': [
                r'explain', r'what is', r'how does', r'why', r'learn',
                r'understand', r'teach', r'educational'
            ],
            'fisherman': [
                r'fishing', r'catch', r'fish', r'season', r'weather',
                r'conditions', r'forecast', r'prediction'
            ]
        }
    
    def classify_intent(self, query: str) -> Dict[str, any]:
        """Classify the intent of a user query"""
        query_lower = query.lower()
        
        # Detect primary intent
        intent_scores = {}
        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, query_lower))
                score += matches
            intent_scores[intent] = score
        
        # Get primary intent
        primary_intent = max(intent_scores, key=intent_scores.get) if intent_scores else 'general_query'
        
        # Detect user mode
        user_mode = self._detect_user_mode(query_lower)
        
        # Extract entities
        entities = self._extract_entities(query)
        
        # Determine complexity level
        complexity = self._assess_complexity(query)
        
        return {
            'primary_intent': primary_intent,
            'intent_scores': intent_scores,
            'user_mode': user_mode,
            'entities': entities,
            'complexity': complexity,
            'confidence': max(intent_scores.values()) / sum(intent_scores.values()) if sum(intent_scores.values()) > 0 else 0
        }
    
    def _detect_user_mode(self, query: str) -> str:
        """Detect the user mode based on query language"""
        mode_scores = {}
        
        for mode, patterns in self.user_mode_patterns.items():
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, query))
                score += matches
            mode_scores[mode] = score
        
        # Default to scientist mode if no clear indication
        return max(mode_scores, key=mode_scores.get) if max(mode_scores.values()) > 0 else 'scientist'
    
    def _extract_entities(self, query: str) -> Dict[str, List[str]]:
        """Extract entities from the query"""
        entities = {
            'locations': [],
            'time_periods': [],
            'parameters': [],
            'values': [],
            'ocean_regions': []
        }
        
        # Extract locations (latitude/longitude patterns)
        lat_lon_pattern = r'(\d+(?:\.\d+)?)[°\s]*[NS]?\s*[,,\s]*(\d+(?:\.\d+)?)[°\s]*[EW]?'
        lat_lon_matches = re.findall(lat_lon_pattern, query)
        entities['locations'] = [f"{lat}°N, {lon}°E" for lat, lon in lat_lon_matches]
        
        # Extract time periods
        time_patterns = [
            r'\d{4}',  # Years
            r'(january|february|march|april|may|june|july|august|september|october|november|december)',
            r'(last|past|recent)\s+(\d+)\s+(days?|months?|years?)',
            r'(this|next)\s+(year|month|week)'
        ]
        
        for pattern in time_patterns:
            matches = re.findall(pattern, query.lower())
            entities['time_periods'].extend(matches)
        
        # Extract ocean regions
        for region in ['indian ocean', 'pacific ocean', 'atlantic ocean', 'arabian sea', 'bay of bengal']:
            if region in query.lower():
                entities['ocean_regions'].append(region)
        
        # Extract parameters
        param_patterns = [
            r'temperature', r'salinity', r'oxygen', r'nitrate', r'ph',
            r'chlorophyll', r'pressure', r'depth'
        ]
        
        for pattern in param_patterns:
            if re.search(pattern, query.lower()):
                entities['parameters'].append(pattern)
        
        # Extract numerical values
        value_pattern = r'\d+(?:\.\d+)?'
        entities['values'] = re.findall(value_pattern, query)
        
        return entities
    
    def _assess_complexity(self, query: str) -> str:
        """Assess the complexity level of the query"""
        query_lower = query.lower()
        
        # Simple queries
        simple_indicators = ['show', 'what', 'where', 'when', 'how many']
        if any(indicator in query_lower for indicator in simple_indicators):
            if len(query.split()) < 10:
                return 'simple'
        
        # Complex queries
        complex_indicators = [
            'compare', 'analyze', 'correlation', 'trend', 'anomaly',
            'statistical', 'regression', 'clustering', 'prediction'
        ]
        if any(indicator in query_lower for indicator in complex_indicators):
            return 'complex'
        
        # Medium complexity
        return 'medium'
    
    def get_response_strategy(self, intent_result: Dict) -> Dict[str, any]:
        """Get response strategy based on intent classification"""
        primary_intent = intent_result['primary_intent']
        user_mode = intent_result['user_mode']
        complexity = intent_result['complexity']
        
        strategies = {
            'scientist': {
                'simple': {
                    'response_style': 'technical',
                    'include_raw_data': True,
                    'visualization_type': 'detailed_plots',
                    'export_formats': ['csv', 'netcdf']
                },
                'medium': {
                    'response_style': 'analytical',
                    'include_raw_data': True,
                    'visualization_type': 'advanced_plots',
                    'export_formats': ['csv', 'netcdf', 'json']
                },
                'complex': {
                    'response_style': 'research_grade',
                    'include_raw_data': True,
                    'visualization_type': 'publication_quality',
                    'export_formats': ['csv', 'netcdf', 'json', 'ascii']
                }
            },
            'student': {
                'simple': {
                    'response_style': 'educational',
                    'include_raw_data': False,
                    'visualization_type': 'colorful_infographics',
                    'export_formats': ['csv']
                },
                'medium': {
                    'response_style': 'explanatory',
                    'include_raw_data': False,
                    'visualization_type': 'interactive_plots',
                    'export_formats': ['csv', 'pdf']
                },
                'complex': {
                    'response_style': 'detailed_explanation',
                    'include_raw_data': True,
                    'visualization_type': 'educational_advanced',
                    'export_formats': ['csv', 'pdf']
                }
            },
            'fisherman': {
                'simple': {
                    'response_style': 'practical',
                    'include_raw_data': False,
                    'visualization_type': 'simple_indicators',
                    'export_formats': []
                },
                'medium': {
                    'response_style': 'forecast_focused',
                    'include_raw_data': False,
                    'visualization_type': 'weather_style',
                    'export_formats': ['pdf']
                },
                'complex': {
                    'response_style': 'comprehensive_forecast',
                    'include_raw_data': False,
                    'visualization_type': 'detailed_forecast',
                    'export_formats': ['pdf', 'csv']
                }
            }
        }
        
        return strategies.get(user_mode, {}).get(complexity, strategies['scientist']['simple'])


