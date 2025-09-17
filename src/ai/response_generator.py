from typing import Dict, List, Any
import logging
from .intent_classifier import IntentClassifier

logger = logging.getLogger(__name__)

class ResponseGenerator:
    """Generate contextual responses based on user intent and mode"""
    
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.response_templates = self._load_response_templates()
    
    def _load_response_templates(self) -> Dict[str, Dict[str, str]]:
        """Load response templates for different user modes and intents"""
        return {
            'scientist': {
                'temperature_query': "Based on the ARGO data analysis, here are the temperature findings:",
                'salinity_query': "Salinity analysis from the oceanographic data reveals:",
                'location_query': "ARGO float locations and measurements:",
                'comparison_query': "Comparative analysis of the requested parameters:",
                'anomaly_query': "Anomaly detection results from the dataset:",
                'general_query': "Scientific analysis of the ARGO oceanographic data:"
            },
            'student': {
                'temperature_query': "Let me explain ocean temperature in simple terms! 🌡️",
                'salinity_query': "Here's what salinity means for our oceans! 🌊",
                'location_query': "Let's explore where these ocean measurements come from! 🗺️",
                'comparison_query': "Let's compare these ocean features! ⚖️",
                'anomaly_query': "Something unusual is happening in the ocean! 🤔",
                'general_query': "Let's learn about the ocean together! 📚"
            },
            'fisherman': {
                'temperature_query': "Here's what the water temperature means for fishing! 🎣",
                'salinity_query': "How salt levels affect your catch! 🐟",
                'location_query': "Best fishing spots based on ocean data! 🎯",
                'comparison_query': "Comparing fishing conditions! 📊",
                'anomaly_query': "Unusual ocean conditions that might affect fishing! ⚠️",
                'general_query': "Ocean conditions for your fishing trip! 🌊"
            }
        }
    
    def generate_response(self, query: str, data_results: Dict, visualization_data: Dict = None) -> Dict[str, Any]:
        """Generate a complete response based on query and results"""
        
        # Classify intent
        intent_result = self.intent_classifier.classify_intent(query)
        user_mode = intent_result['user_mode']
        primary_intent = intent_result['primary_intent']
        
        # Get response strategy
        strategy = self.intent_classifier.get_response_strategy(intent_result)
        
        # Generate base response
        base_response = self._generate_base_response(
            query, data_results, intent_result, strategy
        )
        
        # Add contextual information
        contextual_info = self._add_contextual_info(
            data_results, user_mode, primary_intent
        )
        
        # Generate visualization suggestions
        viz_suggestions = self._suggest_visualizations(
            primary_intent, data_results, user_mode
        )
        
        # Add export options
        export_options = self._get_export_options(strategy)
        
        return {
            'response_text': base_response,
            'contextual_info': contextual_info,
            'visualization_suggestions': viz_suggestions,
            'export_options': export_options,
            'user_mode': user_mode,
            'intent': primary_intent,
            'confidence': intent_result['confidence'],
            'raw_data': data_results.get('results', []) if strategy['include_raw_data'] else None
        }
    
    def _generate_base_response(self, query: str, data_results: Dict, 
                              intent_result: Dict, strategy: Dict) -> str:
        """Generate the base response text"""
        
        user_mode = intent_result['user_mode']
        primary_intent = intent_result['primary_intent']
        
        # Get template
        template = self.response_templates.get(user_mode, {}).get(
            primary_intent, 
            self.response_templates['scientist']['general_query']
        )
        
        # Extract key information from results
        results = data_results.get('results', [])
        if not results:
            return f"{template} Unfortunately, no data was found for your query. Try adjusting your search parameters."
        
        # Generate mode-specific response
        if user_mode == 'scientist':
            return self._generate_scientist_response(template, results, data_results)
        elif user_mode == 'student':
            return self._generate_student_response(template, results, data_results)
        elif user_mode == 'fisherman':
            return self._generate_fisherman_response(template, results, data_results)
        else:
            return self._generate_scientist_response(template, results, data_results)
    
    def _generate_scientist_response(self, template: str, results: List[Dict], 
                                   data_results: Dict) -> str:
        """Generate response for scientist mode"""
        
        response = template + "\n\n"
        
        if len(results) == 1:
            result = results[0]
            response += f"**Single Profile Analysis:**\n"
            response += f"- Platform: {result.get('platform_number', 'N/A')}\n"
            response += f"- Location: {result.get('latitude', 'N/A')}°N, {result.get('longitude', 'N/A')}°E\n"
            response += f"- Date: {result.get('measurement_date', 'N/A')}\n"
            response += f"- Ocean Region: {result.get('ocean_region', 'N/A')}\n"
            
            if 'temperature' in result:
                temp_data = [x for x in result['temperature'] if x is not None]
                if temp_data:
                    response += f"- Temperature Range: {min(temp_data):.2f}°C to {max(temp_data):.2f}°C\n"
                    response += f"- Surface Temperature: {temp_data[0]:.2f}°C\n"
            
            if 'salinity' in result:
                sal_data = [x for x in result['salinity'] if x is not None]
                if sal_data:
                    response += f"- Salinity Range: {min(sal_data):.2f} to {max(sal_data):.2f} PSU\n"
                    response += f"- Surface Salinity: {sal_data[0]:.2f} PSU\n"
        
        else:
            response += f"**Statistical Summary ({len(results)} profiles):**\n"
            
            # Calculate statistics
            all_temps = []
            all_sals = []
            regions = {}
            
            for result in results:
                if 'temperature' in result and result['temperature']:
                    temp_data = [x for x in result['temperature'] if x is not None]
                    if temp_data:
                        all_temps.append(temp_data[0])  # Surface temperature
                
                if 'salinity' in result and result['salinity']:
                    sal_data = [x for x in result['salinity'] if x is not None]
                    if sal_data:
                        all_sals.append(sal_data[0])  # Surface salinity
                
                region = result.get('ocean_region', 'Unknown')
                regions[region] = regions.get(region, 0) + 1
            
            if all_temps:
                response += f"- Average Surface Temperature: {sum(all_temps)/len(all_temps):.2f}°C\n"
                response += f"- Temperature Range: {min(all_temps):.2f}°C to {max(all_temps):.2f}°C\n"
            
            if all_sals:
                response += f"- Average Surface Salinity: {sum(all_sals)/len(all_sals):.2f} PSU\n"
                response += f"- Salinity Range: {min(all_sals):.2f} to {max(all_sals):.2f} PSU\n"
            
            response += f"- Regional Distribution: {dict(regions)}\n"
        
        return response
    
    def _generate_student_response(self, template: str, results: List[Dict], 
                                 data_results: Dict) -> str:
        """Generate response for student mode"""
        
        response = template + "\n\n"
        
        if len(results) == 1:
            result = results[0]
            response += f"**What we found:**\n"
            response += f"📍 This data comes from ARGO float {result.get('platform_number', 'N/A')}\n"
            response += f"🌍 Located at {result.get('latitude', 'N/A')}°N, {result.get('longitude', 'N/A')}°E\n"
            response += f"📅 Measured on {result.get('measurement_date', 'N/A')}\n"
            response += f"🌊 In the {result.get('ocean_region', 'N/A')}\n\n"
            
            if 'temperature' in result:
                temp_data = [x for x in result['temperature'] if x is not None]
                if temp_data:
                    response += f"🌡️ **Temperature:** The water temperature at the surface is {temp_data[0]:.1f}°C. "
                    if temp_data[0] > 25:
                        response += "That's quite warm! Perfect for swimming! 🏊‍♀️\n"
                    elif temp_data[0] > 15:
                        response += "That's a comfortable temperature for most sea life! 🐠\n"
                    else:
                        response += "That's quite cold! Only hardy sea creatures can survive here! 🐧\n"
            
            if 'salinity' in result:
                sal_data = [x for x in result['salinity'] if x is not None]
                if sal_data:
                    response += f"🧂 **Salinity:** The salt level is {sal_data[0]:.1f} PSU. "
                    if sal_data[0] > 35:
                        response += "That's very salty water! 🌊\n"
                    elif sal_data[0] > 30:
                        response += "That's normal ocean salinity! 🐟\n"
                    else:
                        response += "That's less salty - maybe near a river! 🏞️\n"
        
        else:
            response += f"**We found {len(results)} ocean measurements!**\n\n"
            response += "Here's what they tell us:\n"
            
            # Calculate simple statistics
            all_temps = []
            all_sals = []
            
            for result in results:
                if 'temperature' in result and result['temperature']:
                    temp_data = [x for x in result['temperature'] if x is not None]
                    if temp_data:
                        all_temps.append(temp_data[0])
                
                if 'salinity' in result and result['salinity']:
                    sal_data = [x for x in result['salinity'] if x is not None]
                    if sal_data:
                        all_sals.append(sal_data[0])
            
            if all_temps:
                avg_temp = sum(all_temps) / len(all_temps)
                response += f"🌡️ **Average temperature:** {avg_temp:.1f}°C\n"
                if avg_temp > 25:
                    response += "   → This is a warm ocean region! 🌴\n"
                elif avg_temp > 15:
                    response += "   → This is a temperate ocean region! 🌊\n"
                else:
                    response += "   → This is a cold ocean region! ❄️\n"
            
            if all_sals:
                avg_sal = sum(all_sals) / len(all_sals)
                response += f"🧂 **Average salinity:** {avg_sal:.1f} PSU\n"
                response += "   → This is typical ocean saltiness! 🐠\n"
        
        return response
    
    def _generate_fisherman_response(self, template: str, results: List[Dict], 
                                   data_results: Dict) -> str:
        """Generate response for fisherman mode"""
        
        response = template + "\n\n"
        
        if len(results) == 1:
            result = results[0]
            response += f"**Fishing Conditions Report:**\n"
            response += f"🎣 Location: {result.get('latitude', 'N/A')}°N, {result.get('longitude', 'N/A')}°E\n"
            response += f"📅 Date: {result.get('measurement_date', 'N/A')}\n"
            response += f"🌊 Region: {result.get('ocean_region', 'N/A')}\n\n"
            
            if 'temperature' in result:
                temp_data = [x for x in result['temperature'] if x is not None]
                if temp_data:
                    surface_temp = temp_data[0]
                    response += f"🌡️ **Water Temperature:** {surface_temp:.1f}°C\n"
                    if surface_temp > 28:
                        response += "   → Very warm water - good for tropical fish! 🐠\n"
                    elif surface_temp > 22:
                        response += "   → Good fishing temperature! 🎣\n"
                    elif surface_temp > 15:
                        response += "   → Cool water - try deeper fishing! 🐟\n"
                    else:
                        response += "   → Cold water - fish may be less active! ❄️\n"
            
            if 'salinity' in result:
                sal_data = [x for x in result['salinity'] if x is not None]
                if sal_data:
                    surface_sal = sal_data[0]
                    response += f"🧂 **Water Salinity:** {surface_sal:.1f} PSU\n"
                    if surface_sal > 35:
                        response += "   → High salinity - good for saltwater fish! 🌊\n"
                    elif surface_sal > 30:
                        response += "   → Normal ocean conditions! 🐟\n"
                    else:
                        response += "   → Lower salinity - check for freshwater influence! 🏞️\n"
        
        else:
            response += f"**Regional Fishing Conditions ({len(results)} locations):**\n\n"
            
            # Analyze conditions
            all_temps = []
            all_sals = []
            
            for result in results:
                if 'temperature' in result and result['temperature']:
                    temp_data = [x for x in result['temperature'] if x is not None]
                    if temp_data:
                        all_temps.append(temp_data[0])
                
                if 'salinity' in result and result['salinity']:
                    sal_data = [x for x in result['salinity'] if x is not None]
                    if sal_data:
                        all_sals.append(sal_data[0])
            
            if all_temps:
                avg_temp = sum(all_temps) / len(all_temps)
                response += f"🌡️ **Average Water Temperature:** {avg_temp:.1f}°C\n"
                if avg_temp > 26:
                    response += "   → Excellent fishing conditions! 🎣\n"
                elif avg_temp > 20:
                    response += "   → Good fishing conditions! 🐟\n"
                else:
                    response += "   → Challenging conditions - try different techniques! 🎯\n"
            
            if all_sals:
                avg_sal = sum(all_sals) / len(all_sals)
                response += f"🧂 **Average Salinity:** {avg_sal:.1f} PSU\n"
                response += "   → Standard ocean conditions for fishing! 🌊\n"
        
        return response
    
    def _add_contextual_info(self, data_results: Dict, user_mode: str, 
                           primary_intent: str) -> Dict[str, Any]:
        """Add contextual information based on user mode and intent"""
        
        contextual_info = {
            'data_quality': 'high',
            'confidence_level': 'good',
            'recommendations': []
        }
        
        results = data_results.get('results', [])
        
        if user_mode == 'scientist':
            contextual_info['recommendations'] = [
                "Consider downloading raw data for further analysis",
                "Check quality flags for data reliability",
                "Compare with historical data for trend analysis"
            ]
        elif user_mode == 'student':
            contextual_info['recommendations'] = [
                "Try asking about different ocean regions",
                "Learn more about how ARGO floats work",
                "Explore seasonal patterns in ocean data"
            ]
        elif user_mode == 'fisherman':
            contextual_info['recommendations'] = [
                "Check weather forecasts for complete picture",
                "Consider tidal conditions for fishing timing",
                "Look for areas with stable ocean conditions"
            ]
        
        return contextual_info
    
    def _suggest_visualizations(self, primary_intent: str, data_results: Dict, 
                              user_mode: str) -> List[str]:
        """Suggest appropriate visualizations based on intent and data"""
        
        suggestions = []
        results = data_results.get('results', [])
        
        if primary_intent == 'temperature_query':
            suggestions.extend(['temperature_profile', 'temperature_map', 'temperature_timeseries'])
        elif primary_intent == 'salinity_query':
            suggestions.extend(['salinity_profile', 'salinity_map', 'salinity_timeseries'])
        elif primary_intent == 'location_query':
            suggestions.extend(['location_map', 'float_trajectory'])
        elif primary_intent == 'comparison_query':
            suggestions.extend(['comparison_plot', 'scatter_plot', 'box_plot'])
        elif primary_intent == 'anomaly_query':
            suggestions.extend(['anomaly_detection', 'outlier_plot'])
        else:
            suggestions.extend(['general_plot', 'data_summary'])
        
        # Add mode-specific suggestions
        if user_mode == 'student':
            suggestions.extend(['educational_infographic', 'interactive_plot'])
        elif user_mode == 'fisherman':
            suggestions.extend(['fishing_conditions_map', 'weather_style_plot'])
        
        return suggestions
    
    def _get_export_options(self, strategy: Dict) -> List[str]:
        """Get available export options based on strategy"""
        return strategy.get('export_formats', ['csv'])


