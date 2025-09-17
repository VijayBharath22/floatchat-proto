-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create function to determine ocean region
CREATE OR REPLACE FUNCTION determine_ocean_region(lat FLOAT, lon FLOAT)
RETURNS TEXT AS $$
BEGIN
    -- Indian Ocean bounds
    IF lat BETWEEN -60 AND 30 AND lon BETWEEN 20 AND 120 THEN
        RETURN 'Indian Ocean';
    -- Pacific Ocean bounds
    ELSIF lon BETWEEN 120 AND 290 OR lon BETWEEN -180 AND -70 THEN
        RETURN 'Pacific Ocean';
    -- Atlantic Ocean bounds
    ELSIF lon BETWEEN -70 AND 20 THEN
        RETURN 'Atlantic Ocean';
    -- Southern Ocean
    ELSIF lat < -60 THEN
        RETURN 'Southern Ocean';
    -- Arctic Ocean
    ELSIF lat > 66 THEN
        RETURN 'Arctic Ocean';
    ELSE
        RETURN 'Unknown';
    END IF;
END;
$$ LANGUAGE plpgsql;

