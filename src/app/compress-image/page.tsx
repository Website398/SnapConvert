"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Image as ImageIcon, X } from "lucide-react";

type TargetOption = "20KB" | "50KB" | "100KB" | "custom";

export default function CompressImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [target, setTarget] = useState<TargetOption>("50KB");
  const [customSizeKB, setCustomSizeKB] = useState<number>(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [resultSizeKB, setResultSizeKB] = useState<number>(0);
  const [originalSizeKB, setOriginalSizeKB] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const targetKBMap: Record<TargetOption, number> = {
    "20KB": 20,
    "50KB": 50,
    "100KB": 100,
    custom: customSizeKB,
  };

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError("");
    setFile(f);
    setOriginalSizeKB(Math.round(f.size / 1024));
    setResultUrl("");
    setResultSizeKB(0);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
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
    setPreviewUrl("");
    setResultUrl("");
    setResultSizeKB(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // Core compression logic using canvas + binary search on quality
  const compressImage = async () => {
    if (!file) return;
    setIsCompressing(true);
    setError("");
    setResultUrl("");

    try {
      const img = await loadImage(previewUrl);
      const targetKB = targetKBMap[target];

      let width = img.width;
      let height = img.height;

      const maxDimension = 4000;
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.9;
      let minQ = 0.05;
      let maxQ = 0.95;
      let bestBlob: Blob | null = null;
      let bestSizeKB = Infinity;

      // Try up to 8 iterations of binary search to hit target size
      for (let i = 0; i < 8; i++) {
        const blob = await canvasToBlob(canvas, quality);
        const sizeKB = blob.size / 1024;

        if (Math.abs(sizeKB - targetKB) < Math.abs(bestSizeKB - targetKB)) {
          bestBlob = blob;
          bestSizeKB = sizeKB;
        }

        if (sizeKB > targetKB) {
          maxQ = quality;
          quality = (minQ + quality) / 2;
        } else {
          minQ = quality;
          quality = (quality + maxQ) / 2;
        }

        // Close enough, stop early
        if (Math.abs(sizeKB - targetKB) / targetKB < 0.05) break;
      }

      // If still too large even at lowest quality, downscale dimensions
      if (bestSizeKB > targetKB * 1.5) {
        let scaleFactor = 0.9;
        let attempts = 0;
        while (bestSizeKB > targetKB * 1.2 && attempts < 6) {
          const newW = Math.round(width * scaleFactor);
          const newH = Math.round(height * scaleFactor);
          const c2 = document.createElement("canvas");
          c2.width = newW;
          c2.height = newH;
          const ctx2 = c2.getContext("2d");
          if (!ctx2) break;
          ctx2.drawImage(canvas, 0, 0, newW, newH);
          const blob = await canvasToBlob(c2, 0.7);
          const sizeKB = blob.size / 1024;
          if (sizeKB < bestSizeKB) {
            bestBlob = blob;
            bestSizeKB = sizeKB;
          }
          scaleFactor -= 0.1;
          attempts++;
        }
      }

      if (bestBlob) {
        const url = URL.createObjectURL(bestBlob);
        setResultUrl(url);
        setResultSizeKB(Math.round(bestSizeKB));
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while compressing the image.");
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const nameParts = file.name.split(".");
    nameParts.pop();
    a.download = `${nameParts.join(".")}-compressed.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SnapConvert" className="h-22 w-25 object-contain" />
            <span className="font-semibold text-lg text-gray-800">SnapConvert</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">Home</a>
            <a href="/" className="hover:text-blue-600">Image Tools</a>
            <a href="/" className="hover:text-blue-600">PDF Tools</a>
            <a href="/" className="hover:text-blue-600">About Us</a>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-blue-600">Home</a> /{" "}
          <span className="text-gray-700">Image Compressor</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Image Compressor
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Compress image to 20KB, 50KB, 100KB or custom size
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
            className={`cursor-pointer border-2 border-dashed rounded-2xl py-14 sm:py-20 flex flex-col items-center justify-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-400"
            }`}
          >
            <Upload className="w-10 h-10 text-blue-600 mb-3" />
            <p className="text-gray-700 font-medium text-center px-4">
              Drag &amp; Drop Image Here
            </p>
            <p className="text-gray-400 text-sm mb-4">or</p>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg"
            >
              Choose Image
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        )}

        {/* Preview + settings */}
        {file && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
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
                className="text-gray-400 hover:text-red-500 flex-shrink-0"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target size */}
            <p className="text-sm font-medium text-gray-700 mb-2">Target Size</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {(["20KB", "50KB", "100KB", "custom"] as TargetOption[]).map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => setTarget(opt)}
                    className={`text-sm font-medium py-2 rounded-lg border transition-colors ${
                      target === opt
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt === "custom" ? "Custom" : opt}
                  </button>
                )
              )}
            </div>

            {target === "custom" && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">
                  Custom Size (KB)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={500}
                    value={customSizeKB}
                    onChange={(e) => setCustomSizeKB(Number(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {customSizeKB} KB
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 mb-3">{error}</p>
            )}

            <button
              onClick={compressImage}
              disabled={isCompressing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {isCompressing ? "Compressing..." : "Compress Image"}
            </button>

            {/* Result */}
            {resultUrl && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={resultUrl}
                    alt="compressed result"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-800">
                      Compressed Size: {resultSizeKB} KB
                    </p>
                    <p className="text-xs text-gray-500">
                      Reduced from {originalSizeKB} KB
                    </p>
                  </div>
                  <button
                    onClick={downloadResult}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg w-full sm:w-auto justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download
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

// Helper: load image element from URL
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Helper: canvas -> compressed blob at given quality
function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      "image/jpeg",
      quality
    );
  });
}