import React, { useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, FileArchive, ArrowRight, FileSpreadsheet, FileText, X } from 'lucide-react';
import "./index.css"
// Define types for our specific state options
type TargetFormat = 'PDF' | 'CSV';
type ParamMode = 'fixed' | 'custom';

export default function ZipMorph() {
  const [targetType, setTargetType] = useState<TargetFormat>('PDF');
  const [paramMode, setParamMode] = useState<ParamMode>('fixed');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  // Handle file selection via input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  // Handle Drag events
  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === "application/zip" || droppedFile.name.endsWith('.zip'))) {
      setFile(droppedFile);
    } else {
      alert("Validation Error: Please provide a valid .ZIP archive.");
    }
  };

  const removeFile = (): void => setFile(null);

  return (
    <div className="min-h-screen bg-white min-w-100 text-black font-mono selection:bg-black selection:text-white">
      <nav className="border-b border-black p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tighter uppercase italic">ZipMorph_v2.6</h1>
        <div className="flex gap-6 text-xs uppercase font-bold">
          <a href="#docs" className="hover:underline">Documentation</a>
          <a href="#api" className="hover:underline">API Access</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
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

        <div className="border-2 border-black">
          {/* Dropzone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-16 border-b-2 border-black flex flex-col items-center justify-center transition-colors ${
              isDragging ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            {!file ? (
              <>
                <Upload size={48} strokeWidth={1.5} className="mb-4" />
                <p className="text-xs uppercase font-bold tracking-widest">Drop .ZIP file to initialize</p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="fileInput" 
                  accept=".zip"
                  onChange={handleFileChange} 
                />
                <label htmlFor="fileInput" className="mt-4 text-[10px] underline cursor-pointer hover:font-bold uppercase">
                  OR BROWSE FILES
                </label>
              </>
            ) : (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                <FileArchive size={48} className="mb-4 text-emerald-600" />
                <p className="text-sm font-bold uppercase mb-1">{file.name}</p>
                <p className="text-[10px] text-gray-400 mb-6">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • READY
                </p>
                <button 
                  onClick={removeFile}
                  className="flex items-center gap-2 text-[10px] border border-black px-3 py-2 hover:bg-black hover:text-white transition-all uppercase font-bold"
                >
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
                <button 
                  onClick={() => setParamMode('fixed')}
                  className="w-full flex justify-between items-center group"
                >
                  <span className={`text-xs uppercase ${paramMode === 'fixed' ? 'font-bold underline' : ''}`}>Fixed (Standard)</span>
                  <div className={`w-3 h-3 border border-black rounded-full ${paramMode === 'fixed' ? 'bg-black' : ''}`} />
                </button>
                <button 
                  onClick={() => setParamMode('custom')}
                  className="w-full flex justify-between items-center group"
                >
                  <span className={`text-xs uppercase ${paramMode === 'custom' ? 'font-bold underline' : ''}`}>Custom (Schema)</span>
                  <div className={`w-3 h-3 border border-black rounded-full ${paramMode === 'custom' ? 'bg-black' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Execute Action */}
          <button 
            disabled={!file}
            className={`w-full py-6 flex items-center justify-center gap-4 group border-t-2 border-black transition-all ${
              !file 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-white hover:text-black'
            }`}
          >
            <span className="text-sm font-bold uppercase tracking-[0.2em]">
              {file ? 'Execute Conversion' : 'Awaiting Archive'}
            </span>
            <ArrowRight size={20} className={file ? "group-hover:translate-x-2 transition-transform" : ""} />
          </button>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row justify-between gap-8 opacity-50">
        <div className="text-[10px] uppercase space-y-2">
          <p className="font-bold">Security Protocol</p>
          <p>Local-only processing. No data egress detected.</p>
        </div>
        <div className="text-[10px] uppercase space-y-2 text-right">
          <p className="font-bold text-black">Status: Systems Nominal</p>
          <p>© 2026 ZipMorph Labs.</p>
        </div>
      </footer>
    </div>
  );
}