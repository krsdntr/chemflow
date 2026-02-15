import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label as UiLabel } from './ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label as RechartsLabel } from 'recharts';
import { Loader2, Activity, Zap, Search, Ruler, Weight, Fingerprint } from 'lucide-react';
import axios from 'axios';
import { ProteinAnalyzer } from '../lib/chem-logic/protein-analyzer';
import { PurificationStrategist } from '../lib/chem-logic/strategist';

interface AnalyzerProps {
    onAnalysisComplete: (data: any) => void;
}

const Analyzer: React.FC<AnalyzerProps> = ({ onAnalysisComplete }) => {
    const [sequence, setSequence] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<any>(null);
    const [uniprotId, setUniprotId] = useState('');

    const handleFetchUniprot = async () => {
        if (!uniprotId.trim()) return;
        setLoading(true);
        setError('');
        try {
            // Keep Uniprot fetch as an external API call for now (or use a CORS proxy if needed, 
            // but usually Uniprot supports CORS or we validly fetch from frontend if configured)
            // Actually, the previous backend proxy was to avoid CORS or simplify.
            // For now, let's try fetching directly or keep the backend for this ONE feature if needed,
            // OR use a public CORS proxy.
            // Let's try direct fetch from Uniprot REST API which allows CORS.
            const response = await axios.get(`https://rest.uniprot.org/uniprotkb/${uniprotId}.fasta`);
            const fastaData = response.data;
            // Extract sequence
            const parts = fastaData.trim().split('\n');
            const seq = parts.slice(1).join('');
            setSequence(seq);
        } catch (err: any) {
            // Fallback or error
            setError('Fetch failed. Uniprot ID might be invalid.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!sequence.trim()) return;
        setLoading(true);
        setError('');
        try {
            // Local Logic
            const analyzer = new ProteinAnalyzer(sequence);
            const props = analyzer.getProperties();
            const curve = analyzer.generateTitrationCurve();

            const strategist = new PurificationStrategist(props.pI, sequence);
            const strategy = strategist.suggestStrategy();

            const analysisResult = {
                properties: props,
                titration_curve: curve,
                strategy: strategy
            };

            setResult(analysisResult);
            onAnalysisComplete(analysisResult);
        } catch (err: any) {
            setError(err.message || 'Analysis failed. Check sequence format.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Activity className="h-5 w-5 text-primary" />
                        Sequence Input
                    </CardTitle>
                    <CardDescription>Analyze physicochemical properties from FASTA sequence.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Uniprot Fetch Section */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <UiLabel htmlFor="uniprot" className="text-xs font-semibold uppercase text-slate-500 mb-2 block">Import from Uniprot</UiLabel>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="uniprot"
                                    placeholder="Enter Accession ID (e.g. P02769)"
                                    value={uniprotId}
                                    onChange={(e) => setUniprotId(e.target.value)}
                                    className="pl-9 bg-white"
                                />
                            </div>
                            <Button variant="secondary" onClick={handleFetchUniprot} disabled={loading || !uniprotId}>
                                Fetch
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400">Or paste sequence</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <UiLabel htmlFor="sequence">Protein Sequence (FASTA)</UiLabel>
                        <Textarea
                            id="sequence"
                            placeholder="MKT..."
                            className="font-mono text-sm h-40 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            value={sequence}
                            onChange={(e) => setSequence(e.target.value)}
                        />
                        <p className="text-xs text-slate-400 text-right">{sequence.length} characters</p>
                    </div>

                    <Button onClick={handleAnalyze} disabled={loading} className="w-full h-12 text-lg shadow-md hover:shadow-lg transition-all">
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                        Analyze Properties
                    </Button>
                    {error && <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">{error}</p>}
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-md">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center pt-6">
                                <Ruler className="h-6 w-6 mb-2 opacity-80" />
                                <span className="text-xs uppercase tracking-wider opacity-80">Length</span>
                                <span className="text-2xl font-bold">{result.properties.length}</span>
                                <span className="text-xs opacity-60">aa</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-md">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center pt-6">
                                <Weight className="h-6 w-6 mb-2 opacity-80" />
                                <span className="text-xs uppercase tracking-wider opacity-80">Weight</span>
                                <span className="text-2xl font-bold">{(result.properties.molecular_weight / 1000).toFixed(1)}</span>
                                <span className="text-xs opacity-60">kDa</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-md">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center pt-6">
                                <Fingerprint className="h-6 w-6 mb-2 opacity-80" />
                                <span className="text-xs uppercase tracking-wider opacity-80">Isoelectric Pt</span>
                                <span className="text-2xl font-bold">{result.properties.pI.toFixed(2)}</span>
                                <span className="text-xs opacity-60">pH</span>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-lg border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Titration Curve</CardTitle>
                            <CardDescription>Net Charge vs pH Profile</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={result.titration_curve} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#94a3b8" />
                                    <XAxis
                                        dataKey="ph"
                                        type="number"
                                        domain={[0, 14]}
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'pH', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#64748b' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Net Charge', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#0f172a', fontSize: '13px', fontWeight: 600 }}
                                        formatter={(value: number | undefined) => [value?.toFixed(2) || '0.00', 'Charge']}
                                        labelFormatter={(label) => `pH ${label}`}
                                    />
                                    <ReferenceLine x={result.properties.pI} stroke="#ef4444" strokeDasharray="3 3">
                                        <RechartsLabel value="pI" position="insideTopRight" fill="#ef4444" fontSize={12} />
                                    </ReferenceLine>
                                    <ReferenceLine y={0} stroke="#94a3b8" />
                                    <Line type="monotone" dataKey="charge" stroke="#0d9488" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#0d9488' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Analyzer;
