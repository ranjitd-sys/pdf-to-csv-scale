import React, { useState, type ChangeEvent, type DragEvent } from "react";
import {
  Upload,
  FileArchive,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  X,
  Terminal,
  Lock,
  Code2,
  Activity,
  Cpu,
  Shield,
  Globe,
  CheckCircle,
  AlertTriangle,
  RefreshCcw,
  Download,
} from "lucide-react";
import "./index.css";

type TargetFormat = "PDF" | "CSV";
type ParamMode = "fixed" | "custom";
type ProcessStatus = "IDLE" | "UPLOADING" | "SUCCESS" | "ERROR";

// 1. Define the List of Standard Parameters
interface SystemParam {
  label: string;
  value: string;
  icon: React.ReactNode;
  status: "ACTIVE" | "ENFORCED";
}

const FIXED_PARAMS: SystemParam[] = [
  {
    label: "Heuristic Mapping",
    value: "XYZ-DeepScan v4",
    icon: <Cpu size={14} />,
    status: "ACTIVE",
  },
  {
    label: "Recursion Depth",
    value: "Infinite (Flatten)",
    icon: <Activity size={14} />,
    status: "ENFORCED",
  },
  {
    label: "Security Protocol",
    value: "SHA-256 In-Memory",
    icon: <Shield size={14} />,
    status: "ACTIVE",
  },
  {
    label: "Character Encoding",
    value: "UTF-8 / Unicode",
    icon: <Globe size={14} />,
    status: "ENFORCED",
  },
];

