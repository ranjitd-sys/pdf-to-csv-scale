import React, { useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, FileArchive, ArrowRight, FileSpreadsheet, FileText, X, Terminal, Lock, Code2, CheckCircle2 } from 'lucide-react';

type TargetFormat = 'PDF' | 'CSV';
type ParamMode = 'fixed' | 'custom';

// 1. Define the Standard XYZ Schema Example
const FIXED_STANDARD_SCHEMA = {
  version: "2.6.0-stable",
  engine: "XYZ-Morph-Core",
  logic: {
    recursion: "flatten_all",
    filtering: ["*.json", "*.xml", "*.csv", "*.txt"],
    conflict_resolution: "append_timestamp",
    encoding: "UTF-8"
  },
  output: {
    compression: false,
    generate_checksum: true
  }
};

export default function ZipMorph() {
  const [targetType, setTargetType] = useState<TargetFormat>('PDF');
  const [paramMode, setParamMode] = useState<ParamMode>('fixed');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [customSchema, setCustomSchema] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === "application/zip" || droppedFile.name.endsWith('.zip'))) {
      setFile(droppedFile);
    }
  };

  return (
    <div className="min-h-screen bg-white min-w-100 text-black font-mono selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-black p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tighter uppercase italic">ZipMorph_v2.6</h1>
        <div className="flex gap-6 text-xs uppercase font-bold text-gray-400">
          <span className="text-black">BY DeepEcom</span>
          <a href="#api" className="hover:underline">Internal API</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <section className="mb-20">
          <h2 className="text-7xl font-bold tracking-tighter leading-none mb-6">
            ZIP TO <br />
            <span className="bg-black text-white px-2">STRUCTURAL</span> DATA.
          </h2>
        </section>

        <div className="border-2 border-black">
          {/* Dropzone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`p-16 border-b-2 border-black flex flex-col items-center justify-center transition-colors ${
              isDragging ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            {!file ? (
              <>
                <Upload size={48} strokeWidth={1.5} className="mb-4" />
                <p className="text-xs uppercase font-bold tracking-widest">Drop .ZIP file to initialize</p>
                <input type="file" className="hidden" id="fileInput" accept=".zip" onChange={handleFileChange} />
                <label htmlFor="fileInput" className="mt-4 text-[10px] underline cursor-pointer hover:font-bold uppercase">OR BROWSE FILES</label>
              </>
            ) : (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                <FileArchive size={48} className="mb-4 text-black" />
                <p className="text-sm font-bold uppercase mb-1">{file.name}</p>
                <p className="text-[10px] text-gray-400 mb-6 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • READY</p>
                <button onClick={() => setFile(null)} className="flex items-center gap-2 text-[10px] border border-black px-3 py-2 hover:bg-black hover:text-white transition-all uppercase font-bold">
                  <X size={12} /> Clear Selection
                </button>
              </div>
            )}
          </div>

          {/* Configuration Grid */}
          <div className="grid md:grid-cols-2">
            <div className="p-8 border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-black">
              <label className="text-[10px] font-bold uppercase block mb-4">Output Format</label>
              <div className="flex gap-4">
                {(['PDF', 'CSV'] as TargetFormat[]).map((format) => (
                  <button 
                    key={format}
                    onClick={() => setTargetType(format)}
                    className={`flex-1 py-4 border border-black flex items-center justify-center gap-2 transition-all ${
                      targetType === format ? 'bg-black text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {format === 'PDF' ? <FileText size={16} /> : <FileSpreadsheet size={16} />}
                    <span className="text-xs font-bold uppercase">{format}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              <label className="text-[10px] font-bold uppercase block mb-4">Parameter Logic</label>
              <div className="space-y-3">
                <button onClick={() => setParamMode('fixed')} className="w-full flex justify-between items-center group">
                  <span className={`text-xs uppercase ${paramMode === 'fixed' ? 'font-bold underline' : ''}`}>Fixed (Standard)</span>
                  <div className={`w-3 h-3 border border-black rounded-full ${paramMode === 'fixed' ? 'bg-black' : ''}`} />
                </button>
                <button onClick={() => setParamMode('custom')} className="w-full flex justify-between items-center group">
                  <span className={`text-xs uppercase ${paramMode === 'custom' ? 'font-bold underline' : ''}`}>Custom (Schema Definition)</span>
                  <div className={`w-3 h-3 border border-black rounded-full ${paramMode === 'custom' ? 'bg-black' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* PARAMETER DISPLAY AREA */}
          <div className="border-t-2 border-black bg-gray-50 flex flex-col md:flex-row animate-in fade-in slide-in-from-top-4 duration-300">
            {paramMode === 'fixed' ? (
              /* FIXED VIEW */
              <>
                <div className="flex-1 p-8 border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-black overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-gray-400">
                    <Lock size={14} />
                    <label className="text-[10px] font-bold uppercase">System Manifest (Read-Only)</label>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-gray-500 bg-white border border-gray-200 p-6 rounded-sm overflow-x-auto">
                    {JSON.stringify(FIXED_STANDARD_SCHEMA, null, 2)}
                  </pre>
                </div>
                <div className="md:w-64 p-8 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-emerald-600">
                      <CheckCircle2 size={14} />
                      <label className="text-[10px] font-bold uppercase">Standard Verified</label>
                    </div>
                    <p className="text-[10px] uppercase leading-relaxed text-gray-400">
                      Using XYZ Limited's optimized recursive flattening logic. Optimized for high-density archives.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* CUSTOM VIEW */
              <>
                <div className="flex-1 p-8 border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-black">
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal size={14} />
                    <label className="text-[10px] font-bold uppercase">Mapping Schema (JSON)</label>
                  </div>
                  <textarea 
                    value={customSchema}
                    onChange={(e) => setCustomSchema(e.target.value)}
                    placeholder={`{\n  "mapping": "custom",\n  "depth": 5\n}`}
                    className="w-full h-48 bg-white border-2 border-black p-4 text-xs font-mono focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none"
                  />
                </div>
                <div className="md:w-64 p-8 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Code2 size={14} />
                      <label className="text-[10px] font-bold uppercase">Schema Tokens</label>
                    </div>
                    <ul className="text-[10px] font-bold space-y-2 uppercase">
                      <li className="flex justify-between border-b border-gray-100 pb-1"><span>$depth</span> <span className="text-gray-300">INT</span></li>
                      <li className="flex justify-between border-b border-gray-100 pb-1"><span>$filter</span> <span className="text-gray-300">STR[]</span></li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Execute Action */}
          <button 
            disabled={!file}
            className={`w-full py-8 flex items-center justify-center gap-4 group border-t-2 border-black transition-all ${
              !file 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-white hover:text-black hover:tracking-widest'
            }`}
          >
            <span className="text-sm font-bold uppercase tracking-[0.2em]">
              {file ? 'Execute Internal Conversion' : 'Awaiting Archive'}
            </span>
            <ArrowRight size={20} className={file ? "group-hover:translate-x-2 transition-transform" : ""} />
          </button>
        </div>
      </main>
    </div>
  );
}