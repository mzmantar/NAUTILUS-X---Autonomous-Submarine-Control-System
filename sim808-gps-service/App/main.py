from fastapi import FastAPI
from gps import get_gps_location

app = FastAPI()

@app.get("/location")
def get_location():
    lat, lon = get_gps_location()
    if lat and lon:
        return {"latitude": lat, "longitude": lon}
    return {"error": "GPS data unavailable"}

get_location()
