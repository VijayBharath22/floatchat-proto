import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Optional
import uuid
import logging

logger = logging.getLogger(__name__)

class ArgoVectorDatabase:
    """Vector database for ARGO profile semantic search"""
    
    def __init__(self, persist_directory: str = "./data/vectordb"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.collection = self.client.get_or_create_collection(
            name="argo_profiles",
            metadata={"hnsw:space": "cosine"}
        )
    
    def generate_profile_summary(self, profile_data: Dict) -> str:
        """Generate searchable text summary for ARGO profile"""
        
        try:
            temp_data = [x for x in profile_data.get('temperature', []) if x is not None]
            sal_data = [x for x in profile_data.get('salinity', []) if x is not None]
            
            if not temp_data or not sal_data:
                return f"ARGO Float {profile_data.get('platform_number', 'UNKNOWN')} - incomplete data"
            
            temp_range = f"{min(temp_data):.1f}°C to {max(temp_data):.1f}°C"
            sal_range = f"{min(sal_data):.2f} to {max(sal_data):.2f} PSU"
            
            summary = f"""
            ARGO Float {profile_data.get('platform_number', 'UNKNOWN')} collected oceanographic data
            on {profile_data.get('measurement_date', 'unknown date')} 
            at location {profile_data.get('latitude', 0):.2f}°N, {profile_data.get('longitude', 0):.2f}°E
            in the {profile_data.get('ocean_region', 'unknown region')}.
            
            Temperature profile: {temp_range}
            Salinity profile: {sal_range}
            Maximum depth: {profile_data.get('max_depth', 0):.0f}m
            Mixed layer depth: {profile_data.get('mixed_layer_depth', 0):.0f}m
            
            This profile shows {"warm" if np.mean(temp_data) > 20 else "cold"} 
            water conditions with {"high" if np.mean(sal_data) > 35 else "low"} 
            salinity levels typical of {profile_data.get('ocean_region', 'unknown')} waters.
            """
            
            return summary.strip()
            
        except Exception as e:
            logger.error(f"Error generating profile summary: {e}")
            return f"ARGO Float {profile_data.get('platform_number', 'UNKNOWN')} - error in summary generation"
    
    def add_profile(self, profile_data: Dict) -> bool:
        """Add profile to vector database"""
        try:
            summary = self.generate_profile_summary(profile_data)
            embedding = self.embedding_model.encode(summary)
            
            profile_id = str(profile_data.get('profile_id', uuid.uuid4()))
            
            self.collection.add(
                embeddings=[embedding.tolist()],
                documents=[summary],
                metadatas=[{
                    'profile_id': profile_id,
                    'platform_number': str(profile_data.get('platform_number', '')),
                    'latitude': float(profile_data.get('latitude', 0)),
                    'longitude': float(profile_data.get('longitude', 0)),
                    'date': str(profile_data.get('measurement_date', '')),
                    'ocean_region': str(profile_data.get('ocean_region', '')),
                    'max_depth': float(profile_data.get('max_depth', 0)),
                    'mixed_layer_depth': float(profile_data.get('mixed_layer_depth', 0))
                }],
                ids=[profile_id]
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding profile to vector DB: {e}")
            return False
    
    def semantic_search(self, query: str, n_results: int = 10) -> Dict:
        """Perform semantic search on ARGO profiles"""
        try:
            query_embedding = self.embedding_model.encode(query)
            
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=n_results
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return {'documents': [[]], 'metadatas': [[]], 'ids': [[]]}
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about the vector database collection"""
        try:
            count = self.collection.count()
            return {
                'total_profiles': count,
                'embedding_model': 'all-MiniLM-L6-v2',
                'vector_dimension': 384
            }
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {'total_profiles': 0}

