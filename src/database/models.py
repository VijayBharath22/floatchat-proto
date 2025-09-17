from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class ArgoProfile(Base):
    __tablename__ = "argo_profiles"
    
    profile_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform_number = Column(String(20), nullable=False, index=True)
    cycle_number = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    measurement_date = Column(DateTime, nullable=False, index=True)
    
    # Arrays for depth-dependent measurements
    pressure_levels = Column(ARRAY(Float), nullable=False)
    temperature = Column(ARRAY(Float), nullable=False)
    salinity = Column(ARRAY(Float), nullable=False)
    
    # Quality flags
    temp_qc = Column(ARRAY(Integer))
    psal_qc = Column(ARRAY(Integer))
    
    # Derived parameters
    mixed_layer_depth = Column(Float)
    max_depth = Column(Float)
    ocean_region = Column(String(50), index=True)
    
    # Metadata
    data_source = Column(String(100))
    processing_date = Column(DateTime, default=func.now())
    profile_metadata = Column(JSON)

class ArgoBGCProfile(Base):
    __tablename__ = "argo_bgc_profiles"
    
    bgc_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), nullable=False)
    
    # BGC parameters
    oxygen = Column(ARRAY(Float))
    nitrate = Column(ARRAY(Float))
    ph = Column(ARRAY(Float))
    chlorophyll_a = Column(ARRAY(Float))
    backscattering = Column(ARRAY(Float))
    
    # Quality flags
    oxygen_qc = Column(ARRAY(Integer))
    nitrate_qc = Column(ARRAY(Integer))
    ph_qc = Column(ARRAY(Integer))
    chla_qc = Column(ARRAY(Integer))

class VectorEmbedding(Base):
    __tablename__ = "vector_embeddings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    profile_id = Column(UUID(as_uuid=True), nullable=False)
    embedding_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())

