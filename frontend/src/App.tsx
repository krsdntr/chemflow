import { useState } from 'react'
import Analyzer from './components/Analyzer'
import Purifier from './components/Purifier'
import { Card, CardContent } from './components/ui/card'
import { FlaskConical, Dna } from 'lucide-react'

import { DocumentationModal } from './components/DocumentationModal'
import { SettingsModal } from './components/SettingsModal'

function App() {
  const [analysisData, setAnalysisData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              ChemFlow<span className="text-primary">.ai</span>
            </span>
          </div>
          <div className="flex gap-4">
            <DocumentationModal />
            <SettingsModal />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-8">
          {/* Analysis Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Dna className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-slate-800">Protein Characterization</h2>
            </div>
            <Analyzer onAnalysisComplete={setAnalysisData} />
          </div>

          {/* Strategy & Recipe Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-slate-800">Purification Strategy</h2>
            </div>

            {analysisData ? (
              <Purifier strategy={analysisData.strategy} />
            ) : (
              <Card className="h-[200px] flex flex-col items-center justify-center border-dashed border-2 bg-slate-50/50">
                <CardContent className="text-center text-muted-foreground max-w-md">
                  <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                    <Dna className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Analyze</h3>
                  <p className="text-sm text-slate-500">
                    Enter a protein sequence or fetch a Uniprot ID above to generate a tailored purification protocol.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2026 ChemFlow &bull; Deterministic Protein Engineering. Designed with ❤ by Krisdiantoro</p>
        </div>
      </footer>
    </div>
  )
}

export default App
