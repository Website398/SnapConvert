"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Code2, Copy, Check, AlertCircle, BookOpen, Trash2 } from "lucide-react";

interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

interface CheatSheetEntry {
  pattern: string;
  desc: string;
  example: string;
}

const CHEAT_SHEET: CheatSheetEntry[] = [
  { pattern: "\\d", desc: "matches any digit", example: "matches a digit" },
  { pattern: "\\w", desc: "matches any word character", example: "matches a-z, A-Z, 0-9" },
  { pattern: "\\s", desc: "matches any whitespace", example: "matches space, tab, newline" },
  { pattern: ".", desc: "matches any character", example: "except newline" },
  { pattern: "^", desc: "start of string/line", example: "anchors to beginning" },
  { pattern: "$", desc: "end of string/line", example: "anchors to end" },
  { pattern: "*", desc: "0 or more of previous", example: "ab* matches a, ab, abb" },
  { pattern: "+", desc: "1 or more of previous", example: "ab+ matches ab, abb" },
  { pattern: "?", desc: "0 or 1 of previous", example: "ab? matches a, ab" },
  { pattern: "{n,m}", desc: "between n and m times", example: "a{2,4} matches aa, aaa, aaaa" },
  { pattern: "[abc]", desc: "matches any of a, b, c", example: "character set" },
  { pattern: "(a|b)", desc: "matches a or b", example: "alternation group" },
];

