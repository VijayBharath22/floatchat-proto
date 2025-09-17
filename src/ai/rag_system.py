from langchain_community.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import sqlparse
import re
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class ArgoRAGSystem:
    """Retrieval-Augmented Generation system for ARGO data queries"""
    
    def __init__(self, vector_db, sql_client, openai_api_key: str):
        self.vector_db = vector_db
        self.sql_client = sql_client
        self.llm = OpenAI(api_key=openai_api_key, temperature=0.1, max_tokens=2000)
        self.sql_prompt = self._create_sql_prompt_template()
        self.response_prompt = self._create_response_prompt_template()
        
    def _create_sql_prompt_template(self) -> PromptTemplate:
        """Create prompt template for SQL generation"""
        
        template = """
        You are an expert oceanographer and SQL developer. Generate a PostgreSQL query to answer the user's question about ARGO oceanographic data.

        Database Schema:
        - argo_profiles: profile_id, platform_number, cycle_number, latitude, longitude, 
          measurement_date, pressure_levels (FLOAT[]), temperature (FLOAT[]), salinity (FLOAT[]),
          mixed_layer_depth, max_depth, ocean_region
        - argo_bgc_profiles: profile_id, oxygen (FLOAT[]), nitrate (FLOAT[]), ph (FLOAT[]), 
          chlorophyll_a (FLOAT[]), backscattering (FLOAT[])

        Relevant Context from Vector Search:
        {context}

        User Question: {question}

        Important Guidelines:
        - Use array indexing for temperature/salinity (e.g., temperature[1:5] for surface values)
        - Include latitude/longitude bounds for regional queries
        - Use date filtering with measurement_date
        - Include quality control considerations
        - Limit results to prevent timeout (LIMIT 1000)
        - Use ONLY SELECT statements, no modifications allowed

        Generate ONLY the SQL query, no explanation:
        """
        
        return PromptTemplate(
            input_variables=["context", "question"],
            template=template
        )
    
    def _create_response_prompt_template(self) -> PromptTemplate:
        """Create prompt template for response generation"""
        
        template = """
        You are an expert oceanographer. Based on the SQL query results, provide a clear, 
        informative response to the user's question.

        User Question: {question}
        SQL Query Used: {sql_query}
        Query Results: {results}

        Provide a response that:
        1. Directly answers the user's question
        2. Summarizes key findings from the data
        3. Provides oceanographic context and interpretation
        4. Suggests related queries or further analysis

        Response:
        """
        
        return PromptTemplate(
            input_variables=["question", "sql_query", "results"],
            template=template
        )
    
    def process_query(self, user_question: str) -> Dict:
        """Process natural language query and return results"""
        
        try:
            # Step 1: Semantic search for relevant context
            search_results = self.vector_db.semantic_search(user_question, n_results=5)
            
            context = "\n".join([
                f"Profile {i+1}: {doc}" 
                for i, doc in enumerate(search_results['documents'][0])
            ])
            
            # Step 2: Generate SQL query using LLM
            sql_chain = LLMChain(llm=self.llm, prompt=self.sql_prompt)
            sql_query = sql_chain.run(
                context=context,
                question=user_question
            ).strip()
            
            # Step 3: Validate and execute SQL
            sql_query = self._validate_sql_query(sql_query)
            results = self._execute_query(sql_query)
            
            # Step 4: Generate natural language response
            response_chain = LLMChain(llm=self.llm, prompt=self.response_prompt)
            response = response_chain.run(
                question=user_question,
                sql_query=sql_query,
                results=str(results[:5])  # First 5 rows for context
            )
            
            return {
                'query': user_question,
                'sql': sql_query,
                'results': results,
                'response': response,
                'context': search_results,
                'success': True
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                'error': str(e),
                'suggestion': self._generate_query_suggestions(user_question),
                'success': False
            }
    
    def _validate_sql_query(self, sql_query: str) -> str:
        """Validate and sanitize SQL query"""
        
        # Remove dangerous keywords
        dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE']
        sql_upper = sql_query.upper()
        
        for keyword in dangerous_keywords:
            if keyword in sql_upper:
                raise ValueError(f"Dangerous SQL keyword detected: {keyword}")
        
        # Ensure query starts with SELECT
        if not sql_upper.strip().startswith('SELECT'):
            raise ValueError("Only SELECT queries are allowed")
        
        # Parse SQL to ensure it's valid
        try:
            sqlparse.parse(sql_query)
        except Exception as e:
            raise ValueError(f"Invalid SQL syntax: {e}")
        
        # Add LIMIT if not present
        if 'LIMIT' not in sql_upper:
            sql_query += ' LIMIT 1000'
        
        return sql_query
    
    def _execute_query(self, sql_query: str) -> List[Dict]:
        """Execute SQL query and return results"""
        try:
            return self.sql_client.execute_query(sql_query)
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            return []
    
    def _generate_query_suggestions(self, user_question: str) -> List[str]:
        """Generate query suggestions for failed queries"""
        
        suggestions = [
            "Try asking about temperature or salinity profiles",
            "Specify a location (e.g., 'near the equator', 'in Arabian Sea')",
            "Include a time period (e.g., 'in March 2023', 'last 6 months')",
            "Ask about specific ARGO float numbers",
            "Try comparing different regions or time periods"
        ]
        
        return suggestions
    
    def get_example_queries(self) -> Dict[str, str]:
        """Get example queries with their SQL equivalents"""
        
        return {
            "Show me salinity profiles near the equator in March 2023": """
                SELECT platform_number, latitude, longitude, measurement_date, 
                       salinity, pressure_levels
                FROM argo_profiles
                WHERE latitude BETWEEN -5 AND 5 
                AND EXTRACT(month FROM measurement_date) = 3 
                AND EXTRACT(year FROM measurement_date) = 2023
                ORDER BY measurement_date
                LIMIT 100
            """,
            
            "What are the nearest ARGO floats to 15°N, 75°E?": """
                SELECT platform_number, latitude, longitude, measurement_date,
                       SQRT(POWER(latitude - 15, 2) + POWER(longitude - 75, 2)) as distance
                FROM argo_profiles
                WHERE measurement_date >= CURRENT_DATE - INTERVAL '30 days'
                ORDER BY distance
                LIMIT 10
            """,
            
            "Compare temperatures in Indian Ocean vs Pacific Ocean": """
                SELECT ocean_region,
                       AVG((temperature[1] + temperature[2] + temperature[3])/3) as avg_surface_temp,
                       COUNT(*) as profile_count
                FROM argo_profiles
                WHERE ocean_region IN ('Indian Ocean', 'Pacific Ocean')
                AND measurement_date >= CURRENT_DATE - INTERVAL '1 year'
                GROUP BY ocean_region
            """
        }


