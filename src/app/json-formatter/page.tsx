"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Copy, Check, FileJson, AlertCircle, Trash2, Download, Minimize2, Maximize2, Search } from "lucide-react";

type IndentSize = 2 | 4 | "tab";

interface ValidationResult {
  valid: boolean;
  error?: string;
  errorLine?: number;
  errorColumn?: number;
}

export default function JsonFormatterPage() {
  const [rawInput, setRawInput] = useState<string>("");
  const [formatted, setFormatted] = useState<string>("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedView, setCollapsedView] = useState(false);
  const [stats, setStats] = useState<{ keys: number; depth: number; size: number } | null>(null);

  const getIndentString = (size: IndentSize): string | number => {
    if (size === "tab") return "\t";
    return size;
  };

  const countKeysAndDepth = (obj: unknown, depth = 0): { keys: number; maxDepth: number } => {
    if (obj === null || typeof obj !== "object") {
      return { keys: 0, maxDepth: depth };
    }
    let keys = 0;
    let maxDepth = depth;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = countKeysAndDepth(item, depth + 1);
        keys += result.keys;
        maxDepth = Math.max(maxDepth, result.maxDepth);
      }
    } else {
      const entries = Object.entries(obj as Record<string, unknown>);
      keys += entries.length;
      for (const [, value] of entries) {
        const result = countKeysAndDepth(value, depth + 1);
        keys += result.keys;
        maxDepth = Math.max(maxDepth, result.maxDepth);
      }
    }
    return { keys, maxDepth };
  };

  const sortObjectKeys = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    if (obj !== null && typeof obj === "object") {
      const sorted: Record<string, unknown> = {};
      Object.keys(obj as Record<string, unknown>)
        .sort()
        .forEach((key) => {
          sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        });
      return sorted;
    }
    return obj;
  };

  const parseJsonWithLineInfo = (input: string): ValidationResult => {
    try {
      JSON.parse(input);
      return { valid: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid JSON";
      const positionMatch = message.match(/position (\d+)/);
      let line: number | undefined;
      let column: number | undefined;

      if (positionMatch) {
        const pos = parseInt(positionMatch[1], 10);
        const upToError = input.substring(0, pos);
        const lines = upToError.split("\n");
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      return {
        valid: false,
        error: message,
        errorLine: line,
        errorColumn: column,
      };
    }
  };

  const formatJson = useCallback(() => {
    if (!rawInput.trim()) {
      setValidation({ valid: false, error: "Please paste some JSON data first." });
      setFormatted("");
      setStats(null);
      return;
    }

    const result = parseJsonWithLineInfo(rawInput);
    setValidation(result);

    if (result.valid) {
      try {
        let parsed = JSON.parse(rawInput);
        if (sortKeys) {
          parsed = sortObjectKeys(parsed);
        }
        const indent = getIndentString(indentSize);
        const output = JSON.stringify(parsed, null, indent as string | number);
        setFormatted(output);

        const { keys, maxDepth } = countKeysAndDepth(parsed);
        setStats({
          keys,
          depth: maxDepth,
          size: new Blob([output]).size,
        });
      } catch {
        setFormatted("");
        setStats(null);
      }
    } else {
      setFormatted("");
      setStats(null);
    }
  }, [rawInput, indentSize, sortKeys]);

  const minifyJson = () => {
    if (!rawInput.trim()) return;
    const result = parseJsonWithLineInfo(rawInput);
    setValidation(result);
    if (result.valid) {
      try {
        const parsed = JSON.parse(rawInput);
        const output = JSON.stringify(parsed);
        setFormatted(output);
        const { keys, maxDepth } = countKeysAndDepth(parsed);
        setStats({ keys, depth: maxDepth, size: new Blob([output]).size });
      } catch {
        setFormatted("");
      }
    } else {
      setFormatted("");
    }
  };

  const handleValidateOnly = () => {
    if (!rawInput.trim()) {
      setValidation({ valid: false, error: "Please paste some JSON data first." });
      return;
    }
    const result = parseJsonWithLineInfo(rawInput);
    setValidation(result);
  };

  const clearAll = () => {
    setRawInput("");
    setFormatted("");
    setValidation(null);
    setStats(null);
    setSearchTerm("");
  };

  const copyToClipboard = async () => {
    if (!formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const downloadJson = () => {
    if (!formatted) return;
    const blob = new Blob([formatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSampleJson = () => {
    const sample = {
      name: "SnapConvert",
      version: "1.0.0",
      features: ["compress", "resize", "convert", "merge"],
      pricing: { free: true, plans: null },
      stats: { users: 500000, countries: 190 },
      active: true,
    };
    setRawInput(JSON.stringify(sample));
  };

  const highlightedFormatted = useMemo(() => {
    if (!formatted) return "";
    if (!searchTerm.trim()) return formatted;
    return formatted;
  }, [formatted, searchTerm]);

  const matchCount = useMemo(() => {
    if (!formatted || !searchTerm.trim()) return 0;
    const regex = new RegExp(escapeRegExp(searchTerm), "gi");
    const matches = formatted.match(regex);
    return matches ? matches.length : 0;
  }, [formatted, searchTerm]);

  function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const renderFormattedWithHighlight = () => {
    if (!formatted) return null;
    if (!searchTerm.trim()) {
      return <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">{formatted}</pre>;
    }
    const parts = formatted.split(new RegExp(`(${escapeRegExp(searchTerm)})`, "gi"));
    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </pre>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <FileJson className="h-6 w-6 text-yellow-600" />
            <span className="font-bold text-lg text-slate-900 dark:text-white">SnapConvert</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/" className="hover:text-blue-600">Image Tools</Link>
            <Link href="/" className="hover:text-blue-600">PDF Tools</Link>
            <Link href="/" className="hover:text-blue-600">Developer Tools</Link>
            <Link href="/" className="hover:text-blue-600">About Us</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/developer-tools" className="hover:text-blue-600">Developer &amp; Data Tools</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200">JSON Formatter</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-50 dark:bg-yellow-500/10 rounded-2xl mb-4">
            <FileJson className="w-7 h-7 text-yellow-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            JSON Formatter &amp; Validator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Format and validate messy JSON data in one click
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={loadSampleJson}
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Load Sample
          </button>

          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            {([2, 4, "tab"] as IndentSize[]).map((size) => (
              <button
                key={String(size)}
                onClick={() => setIndentSize(size)}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                  indentSize === size
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {size === "tab" ? "Tab" : `${size} spaces`}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600"
            />
            Sort keys A-Z
          </label>

          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1 text-xs sm:text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        {/* Editor grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Raw JSON
              </span>
              <span className="text-xs text-slate-400">
                {rawInput.length.toLocaleString()} chars
              </span>
            </div>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder='Paste your messy JSON here, e.g. {"name":"test","items":[1,2,3]}'
              spellCheck={false}
              className="w-full min-h-[280px] sm:min-h-[380px] p-4 font-mono text-xs sm:text-sm bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none resize-y"
            />
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Formatted Output
              </span>
              {formatted && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              )}
            </div>

            {formatted && (
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search in output..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:outline-none focus:border-blue-500"
                  />
                  {searchTerm && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      {matchCount} match{matchCount !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="min-h-[280px] sm:min-h-[380px] p-4 overflow-auto max-h-[500px]">
              {validation && !validation.valid && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg p-3 text-red-600 dark:text-red-400 text-xs sm:text-sm mb-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Invalid JSON</p>
                    <p className="mt-1">{validation.error}</p>
                    {validation.errorLine && (
                      <p className="mt-1 text-red-500 dark:text-red-400/80">
                        Near line {validation.errorLine}, column {validation.errorColumn}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {validation && validation.valid && !formatted && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-lg p-3 text-green-600 dark:text-green-400 text-xs sm:text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  Valid JSON. Click "Format" to see pretty output.
                </div>
              )}
              {formatted && renderFormattedWithHighlight()}
              {!validation && !formatted && (
                <p className="text-slate-400 text-sm">Formatted output will appear here.</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.keys}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Keys</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.depth}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Max Depth</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{(stats.size / 1024).toFixed(2)} KB</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Output Size</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleValidateOnly}
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Check className="w-4 h-4" />
            Validate
          </button>
          <button
            onClick={formatJson}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Format JSON
          </button>
          <button
            onClick={minifyJson}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            Minify JSON
          </button>
          {formatted && (
            <button
              onClick={downloadJson}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download .json
            </button>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">100% Private</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your JSON never leaves your browser. Everything runs locally.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Instant Feedback</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get precise error location with line and column numbers.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Flexible Output</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose indentation, sort keys, minify or download instantly.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}