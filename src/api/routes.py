from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Dict, Optional
import pandas as pd
from ..ai.rag_system import ArgoRAGSystem
from ..ai.response_generator import ResponseGenerator
from ..data_pipeline.vector_db import ArgoVectorDatabase
from ..database.connection import get_db_session, DatabaseClient
from .schemas import QueryRequest, QueryResponse, ProfileData

router = APIRouter()

# Initialize components (in production, use dependency injection)
vector_db = ArgoVectorDatabase()
db_client = DatabaseClient()
response_generator = ResponseGenerator()

@router.post("/query", response_model=QueryResponse)
async def process_natural_language_query(request: QueryRequest):
    """Process natural language query about ARGO data"""
    try:
        # For demo purposes, return mock response
        # In production: result = rag_system.process_query(request.query)
        
        mock_result = {
            "query": request.query,
            "sql": "SELECT * FROM argo_profiles WHERE latitude BETWEEN -5 AND 5 LIMIT 10",
            "results": [
                {
                    "platform_number": "2900123",
                    "latitude": 2.5,
                    "longitude": 87.3,
                    "measurement_date": "2023-03-15",
                    "temperature": [28.5, 28.2, 27.8, 26.5],
                    "salinity": [34.2, 34.5, 34.8, 35.1]
                }
            ],
            "response": "I found 1 ARGO profile near the equator in March 2023. The surface temperature was 28.5°C with salinity of 34.2 PSU.",
            "visualization_suggestions": ["temperature_profile", "location_map"],
            "success": True
        }
        
        return QueryResponse(**mock_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profiles/search")
async def search_profiles(
    lat_min: float = Query(-90, ge=-90, le=90),
    lat_max: float = Query(90, ge=-90, le=90),
    lon_min: float = Query(-180, ge=-180, le=180),
    lon_max: float = Query(180, ge=-180, le=180),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000)
):
    """Search ARGO profiles by location and time"""
    try:
        # Mock response for demo
        mock_profiles = [
            {
                "profile_id": "550e8400-e29b-41d4-a716-446655440000",
                "platform_number": "2900123",
                "latitude": 15.5,
                "longitude": 75.2,
                "measurement_date": "2023-08-15T12:00:00Z",
                "max_depth": 2000.0,
                "ocean_region": "Indian Ocean"
            }
        ]
        
        return {"profiles": mock_profiles, "total_count": len(mock_profiles)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profiles/{profile_id}")
async def get_profile_details(profile_id: str):
    """Get detailed profile data"""
    try:
        # Mock detailed profile
        mock_profile = {
            "profile_id": profile_id,
            "platform_number": "2900123",
            "cycle_number": 45,
            "latitude": 15.5,
            "longitude": 75.2,
            "measurement_date": "2023-08-15T12:00:00Z",
            "pressure_levels": [2.5, 10.0, 20.0, 30.0, 50.0, 75.0, 100.0],
            "temperature": [28.5, 28.2, 27.8, 26.5, 24.2, 22.1, 20.8],
            "salinity": [34.2, 34.5, 34.8, 35.1, 35.3, 35.4, 35.5],
            "mixed_layer_depth": 45.0,
            "max_depth": 2000.0,
            "ocean_region": "Indian Ocean"
        }
        
        return mock_profile
        
    except Exception as e:
        raise HTTPException(status_code=404, detail="Profile not found")

@router.get("/stats")
async def get_database_stats():
    """Get database statistics"""
    try:
        stats = vector_db.get_collection_stats()
        
        mock_stats = {
            "total_profiles": stats.get('total_profiles', 0),
            "regions": {
                "Indian Ocean": 450,
                "Pacific Ocean": 1200,
                "Atlantic Ocean": 800,
                "Southern Ocean": 200
            },
            "date_range": {
                "earliest": "2020-01-01",
                "latest": "2023-12-31"
            },
            "parameters": ["temperature", "salinity", "pressure"]
        }
        
        return mock_stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_ai_insights():
    """Get AI-generated insights about ocean data"""
    try:
        mock_insights = [
            {
                "type": "anomaly",
                "title": "Unusual Salinity Spike",
                "description": "Salinity levels in Arabian Sea are 0.3 PSU above normal for this time of year",
                "severity": "medium",
                "region": "Arabian Sea",
                "date": "2023-08-15"
            },
            {
                "type": "trend",
                "title": "Indian Ocean Warming",
                "description": "Surface temperatures have increased 0.2°C over the past 5 years",
                "severity": "low",
                "region": "Indian Ocean",
                "trend_value": "+0.2°C/5yr"
            },
            {
                "type": "prediction",
                "title": "Cyclone Risk Alert",
                "description": "High ocean heat content detected - favorable conditions for cyclone development",
                "severity": "high",
                "region": "Bay of Bengal",
                "confidence": 0.78
            }
        ]
        
        return {"insights": mock_insights}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/example-queries")
async def get_example_queries():
    """Get example queries for users"""
    examples = [
        {
            "category": "Basic Queries",
            "queries": [
                "Show me temperature profiles near Chennai",
                "What's the salinity in Arabian Sea last month?",
                "Find ARGO floats near 15°N, 75°E"
            ]
        },
        {
            "category": "Advanced Analysis",
            "queries": [
                "Compare oxygen levels between monsoon seasons",
                "Show temperature anomalies in Indian Ocean",
                "Analyze salinity trends over last 5 years"
            ]
        },
        {
            "category": "Regional Focus",
            "queries": [
                "How has Bay of Bengal temperature changed?",
                "Show me profiles in Lakshadweep region",
                "Compare Indian Ocean vs Pacific temperatures"
            ]
        }
    ]
    
    return {"examples": examples}


