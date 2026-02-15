class PurificationStrategist:
    def __init__(self, pi: float, sequence: str = None):
        self.pi = pi
        self.sequence = sequence

    def suggest_strategy(self):
        """
        Suggests purification strategy based on pI.
        
        Logic:
        - pH_start = pI
        - Unstable Zone: pI +/- 0.5
        - Acidic Protein (pI < 6.0): Anion Exchange (AEX) at pH > pI (Net Charge Negative)
        - Basic Protein (pI > 8.0): Cation Exchange (CEX) at pH < pI (Net Charge Positive)
        - Neutral (6.0 - 8.0): Options.
        """
        
        # Define Unstable Zone (Precipitation Risk)
        unstable_zone = (round(self.pi - 0.5, 2), round(self.pi + 0.5, 2))
        
        strategy = {
            "pI": round(self.pi, 2),
            "unstable_zone": unstable_zone,
            "strategies": []
        }

        # Strategy Logic
        if self.pi < 6.0:
            # Acidic: Use Anion Exchange
            target_ph = self.pi + 1.0
            
            # Recommend Buffer
            rec_buffer = "tris" if target_ph > 7.5 else "phosphate" if target_ph > 5.8 else "mes"

            # Recommend Additives based on sequence
            additives = []
            additives_reason = ""
            if self.sequence and "C" in self.sequence:
                additives.append("DTT")
                additives_reason = "Cysteines detected. Reducing agent (DTT) recommended to prevent aggregation."

            strategy["strategies"].append({
                "type": "Anion Exchange",
                "recommended_ph": round(target_ph, 2),
                "recommended_buffer_id": rec_buffer,
                "recommended_concentration": 20,
                "recommended_salt": 0,
                "salt_reason": "Start at 0 mM NaCl to promote binding to IEX resin.",
                "recommended_additives": additives,
                "additives_reason": additives_reason,
                "reason": "Protein is acidic (pI < 6.0). Needs pH > pI to be negatively charged for AEX.",
                "buffer_reason": f"Chosen for optimal buffering capacity at pH {round(target_ph, 2)}.",
                "concentration_reason": "Standard starting ionic strength for IEX to allow binding.",
                "resin_type": "Positive Ligand (e.g., Q-Sepharose)"
            })
        elif self.pi > 8.0:
            # Basic: Use Cation Exchange
            target_ph = self.pi - 1.0
            
            # Recommend Buffer
            rec_buffer = "phosphate" if target_ph > 5.8 else "mes" if target_ph > 5.5 else "acetate" 

            # Recommend Additives based on sequence
            additives = []
            additives_reason = ""
            if self.sequence and "C" in self.sequence:
                additives.append("DTT")
                additives_reason = "Cysteines detected. Reducing agent (DTT) recommended to prevent aggregation."
            
            strategy["strategies"].append({
                "type": "Cation Exchange",
                "recommended_ph": round(target_ph, 2),
                "recommended_buffer_id": rec_buffer,
                "recommended_concentration": 20,
                 "recommended_salt": 0,
                "salt_reason": "Start at 0 mM NaCl to promote binding to IEX resin.",
                "recommended_additives": additives,
                "additives_reason": additives_reason,
                "reason": "Protein is basic (pI > 8.0). Needs pH < pI to be positively charged for CEX.",
                "buffer_reason": f"Chosen for optimal buffering capacity at pH {round(target_ph, 2)}.",
                "concentration_reason": "Standard starting ionic strength for IEX to allow binding.",
                "resin_type": "Negative Ligand (e.g., SP-Sepharose)"
            })
        else:
            # Neutral: Propose both with caution
            aex_ph = self.pi + 1.0
            cex_ph = self.pi - 1.0
            
             # Recommend Additives based on sequence
            additives = []
            additives_reason = ""
            if self.sequence and "C" in self.sequence:
                additives.append("DTT")
                additives_reason = "Cysteines detected. Reducing agent (DTT) recommended to prevent aggregation."

            # Option 1: AEX
            if aex_ph <= 14.0:
                rec_buffer_aex = "tris" if aex_ph > 7.5 else "phosphate"
                strategy["strategies"].append({
                    "type": "Anion Exchange",
                    "recommended_ph": round(aex_ph, 2),
                    "recommended_buffer_id": rec_buffer_aex,
                    "recommended_concentration": 20,
                    "recommended_salt": 0,
                    "salt_reason": "Start at 0 mM NaCl to promote binding to IEX resin.",
                    "recommended_additives": additives,
                    "additives_reason": additives_reason,
                    "reason": "Neutral pI. AEX option (pH > pI).",
                    "buffer_reason": f"Chosen for optimal buffering capacity at pH {round(aex_ph, 2)}.",
                    "concentration_reason": "Standard starting ionic strength for IEX to allow binding.",
                    "resin_type": "Positive Ligand"
                })
            
            # Option 2: CEX
            if cex_ph >= 0.0:
                rec_buffer_cex = "phosphate" if cex_ph > 5.8 else "mes"
                strategy["strategies"].append({
                    "type": "Cation Exchange",
                    "recommended_ph": round(cex_ph, 2),
                     "recommended_buffer_id": rec_buffer_cex,
                    "recommended_concentration": 20,
                    "recommended_salt": 0,
                    "salt_reason": "Start at 0 mM NaCl to promote binding to IEX resin.",
                    "recommended_additives": additives,
                    "additives_reason": additives_reason,
                    "reason": "Neutral pI. CEX option (pH < pI).",
                    "buffer_reason": f"Chosen for optimal buffering capacity at pH {round(cex_ph, 2)}.",
                    "concentration_reason": "Standard starting ionic strength for IEX to allow binding.",
                    "resin_type": "Negative Ligand"
                })
                
        return strategy
