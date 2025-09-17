from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class QueryRequest(BaseModel):
    query: str
    mode: str = "scientist"  # scientist, student, fisherman
    filters: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    query: str
    sql: Optional[str] = None
    results: List[Dict[str, Any]]
    response: str
    visualization_suggestions: List[str] = []
    context: Optional[Dict[str, Any]] = None
    success: bool
    error: Optional[str] = None

class ProfileData(BaseModel):
    profile_id: str
    platform_number: str
    cycle_number: int
    latitude: float
    longitude: float
    measurement_date: datetime
    pressure_levels: List[float]
    temperature: List[float]
    salinity: List[float]
    mixed_layer_depth: Optional[float] = None
    max_depth: Optional[float] = None
    ocean_region: Optional[str] = None

class InsightData(BaseModel):
    type: str  # anomaly, trend, prediction
    title: str
    description: str
    severity: str  # low, medium, high
    region: str
    confidence: Optional[float] = None
    date: Optional[str] = None


