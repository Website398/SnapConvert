"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, FileImage, X } from "lucide-react";


// Point pdfjs to its worker bundled from cdn (avoids extra build config)

type PageOption = "all" | "select";

interface ResultPage {
  pageNumber: number;
  url: string;
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pageOption, setPageOption] = useState<PageOption>("all");
  const [pageRange, setPageRange] = useState<string>("");
  const [quality, setQuality] = useState<number>(90);
  const [isConverting, setIsConverting] = useState(false);
  const [results, setResults] = useState<ResultPage[]>([]);
  const [error, setError] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    setError("");
    setFile(f);
    setResults([]);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setResults([]);
    setError("");
    setPageRange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const parsePageRange = (range: string, total: number): number[] => {
    const pages = new Set<number>();
    range.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= total) pages.add(i);
        }
      } else {
        const num = Number(trimmed);
        if (num >= 1 && num <= total) pages.add(num);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const convertToJpg = async () => {
    if (!file) return;
    setIsConverting(true);
    setError("");
    setResults([]);

    try {
      const pdfjsLib = await import("pdfjs-dist");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      let pagesToRender: number[];
      if (pageOption === "all") {
        pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        if (!pageRange.trim()) {
          setError("Please enter page numbers, e.g. 1,3,5-7");
          setIsConverting(false);
          return;
        }
        pagesToRender = parsePageRange(pageRange, totalPages);
        if (pagesToRender.length === 0) {
          setError("No valid pages found in the range provided.");
          setIsConverting(false);
          return;
        }
      }

      const renderedPages: ResultPage[] = [];

      for (const pageNum of pagesToRender) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        const renderTask = page.render({
  canvasContext: ctx as any,
  viewport: viewport as any,
} as any);

await renderTask.promise;

   

        const blob: Blob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Render failed"))),
            "image/jpeg",
            quality / 100
          );
        });

        renderedPages.push({
          pageNumber: pageNum,
          url: URL.createObjectURL(blob),
        });
      }

      setResults(renderedPages);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while converting the PDF. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const downloadPage = (result: ResultPage) => {
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `page-${result.pageNumber}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    results.forEach((r, i) => {
      setTimeout(() => downloadPage(r), i * 200);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileImage className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-lg text-gray-800">SnapConvert</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="/" className="hover:text-blue-600 transition-colors">Image Tools</a>
            <a href="/" className="hover:text-blue-600 transition-colors">PDF Tools</a>
            <a href="/" className="hover:text-blue-600 transition-colors">About Us</a>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          <span>/</span>
          <span className="text-gray-700">PDF to JPG</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">PDF to JPG</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Convert PDF pages to JPG images
          </p>
        </div>

        {/* Upload box */}
        {!file && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl py-14 sm:py-20 flex flex-col items-center justify-center transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50 scale-[1.01]"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30"
            }`}
          >
            <Upload className="w-10 h-10 text-blue-600 mb-3" />
            <p className="text-gray-700 font-medium text-center px-4">
              Drag &amp; Drop PDF File Here
            </p>
            <p className="text-gray-400 text-sm my-2">or</p>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm transition-colors"
            >
              Choose PDF File
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        )}

        {/* Settings */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileImage className="w-7 h-7 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[180px] sm:max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(file.size / 1024)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors p-1"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Page options */}
            <p className="text-sm font-medium text-gray-700 mb-3">Options</p>
            <div className="space-y-3 mb-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pageOption"
                  checked={pageOption === "all"}
                  onChange={() => setPageOption("all")}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">All Pages</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer flex-wrap">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pageOption"
                    checked={pageOption === "select"}
                    onChange={() => setPageOption("select")}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">Select Pages</span>
                </span>
                <input
                  type="text"
                  placeholder="e.g. 1,3,5-7"
                  value={pageRange}
                  onChange={(e) => {
                    setPageRange(e.target.value);
                    setPageOption("select");
                  }}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-40 focus:outline-none focus:border-blue-500"
                />
              </label>
            </div>

            {/* Quality */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Quality</label>
                <span className="text-sm text-gray-500">{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={convertToJpg}
              disabled={isConverting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Converting...
                </>
              ) : (
                "Convert to JPG"
              )}
            </button>

            {/* Results grid */}
            {results.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    {results.length} page{results.length > 1 ? "s" : ""} converted
                  </p>
                  {results.length > 1 && (
                    <button
                      onClick={downloadAll}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.map((r) => (
                    <div
                      key={r.pageNumber}
                      className="border border-gray-200 rounded-xl overflow-hidden group relative"
                    >
                      <img
                        src={r.url}
                        alt={`Page ${r.pageNumber}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50">
                        <span className="text-xs text-gray-500">
                          Page {r.pageNumber}
                        </span>
                        <button
                          onClick={() => downloadPage(r)}
                          className="text-blue-600 hover:text-blue-700"
                          aria-label={`Download page ${r.pageNumber}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}