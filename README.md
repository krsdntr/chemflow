# ChemFlow: Deterministic Protein Buffer Formulation & Analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.example.svg)](https://doi.org/10.5281/zenodo.example)

**ChemFlow** is an open-source, serverless web application designed to streamline the preparation of protein purification buffers. By integrating physicochemical analysis (pI, GRAVY) with a deterministic buffer formulation engine, ChemFlow eliminates manual calculations and reduces batch-to-batch variability in biochemical experiments.

🔗 **Live Demo:** [https://krsdntr.github.io/chemflow/](https://krsdntr.github.io/chemflow/)

---

## Key Features

### 1. 🧬 Protein Characterization
- **Isoelectric Point (pI)** calculation using the iterative dissociation algorithm.
- **GRAVY (Grand Average of Hydropathy)** score for solubility prediction.
- **Titration Curve** visualization to predict charge states across pH ranges.

### 2. 🎯 Smart Purification Strategy
- Automatically suggests **Ion Exchange (IEX)** strategies (Anion vs. Cation) based on pI.
- Recommends optimal **pH**, **Buffer System**, and **Salt Concentration**.
- Detects oxidation-prone residues (Cysteines) and recommends reducing agents (DTT).

### 3. ⚖️ Precision Buffer Formulator
- **Henderson-Hasselbalch Equation**: Calculates exact ratios of conjugate acid/base.
- **Temperature Correction**: Adjusts pKa values based on operating temperature (e.g., 4°C vs 25°C).
- **Gravimetric "Smart Mix"**: Generates recipes based on mass (g), eliminating the need for manual pH titration.
- **Additives Support**: Automatically calculates masses for Salts (NaCl), EDTA, and DTT.

### 4. 📄 Laboratory Documentation
- Generates **Publication-Ready PDF Protocols**.
- Includes **Safety Checklists**, **Reagent Tables**, and **Methodology Citations**.

---

## Scientific Methodology

ChemFlow operates on deterministic algorithms derived from standard biochemical literature:

1.  **pI Calculation**: 
    > Iterative algorithm summing partial charges of ionizable groups (N-term, C-term, Lys, Arg, His, Asp, Glu, Tyr, Cys).  
    > *Reference: Gasteiger E., et al. (2005). The Proteomics Protocols Handbook.*

2.  **Buffer Formulation**:
    > $$ pH = pK_a + \log \left( \frac{[A^-]}{[HA]} \right) $$  
    > Temperature correction applied: $ pK_a(T) = pK_a(25^\circ C) + \frac{dpK_a}{dT} \Delta T $  
    > *Reference: Beynon, R. J., & Easterby, J. S. (1996). Buffer Solutions: The Basics.*

3.  **Hydropathy (GRAVY)**:
    > Arithmetic mean of the sum of hydropathy values of all amino acids.  
    > *Reference: Kyte, J., & Doolittle, R. F. (1982). J. Mol. Biol.*

---

## Installation & Development

ChemFlow is a strict **Client-Side Application** built with React, TypeScript, and Vite. It requires no backend server.

### Prerequisites
- Node.js (v18+)
- npm

### Local Setup
```bash
git clone https://github.com/krsdntr/chemflow.git
cd chemflow/frontend
npm install
npm run dev
```

### Deployment
ChemFlow is designed for static hosting (GitHub Pages, Netlify, Vercel).
```bash
npm run build
npm run deploy # Deploys to gh-pages branch
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use ChemFlow in your research, please cite:

> Krisdiantoro, et al. (2026). ChemFlow: A Serverless Framework for Reproducible Protein Buffer Formulation.
