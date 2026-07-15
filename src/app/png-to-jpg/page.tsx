"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, FileImage, X } from "lucide-react";

export default function PngToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "image/png") {
      setError("Please upload a valid PNG file.");
      return;
    }
    setError("");
    setFile(f);
    setResultUrl("");
    setPreviewUrl(URL.createObjectURL(f));
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
      if (!ctx) throw new Error("Canvas not supported");

      // JPG doesn't support transparency, fill white background first
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
          "image/jpeg",
          0.92
        );
      });

      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while converting the image.");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileImage className="w-6 h-6 text-blue-600" />
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
        <div className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-blue-600">Home</a> /{" "}
          <span className="text-gray-700">PNG to JPG</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">PNG to JPG</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Convert PNG images to JPG format
          </p>
        </div>

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
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"
            }`}
          >
            <Upload className="w-10 h-10 text-blue-600 mb-3" />
            <p className="text-gray-700 font-medium text-center px-4">Drag &amp; Drop PNG Image Here</p>
            <p className="text-gray-400 text-sm mb-4">or</p>
            <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg">
              Choose PNG Image
            </button>
            <input ref={inputRef} type="file" accept="image/png" className="hidden" onChange={onFileChange} />
          </div>
        )}

        {file && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src={previewUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[180px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                </div>
              </div>
              <button onClick={clearFile} className="text-gray-400 hover:text-red-500 flex-shrink-0" aria-label="Remove file">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 mb-4 text-sm text-gray-600">
              Output Format: <span className="font-medium text-gray-800">JPG</span>
            </div>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <button
              onClick={convertToJpg}
              disabled={isConverting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {isConverting ? "Converting..." : "Convert to JPG"}
            </button>

            {resultUrl && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img src={resultUrl} alt="result" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-800">Converted to JPG</p>
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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}