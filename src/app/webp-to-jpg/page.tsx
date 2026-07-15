"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, FileImage, X, RefreshCw } from "lucide-react";

export default function WebpToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState<number>(90);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [resultSizeKB, setResultSizeKB] = useState<number>(0);
  const [originalSizeKB, setOriginalSizeKB] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "image/webp") {
      setError("Please upload a valid WebP file.");
      return;
    }
    setError("");
    setFile(f);
    setOriginalSizeKB(Math.round(f.size / 1024));
    setResultUrl("");
    setResultSizeKB(0);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl("");
    setResultUrl("");
    setResultSizeKB(0);
    setOriginalSizeKB(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const convertToJpg = async () => {
    if (!file || !previewUrl) return;
    setIsConverting(true);
    setError("");
    setResultUrl("");

    try {
      const img = await loadImage(previewUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported in this browser.");

      // JPG has no alpha channel, so we fill a white background first
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
          "image/jpeg",
          quality / 100
        );
      });

      setResultUrl(URL.createObjectURL(blob));
      setResultSizeKB(Math.round(blob.size / 1024));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while converting the image. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const nameParts = file.name.split(".");
    nameParts.pop();
    a.download = `${nameParts.join(".")}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const startOver = () => {
    convertToJpg();
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
          <button className="md:hidden text-gray-600" aria-label="menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
          <span>/</span>
          <span className="text-gray-700">WebP to JPG</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4">
            <RefreshCw className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">WebP to JPG</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Convert WebP images to JPG format
          </p>
        </div>

        {/* Upload box */}
        {!file && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl py-14 sm:py-20 flex flex-col items-center justify-center transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50 scale-[1.01]"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30"
            }`}
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-700 font-medium text-center px-4">
              Drag &amp; Drop WebP Image Here
            </p>
            <p className="text-gray-400 text-sm my-3">or</p>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-6 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              Choose WebP Image
            </button>
            <p className="text-xs text-gray-400 mt-4">Supports .webp files up to 20MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/webp"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        )}

        {/* Settings + preview */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[180px] sm:max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Original: {originalSizeKB} KB
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

            <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 mb-5 text-sm text-gray-600 flex items-center justify-between">
              <span>Output Format</span>
              <span className="font-semibold text-gray-800">JPG</span>
            </div>

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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
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

            {resultUrl && (
              <div className="mt-6 border-t border-gray-100 pt-5 animate-[fadeIn_0.3s_ease-in]">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-green-50/50 border border-green-100 rounded-xl p-4">
                  <img
                    src={resultUrl}
                    alt="converted result"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-800">
                      Converted successfully
                    </p>
                    <p className="text-xs text-gray-500">
                      New size: {resultSizeKB} KB
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={startOver}
                      className="text-sm text-gray-600 hover:text-blue-600 px-3 py-2 transition-colors"
                    >
                      Re-convert
                    </button>
                    <button
                      onClick={downloadResult}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex-1 sm:flex-none justify-center shadow-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 mt-8 text-center">
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-700">100% Private</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-700">No Login</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-700">Fast &amp; Easy</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}