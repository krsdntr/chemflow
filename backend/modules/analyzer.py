from Bio.SeqUtils import ProtParam
from Bio.SeqUtils.ProtParam import ProteinAnalysis
import numpy as np

class ProteinAnalyzer:
    def __init__(self, sequence: str):
        self.sequence = sequence.upper().replace("\n", "").replace(" ", "")
        # Basic validation: check for non-amino acid characters
        # For simplicity in this phase, we assume standard amino acids.
        self.analysis = ProteinAnalysis(self.sequence)

    def get_properties(self):
        """
        Returns a dictionary of protein properties:
        - pI
        - Molecular Weight
        - GRAVY (Hydropathy)
        - Extinction Coefficient (reduced, oxidized)
        """
        return {
            "pI": self.analysis.isoelectric_point(),
            "molecular_weight": self.analysis.molecular_weight(),
            "gravy": self.analysis.gravy(),
            "amino_acid_count": self.analysis.count_amino_acids(),
            "length": len(self.sequence)
        }

    def generate_titration_curve(self, step=0.1):
        """
        Generates data points for Net Charge vs pH curve (pH 0-14).
        Returns a list of dictionaries: [{"ph": 0.0, "charge": 10.5}, ...]
        """
        ph_range = np.arange(0, 14 + step, step)
        curve_data = []
        
        for ph in ph_range:
            charge = self.analysis.charge_at_pH(ph)
            curve_data.append({
                "ph": round(ph, 2),
                "charge": round(charge, 4)
            })
            
        return curve_data
