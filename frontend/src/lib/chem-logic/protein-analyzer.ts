// Standard pKa values from EMBOSS/Biopython
// https://github.com/biopython/biopython/blob/master/Bio/SeqUtils/ProtParamData.py

const pKaValues: { [key: string]: number } = {
    'D': 3.9,
    'E': 4.07,
    'H': 6.04,
    'C': 8.18,
    'Y': 10.46,
    'K': 10.54,
    'R': 12.48,
    'N_TERM': 8.2, // Default N-terminus
    'C_TERM': 3.65 // Default C-terminus
};

const hydropathyScale: { [key: string]: number } = {
    'A': 1.8, 'R': -4.5, 'N': -3.5, 'D': -3.5, 'C': 2.5,
    'Q': -3.5, 'E': -3.5, 'G': -0.4, 'H': -3.2, 'I': 4.5,
    'L': 3.8, 'K': -3.9, 'M': 1.9, 'F': 2.8, 'P': -1.6,
    'S': -0.8, 'T': -0.7, 'W': -0.9, 'Y': -1.3, 'V': 4.2
};

const molecularWeights: { [key: string]: number } = {
    'A': 89.09, 'R': 174.20, 'N': 132.12, 'D': 133.10, 'C': 121.16,
    'Q': 146.15, 'E': 147.13, 'G': 75.07, 'H': 155.16, 'I': 131.18,
    'L': 131.18, 'K': 146.19, 'M': 149.21, 'F': 165.19, 'P': 115.13,
    'S': 105.09, 'T': 119.12, 'W': 204.23, 'Y': 181.19, 'V': 117.15
};

export class ProteinAnalyzer {
    sequence: string;
    aminoAcidCounts: { [key: string]: number };

    constructor(sequence: string) {
        this.sequence = sequence.toUpperCase().replace(/\s/g, '').replace(/[^A-Z]/g, '');
        this.aminoAcidCounts = this.countAminoAcids();
    }

    private countAminoAcids(): { [key: string]: number } {
        const counts: { [key: string]: number } = {};
        for (const char of this.sequence) {
            counts[char] = (counts[char] || 0) + 1;
        }
        return counts;
    }

    calculateMolecularWeight(): number {
        let mw = 0;
        // Add MW of each AA
        for (const [aa, count] of Object.entries(this.aminoAcidCounts)) {
            if (molecularWeights[aa]) {
                mw += (molecularWeights[aa] - 18.01528) * count; // Subtract water for peptide bond
            }
        }
        // Add one water molecule for the ends
        mw += 18.01528;
        return parseFloat(mw.toFixed(2));
    }

    calculateGRAVY(): number {
        let totalHydropathy = 0;
        for (const char of this.sequence) {
            if (hydropathyScale[char] !== undefined) {
                totalHydropathy += hydropathyScale[char];
            }
        }
        if (this.sequence.length === 0) return 0;
        return parseFloat((totalHydropathy / this.sequence.length).toFixed(3));
    }

    calculateChargeAtPH(pH: number): number {
        let charge = 0.0;

        // Positive charges (Basic AA + N-term)
        // Charge = 1 / (1 + 10^(pH - pKa))
        charge += 1 / (1 + Math.pow(10, pH - pKaValues['N_TERM']));
        charge += (this.aminoAcidCounts['K'] || 0) / (1 + Math.pow(10, pH - pKaValues['K']));
        charge += (this.aminoAcidCounts['R'] || 0) / (1 + Math.pow(10, pH - pKaValues['R']));
        charge += (this.aminoAcidCounts['H'] || 0) / (1 + Math.pow(10, pH - pKaValues['H']));

        // Negative charges (Acidic AA + C-term)
        // Charge = -1 / (1 + 10^(pKa - pH))
        charge -= 1 / (1 + Math.pow(10, pKaValues['C_TERM'] - pH));
        charge -= (this.aminoAcidCounts['D'] || 0) / (1 + Math.pow(10, pKaValues['D'] - pH));
        charge -= (this.aminoAcidCounts['E'] || 0) / (1 + Math.pow(10, pKaValues['E'] - pH));
        charge -= (this.aminoAcidCounts['C'] || 0) / (1 + Math.pow(10, pKaValues['C'] - pH));
        charge -= (this.aminoAcidCounts['Y'] || 0) / (1 + Math.pow(10, pKaValues['Y'] - pH));

        return charge;
    }

    calculateIsoelectricPoint(): number {
        let minPH = 0;
        let maxPH = 14;
        let pI = 7;

        // Binary search for pI (Net Charge = 0)
        while (maxPH - minPH > 0.0001) {
            pI = (minPH + maxPH) / 2;
            const charge = this.calculateChargeAtPH(pI);

            if (charge > 0) {
                minPH = pI;
            } else {
                maxPH = pI;
            }
        }
        return parseFloat(pI.toFixed(2));
    }

    generateTitrationCurve(step: number = 0.1): { ph: number, charge: number }[] {
        const curveData = [];
        for (let ph = 0; ph <= 14; ph += step) {
            curveData.push({
                ph: parseFloat(ph.toFixed(2)),
                charge: parseFloat(this.calculateChargeAtPH(ph).toFixed(4))
            });
        }
        return curveData;
    }

    getProperties() {
        return {
            pI: this.calculateIsoelectricPoint(),
            molecular_weight: this.calculateMolecularWeight(),
            gravy: this.calculateGRAVY(),
            amino_acid_count: this.aminoAcidCounts,
            length: this.sequence.length
        };
    }
}
