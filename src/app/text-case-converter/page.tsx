"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { CaseSensitive, Copy, Check, Trash2, ArrowUpDown, ListOrdered } from "lucide-react";

type CaseType =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab";

type SortMode = "az" | "za" | "length-asc" | "length-desc" | "shuffle";

export default function TextCaseConverterPage() {
  const [caseText, setCaseText] = useState<string>("");
  const [caseOutput, setCaseOutput] = useState<string>("");
  const [activeCase, setActiveCase] = useState<CaseType | null>(null);
  const [copiedCase, setCopiedCase] = useState(false);

  const [listText, setListText] = useState<string>("");
  const [sortMode, setSortMode] = useState<SortMode>("az");
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [removeDuplicateLines, setRemoveDuplicateLines] = useState(false);
  const [copiedList, setCopiedList] = useState(false);

  /* -------------------- Case conversion logic -------------------- */

  const toTitleCase = (text: string): string =>
    text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  const toSentenceCase = (text: string): string => {
    const lower = text.toLowerCase();
    return lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toCamelCase = (text: string): string => {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .trim()
      .split(/\s+/)
      .map((word, i) =>
        i === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join("");
  };

  const toPascalCase = (text: string): string => {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  };

  const toSnakeCase = (text: string): string => {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .trim()
      .split(/\s+/)
      .map((w) => w.toLowerCase())
      .join("_");
  };

  const toKebabCase = (text: string): string => {
    return text
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .trim()
      .split(/\s+/)
      .map((w) => w.toLowerCase())
      .join("-");
  };

  const applyCase = (type: CaseType) => {
    if (!caseText.trim()) {
      setCaseOutput("");
      setActiveCase(type);
      return;
    }
    let result = "";
    switch (type) {
      case "upper":
        result = caseText.toUpperCase();
        break;
      case "lower":
        result = caseText.toLowerCase();
        break;
      case "title":
        result = toTitleCase(caseText);
        break;
      case "sentence":
        result = toSentenceCase(caseText);
        break;
      case "camel":
        result = toCamelCase(caseText);
        break;
      case "pascal":
        result = toPascalCase(caseText);
        break;
      case "snake":
        result = toSnakeCase(caseText);
        break;
      case "kebab":
        result = toKebabCase(caseText);
        break;
    }
    setCaseOutput(result);
    setActiveCase(type);
  };

  const caseStats = useMemo(() => {
    const words = caseText.trim() ? caseText.trim().split(/\s+/).length : 0;
    return {
      chars: caseText.length,
      words,
      lines: caseText.split("\n").length,
    };
  }, [caseText]);

  const copyCaseOutput = useCallback(async () => {
    if (!caseOutput) return;
    try {
      await navigator.clipboard.writeText(caseOutput);
      setCopiedCase(true);
      setTimeout(() => setCopiedCase(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }, [caseOutput]);

  const clearCaseInputs = () => {
    setCaseText("");
    setCaseOutput("");
    setActiveCase(null);
  };

  /* -------------------- List sorter logic -------------------- */

  const sortedList = useMemo(() => {
    let lines = listText.split("\n");

    if (removeEmptyLines) {
      lines = lines.filter((l) => l.trim() !== "");
    }

    if (removeDuplicateLines) {
      const seen = new Set<string>();
      lines = lines.filter((l) => {
        const key = l.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    switch (sortMode) {
      case "az":
        return [...lines].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
      case "za":
        return [...lines].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: "base" }));
      case "length-asc":
        return [...lines].sort((a, b) => a.length - b.length);
      case "length-desc":
        return [...lines].sort((a, b) => b.length - a.length);
      case "shuffle": {
        const arr = [...lines];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }
      default:
        return lines;
    }
  }, [listText, sortMode, removeEmptyLines, removeDuplicateLines]);

  const listStats = useMemo(() => {
    const original = listText.split("\n").length;
    return {
      originalLines: original,
      resultLines: sortedList.length,
    };
  }, [listText, sortedList]);

  const copyListOutput = useCallback(async () => {
    if (sortedList.length === 0) return;
    try {
      await navigator.clipboard.writeText(sortedList.join("\n"));
      setCopiedList(true);
      setTimeout(() => setCopiedList(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }, [sortedList]);

  const clearListInputs = () => {
    setListText("");
  };

  const loadSampleList = () => {
    setListText("banana\napple\nCherry\ngrape\napple\n\nMango\nkiwi");
  };

  const CASE_BUTTONS: { type: CaseType; label: string }[] = [
    { type: "upper", label: "UPPERCASE" },
    { type: "lower", label: "lowercase" },
    { type: "title", label: "Title Case" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <CaseSensitive className="h-6 w-6 text-rose-600" />
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
          <span className="text-slate-700 dark:text-slate-200">Text Case Converter &amp; List Sorter</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-2xl mb-4">
            <CaseSensitive className="w-7 h-7 text-rose-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Text Case Converter &amp; List Sorter
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Convert text case or sort your lists instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ---------------- Case Converter ---------------- */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-rose-600" />
                Case Converter
              </h2>
              <button
                onClick={clearCaseInputs}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            <textarea
              value={caseText}
              onChange={(e) => {
                setCaseText(e.target.value);
                if (activeCase) {
                  setTimeout(() => applyCase(activeCase), 0);
                }
              }}
              placeholder="Type or paste your text here..."
              className="w-full min-h-[140px] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500 resize-y mb-3"
            />

            <div className="flex justify-between text-xs text-slate-400 mb-4">
              <span>{caseStats.words} words</span>
              <span>{caseStats.chars} characters</span>
              <span>{caseStats.lines} lines</span>
            </div>

            {/* Primary buttons */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {CASE_BUTTONS.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => applyCase(btn.type)}
                  className={`text-xs sm:text-sm font-medium py-2 rounded-lg border transition-colors ${
                    activeCase === btn.type
                      ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Secondary / dev-focused buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {(
                [
                  { type: "sentence", label: "Sentence" },
                  { type: "camel", label: "camelCase" },
                  { type: "pascal", label: "PascalCase" },
                  { type: "snake", label: "snake_case" },
                  { type: "kebab", label: "kebab-case" },
                ] as { type: CaseType; label: string }[]
              ).map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => applyCase(btn.type)}
                  className={`text-xs font-medium py-2 rounded-lg border transition-colors ${
                    activeCase === btn.type
                      ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Output */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Output
                </span>
                <button
                  onClick={copyCaseOutput}
                  disabled={!caseOutput}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  {copiedCase ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
              </div>
              <div className="p-3 min-h-[80px]">
                {caseOutput ? (
                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                    {caseOutput}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">Pick a case style above to see the result</p>
                )}
              </div>
            </div>
          </div>

          {/* ---------------- List Sorter ---------------- */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-rose-600" />
                List Sorter
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={loadSampleList} className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
                  Sample
                </button>
                <button
                  onClick={clearListInputs}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>

            <textarea
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              placeholder={"Paste your list here, one item per line:\napple\nbanana\ncherry"}
              className="w-full min-h-[140px] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500 resize-y mb-3 font-mono"
            />

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeEmptyLines}
                  onChange={(e) => setRemoveEmptyLines(e.target.checked)}
                  className="w-3.5 h-3.5 accent-rose-600"
                />
                Remove empty lines
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeDuplicateLines}
                  onChange={(e) => setRemoveDuplicateLines(e.target.checked)}
                  className="w-3.5 h-3.5 accent-rose-600"
                />
                Remove duplicates
              </label>
            </div>

            {/* Sort mode buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSortMode("az")}
                className={`text-xs sm:text-sm font-medium py-2 rounded-lg border transition-colors ${
                  sortMode === "az"
                    ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300"
                }`}
              >
                A → Z
              </button>
              <button
                onClick={() => setSortMode("za")}
                className={`text-xs sm:text-sm font-medium py-2 rounded-lg border transition-colors ${
                  sortMode === "za"
                    ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300"
                }`}
              >
                Z → A
              </button>
              <button
                onClick={() => setSortMode("length-asc")}
                className={`text-xs sm:text-sm font-medium py-2 rounded-lg border transition-colors ${
                  sortMode === "length-asc"
                    ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300"
                }`}
              >
                Shortest first
              </button>
              <button
                onClick={() => setSortMode("length-desc")}
                className={`text-xs sm:text-sm font-medium py-2 rounded-lg border transition-colors ${
                  sortMode === "length-desc"
                    ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300"
                }`}
              >
                Longest first
              </button>
              <button
                onClick={() => setSortMode("shuffle")}
                className={`col-span-2 text-xs sm:text-sm font-medium py-2 rounded-lg border transition-colors ${
                  sortMode === "shuffle"
                    ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300"
                }`}
              >
                Shuffle Randomly
              </button>
            </div>

            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>{listStats.originalLines} original lines</span>
              <span>{listStats.resultLines} result lines</span>
            </div>

            {/* Output */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Sorted List
                </span>
                <button
                  onClick={copyListOutput}
                  disabled={sortedList.length === 0}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  {copiedList ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
              </div>
              <div className="p-3 max-h-56 overflow-y-auto">
                {sortedList.length > 0 ? (
                  <ol className="space-y-1">
                    {sortedList.map((line, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-200 font-mono">
                        {line}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-400">Sorted list will appear here</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}