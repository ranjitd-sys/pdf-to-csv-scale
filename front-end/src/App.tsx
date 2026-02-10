import React, { useState } from 'react';
import { Upload, FileArchive, ArrowRight, Settings2, FileSpreadsheet, FileText } from 'lucide-react';
import "./index.css"
export default function ZipMorph() {
  const [targetType, setTargetType] = useState('PDF'); // PDF or CSV
  const [paramMode, setParamMode] = useState('fixed'); // fixed or custom
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="min-h-screen bg-white min-w-100 text-black font-mono selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-black p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tighter uppercase italic">ZipMorph_v2.6</h1>
        <div className="flex gap-6 text-xs uppercase font-bold">
          <a href="#docs" className="hover:underline">Documentation</a>
          <a href="#api" className="hover:underline">API Access</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="mb-20">
          <h2 className="text-7xl font-bold tracking-tighter leading-none mb-6">
            ZIP TO <br />
            <span className="bg-black text-white px-2">STRUCTURAL</span> DATA.
          </h2>
          <p className="text-sm max-w-md uppercase leading-relaxed text-gray-500">
            Convert compressed archives into flattened PDF reports or parsed CSV datasets using heuristic mapping. 
            Local processing. Zero latency.
          </p>
        </section>

        {/* The Tool Interface */}
        <div className="border-2 border-black">
          {/* Dropzone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`p-16 border-b-2 border-black flex flex-col items-center justify-center transition-colors ${isDragging ? 'bg-black text-white' : 'bg-white'}`}
          >
            <Upload size={48} strokeWidth={1.5} className="mb-4" />
            <p className="text-xs uppercase font-bold tracking-widest">Drop .ZIP file to initialize</p>
            <input type="file" className="hidden" id="fileInput" />
            <label htmlFor="fileInput" className="mt-4 text-[10px] underline cursor-pointer hover:font-bold">OR BROWSE FILES</label>
          </div>

          {/* Configuration Grid */}
          <div className="grid md:grid-cols-2">
            {/* Format Toggle */}
            <div className="p-8 border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-black">
              <label className="text-[10px] font-bold uppercase block mb-4">Output Format</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setTargetType('PDF')}
                  className={`flex-1 py-4 border border-black flex items-center justify-center gap-2 transition-all ${targetType === 'PDF' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                >
                  <FileText size={16} /> <span className="text-xs font-bold uppercase">PDF</span>
                </button>
                <button 
                  onClick={() => setTargetType('CSV')}
                  className={`flex-1 py-4 border border-black flex items-center justify-center gap-2 transition-all ${targetType === 'CSV' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                >
                  <FileSpreadsheet size={16} /> <span className="text-xs font-bold uppercase">CSV</span>
                </button>
              </div>
            </div>

            {/* Parameter Selection */}
            <div className="p-8">
              <label className="text-[10px] font-bold uppercase block mb-4">Parameter Logic</label>
              <div className="space-y-3">
                <button 
                  onClick={() => setParamMode('fixed')}
                  className="w-full flex justify-between items-center group"
                >
                  <span className={`text-xs uppercase ${paramMode === 'fixed' ? 'font-bold underline' : ''}`}>Fixed (Standard Mapping)</span>
                  <div className={`w-3 h-3 border border-black rounded-full ${paramMode === 'fixed' ? 'bg-black' : ''}`} />
                </button>
                <button 
                  onClick={() => setParamMode('custom')}
                  className="w-full flex justify-between items-center group"
                >
                  <span className={`text-xs uppercase ${paramMode === 'custom' ? 'font-bold underline' : ''}`}>Custom (Schema Definition)</span>
                  <div className={`w-3 h-3 border border-black rounded-full ${paramMode === 'custom' ? 'bg-black' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Custom Params Input (Conditional) */}
          {paramMode === 'custom' && (
            <div className="p-8 border-t-2 border-black bg-gray-50 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-bold uppercase block mb-2">Schema Mapping (JSON / Key-Value)</label>
              <textarea 
                className="w-full bg-transparent border border-black p-4 text-xs focus:outline-none h-32"
                placeholder="row_delimiter: '\n'&#10;column_mapping: true&#10;header_row: 1"
              />
            </div>
          )}

          {/* Execute Action */}
          <button className="w-full bg-black text-white py-6 flex items-center justify-center gap-4 group hover:bg-white hover:text-black border-t-2 border-black transition-all">
            <span className="text-sm font-bold uppercase tracking-[0.2em]">Execute Conversion</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row justify-between gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
        <div className="text-[10px] uppercase space-y-2">
          <p className="font-bold">Security Protocol</p>
          <p>Files are processed in-memory. No data leaves the local client. SHA-256 verified.</p>
        </div>
        <div className="text-[10px] uppercase space-y-2 text-right">
          <p className="font-bold text-black">Status: Systems Nominal</p>
          <p>© 2026 ZipMorph Labs.</p>
        </div>
      </footer>
    </div>
  );
}