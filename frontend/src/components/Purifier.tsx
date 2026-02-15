import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { FlaskConical, Beaker, CheckCircle2, Printer, Sliders } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { BufferFormulator } from '../lib/chem-logic/formulator';

interface PurifierProps {
    strategy: any;
}

const Purifier: React.FC<PurifierProps> = ({ strategy }) => {
    const [buffer, setBuffer] = useState('');
    const [volume, setVolume] = useState(500);
    const [concentration, setConcentration] = useState(50);
    const [salt, setSalt] = useState(0);
    const [temperature, setTemperature] = useState(25);
    const [mixingMethod, setMixingMethod] = useState<'smart' | 'titration'>('smart');
    const [targetPH, setTargetPH] = useState<number>(7.4);
    const [additives, setAdditives] = useState<string[]>([]);
    const [recipe, setRecipe] = useState<any>(null);
    const [buffersList, setBuffersList] = useState<any[]>([]);

    // Instance of formulator
    const formulator = new BufferFormulator();

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'ChemFlow-Recipe',
    });

    // Initialize buffer from strategy suggestion
    useEffect(() => {
        if (strategy && strategy.strategies && strategy.strategies.length > 0) {
            const bestStrat = strategy.strategies[0];
            if (bestStrat.recommended_buffer_id) {
                setBuffer(bestStrat.recommended_buffer_id);
            } else {
                setBuffer('tris');
            }

            if (bestStrat.recommended_concentration) {
                setConcentration(bestStrat.recommended_concentration);
            } else {
                setConcentration(50);
            }

            if (bestStrat.recommended_salt !== undefined) {
                setSalt(bestStrat.recommended_salt);
            }

            if (bestStrat.recommended_additives) {
                setAdditives(bestStrat.recommended_additives);
            }

            if (bestStrat.recommended_ph) {
                setTargetPH(bestStrat.recommended_ph);
            }
        }
        // Fetch buffers (local)
        setBuffersList(formulator.buffers);
    }, [strategy]);

    // Effect to calculate recipe when inputs change
    useEffect(() => {
        const getRecipe = async () => {
            if (!buffer) return;
            try {
                // Find selected buffer data
                const bufferData = formulator.buffers.find(b => b.id === buffer);
                if (!bufferData) return;

                const result = formulator.calculateRecipe(
                    bufferData,
                    volume / 1000.0, // Convert to L
                    concentration / 1000.0, // Convert to M
                    targetPH,
                    salt,
                    additives,
                    temperature,
                    mixingMethod
                );
                setRecipe(result);
            } catch (err) {
                console.error(err);
            }
        };

        const debounce = setTimeout(getRecipe, 300);
        return () => clearTimeout(debounce);
    }, [buffer, volume, concentration, salt, additives, temperature, mixingMethod, targetPH, strategy]);

    if (!strategy) return null;

    const getBufferLabel = (b: any) => {
        const isRecommended = strategy?.strategies?.[0]?.recommended_buffer_id === b.id;
        return `${b.name} (pH ${b.useful_range[0]} - ${b.useful_range[1]})${isRecommended ? ' ⭐ Recommended' : ''}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* SCREEN ONLY CONTENT */}
            <div className="print:hidden space-y-6">
                {/* Strategy Card */}
                <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                            <FlaskConical className="h-5 w-5 text-emerald-600" />
                            Recommended Strategy
                        </CardTitle>
                        <CardDescription>
                            Based on pI <strong className="text-slate-800">{strategy.pI}</strong>, we recommend running at <strong className="text-emerald-600">pH {strategy.strategies[0]?.recommended_ph}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-2 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 text-sm">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                            <p className="text-slate-700 leading-relaxed font-medium">{strategy.strategies[0]?.reason}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Configuration Panel */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Sliders className="h-5 w-5 text-slate-500" />
                                Buffer Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-slate-600">Buffer System</Label>
                                <select
                                    className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                                    value={buffer}
                                    onChange={(e) => setBuffer(e.target.value)}
                                >
                                    {buffersList.map((b) => (
                                        <option key={b.id} value={b.id} className={strategy?.strategies?.[0]?.recommended_buffer_id === b.id ? "font-bold text-emerald-600" : ""}>
                                            {getBufferLabel(b)}
                                        </option>
                                    ))}
                                </select>
                                {strategy?.strategies?.[0]?.buffer_reason && buffer === strategy.strategies[0].recommended_buffer_id && (
                                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {strategy.strategies[0].buffer_reason}
                                    </p>
                                )}
                            </div>

                            {/* pH Control */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-600">Target pH</Label>
                                    <span className="text-sm font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{targetPH}</span>
                                </div>
                                <input
                                    type="range"
                                    min={buffersList.find(b => b.id === buffer)?.useful_range[0] || 4.0}
                                    max={buffersList.find(b => b.id === buffer)?.useful_range[1] || 10.0}
                                    step="0.1"
                                    value={targetPH}
                                    onChange={(e) => setTargetPH(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                {buffer && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-slate-400" />
                                        Recommended range for {buffersList.find(b => b.id === buffer)?.name}: {buffersList.find(b => b.id === buffer)?.useful_range[0]} - {buffersList.find(b => b.id === buffer)?.useful_range[1]}
                                    </p>
                                )}
                            </div>

                            {/* Method Toggle */}
                            <div className="space-y-3">
                                <Label className="text-slate-600">Preparation Method</Label>
                                <div className="flex bg-slate-100 p-1 rounded-md">
                                    <button
                                        onClick={() => setMixingMethod('smart')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${mixingMethod === 'smart'
                                            ? 'bg-white text-emerald-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        ✨ Smart Mix
                                    </button>
                                    <button
                                        onClick={() => setMixingMethod('titration')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${mixingMethod === 'titration'
                                            ? 'bg-white text-emerald-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        💧 Titration
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {mixingMethod === 'smart'
                                        ? "Calculates exact mass of Acid and Base components. No pH adjustment needed."
                                        : "Standard preparation. Dissolve base and adjust pH with HCl/NaOH."}
                                </p>
                            </div>

                            {/* Temperature Control */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-600">Temperature</Label>
                                    <span className="text-sm font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{temperature} °C</span>
                                </div>
                                <div className="flex gap-4">
                                    {[4, 20, 25, 37].map((temp) => (
                                        <button
                                            key={temp}
                                            onClick={() => setTemperature(temp)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${temperature === temp
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {temp}°C
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-600">Volume</Label>
                                    <span className="text-sm font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{volume} mL</span>
                                </div>
                                <input
                                    type="range" min="100" max="5000" step="50"
                                    value={volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-600">Concentration</Label>
                                    <span className="text-sm font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{concentration} mM</span>
                                </div>
                                <input
                                    type="range" min="10" max="1000" step="5"
                                    value={concentration}
                                    onChange={(e) => setConcentration(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                {strategy?.strategies?.[0]?.concentration_reason && concentration === strategy.strategies[0].recommended_concentration && (
                                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Recommended: {strategy.strategies[0].recommended_concentration} mM - {strategy.strategies[0].concentration_reason}
                                    </p>
                                )}
                            </div>

                            {/* Salt Configuration */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-600">Salt (NaCl)</Label>
                                    <span className="text-sm font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{salt} mM</span>
                                </div>
                                <input
                                    type="range" min="0" max="1000" step="50"
                                    value={salt}
                                    onChange={(e) => setSalt(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                {strategy?.strategies?.[0]?.recommended_salt !== undefined && salt === strategy.strategies[0].recommended_salt && (
                                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Recommended: {strategy.strategies[0].recommended_salt} mM - {strategy.strategies[0].salt_reason}
                                    </p>
                                )}
                            </div>

                            {/* Additives Configuration */}
                            <div className="space-y-3">
                                <Label className="text-slate-600">Additives</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`flex items-center gap-2 border p-3 rounded-md cursor-pointer transition-all ${additives.includes('DTT') ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={additives.includes('DTT')}
                                            onChange={(e) => {
                                                if (e.target.checked) setAdditives([...additives, 'DTT']);
                                                else setAdditives(additives.filter(a => a !== 'DTT'));
                                            }}
                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">DTT (1 mM)</span>
                                            {strategy?.strategies?.[0]?.recommended_additives?.includes('DTT') && (
                                                <span className="text-[10px] text-emerald-600 font-medium">⭐ Recommended</span>
                                            )}
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-2 border p-3 rounded-md cursor-pointer transition-all ${additives.includes('EDTA') ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={additives.includes('EDTA')}
                                            onChange={(e) => {
                                                if (e.target.checked) setAdditives([...additives, 'EDTA']);
                                                else setAdditives(additives.filter(a => a !== 'EDTA'));
                                            }}
                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">EDTA (1 mM)</span>
                                        </div>
                                    </label>
                                </div>
                                {strategy?.strategies?.[0]?.recommended_additives?.includes('DTT') && additives.includes('DTT') && (
                                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {strategy.strategies[0].additives_reason}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* The Recipe Card (Premium Look) - Hidden on print, referenced for logic */}
                    <div className="h-full">
                        <Card className="bg-slate-900 text-white border-0 shadow-xl h-full flex flex-col justify-between relative overflow-hidden group">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000"></div>

                            <div>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-emerald-400">
                                        <Beaker className="h-5 w-5" />
                                        The Recipe
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">Exact laboratory formulation</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 relative z-10">
                                    {recipe ? (
                                        <>
                                            <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                                                <span className="text-slate-400 text-sm font-medium">Reagent</span>
                                                <span className="font-mono text-xl font-bold tracking-tight">{recipe.buffer_name}</span>
                                            </div>

                                            {recipe.components ? (
                                                <div className="space-y-3 border-b border-slate-800 pb-3">
                                                    {recipe.components.map((comp: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center">
                                                            <span className="text-slate-400 text-sm">{comp.name}</span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="font-mono text-2xl text-emerald-400 font-bold">{comp.mass}</span>
                                                                <span className="text-sm font-medium text-emerald-600">g</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/50">
                                                        <span className="text-slate-500 text-xs uppercase">Total Mass</span>
                                                        <span className="font-mono text-sm text-slate-500">{recipe.mass_to_weigh_g} g</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                                                    <span className="text-slate-400 text-sm font-medium">Mass to Weigh</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-mono text-4xl text-emerald-400 font-bold">{recipe.mass_to_weigh_g}</span>
                                                        <span className="text-sm font-medium text-emerald-600">g</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="pt-2 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                                                <span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-2">Preparation Instructions</span>
                                                <div className="space-y-3">
                                                    {recipe.instruction_steps?.map((step: string, idx: number) => (
                                                        <div key={idx} className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                className="mt-1 h-4 w-4 rounded border-slate-500 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                                                            />
                                                            <span className="font-mono text-sm leading-relaxed text-slate-300 flex-1">{step}</span>
                                                        </div>
                                                    )) || (
                                                            <p className="font-mono text-sm leading-relaxed text-slate-300">
                                                                {recipe.instructions}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-3">
                                            <Beaker className="h-8 w-8 opacity-20" />
                                            <p>Adjust parameters to calculate...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </div>
                            <CardFooter className="relative z-10 pt-6">
                                <Button variant="secondary" onClick={() => handlePrint && handlePrint()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-900/20 font-semibold transition-all">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Protocol / Export PDF
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            {/* PRINT ONLY LAYOUT */}
            <div ref={componentRef} className="hidden print:block text-black p-8 max-w-[210mm] mx-auto bg-white">
                {/* Header */}
                <div className="border-b-2 border-emerald-600 pb-4 mb-6 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FlaskConical className="h-8 w-8 text-emerald-600" />
                            <h1 className="text-2xl font-bold text-slate-900">ChemFlow Protocol</h1>
                        </div>
                        <p className="text-sm text-slate-500">Laboratory Buffer Formulation Form</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-mono text-slate-500">Generated on:</p>
                        <p className="font-medium text-slate-800">{new Date().toLocaleString()}</p>
                    </div>
                </div>

                {recipe ? (
                    <div className="space-y-8">
                        {/* Buffer Info Table */}
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h2 className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider">Buffer Specifications</h2>
                            <div className="grid grid-cols-3 gap-y-4 gap-x-8 text-sm">
                                <div>
                                    <span className="block text-xs text-slate-500 uppercase">Buffer System</span>
                                    <span className="font-bold text-lg text-slate-900">{recipe.buffer_name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500 uppercase">Target pH</span>
                                    <span className="font-bold text-lg text-slate-900">{targetPH}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500 uppercase">Volume</span>
                                    <span className="font-bold text-lg text-slate-900">{volume} mL</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500 uppercase">Concentration</span>
                                    <span className="font-medium text-slate-800">{concentration} mM</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500 uppercase">Temperature</span>
                                    <span className="font-medium text-slate-800">{temperature} °C</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500 uppercase">Method</span>
                                    <span className="font-medium text-slate-800 capitalize">{mixingMethod} Mix</span>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients Table */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-emerald-500 pl-3">Reagents & Materials</h2>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 border-b border-slate-300">
                                        <th className="py-2 px-3 text-left font-semibold text-slate-700">Component</th>
                                        <th className="py-2 px-3 text-right font-semibold text-slate-700">Mass (g)</th>
                                        <th className="py-2 px-3 text-center font-semibold text-slate-700">Check</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipe.components && recipe.components.map((comp: any, idx: number) => (
                                        <tr key={idx} className="border-b border-slate-200">
                                            <td className="py-3 px-3 text-slate-800 font-medium">{comp.name}</td>
                                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{comp.mass}</td>
                                            <td className="py-3 px-3 text-center">
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded inline-block"></div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Checklist */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-emerald-500 pl-3">Preparation Procedure</h2>
                            <div className="space-y-2">
                                {recipe.instruction_steps?.map((step: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 p-2">
                                        <span className="font-bold text-slate-400 w-6">{idx + 1}.</span>
                                        <p className="text-slate-800 text-sm leading-relaxed flex-1">{step}</p>
                                        <div className="w-6 h-6 border-2 border-slate-300 rounded shrink-0"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Methodology & References */}
                        <div className="border-t-2 border-slate-100 pt-6 mt-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Methodology</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Buffer calculated using the <strong>Henderson-Hasselbalch equation</strong>:<br />
                                        pH = pKa + log([Base]/[Acid]).<br />
                                        Temperature correction applied using coefficient d(pKa)/dT to adjust pKa from 25°C standard.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Key References</h3>
                                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                                        <li>Beynon, R. J., & Easterby, J. S. (1996). <em>Buffer Solutions: The Basics</em>.</li>
                                        <li>Kyte, J., & Doolittle, R. F. (1982). <em>J. Mol. Biol.</em> 157, 105-132.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Sign-off Area */}
                        <div className="mt-12 pt-6 border-t border-slate-300">
                            <div className="flex justify-between gap-12">
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase mb-4">Prepared By</p>
                                    <div className="border-b border-slate-300 h-8"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase mb-4">Date</p>
                                    <div className="border-b border-slate-300 h-8"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase mb-4">Verified By</p>
                                    <div className="border-b border-slate-300 h-8"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-12 text-slate-500">
                        <p>No recipe generated. Please configure settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default Purifier;
