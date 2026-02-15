import sys
import os

# Ensure backend modules are in path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.modules.analyzer import ProteinAnalyzer
from backend.modules.strategist import PurificationStrategist
from backend.modules.formulator import BufferFormulator

def main():
    print("=========================================")
    print("   ChemFlow - Protein Purification V1    ")
    print("=========================================\n")

    # Hardcoded test case or Input
    # BSA Sequence Fragment (Example)
    default_seq = "MKWVTFISLLLLFSSAYSRGVFRRDTHKSEIAHRFKDLGEEHFKGLVLIAFSQYLQQCPFDEHVKLVNELTEFAKTCVADESHAGCEKSLHTLFGDELCKVASLRETYGDMADCCEKQEPERNECFLSHKDDSPDLPKLKPDPNTLCDEFKADEKKFWGKYLYEIARRHPYFYAPELLYYANKYNGVFQECCQAEDKGACLLPKIETMREKVLTSSARQRLRCASIQKFGERALKAWSVARLSQKFPKAEFVEVTKLVTDLTKVHKECCHGDLLECADDRADLAKYICENQDSISSKLKECCEKPLLEKSHCIAEVENDEMPADLPSLAADFVESKDVCKNYAEAKDVFLGMFLYEYARRHPDYSVVLLLRLAKTYETTLEKCCAAADPHECYAKVFDEFKPLVEEPQNLIKQNCELFEQLGEYKFQNALLVRYTKKVPQVSTPTLVEVSRNLGKVGSKCCKHPEAKRMPCAEDYLSVVLNQLCVLHEKTPVSDRVTKCCTESLVNRRPCFSALEVDETYVPKEFNAETFTFHADICTLSEKERQIKKQTALVELVKHKPKATKEQLKAVMDDFAAFVEKCCKADDKETCFAEEGKKLVAASQAALGL"
    
    print("Enter Protein Sequence (FASTA) [Press Enter to use BSA]:")
    seq = input().strip()
    if not seq:
        seq = default_seq
        print("Using BSA Sequence...")

    # 1. Analyze
    print("\n[1] ANALYZING PROTEIN...")
    analyzer = ProteinAnalyzer(seq)
    props = analyzer.get_properties()
    print(f" > Length: {props['length']} aa")
    print(f" > MW: {props['molecular_weight']:.2f} Da")
    print(f" > pI: {props['pI']:.2f}")
    print(f" > GRAVY: {props['gravy']:.4f}")

    # 2. Strategize
    print("\n[2] DETERMINING STRATEGY...")
    strategist = PurificationStrategist(props['pI'])
    strat_result = strategist.suggest_strategy()
    
    print(f" > Unstable Zone (Precipitation): pH {strat_result['unstable_zone'][0]} - {strat_result['unstable_zone'][1]}")
    
    if not strat_result["strategies"]:
        print("No suitable standard strategy found!")
        return

    best_strat = strat_result["strategies"][0] # Take the first suggestion
    print(f" > Suggestion: {best_strat['type']}")
    print(f" > Reason: {best_strat['reason']}")
    print(f" > Recommended pH: {best_strat['recommended_ph']}")
    print(f" > Target Resin: {best_strat['resin_type']}")

    # 3. Formulate
    print("\n[3] CALCULATING BUFFER RECIPE...")
    formulator = BufferFormulator()
    target_ph = best_strat['recommended_ph']
    
    best_buffer = formulator.find_best_buffer(target_ph)
    
    if best_buffer:
        print(f" > Selected Buffer: {best_buffer['name']} (pKa {best_buffer['pka_25c']})")
        
        # User parameters for recipe
        vol_l = 0.5 # 500 mL
        conc_m = 0.05 # 50 mM
        
        recipe = formulator.calculate_recipe(best_buffer, vol_l, conc_m)
        print("\n--- RECIPE CARD ---")
        print(f"Buffer: {recipe['buffer_name']}")
        print(f"Target Volume: {recipe['target_volume']}")
        print(f"Target Conc: {recipe['target_concentration']}")
        print(f"Mass to Weigh: {recipe['mass_to_weigh_g']} g")
        print(f"Instructions: {recipe['instructions']}")
        print("-------------------")
    else:
        print(f" > No suitable buffer found in database for pH {target_ph}")

if __name__ == "__main__":
    main()
