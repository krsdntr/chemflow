export interface StrategyRecommendation {
    type: string;
    recommended_ph: number;
    recommended_buffer_id: string;
    recommended_concentration: number;
    recommended_salt: number;
    salt_reason: string;
    recommended_additives: string[];
    additives_reason: string;
    reason: string;
    buffer_reason: string;
    concentration_reason: string;
    resin_type: string;
}

export interface PurificationStrategy {
    pI: number;
    unstable_zone: [number, number];
    strategies: StrategyRecommendation[];
}

export class PurificationStrategist {
    pi: number;
    sequence: string;

    constructor(pi: number, sequence: string = "") {
        this.pi = pi;
        this.sequence = sequence;
    }

    suggestStrategy(): PurificationStrategy {
        // Define Unstable Zone (Precipitation Risk)
        const unstable_zone: [number, number] = [
            parseFloat((this.pi - 0.5).toFixed(2)),
            parseFloat((this.pi + 0.5).toFixed(2))
        ];

        const strategy: PurificationStrategy = {
            pI: parseFloat(this.pi.toFixed(2)),
            unstable_zone: unstable_zone,
            strategies: []
        };

        // Cystiene check for additives
        const additives: string[] = [];
        let additives_reason = "";
        if (this.sequence && this.sequence.includes("C")) {
            additives.push("DTT");
            additives_reason = "Cysteines detected. Reducing agent (DTT) recommended to prevent aggregation.";
        }

        // Logic
        if (this.pi < 6.0) {
            // Acidic: Use Anion Exchange
            const target_ph = this.pi + 1.0;
            const rec_buffer = target_ph > 7.5 ? "tris" : (target_ph > 5.8 ? "phosphate" : "mes");

            strategy.strategies.push({
                type: "Anion Exchange",
                recommended_ph: parseFloat(target_ph.toFixed(2)),
                recommended_buffer_id: rec_buffer,
                recommended_concentration: 20,
                recommended_salt: 0,
                salt_reason: "Start at 0 mM NaCl to promote binding to IEX resin.",
                recommended_additives: additives,
                additives_reason: additives_reason,
                reason: "Protein is acidic (pI < 6.0). Needs pH > pI to be negatively charged for AEX.",
                buffer_reason: `Chosen for optimal buffering capacity at pH ${target_ph.toFixed(2)}.`,
                concentration_reason: "Standard starting ionic strength for IEX to allow binding.",
                resin_type: "Positive Ligand (e.g., Q-Sepharose)"
            });
        } else if (this.pi > 8.0) {
            // Basic: Use Cation Exchange
            const target_ph = this.pi - 1.0;
            const rec_buffer = target_ph > 5.8 ? "phosphate" : (target_ph > 5.5 ? "mes" : "acetate");

            strategy.strategies.push({
                type: "Cation Exchange",
                recommended_ph: parseFloat(target_ph.toFixed(2)),
                recommended_buffer_id: rec_buffer,
                recommended_concentration: 20,
                recommended_salt: 0,
                salt_reason: "Start at 0 mM NaCl to promote binding to IEX resin.",
                recommended_additives: additives,
                additives_reason: additives_reason,
                reason: "Protein is basic (pI > 8.0). Needs pH < pI to be positively charged for CEX.",
                buffer_reason: `Chosen for optimal buffering capacity at pH ${target_ph.toFixed(2)}.`,
                concentration_reason: "Standard starting ionic strength for IEX to allow binding.",
                resin_type: "Negative Ligand (e.g., SP-Sepharose)"
            });
        } else {
            // Neutral: Propose both
            const aex_ph = this.pi + 1.0;
            const cex_ph = this.pi - 1.0;

            // Option 1: AEX
            if (aex_ph <= 14.0) {
                const rec_buffer_aex = aex_ph > 7.5 ? "tris" : "phosphate";
                strategy.strategies.push({
                    type: "Anion Exchange",
                    recommended_ph: parseFloat(aex_ph.toFixed(2)),
                    recommended_buffer_id: rec_buffer_aex,
                    recommended_concentration: 20,
                    recommended_salt: 0,
                    salt_reason: "Start at 0 mM NaCl to promote binding to IEX resin.",
                    recommended_additives: additives,
                    additives_reason: additives_reason,
                    reason: "Neutral pI. AEX option (pH > pI).",
                    buffer_reason: `Chosen for optimal buffering capacity at pH ${aex_ph.toFixed(2)}.`,
                    concentration_reason: "Standard starting ionic strength for IEX to allow binding.",
                    resin_type: "Positive Ligand"
                });
            }

            // Option 2: CEX
            if (cex_ph >= 0.0) {
                const rec_buffer_cex = cex_ph > 5.8 ? "phosphate" : "mes";
                strategy.strategies.push({
                    type: "Cation Exchange",
                    recommended_ph: parseFloat(cex_ph.toFixed(2)),
                    recommended_buffer_id: rec_buffer_cex,
                    recommended_concentration: 20,
                    recommended_salt: 0,
                    salt_reason: "Start at 0 mM NaCl to promote binding to IEX resin.",
                    recommended_additives: additives,
                    additives_reason: additives_reason,
                    reason: "Neutral pI. CEX option (pH < pI).",
                    buffer_reason: `Chosen for optimal buffering capacity at pH ${cex_ph.toFixed(2)}.`,
                    concentration_reason: "Standard starting ionic strength for IEX to allow binding.",
                    resin_type: "Negative Ligand"
                });
            }
        }

        return strategy;
    }
}
