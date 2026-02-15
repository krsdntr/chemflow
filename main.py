from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sys
import os
import urllib.request

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.modules.analyzer import ProteinAnalyzer
from backend.modules.strategist import PurificationStrategist
from backend.modules.formulator import BufferFormulator

app = FastAPI(title="ChemFlow API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Models
class SequenceInput(BaseModel):
    sequence: str

class RecipeInput(BaseModel):
    buffer_name: str
    molarity_mm: float
    volume_ml: float
    target_ph: float
    salt_mm: Optional[float] = 0.0
    additives: Optional[list[str]] = []
    temperature_c: Optional[float] = 25.0
    mixing_method: Optional[str] = "smart" # "smart" or "titration"

# Endpoints

@app.get("/")
def read_root():
    return {"message": "ChemFlow API is running"}

@app.post("/analyze")
def analyze_protein(data: SequenceInput):
    """
    Analyzes protein sequence: pI, GRAVY, MW.
    Suggests purification strategy.
    Generates titration curve.
    """
    try:
        analyzer = ProteinAnalyzer(data.sequence)
        props = analyzer.get_properties()
        curve = analyzer.generate_titration_curve()
        
        strategist = PurificationStrategist(props['pI'], sequence=data.sequence)
        strategy = strategist.suggest_strategy()
        
        return {
            "properties": props,
            "titration_curve": curve,
            "strategy": strategy
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/recipe")
def get_recipe(data: RecipeInput):
    """
    Calculates buffer recipe.
    """
    try:
        formulator = BufferFormulator()
        # Find buffer metadata
        selected_buffer = formulator.find_best_buffer(data.target_ph) if data.target_ph else None
        
        # If ID passed directly (or if find_best_buffer logic varies), let's ensure we get the right one
        # Current find_best_buffer finds by pH. We need by ID if name provided.
        # Let's simple look up by ID for now since frontend sends ID
        found = next((b for b in formulator.buffers if b["id"] == data.buffer_name), None)
        if found:
            selected_buffer = found
        
        if not selected_buffer:
             return {"error": "Buffer not found"}

        vol_l = data.volume_ml / 1000.0
        conc_m = data.molarity_mm / 1000.0
        
        recipe = formulator.calculate_recipe(
            selected_buffer, 
            vol_l, 
            conc_m, 
            target_ph=data.target_ph,
            salt_mm=data.salt_mm,
            additives=data.additives,
            temperature_c=data.temperature_c,
            mixing_method=data.mixing_method
        )
        return recipe

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/fetch/{uniprot_id}")
def fetch_uniprot(uniprot_id: str):
    """
    Fetches protein sequence from Uniprot.
    """
    try:
        url = f"https://rest.uniprot.org/uniprotkb/{uniprot_id}.fasta"
        with urllib.request.urlopen(url) as response:
            fasta_data = response.read().decode('utf-8')
            # Extract sequence from FASTA (remove header)
            parts = fasta_data.strip().split('\n')
            sequence = "".join(parts[1:])
            return {"sequence": sequence, "raw_fasta": fasta_data}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Protein not found or Uniprot error")

@app.post("/buffers")
def list_buffers():
    """Returns list of available buffers."""
    formulator = BufferFormulator()
    return formulator.buffers
