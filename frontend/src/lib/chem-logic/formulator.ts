import buffersData from '../../data/buffers.json';

interface BufferDefinition {
    id: string;
    name: string;
    pka_25c: number;
    useful_range: [number, number];
    molecular_weight_base: number;
    name_base: string;
    molecular_weight_acid: number;
    name_acid: string;
    temperature_coeff: number;
    notes: string;
}

interface Component {
    name: string;
    mass: number;
}

interface RecipeResult {
    buffer_name: string;
    mass_to_weigh_g: number;
    instructions: string;
    instruction_steps: string[];
    components: Component[] | null;
}

export class BufferFormulator {
    buffers: BufferDefinition[];

    constructor() {
        this.buffers = buffersData as BufferDefinition[];
    }

    findBestBuffer(targetPH: number): BufferDefinition | null {
        const candidates = [];
        for (const buf of this.buffers) {
            const [minPH, maxPH] = buf.useful_range;
            if (targetPH >= minPH && targetPH <= maxPH) {
                const delta = Math.abs(buf.pka_25c - targetPH);
                candidates.push({ delta, buf });
            }
        }

        // Sort by smallest delta
        candidates.sort((a, b) => a.delta - b.delta);

        if (candidates.length === 0) return null;
        return candidates[0].buf;
    }

    calculateRecipe(
        bufferData: BufferDefinition,
        volumeL: number,
        concentrationM: number,
        targetPH: number | null = null,
        saltMM: number = 0,
        additives: string[] = [],
        temperatureC: number = 25,
        mixingMethod: "smart" | "titration" = "smart"
    ): RecipeResult {

        if (targetPH === null) {
            targetPH = bufferData.pka_25c;
        }

        // Temperature Correction
        let pKa = bufferData.pka_25c;
        if (bufferData.temperature_coeff) {
            pKa += bufferData.temperature_coeff * (temperatureC - 25.0);
        }

        // Henderson-Hasselbalch
        // pH = pKa + log([Base]/[Acid])
        // ratio = [Base]/[Acid] = 10^(pH - pKa)
        const ratio = Math.pow(10, targetPH - pKa);

        const fracBase = ratio / (1 + ratio);
        const fracAcid = 1 - fracBase;

        const components: Component[] = [];
        let massTotal = 0;

        // 1. Salt and Additives Logic
        const MW_NACL = 58.44;
        const MW_EDTA = 372.24;
        const MW_DTT = 154.25;

        const saltAdditiveInstructions: string[] = [];

        if (saltMM > 0) {
            const saltMass = (saltMM / 1000.0) * volumeL * MW_NACL;
            const saltMassRounded = parseFloat(saltMass.toFixed(4));
            saltAdditiveInstructions.push(`Add ${saltMassRounded}g of NaCl (${saltMM} mM).`);
            components.push({ name: "NaCl", mass: saltMassRounded });
            massTotal += saltMass;
        }

        if (additives) {
            for (const additive of additives) {
                if (additive === "EDTA") {
                    const edtaMass = (1.0 / 1000.0) * volumeL * MW_EDTA;
                    const edtaMassRounded = parseFloat(edtaMass.toFixed(4));
                    saltAdditiveInstructions.push(`Add ${edtaMassRounded}g of EDTA (1 mM).`);
                    components.push({ name: "EDTA (1 mM)", mass: edtaMassRounded });
                    massTotal += edtaMass;
                } else if (additive === "DTT") {
                    const dttMass = (1.0 / 1000.0) * volumeL * MW_DTT;
                    const dttMassRounded = parseFloat(dttMass.toFixed(4));
                    saltAdditiveInstructions.push(`Add ${dttMassRounded}g of DTT (1 mM).`);
                    components.push({ name: "DTT (1 mM)", mass: dttMassRounded });
                    massTotal += dttMass;
                }
            }
        }

        // 2. Buffer Logic
        let bufferIntro = "";
        let phInstruction = "";

        if (mixingMethod === "smart" && bufferData.molecular_weight_acid && bufferData.molecular_weight_base) {
            // Smart Mixing
            const mwAcid = bufferData.molecular_weight_acid;
            const mwBase = bufferData.molecular_weight_base;

            const concAcid = concentrationM * fracAcid;
            const concBase = concentrationM * fracBase;

            const massAcid = concAcid * volumeL * mwAcid;
            const massBase = concBase * volumeL * mwBase;

            massTotal += massAcid + massBase;

            bufferIntro = `Mix ${massAcid.toFixed(3)} g of ${bufferData.name_acid || 'Acid Form'} and ${massBase.toFixed(3)} g of ${bufferData.name_base || 'Base Form'} in approx ${(volumeL * 0.8 * 1000).toFixed(0)} mL water.`;

            // Insert at beginning
            components.unshift({ name: bufferData.name_base || 'Base', mass: parseFloat(massBase.toFixed(3)) });
            components.unshift({ name: bufferData.name_acid || 'Acid', mass: parseFloat(massAcid.toFixed(3)) });

            phInstruction = `Check pH (Theoretical: ${targetPH}`;
        } else {
            // Titration fallback
            const mw = bufferData.molecular_weight_base;
            const bufferMass = concentrationM * volumeL * mw;
            massTotal += bufferMass;

            bufferIntro = `Dissolve ${bufferMass.toFixed(4)}g of ${bufferData.name} in approx ${volumeL * 0.8 * 1000}mL water.`;

            components.unshift({ name: bufferData.name, mass: parseFloat(bufferMass.toFixed(3)) });

            phInstruction = `Adjust pH to ${targetPH}`;
        }

        if (temperatureC !== 25) {
            phInstruction += ` at ${temperatureC}°C).`;
        } else {
            phInstruction += " at 25°C).";
        }

        // 3. Assemble
        const finalSteps = [bufferIntro];
        finalSteps.push(...saltAdditiveInstructions);
        finalSteps.push(phInstruction);
        finalSteps.push(`Fill to ${volumeL * 1000} mL with water.`);

        return {
            buffer_name: bufferData.name,
            mass_to_weigh_g: parseFloat(massTotal.toFixed(3)),
            instructions: finalSteps.join(" "),
            instruction_steps: finalSteps,
            components: components
        };
    }
}