const COMMON_PATTERNS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { label: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}" },
  { label: "URL", pattern: "https?:\\/\\/[^\\s]+" },
  { label: "IPv4 Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { label: "Hex Color", pattern: "#[0-9A-Fa-f]{6}\\b" },
  { label: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}" },
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState<string>("");
  const [testText, setTestText] = useState<string>("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [copied, setCopied] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(true);

  const flagString = useMemo(() => {
    let s = "";
    if (flags.g) s += "g";
    if (flags.i) s += "i";
    if (flags.m) s += "m";
    if (flags.s) s += "s";
    return s;
  }, [flags]);

  const regexResult = useMemo((): { matches: RegexMatch[]; error: string | null } => {
    if (!pattern.trim()) return { matches: [], error: null };

    try {
      const regex = new RegExp(pattern, flagString);
      const matches: RegexMatch[] = [];

      if (flags.g) {
        let m: RegExpExecArray | null;
        const globalRegex = new RegExp(pattern, flagString);
        let iterations = 0;
        while ((m = globalRegex.exec(testText)) !== null && iterations < 1000) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1).filter((g): g is string => g !== undefined),
          });
          if (m[0] === "") globalRegex.lastIndex++;
          iterations++;
        }
      } else {
        const m = regex.exec(testText);
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1).filter((g): g is string => g !== undefined),
          });
        }
      }

      return { matches, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid regular expression";
      return { matches: [], error: message };
    }
  }, [pattern, testText, flagString, flags.g]);

  const highlightedText = useMemo(() => {
    if (!pattern.trim() || regexResult.error || regexResult.matches.length === 0) {
      return testText;
    }
    return null;
  }, [pattern, testText, regexResult]);

  const renderHighlightedText = () => {
    if (!testText) {
      return <p className="text-slate-400 text-sm">Test text output will appear here with matches highlighted.</p>;
    }
    if (!pattern.trim() || regexResult.error) {
      return <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300">{testText}</pre>;
    }
    if (regexResult.matches.length === 0) {
      return <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300">{testText}</pre>;
    }

    const segments: { text: string; isMatch: boolean }[] = [];
    let lastIndex = 0;

    regexResult.matches.forEach((m) => {
      if (m.index > lastIndex) {
        segments.push({ text: testText.slice(lastIndex, m.index), isMatch: false });
      }
      segments.push({ text: m.match, isMatch: true });
      lastIndex = m.index + m.match.length;
    });

    if (lastIndex < testText.length) {
      segments.push({ text: testText.slice(lastIndex), isMatch: false });
    }

    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        {segments.map((seg, i) =>
          seg.isMatch ? (
            <mark key={i} className="bg-indigo-200 dark:bg-indigo-600/50 text-indigo-900 dark:text-indigo-100 rounded px-0.5">
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </pre>
    );
  };

  const toggleFlag = (flag: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const copyPattern = useCallback(async () => {
    if (!pattern) return;
    try {
      await navigator.clipboard.writeText(`/${pattern}/${flagString}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }, [pattern, flagString]);

  const clearAll = () => {
    setPattern("");
    setTestText("");
  };

  const loadSample = () => {
    setPattern("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    setTestText(
      "Contact us at support@snapconvert.com or sales@example.co.in for more information. You can also reach john.doe123@company.org anytime."
    );
  };

  const useCommonPattern = (p: string) => {
    setPattern(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-indigo-600" />
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
          <span className="text-slate-700 dark:text-slate-200">Regex Tester &amp; Cheat Sheet</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl mb-4">
            <Code2 className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Regex Tester &amp; Cheat Sheet
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Test regular expressions live and access a quick formula guide
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main tester */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pattern input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Regex Pattern</label>
                <div className="flex items-center gap-2">
                  <button onClick={loadSample} className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
                    Load Sample
                  </button>
                  <button onClick={clearAll} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500">
                <span className="pl-3 text-slate-400 font-mono text-sm">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter your regex pattern..."
                  spellCheck={false}
                  className="flex-1 px-2 py-3 font-mono text-sm bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
                />
                <span className="text-slate-400 font-mono text-sm">/{flagString}</span>
                <button
                  onClick={copyPattern}
                  className="px-3 text-slate-400 hover:text-indigo-600 transition-colors"
                  aria-label="Copy pattern"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {(
                  [
                    { key: "g", label: "Global (g)" },
                    { key: "i", label: "Ignore Case (i)" },
                    { key: "m", label: "Multiline (m)" },
                    { key: "s", label: "Dot All (s)" },
                  ] as const
                ).map((f) => (
                  <label key={f.key} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flags[f.key]}
                      onChange={() => toggleFlag(f.key)}
                      className="w-3.5 h-3.5 accent-indigo-600"
                    />
                    {f.label}
                  </label>
                ))}
              </div>

              {regexResult.error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg p-3 text-red-600 dark:text-red-400 text-xs sm:text-sm mt-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{regexResult.error}</span>
                </div>
              )}
            </div>

            {/* Common patterns quick-select */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Common Patterns
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_PATTERNS.map((cp) => (
                  <button
                    key={cp.label}
                    onClick={() => useCommonPattern(cp.pattern)}
                    className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg px-3 py-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    {cp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test text */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                Test Text
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Paste your test data here..."
                spellCheck={false}
                className="w-full min-h-[140px] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            {/* Matched results */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Matched Results ({regexResult.matches.length})
                </span>
              </div>
              <div className="p-4">{renderHighlightedText()}</div>

              {regexResult.matches.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-4 max-h-56 overflow-y-auto">
                  <div className="space-y-2">
                    {regexResult.matches.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 text-xs sm:text-sm"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-indigo-700 dark:text-indigo-300">{m.match}</span>
                          <span className="text-slate-400 ml-2">at index {m.index}</span>
                          {m.groups.length > 0 && (
                            <span className="text-slate-400 ml-2">
                              groups: {m.groups.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cheat sheet sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm h-fit">
            <button
              onClick={() => setShowCheatSheet((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Regex Cheat Sheet
              </span>
              <span className="text-xs text-slate-400">{showCheatSheet ? "Hide" : "Show"}</span>
            </button>

            {showCheatSheet && (
              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {CHEAT_SHEET.map((entry) => (
                  <button
                    key={entry.pattern}
                    onClick={() => setPattern((p) => p + entry.pattern)}
                    className="w-full text-left border border-slate-100 dark:border-slate-800 rounded-lg p-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors"
                  >
                    <code className="text-sm font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                      {entry.pattern}
                    </code>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{entry.desc}</p>
                    <p className="text-xs text-slate-400 mt-0.5 italic">{entry.example}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}