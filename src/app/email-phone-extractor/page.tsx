"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { Mail, Phone, Copy, Check, Trash2, Upload, Download, FileText } from "lucide-react";

interface ExtractedData {
  emails: string[];
  phones: string[];
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const PHONE_REGEX_MAP: Record<string, RegExp> = {
  any: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
  us: /(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  intl: /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?([-.\s]?\d{2,4}){2,4}/g,
};

export default function EmailPhoneExtractorPage() {
  const [inputText, setInputText] = useState<string>("");
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedPhones, setCopiedPhones] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [phoneFormat, setPhoneFormat] = useState<"any" | "us" | "intl">("any");
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extracted: ExtractedData = useMemo(() => {
    if (!inputText.trim()) return { emails: [], phones: [] };

    const emailMatches = inputText.match(EMAIL_REGEX) || [];
    const phoneRegex = PHONE_REGEX_MAP[phoneFormat];
    const phoneMatches = (inputText.match(phoneRegex) || [])
      .map((p: string) => p.trim())
      .filter((p: string) => p.replace(/\D/g, "").length >= 7);

    let emails: string[] = emailMatches;
    let phones: string[] = phoneMatches;

    if (removeDuplicates) {
      const emailSet = new Set<string>(emails.map((e) => e.toLowerCase()));
      emails = Array.from(emailSet);

      const phoneSet = new Set<string>(phones.map((p) => p.replace(/\s+/g, " ").trim()));
      phones = Array.from(phoneSet);
    }

    return { emails, phones };
  }, [inputText, removeDuplicates, phoneFormat]);

  const stats = useMemo(() => {
    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    return {
      totalChars: inputText.length,
      totalWords: wordCount,
      emailCount: extracted.emails.length,
      phoneCount: extracted.phones.length,
    };
  }, [inputText, extracted]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt") && !file.name.endsWith(".csv")) {
      setError("Please upload a plain text (.txt) or .csv file.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setInputText(text);
      }
    };
    reader.onerror = () => setError("Could not read the file.");
    reader.readAsText(file);
  };

  const clearAll = () => {
    setInputText("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyList = useCallback(async (items: string[], type: "email" | "phone") => {
    if (items.length === 0) return;
    try {
      await navigator.clipboard.writeText(items.join("\n"));
      if (type === "email") {
        setCopiedEmails(true);
        setTimeout(() => setCopiedEmails(false), 2000);
      } else {
        setCopiedPhones(true);
        setTimeout(() => setCopiedPhones(false), 2000);
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  }, []);

  const copySingle = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const downloadAsCsv = (type: "email" | "phone") => {
    const items = type === "email" ? extracted.emails : extracted.phones;
    if (items.length === 0) return;
    const header = type === "email" ? "Email" : "Phone Number";
    const csvContent = [header, ...items].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}s.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadBoth = () => {
    const lines: string[] = [];
    lines.push("Type,Value");
    extracted.emails.forEach((e) => lines.push(`Email,${e}`));
    extracted.phones.forEach((p) => lines.push(`Phone,${p}`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-contacts.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setInputText(
      `Hi team, reach out to john.doe@example.com or sarah_k@company.co.in for questions.\nYou can also call us at +1-415-555-0198 or (022) 4567-8901.\nAlternative contact: support@snapconvert.com, +91 98765 43210.\nBackup number: 011-2345-6789`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-cyan-600" />
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

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/developer-tools" className="hover:text-blue-600">Developer &amp; Data Tools</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200">Bulk Email &amp; Phone Extractor</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl mb-4">
            <Mail className="w-7 h-7 text-cyan-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Bulk Email &amp; Phone Extractor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
            Easily extract all emails and phone numbers from raw text
          </p>
        </div>

        {/* Input area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Paste your text data here
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSample}
                className="text-xs font-medium text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload .txt
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,text/plain"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text data here... e.g. emails from a document, contact list, scraped webpage text, etc."
            spellCheck={false}
            className="w-full min-h-[200px] sm:min-h-[240px] border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 resize-y"
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5 mt-3">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                Remove duplicates
              </label>

              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                {(["any", "us", "intl"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setPhoneFormat(f)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                      phoneFormat === f
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {f === "any" ? "Any Format" : f === "us" ? "US Style" : "International"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs sm:text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalWords}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Words</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalChars}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Characters</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-cyan-600">{stats.emailCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Emails Found</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-cyan-600">{stats.phoneCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Phones Found</p>
          </div>
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Emails */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Extracted Emails ({extracted.emails.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyList(extracted.emails, "email")}
                  disabled={extracted.emails.length === 0}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  {copiedEmails ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy All
                </button>
              </div>
            </div>
            <div className="p-4 max-h-72 overflow-y-auto">
              {extracted.emails.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No emails found yet</p>
              ) : (
                <ul className="space-y-1.5">
                  {extracted.emails.map((email, i) => (
                    <li
                      key={`${email}-${i}`}
                      className="flex items-center justify-between text-xs sm:text-sm bg-cyan-50/50 dark:bg-cyan-500/5 rounded-lg px-3 py-2 group"
                    >
                      <span className="text-slate-700 dark:text-slate-200 truncate">{email}</span>
                      <button
                        onClick={() => copySingle(email)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity flex-shrink-0 ml-2"
                        aria-label="Copy email"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {extracted.emails.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => downloadAsCsv("email")}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download as CSV
                </button>
              </div>
            )}
          </div>

          {/* Phones */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Extracted Phones ({extracted.phones.length})
                </span>
              </div>
              <button
                onClick={() => copyList(extracted.phones, "phone")}
                disabled={extracted.phones.length === 0}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed"
              >
                {copiedPhones ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy All
              </button>
            </div>
            <div className="p-4 max-h-72 overflow-y-auto">
              {extracted.phones.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No phone numbers found yet</p>
              ) : (
                <ul className="space-y-1.5">
                  {extracted.phones.map((phone, i) => (
                    <li
                      key={`${phone}-${i}`}
                      className="flex items-center justify-between text-xs sm:text-sm bg-cyan-50/50 dark:bg-cyan-500/5 rounded-lg px-3 py-2 group"
                    >
                      <span className="text-slate-700 dark:text-slate-200 truncate">{phone}</span>
                      <button
                        onClick={() => copySingle(phone)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity flex-shrink-0 ml-2"
                        aria-label="Copy phone"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {extracted.phones.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => downloadAsCsv("phone")}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download as CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {(extracted.emails.length > 0 || extracted.phones.length > 0) && (
          <div className="mt-5">
            <button
              onClick={downloadBoth}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              Download Combined CSV
            </button>
          </div>
        )}
      </main>
    </div>
  );
}