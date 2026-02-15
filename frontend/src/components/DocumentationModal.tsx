import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"

export function DocumentationModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">Documentation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden bg-white/95 backdrop-blur-xl">
                <div className="p-6 pb-0">
                    <DialogHeader className="pb-4 border-b border-slate-100">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Scientific Methodology & Documentation
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Technical reference for ChemFlow's algorithms and calculations.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="h-full max-h-[calc(85vh-120px)] overflow-y-auto px-6 pb-6">
                    <div className="space-y-8 py-4 text-slate-700 leading-relaxed max-w-3xl">

                        {/* Section 1: Protein Analysis */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                                Physicochemical Analysis
                            </h3>
                            <div className="pl-8 space-y-4">
                                <div>
                                    <h4 className="font-semibold text-slate-800">Isoelectric Point (pI)</h4>
                                    <p className="text-sm">
                                        The pI is calculated using the iterative dissociation algorithm. The net charge <em>Q</em> at a given pH is determined by summing the partial charges of all ionizable groups:
                                    </p>
                                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200 my-2 font-mono text-xs overflow-x-auto">
                                        Q = &sum; (N_i / (1 + 10^(pH - pKa_i))) - &sum; (N_j / (1 + 10^(pKa_j - pH)))
                                    </div>
                                    <p className="text-sm text-slate-500">Where <em>N</em> is the count of each amino acid residue and <em>pKa</em> values are sourced from the EMBOSS data set.</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-800">GRAVY (Grand Average of Hydropathy)</h4>
                                    <p className="text-sm">
                                        Calculated as the sum of hydropathy values of all amino acids divided by the protein length (Kyte & Doolittle, 1982). Positive values indicate hydrophobicity; negative values indicate hydrophilicity.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Purification Strategy */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                                Ion Exchange Strategy
                            </h3>
                            <div className="pl-8 space-y-2">
                                <p className="text-sm">
                                    The application recommends an Ion Exchange (IEX) strategy based on the &Delta;pI principle:
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                                    <li><strong>Anion Exchange (AEX):</strong> Recommended for acidic proteins (pI &lt; 7). Operating pH is set 1.0 unit <em>above</em> pI to ensure net negative charge.</li>
                                    <li><strong>Cation Exchange (CEX):</strong> Recommended for basic proteins (pI &gt; 7). Operating pH is set 1.0 unit <em>below</em> pI to ensure net positive charge.</li>
                                    <li><strong>Reasoning:</strong> A gap of &ge; 0.5 pH units typically ensures sufficient binding capacity. Ideally, 1.0 unit is used for robust capture.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3: Buffer Formulation */}
                        <section className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded flex items-center justify-center text-xs">3</span>
                                Buffer Formulator
                            </h3>
                            <div className="pl-8 space-y-4">
                                <p className="text-sm">
                                    Recipes are calculated using the <strong>Henderson-Hasselbalch equation</strong> to determine the precise ratio of conjugate acid to conjugate base required for the target pH.
                                </p>

                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 font-mono text-xs text-center">
                                    pH = pKa + log([Base] / [Acid])
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-800">Smart Mix (Acid/Base) Method</h4>
                                    <p className="text-sm">
                                        Specifically solves for the mass of the Acid form (<em>m<sub>A</sub></em>) and Base form (<em>m<sub>B</sub></em>) to achieve the target concentration (<em>C</em>) and pH without manual titration:
                                    </p>
                                    <div className="text-xs bg-slate-50 p-2 rounded mt-1 border border-slate-100">
                                        Ratio = 10^(pH - pKa)<br />
                                        Fraction_Base = Ratio / (1 + Ratio)<br />
                                        Mass_Base = C * Vol * MW_Base * Fraction_Base
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-800">Temperature Correction</h4>
                                    <p className="text-sm">
                                        Buffer pKa values are temperature-dependent. The system corrects the pKa for the target temperature (<em>T</em>) using the temperature coefficient (<em>dpKa/dT</em>):
                                    </p>
                                    <div className="text-xs bg-slate-50 p-2 rounded mt-1 border border-slate-100 font-mono">
                                        pKa_T = pKa_25 + (dpKa/dT) * (T - 25)
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        <em>Example: Tris has a coefficient of -0.028/°C. A pH 8.0 buffer at 25°C will be pH 8.42 at 10°C.</em>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* References */}
                        <section className="space-y-3 pt-4 border-t border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">References</h3>
                            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2">
                                <li>
                                    Kyte, J., & Doolittle, R. F. (1982). A simple method for displaying the hydropathic character of a protein. <em>Journal of Molecular Biology</em>, 157(1), 105-132.
                                </li>
                                <li>
                                    Beynon, R. J., & Easterby, J. S. (1996). <em>Buffer Solutions: The Basics</em>. Oxford University Press.
                                </li>
                                <li>
                                    Gasteiger E., et al. (2005). Protein Identification and Analysis Tools on the ExPASy Server. <em>The Proteomics Protocols Handbook</em>.
                                </li>
                                <li>
                                    Mohan, C. (2003). Buffers: A guide for the preparation and use of buffers in biological systems. <em>Calbiochem Corporation</em>.
                                </li>
                            </ol>
                        </section>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
