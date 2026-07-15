"use client";

import { useState, useRef } from "react";
import { FileText, Download, Bold, Italic, Underline, List, AlignLeft, AlignCenter } from "lucide-react";
import { jsPDF } from "jspdf";

type PageSize = "a4" | "letter" | "legal";
type Margin = "narrow" | "normal" | "wide";

const PAGE_SIZES: Record<PageSize, { w: number; h: number; label: string }> = {
  a4: { w: 210, h: 297, label: "A4" },
  letter: { w: 215.9, h: 279.4, label: "Letter" },
  legal: { w: 215.9, h: 355.6, label: "Legal" },
};

const MARGIN_VALUES: Record<Margin, number> = {
  narrow: 10,
  normal: 20,
  wide: 30,
};

export default function TextToPdfPage() {
  const [text, setText] = useState<string>("");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [margin, setMargin] = useState<Margin>("normal");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [align, setAlign] = useState<"left" | "center">("left");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const generatePdf = async () => {
    if (!text.trim()) {
      setError("Please type or paste some text first.");
      return;
    }
    setIsGenerating(true);
    setError("");
    setResultUrl("");

    try {
      const { w, h } = PAGE_SIZES[pageSize];
      const marginMM = MARGIN_VALUES[margin];

      const doc = new jsPDF({
        unit: "mm",
        format: [w, h],
      });

      const fontStyle =
        isBold && isItalic ? "bolditalic" : isBold ? "bold" : isItalic ? "italic" : "normal";

      doc.setFont("helvetica", fontStyle);
      doc.setFontSize(12);

      const usableWidth = w - marginMM * 2;
      const lines = doc.splitTextToSize(text, usableWidth);
      const lineHeight = 6;
      let cursorY = marginMM;

      lines.forEach((line: string) => {
        if (cursorY + lineHeight > h - marginMM) {
          doc.addPage([w, h]);
          cursorY = marginMM;
        }

        let xPos = marginMM;
        if (align === "center") {
          const textWidth = doc.getTextWidth(line);
          xPos = (w - textWidth) / 2;
        }

        doc.text(line, xPos, cursorY);

        if (isUnderline) {
          const textWidth = doc.getTextWidth(line);
          doc.line(xPos, cursorY + 1, xPos + textWidth, cursorY + 1);
        }

        cursorY += lineHeight;
      });

      const pdfBlob = doc.output("blob");
      setResultUrl(URL.createObjectURL(pdfBlob));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const applyFormatting = (type: "bold" | "italic" | "underline") => {
    if (type === "bold") setIsBold((v) => !v);
    if (type === "italic") setIsItalic((v) => !v);
    if (type === "underline") setIsUnderline((v) => !v);
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
          <span className="text-gray-700">Text to PDF</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Text to PDF</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Convert text or write anything to PDF
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          {/* Toolbar */}
          <div className="flex items-center gap-1 mb-3 border border-gray-200 rounded-lg p-1.5 flex-wrap">
            <button
              onClick={() => applyFormatting("bold")}
              className={`p-2 rounded-md transition-colors ${
                isBold ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormatting("italic")}
              className={`p-2 rounded-md transition-colors ${
                isItalic ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormatting("underline")}
              className={`p-2 rounded-md transition-colors ${
                isUnderline ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={() => setAlign("left")}
              className={`p-2 rounded-md transition-colors ${
                align === "left" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label="Align left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAlign("center")}
              className={`p-2 rounded-md transition-colors ${
                align === "center" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label="Align center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="List"
              onClick={() => setText((t) => t + "\n• ")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Text area */}
          <textarea
            ref={textAreaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className={`w-full min-h-[220px] sm:min-h-[280px] border border-gray-200 rounded-lg p-4 text-sm focus:outline-none focus:border-blue-500 resize-y mb-2 ${
              isBold ? "font-bold" : ""
            } ${isItalic ? "italic" : ""} ${isUnderline ? "underline" : ""} ${
              align === "center" ? "text-center" : "text-left"
            }`}
          />
          <div className="flex justify-between text-xs text-gray-400 mb-5">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>

          {/* Page settings */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as PageSize)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                {(Object.keys(PAGE_SIZES) as PageSize[]).map((key) => (
                  <option key={key} value={key}>
                    {PAGE_SIZES[key].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Margins</label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value as Margin)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
              </select>
            </div>
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
                  <p className="text-xs text-gray-500">
                    {PAGE_SIZES[pageSize].label} · {margin} margins
                  </p>
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
      </main>
    </div>
  );
}