export default function ZipMorph() {
  const [targetType, setTargetType] = useState<TargetFormat>("PDF");
  const [paramMode, setParamMode] = useState<ParamMode>("fixed");
  const [status, setStatus] = useState<ProcessStatus>("IDLE");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [customSchema, setCustomSchema] = useState<string>("");

  async function downloadFile() {
  const response = await fetch("http://localhost:8080/download");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "sample.xlsx";
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
}
  const handleExecute = async () => {
    if (!file) return;
    setStatus("UPLOADING");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetType", targetType); // Fixed typo from tragetType
    formData.append("paramMode", paramMode);
    
    

    try {
      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // const data = await response.json(); // Use if you need data from response
        setStatus("SUCCESS");
      } else {
        throw new Error("Server responded with error");
      }
    } catch (error) {
      console.log("Upload Failed", error);
      setStatus("ERROR");
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("IDLE");
    setCustomSchema("");
  };

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
    if (
      droppedFile &&
      (droppedFile.type === "application/zip" ||
        droppedFile.name.endsWith(".zip"))
    ) {
      setFile(droppedFile);
    }
  };

  return (
    <div className="min-h-screen bg-white min-w-[90vw] text-black font-mono selection:bg-black selection:text-white">
      <nav className="border-b border-black p-6 flex justify-between items-center w-full">
        <h1 className="text-xl font-bold tracking-tighter uppercase italic">
          ZipMorph_v2.6
        </h1>
        <div className="flex gap-6 text-xs uppercase font-bold text-gray-400">
          <span className="text-black">BY DeepEcom</span>
          <a href="#api" className="hover:underline">
            Internal API
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <section className="mb-20">
          <h2 className="text-7xl font-bold tracking-tighter leading-none mb-6">
            ZIP TO <br />
            <span className="bg-black text-white px-2">STRUCTURAL</span> DATA.
          </h2>
        </section>

        <div className="border-2 border-black min-h-150 flex flex-col">
          
          {/* --------------------------------------------------------- */}
          {/* VIEW: IDLE & UPLOADING (Original UI)                      */}
          {/* --------------------------------------------------------- */}
          {(status === "IDLE" || status === "UPLOADING") && (
            <>
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`p-16 border-b-2 border-black flex flex-col items-center justify-center transition-colors ${
                  isDragging ? "bg-black text-white" : "bg-white"
                }`}
              >
                {!file ? (
                  <>
                    <Upload size={48} strokeWidth={1.5} className="mb-4" />
                    <p className="text-xs uppercase font-bold tracking-widest">
                      Drop .ZIP archive to initialize
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      id="fileInput"
                      accept=".zip"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="fileInput"
                      className="mt-4 text-[10px] underline cursor-pointer hover:font-bold uppercase"
                    >
                      OR BROWSE FILES
                    </label>
                  </>
                ) : (
                  <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                    <FileArchive size={48} className="mb-4 text-black" />
                    <p className="text-sm font-bold uppercase mb-1">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mb-6 uppercase">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • VERIFIED
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      disabled={status === "UPLOADING"}
                      className="flex items-center gap-2 text-[10px] border border-black px-3 py-2 hover:bg-black hover:text-white transition-all uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={12} /> Clear Selection
                    </button>
                  </div>
                )}
              </div>

              {/* Configuration Grid */}
              <div className="grid md:grid-cols-2">
                <div className="p-8 border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-black">
                  <label className="text-[10px] font-bold uppercase block mb-4 text-gray-400">
                    Target Output
                  </label>
                  <div className="flex gap-4">
                    {(["CSV"] as TargetFormat[]).map((format) => (
                      <button
                        key={format}
                        onClick={() => setTargetType(format)}
                        disabled={status === "UPLOADING"}
                        className={`flex-1 py-4 border border-black flex items-center justify-center gap-2 transition-all ${
                          targetType === format
                            ? "bg-black text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {format === "CSV" ? (
                          <div className="flex gap-2 justify-center items-center">
                          
                            <FileSpreadsheet size={16} />
                          </div>
                          
                        ) : null}
                  
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8">
                  <label className="text-[10px] font-bold uppercase block mb-4 text-gray-400">
                    Processing Mode
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setParamMode("fixed")}
                      disabled={status === "UPLOADING"}
                      className="w-full flex justify-between items-center group"
                    >
                      <span
                        className={`text-xs uppercase ${
                          paramMode === "fixed" ? "font-bold underline" : ""
                        }`}
                      >
                        Fixed (Standard)
                      </span>
                      <div
                        className={`w-3 h-3 border border-black rounded-full ${
                          paramMode === "fixed" ? "bg-black" : ""
                        }`}
                      />
                    </button>
                    
                  </div>
                </div>
              </div>

              {/* DYNAMIC PARAMETER AREA */}
              <div className="flex-1 border-t-2 border-black bg-white flex flex-col md:flex-row animate-in fade-in slide-in-from-top-4 duration-300">
                {paramMode === "fixed" ? (
                  <div className="flex-1 grid md:grid-cols-2 divide-x-0 md:divide-x-2 divide-y-2 md:divide-y-0 divide-black">
                    <div className="p-8 bg-gray-50">
                      <div className="flex items-center gap-2 mb-6">
                        <Lock size={14} className="text-gray-400" />
                        <label className="text-[10px] font-bold uppercase">
                          Standard Engine Config
                        </label>
                      </div>
                      <div className="space-y-4">
                        {FIXED_PARAMS.map((param) => (
                          <div
                            key={param.label}
                            className="flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400 uppercase">
                                {param.label}
                              </span>
                              <span className="text-[9px] font-bold bg-black text-white px-1">
                                {param.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 border-b border-black pb-2">
                              {param.icon}
                              <span className="text-xs font-bold uppercase">
                                {param.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-center items-center text-center">
                      <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <div className="w-8 h-8 bg-black rounded-full" />
                      </div>
                      <p className="text-[10px] font-bold uppercase max-w-50 leading-relaxed">
                        Optimized for structural integrity. No manual overrides
                        permitted in Standard Mode.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>

                    <div className="md:w-64 p-8 flex flex-col justify-between bg-white">
                      <div>
                        <div className="flex items-center gap-2 mb-4 text-gray-400">
                          <Code2 size={14} />
                          <label className="text-[10px] font-bold uppercase">
                            Schema Logic
                          </label>
                        </div>
                        <p className="text-[10px] uppercase leading-relaxed text-gray-400">
                          Input custom JSON to override the XYZ Limited default
                          heuristic engine.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleExecute}
                disabled={!file || status === "UPLOADING"}
                className={`w-full py-8 flex items-center justify-center gap-4 group border-t-2 border-black transition-all ${
                  !file || status === "UPLOADING"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-white hover:text-black hover:tracking-[0.3em]"
                }`}
              >
                <span className="text-sm font-bold uppercase tracking-[0.2em]">
                  {status === "UPLOADING"
                    ? "Processing Sequence..."
                    : "Execute Internal Conversion"}
                </span>

                {status !== "UPLOADING" && (
                  <ArrowRight
                    size={20}
                    className={
                      file
                        ? "group-hover:translate-x-2 transition-transform"
                        : ""
                    }
                  />
                )}
              </button>
            </>
          )}

          {/* --------------------------------------------------------- */}
          {/* VIEW: SUCCESS                                             */}
          {/* --------------------------------------------------------- */}
          {status === "SUCCESS" && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-300">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-20"></div>
                <CheckCircle size={84} strokeWidth={1} className="relative text-black" />
              </div>
              
              <h3 className="text-4xl font-bold uppercase mb-2">Sequence Complete</h3>
              <p className="text-xs font-bold uppercase text-gray-400 mb-8 tracking-widest">
                Data Transmutation Successful • Integrity 100%
              </p>

              <div className="w-full max-w-md border-2 border-black bg-gray-50 p-6 mb-8 text-left">
                <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
                  <span className="text-[10px] font-bold uppercase">Output Format</span>
                  <span className="text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5">{targetType}</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] uppercase">
                      <span className="text-gray-500">Source File</span>
                      <span className="font-bold">{file?.name}</span>
                   </div>
                   <div className="flex justify-between text-[10px] uppercase">
                      <span className="text-gray-500">Algorithm</span>
                      <span className="font-bold">{paramMode === 'fixed' ? 'DeepScan v4' : 'Custom Schema'}</span>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 w-full max-w-md">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-100 uppercase font-bold text-xs transition-all"
                >
                  <RefreshCcw size={14} /> Start New
                </button>
                <button onClick={downloadFile} className="flex-2 py-4 bg-black text-white flex items-center justify-center gap-2 hover:tracking-widest transition-all uppercase font-bold text-xs">
                  <Download size={14} /> Download {targetType}
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* VIEW: ERROR                                               */}
          {/* --------------------------------------------------------- */}
          {status === "ERROR" && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-black text-white animate-in zoom-in-95 duration-300">
              <AlertTriangle size={84} strokeWidth={1} className="mb-6 text-white" />
              
              <h3 className="text-4xl font-bold uppercase mb-2">Critical Failure</h3>
              <p className="text-xs font-bold uppercase text-gray-500 mb-8 tracking-widest">
                DeepEcom Engine Protocol Aborted
              </p>

              <div className="w-full max-w-md border border-white/20 bg-white/5 p-6 mb-8 text-left font-mono">
                 <p className="text-[10px] text-red-400 mb-2">ERROR_LOG_DUMP_INIT</p>
                 <p className="text-[10px] text-gray-300 mb-1"> Connection to :8080/upload timed out.</p>
                 <p className="text-[10px] text-gray-300 mb-1"> Payload integrity check failed.</p>
                 <p className="text-[10px] text-red-400 mt-2"> SYSTEM_HALT</p>
              </div>

              <button
                onClick={handleReset}
                className="w-full max-w-md py-4 bg-white text-black flex items-center justify-center gap-2 hover:bg-gray-200 uppercase font-bold text-xs transition-all"
              >
                <RefreshCcw size={14} /> Reinitialize System
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row justify-between gap-8 opacity-50">
        <div className="text-[10px] uppercase space-y-2">
          <p className="font-bold">Security Protocol</p>
          <p>Local-only processing. XYZ Hardware verification enabled.</p>
        </div>
        <div className="text-[10px] uppercase space-y-2 text-right">
          <p className="font-bold text-black">Status: Systems Nominal</p>
          <p>© 2026 DeepEcom Limited.</p>
        </div>
      </footer>
    </div>
  );
}