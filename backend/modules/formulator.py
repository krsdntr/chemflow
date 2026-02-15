import json
import os

class BufferFormulator:
    def __init__(self, buffers_db_path="d:/app/ChemFlow/backend/data/buffers.json"):
        with open(buffers_db_path, "r") as f:
            self.buffers = json.load(f)

    def find_best_buffer(self, target_ph: float):
        """
        Finds the best buffer for a given target pH.
        Criteria:
        1. target_ph is within useful_range.
        2. sorted by proximity of pKa to target_ph (Buffer Capacity).
        """
        candidates = []
        for buf in self.buffers:
            min_ph, max_ph = buf["useful_range"]
            if min_ph <= target_ph <= max_ph:
                delta = abs(buf["pka_25c"] - target_ph)
                candidates.append((delta, buf))
        
        # Sort by smallest delta (best capacity)
        candidates.sort(key=lambda x: x[0])
        
        if not candidates:
            return None
        
        # Return the best match (buffer dict)
        return candidates[0][1]

    def calculate_recipe(self, buffer_data, volume_l, concentration_m, target_ph=None, salt_mm=0, additives=None, temperature_c=25, mixing_method="smart"):
        """
        Calculates the recipe for a given buffer.
        """
        if not target_ph and 'pka_25c' in buffer_data:
             target_ph = buffer_data['pka_25c'] # Default to pKa if no target

        # Temperature Correction
        pka = buffer_data['pka_25c']
        if 'temperature_coeff' in buffer_data:
            pka += buffer_data['temperature_coeff'] * (temperature_c - 25.0)

        # Simple Henderson-Hasselbalch approximation for ratio
        # pH = pKa + log([A-]/[HA])
        # [A-]/[HA] = 10^(pH - pKa)
        ratio = 10 ** (target_ph - pka)
        
        # Fraction of base form
        frac_base = ratio / (1 + ratio)
        frac_acid = 1 - frac_base
        
        components = []
        mass_total = 0

        # 1. Salt and Additives Logic (Common)
        MW_NACL = 58.44
        MW_EDTA = 372.24 # Disodium dihydrate
        MW_DTT = 154.25
        
        salt_additive_instructions = []
        if salt_mm > 0:
            salt_mass = (salt_mm / 1000.0) * volume_l * MW_NACL
            salt_additive_instructions.append(f"Add {round(salt_mass, 4)}g of NaCl ({salt_mm} mM).")
            components.append({"name": "NaCl", "mass": round(salt_mass, 4)})
            mass_total += salt_mass
            
        if additives:
            for additive in additives:
                if additive == "EDTA":
                    edta_mass = (1.0 / 1000.0) * volume_l * MW_EDTA
                    salt_additive_instructions.append(f"Add {round(edta_mass, 4)}g of EDTA (1 mM).")
                    components.append({"name": "EDTA (1 mM)", "mass": round(edta_mass, 4)})
                    mass_total += edta_mass
                elif additive == "DTT":
                    dtt_mass = (1.0 / 1000.0) * volume_l * MW_DTT
                    salt_additive_instructions.append(f"Add {round(dtt_mass, 4)}g of DTT (1 mM).")
                    components.append({"name": "DTT (1 mM)", "mass": round(dtt_mass, 4)})
                    mass_total += dtt_mass

        # 2. Buffer Logic
        buffer_intro = ""
        ph_instruction = ""
        
        if mixing_method == "smart" and 'molecular_weight_acid' in buffer_data and 'molecular_weight_base' in buffer_data:
            # Smart Mixing
            mw_acid = buffer_data['molecular_weight_acid']
            mw_base = buffer_data['molecular_weight_base']
            
            conc_acid = concentration_m * frac_acid
            conc_base = concentration_m * frac_base
            
            mass_acid = conc_acid * volume_l * mw_acid
            mass_base = conc_base * volume_l * mw_base
            
            mass_total += mass_acid + mass_base
            
            buffer_intro = (
                f"Mix {mass_acid:.3f} g of {buffer_data.get('name_acid', 'Acid Form')} "
                f"and {mass_base:.3f} g of {buffer_data.get('name_base', 'Base Form')} "
                f"in approx {volume_l * 0.8 * 1000:.0f} mL water."
            )
            
            # Prepend buffer components so they appear first
            components.insert(0, {"name": buffer_data.get('name_base', 'Base'), "mass": round(mass_base, 3)})
            components.insert(0, {"name": buffer_data.get('name_acid', 'Acid'), "mass": round(mass_acid, 3)})
            
            ph_instruction = f"Check pH (Theoretical: {target_ph}"
        else:
            # Fallback (Titration Method)
            mw = buffer_data.get("molecular_weight_base", 0)
            buffer_mass = concentration_m * volume_l * mw
            mass_total += buffer_mass
            
            buffer_intro = f"Dissolve {round(buffer_mass, 4)}g of {buffer_data['name']} in approx {volume_l * 0.8 * 1000}mL water."
            
            components.insert(0, {"name": buffer_data['name'], "mass": round(buffer_mass, 3)})
            
            ph_instruction = f"Adjust pH to {target_ph}"

        # Temperature part of pH instruction
        if temperature_c != 25:
             ph_instruction += f" at {temperature_c}°C)."
        else:
             ph_instruction += " at 25°C)."

        # 3. Assemble Final Instructions
        final_steps = [buffer_intro]
        final_steps.extend(salt_additive_instructions)
        final_steps.append(ph_instruction)
        final_steps.append(f"Fill to {volume_l * 1000} mL with water.")
        
        return {
            "buffer_name": buffer_data["name"],
            "mass_to_weigh_g": round(mass_total, 3), 
            "instructions": " ".join(final_steps),
            "instruction_steps": final_steps,
            "components": components 
        }
