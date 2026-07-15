"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, ScanLine, X } from "lucide-react";

type SizePreset = "passport" | "a4" | "custom";

const PRESETS: Record<Exclude<SizePreset, "custom">, { label: string; sub: string; width: number; height: number }> = {
  passport: { label: "Passport", sub: "413 x 531 px", width: 413, height: 531 },
  a4: { label: "A4", sub: "2480 x 3508 px", width: 2480, height: 3508 },
};

export default function ResizeImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [preset, setPreset] = useState<SizePreset>("custom");
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(800);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [originalRatio, setOriginalRatio] = useState<number>(1);
  const [isResizing, setIsResizing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [resultDims, setResultDims] = useState({ w: 0, h: 0 });
  const [error, setError] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError("");
    setFile(f);
    setResultUrl("");
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const img = new window.Image();
    img.onload = () => {
      setOriginalRatio(img.width / img.height);
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = url;
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
    setError("");
    setPreset("custom");
    if (inputRef.current) inputRef.current.value = "";
  };

  // Apply preset dimensions when preset changes
  useEffect(() => {
    if (preset === "passport" || preset === "a4") {
      setWidth(PRESETS[preset].width);
      setHeight(PRESETS[preset].height);
    }
  }, [preset]);

  const onWidthChange = (val: number) => {
    setWidth(val);
    if (maintainRatio && originalRatio) {
      setHeight(Math.round(val / originalRatio));
    }
    setPreset("custom");
  };

  const onHeightChange = (val: number) => {
    setHeight(val);
    if (maintainRatio && originalRatio) {
      setWidth(Math.round(val * originalRatio));
    }
    setPreset("custom");
  };

  const resizeImage = async () => {
    if (!file || !previewUrl) return;
    setIsResizing(true);
    setError("");
    setResultUrl("");

    try {
      const img = await loadImage(previewUrl);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
          file.type === "image/png" ? "image/png" : "image/jpeg",
          0.92
        );
      });

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultDims({ w: width, h: height });
    } catch (err) {
      console.error(err);
      setError("Something went wrong while resizing the image.");
    } finally {
      setIsResizing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const nameParts = file.name.split(".");
    const ext = file.type === "image/png" ? "png" : "jpg";
    nameParts.pop();
    a.download = `${nameParts.join(".")}-resized.${ext}`;
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
            <ScanLine className="w-6 h-6 text-blue-600" />
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
          <span className="text-gray-700">Resize Image</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Resize Image
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Resize image for passport, A4 or custom size
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

        {/* Settings */}
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
                    Original: {Math.round(originalRatio * height)} x {height} px
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

            {/* Select Size */}
            <p className="text-sm font-medium text-gray-700 mb-2">Select Size</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
              {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setPreset(key)}
                  className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                    preset === key
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800">
                    {PRESETS[key].label}
                  </p>
                  <p className="text-xs text-gray-500">{PRESETS[key].sub}</p>
                </button>
              ))}
              <button
                onClick={() => setPreset("custom")}
                className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                  preset === "custom"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-medium text-gray-800">Custom</p>
                <p className="text-xs text-gray-500">Set custom size</p>
              </button>
            </div>

            {/* Custom size inputs */}
            <p className="text-sm font-medium text-gray-700 mb-2">Custom Size</p>
            <div className="flex items-end gap-3 mb-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-gray-400 pb-2">×</span>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => onHeightChange(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={maintainRatio}
                onChange={(e) => setMaintainRatio(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-600">Maintain Aspect Ratio</span>
            </label>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <button
              onClick={resizeImage}
              disabled={isResizing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {isResizing ? "Resizing..." : "Resize Image"}
            </button>

            {/* Result */}
            {resultUrl && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={resultUrl}
                    alt="resized result"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-800">
                      Resized to: {resultDims.w} x {resultDims.h} px
                    </p>
                    <p className="text-xs text-gray-500">Ready to download</p>
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