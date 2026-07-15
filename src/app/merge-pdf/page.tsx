"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, FileStack, X, GripVertical, Trash2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PdfItem {
  id: string;
  file: File;
  sizeKB: number;
}

export default function MergePdfPage() {
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const valid: PdfItem[] = [];
    Array.from(fileList).forEach((f) => {
      if (f.type === "application/pdf") {
        valid.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          sizeKB: Math.round(f.size / 1024),
        });
      }
    });
    if (valid.length === 0) {
      setError("Please upload valid PDF files.");
      return;
    }
    setError("");
    setResultUrl("");
    setPdfs((prev) => [...prev, ...valid]);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
    setResultUrl("");
  };

  const clearAll = () => {
    setPdfs([]);
    setResultUrl("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDragStartItem = (index: number) => setDraggedIndex(index);
  const onDragOverItem = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setPdfs((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDraggedIndex(index);
  };
  const onDragEndItem = () => setDraggedIndex(null);

  const mergePdfs = async () => {
    if (pdfs.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }
    setIsMerging(true);
    setError("");
    setResultUrl("");

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfs) {
        const arrayBuffer = await item.file.arrayBuffer();
        const donorPdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          donorPdf,
          donorPdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();

const arrayBuffer = new ArrayBuffer(pdfBytes.length);

new Uint8Array(arrayBuffer).set(pdfBytes);

const blob = new Blob([arrayBuffer], {
  type: "application/pdf",
});
   
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while merging the PDFs. Make sure files aren't password-protected.");
    } finally {
      setIsMerging(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "merged.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalSizeKB = pdfs.reduce((sum, p) => sum + p.sizeKB, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileStack className="w-6 h-6 text-blue-600" />
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
          <span className="text-gray-700">Merge PDF</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Merge PDF</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Merge multiple PDF files into one
          </p>
        </div>

        {/* Upload box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl py-12 sm:py-16 flex flex-col items-center justify-center transition-all duration-200 mb-5 ${
            isDragging
              ? "border-blue-500 bg-blue-50 scale-[1.01]"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30"
          }`}
        >
          <Upload className="w-9 h-9 text-blue-600 mb-3" />
          <p className="text-gray-700 font-medium text-center px-4">
            Drag &amp; Drop PDF Files Here
          </p>
          <p className="text-gray-400 text-sm my-2">or</p>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm transition-colors"
          >
            Choose PDF Files
          </button>
          <p className="text-xs text-gray-400 mt-3">✦ You can select multiple PDF files</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* PDF list */}
        {pdfs.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700">
                PDF Files ({pdfs.length}) · {totalSizeKB} KB
              </p>
              <button
                onClick={clearAll}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2 mb-5">
              {pdfs.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStartItem(index)}
                  onDragOver={(e) => onDragOverItem(e, index)}
                  onDragEnd={onDragEndItem}
                  className={`flex items-center gap-3 border rounded-xl p-3 cursor-move transition-all ${
                    draggedIndex === index ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileStack className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {index + 1}. {item.file.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.sizeKB} KB</p>
                  </div>
                  <button
                    onClick={() => removeFile(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                    aria-label="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={mergePdfs}
              disabled={isMerging || pdfs.length < 2}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isMerging ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Merging...
                </>
              ) : (
                "Merge PDF"
              )}
            </button>
            {pdfs.length < 2 && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Add at least 2 PDF files to merge
              </p>
            )}

            {resultUrl && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-green-50/50 border border-green-100 rounded-xl p-4">
                  <div className="w-14 h-14 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileStack className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-800">Merged PDF ready</p>
                    <p className="text-xs text-gray-500">{pdfs.length} files combined</p>
                  </div>
                  <button
                    onClick={downloadResult}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg w-full sm:w-auto justify-center shadow-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}