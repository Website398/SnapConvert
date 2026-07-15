"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, FileText, X, GripVertical, Trash2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const valid: ImageItem[] = [];
    Array.from(fileList).forEach((f) => {
      if (f.type.startsWith("image/")) {
        valid.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          previewUrl: URL.createObjectURL(f),
        });
      }
    });
    if (valid.length === 0) {
      setError("Please upload valid image files.");
      return;
    }
    setError("");
    setResultUrl("");
    setImages((prev) => [...prev, ...valid]);
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setResultUrl("");
  };

  const clearAll = () => {
    setImages([]);
    setResultUrl("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // Simple reorder via drag handles
  const onDragStartItem = (index: number) => setDraggedIndex(index);
  const onDragOverItem = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDraggedIndex(index);
  };
  const onDragEndItem = () => setDraggedIndex(null);

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    setError("");
    setResultUrl("");

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const arrayBuffer = await item.file.arrayBuffer();
        let embeddedImage;

        if (item.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          // Convert everything else (jpg, webp, etc.) via canvas to JPEG first
          const jpgBuffer = await convertToJpegBuffer(item.previewUrl);
          embeddedImage = await pdfDoc.embedJpg(jpgBuffer);
        }

        const { width, height } = embeddedImage;
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save();

const arrayBuffer = new ArrayBuffer(pdfBytes.length);

new Uint8Array(arrayBuffer).set(pdfBytes);

const blob = new Blob([arrayBuffer], {
  type: "application/pdf",
});
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "converted-images.pdf";
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
            <FileText className="w-6 h-6 text-blue-600" />
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
          <span className="text-gray-700">Image to PDF</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Image to PDF</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Convert multiple images to a single PDF
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
            Drag &amp; Drop Images Here
          </p>
          <p className="text-gray-400 text-sm my-2">or</p>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm transition-colors"
          >
            Choose Images
          </button>
          <p className="text-xs text-gray-400 mt-3">✦ You can select multiple images</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Images list */}
        {images.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700">
                Images ({images.length})
              </p>
              <button
                onClick={clearAll}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => onDragStartItem(index)}
                  onDragOver={(e) => onDragOverItem(e, index)}
                  onDragEnd={onDragEndItem}
                  className={`relative group border rounded-xl overflow-hidden cursor-move transition-all ${
                    draggedIndex === index ? "border-blue-400 opacity-60" : "border-gray-200"
                  }`}
                >
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="w-full h-24 sm:h-28 object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                    <GripVertical className="w-3 h-3" />
                    {index + 1}
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded p-1 transition-colors"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-gray-500 truncate px-1.5 py-1 bg-white">
                    {img.file.name}
                  </p>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={generatePdf}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating PDF...
                </>
              ) : (
                "Convert to PDF"
              )}
            </button>

            {resultUrl && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-green-50/50 border border-green-100 rounded-xl p-4">
                  <div className="w-14 h-14 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-800">PDF ready</p>
                    <p className="text-xs text-gray-500">{images.length} pages combined</p>
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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function convertToJpegBuffer(url: string): Promise<ArrayBuffer> {
  const img = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
      "image/jpeg",
      0.95
    );
  });
  return await blob.arrayBuffer();
}