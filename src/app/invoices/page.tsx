"use client";

import Link from "next/link";
import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Plus,
  Trash2,
  Download,
  RefreshCw,
  User,
  Building2,
  Hash,
  Percent,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
  ChevronDown,
  Menu,
  X,
  Loader2,
  ArrowLeft,
  Landmark,
} from "lucide-react";

/* ============================================================
   Types
   ============================================================ */

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  discountRate: number;
  notes: string;
  bankDetails: string;
  currency: string;
}

function makeItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getBlankInvoice(): InvoiceData {
  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return {
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    issueDate: today,
    dueDate: due,
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    items: [{ id: makeItemId(), description: "", quantity: 1, price: 0 }],
    taxRate: 0,
    discountRate: 0,
    notes: "Thank you for your business.",
    bankDetails: "",
    currency: "USD",
  };
}

const CURRENCIES: { code: string; symbol: string }[] = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "AED", symbol: "د.إ" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
];

/* ============================================================
   Site nav (matches rest of the site)
   ============================================================ */

function NavIcon({ path, className = "" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}
const chevronDownPath = "M6 9l6 6 6-6";

const imageToolsMenu = [
  { label: "Compress Image", href: "/compress-image" },
  { label: "Resize Image", href: "/resize-image" },
  { label: "PNG to JPG", href: "/png-to-jpg" },
  { label: "JPG to PNG", href: "/jpg-to-png" },
  { label: "JPG to WebP", href: "/jpg-to-webp" },
  { label: "WebP to JPG", href: "/webp-to-jpg" },
];
const pdfToolsMenu = [
  { label: "Image to PDF", href: "/image-to-pdf" },
  { label: "Merge PDF", href: "/merge-pdf" },
  { label: "PDF to JPG", href: "/pdf-to-jpg" },
  { label: "Text to PDF", href: "/text-to-pdf" },
];
const devToolsMenu = [
  { label: "JSON Formatter", href: "/json-formatter" },
  { label: "Bulk Email & Phone Extractor", href: "/email-phone-extractor" },
  { label: "Regex Tester", href: "/regex-tester" },
  { label: "Text Case Converter", href: "/text-case-converter" },
  { label: "Invoice Generator", href: "/invoices" },
];

/* ============================================================
   Page
   ============================================================ */

type Stage = "form" | "generating" | "result";

const INVOICE_WIDTH = 794; // A4 @ 96dpi
const INVOICE_MIN_HEIGHT = 1123;

export default function InvoiceGeneratorPage() {
  const [invoice, setInvoice] = useState<InvoiceData>(() => getBlankInvoice());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [downloading, setDownloading] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const previewRef = useRef<HTMLDivElement | null>(null);
  const scaleWrapperRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const handleInputChange = useCallback(
    <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
      setInvoice((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleItemChange = useCallback(
    <K extends keyof InvoiceItem>(id: string, field: K, value: InvoiceItem[K]) => {
      setInvoice((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      }));
    },
    []
  );

  const addItem = useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { id: makeItemId(), description: "", quantity: 1, price: 0 }],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setInvoice((prev) => {
      if (prev.items.length === 1) return prev;
      return { ...prev, items: prev.items.filter((item) => item.id !== id) };
    });
  }, []);

  const resetForm = useCallback(() => {
    setInvoice(getBlankInvoice());
    setStage("form");
    setFormError("");
  }, []);

  const currencySymbol = useMemo(() => {
    return CURRENCIES.find((c) => c.code === invoice.currency)?.symbol ?? "$";
  }, [invoice.currency]);

  const summary = useMemo(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const discountAmount = subtotal * (invoice.discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (invoice.taxRate / 100);
    const total = taxableAmount + taxAmount;

    const format = (val: number): string =>
      val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return {
      subtotal: format(subtotal),
      discount: format(discountAmount),
      tax: format(taxAmount),
      total: format(total),
      subtotalRaw: subtotal,
      totalRaw: total,
    };
  }, [invoice.items, invoice.discountRate, invoice.taxRate]);

  const validateForm = useCallback((): string => {
    if (!invoice.companyName.trim()) return "Please enter your business name.";
    if (!invoice.clientName.trim()) return "Please enter the client's name.";
    if (!invoice.invoiceNumber.trim()) return "Please enter an invoice number.";
    const hasValidItem = invoice.items.some(
      (item) => item.description.trim().length > 0 && item.quantity > 0 && item.price >= 0
    );
    if (!hasValidItem) return "Add at least one item with a description, quantity, and price.";
    return "";
  }, [invoice]);

  const handleGenerate = useCallback(() => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");
    setStage("generating");
    window.setTimeout(() => {
      setStage("result");
    }, 800);
  }, [validateForm]);

  const handleDownloadPDF = useCallback(async () => {
    const node = previewRef.current;
    if (!node) {
      alert("Invoice preview not found. Please try generating again.");
      return;
    }

    setDownloading(true);
    try {
      const options: any = {
  scale: 2,
  useCORS: true,
  backgroundColor: "#ffffff",
  logging: false,
};

const canvas = await html2canvas(node, options);
      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let positionY = 0;

      pdf.addImage(imgData, "JPEG", 0, positionY, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        positionY = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, positionY, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeInvoiceNumber = invoice.invoiceNumber.trim().replace(/[^a-zA-Z0-9-_]/g, "");
      const fileName = safeInvoiceNumber ? `Invoice-${safeInvoiceNumber}.pdf` : "Invoice.pdf";

      pdf.save(fileName);
    } catch (err: any) {
  console.error("PDF generation failed:", err);

  alert(
    err?.message ||
    err?.toString() ||
    "Unknown PDF Error"
  );
}
     finally {
      setDownloading(false);
    }
  }, [invoice.invoiceNumber]);

  const formatDate = (iso: string): string => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  /* ------------------------------------------------------------
     Responsive preview scaling — keeps the invoice at its real
     794px A4 width (so the PDF capture is always crisp) but
     visually shrinks it to fit small screens, no side-scrolling.
     ------------------------------------------------------------ */
  useEffect(() => {
    if (stage !== "result") return;

    function updateScale() {
      const el = scaleWrapperRef.current;
      if (!el) return;
      const available = el.clientWidth;
      const next = Math.min(1, available / INVOICE_WIDTH);
      setPreviewScale(next > 0 ? next : 1);
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [stage]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ---------- Navbar ---------- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3a3 3 0 0 0-3 3c0 1.3.7 2.3 1.7 2.7C9.7 9.4 9 10.6 9 12c0 1.9 1.3 3.5 3 3.9V19a2 2 0 0 1-2 2H8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="6" r="0.6" fill="currentColor" />
            </svg>
            <span className="text-lg font-bold text-slate-900 dark:text-white">SnapConvert</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <Link href="/" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">Home</Link>

            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                Image Tools
                <NavIcon path={chevronDownPath} className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-0 top-full w-56 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900">
                {imageToolsMenu.map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{item.label}</Link>
                ))}
              </div>
            </div>

            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                PDF Tools
                <NavIcon path={chevronDownPath} className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-0 top-full w-56 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900">
                {pdfToolsMenu.map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{item.label}</Link>
                ))}
              </div>
            </div>

            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-blue-600">
                Developer Tools
                <NavIcon path={chevronDownPath} className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-0 top-full w-64 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900">
                {devToolsMenu.map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{item.label}</Link>
                ))}
              </div>
            </div>

            <Link href="/about-us" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">About Us</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact-us" className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 sm:inline-block">
              Contact Us
            </Link>
            <button aria-label="Open menu" onClick={() => setMobileOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden max-h-[75vh] overflow-y-auto">
            <Link href="/" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Home</Link>

            <button onClick={() => setImageOpen((v) => !v)} className="flex w-full items-center justify-between py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Image Tools
              <ChevronDown className={`h-4 w-4 transition-transform ${imageOpen ? "rotate-180" : ""}`} />
            </button>
            {imageOpen && (
              <div className="ml-3 flex flex-col border-l border-slate-200 pl-3 dark:border-slate-800">
                {imageToolsMenu.map((item) => (
                  <Link key={item.href} href={item.href} className="py-2 text-sm text-slate-600 dark:text-slate-300">{item.label}</Link>
                ))}
              </div>
            )}

            <button onClick={() => setPdfOpen((v) => !v)} className="flex w-full items-center justify-between py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              PDF Tools
              <ChevronDown className={`h-4 w-4 transition-transform ${pdfOpen ? "rotate-180" : ""}`} />
            </button>
            {pdfOpen && (
              <div className="ml-3 flex flex-col border-l border-slate-200 pl-3 dark:border-slate-800">
                {pdfToolsMenu.map((item) => (
                  <Link key={item.href} href={item.href} className="py-2 text-sm text-slate-600 dark:text-slate-300">{item.label}</Link>
                ))}
              </div>
            )}

            <button onClick={() => setDevOpen((v) => !v)} className="flex w-full items-center justify-between py-2 text-sm font-medium text-blue-600">
              Developer Tools
              <ChevronDown className={`h-4 w-4 transition-transform ${devOpen ? "rotate-180" : ""}`} />
            </button>
            {devOpen && (
              <div className="ml-3 flex flex-col border-l border-slate-200 pl-3 dark:border-slate-800">
                {devToolsMenu.map((item) => (
                  <Link key={item.href} href={item.href} className="py-2 text-sm text-slate-600 dark:text-slate-300">{item.label}</Link>
                ))}
              </div>
            )}

            <Link href="/about-us" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">About Us</Link>
            <Link href="/contact-us" className="mt-2 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">Contact Us</Link>
          </div>
        )}
      </header>

      {/* ---------- Page header ---------- */}
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200">Invoice Generator</span>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl mb-4">
            <FileText className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Invoice Generator</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base max-w-xl mx-auto">
            Create a professional invoice, then download it as a real PDF file — 100% free, no sign up, no watermark.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* ===================== FORM + GENERATING ===================== */}
        {(stage === "form" || stage === "generating") && (
          <div className="space-y-5">
            {/* Invoice metadata */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                <Hash className="w-3.5 h-3.5" /> Invoice Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                    placeholder="e.g. INV-2026-001"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Currency</label>
                  <select
                    value={invoice.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => handleInputChange("issueDate", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* From */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                <Building2 className="w-3.5 h-3.5" /> From (Your Business)
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={invoice.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Your company or your name"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={invoice.companyEmail}
                    onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                    placeholder="billing@yourbusiness.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="tel"
                    value={invoice.companyPhone}
                    onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                    placeholder="Phone number"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <textarea
                  rows={2}
                  value={invoice.companyAddress}
                  onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                  placeholder="Business address"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Client */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                <User className="w-3.5 h-3.5" /> Bill To (Client)
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={invoice.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder="Client name or company"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="email"
                  value={invoice.clientEmail}
                  onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                  placeholder="client@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  rows={2}
                  value={invoice.clientAddress}
                  onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                  placeholder="Client address"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Items
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-500/20 transition-all gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {invoice.items.map((item, index) => {
                  const lineTotal = (item.quantity * item.price).toFixed(2);
                  return (
                    <div key={item.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={invoice.items.length === 1}
                          className="p-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 rounded-lg border border-rose-100 dark:border-rose-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        placeholder="What did you deliver?"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-medium text-slate-400 uppercase mb-1 block">Qty</label>
                          <input
                            type="number"
                            min={0}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, "quantity", Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white text-center focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-400 uppercase mb-1 block">Unit Price</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, "price", Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Line total: {currencySymbol}{lineTotal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adjustments + notes + bank details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                <Layers className="w-3.5 h-3.5" /> Adjustments & Payment Info
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={invoice.taxRate}
                    onChange={(e) => handleInputChange("taxRate", Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Discount (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={invoice.discountRate}
                    onChange={(e) => handleInputChange("discountRate", Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Landmark className="w-3 h-3" /> Payment Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={invoice.bankDetails}
                  onChange={(e) => handleInputChange("bankDetails", e.target.value)}
                  placeholder="Bank name, account number, IFSC / SWIFT, PayPal link, etc."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={invoice.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="e.g. Payment due within 14 days."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                {formError}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={stage === "generating"}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all text-base"
            >
              {stage === "generating" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating your invoice...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Invoice
                </>
              )}
            </button>

            {stage === "generating" && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Formatting your invoice...</p>
              </div>
            )}
          </div>
        )}

        {/* ===================== RESULT (generated invoice + download) ===================== */}
        {stage === "result" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStage("form")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Edit
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> New Invoice
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Preparing PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Your invoice is ready. Click "Download PDF" to save it to your device.
            </div>

            {/* ============================================================
                Generated invoice — this is the exact node captured for PDF.
                It always renders at a fixed 794px (true A4 width) so the
                PDF export stays crisp. On small screens it is visually
                scaled down with a CSS transform so nothing overflows and
                there is no horizontal scrolling — what you see is the
                whole invoice, just smaller.
               ============================================================ */}
            <div
              ref={scaleWrapperRef}
              className="bg-slate-100 dark:bg-slate-900/40 p-3 sm:p-6 rounded-2xl overflow-hidden"
            >
              <div
                style={{
                  width: "100%",
                  height: INVOICE_MIN_HEIGHT * previewScale,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: INVOICE_WIDTH,
                    height: INVOICE_MIN_HEIGHT,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    ref={previewRef}
                    style={{
                      width: INVOICE_WIDTH,
                      minHeight: INVOICE_MIN_HEIGHT,
                      background: "#FFFFFF",
                      color: "#14181F",
                      fontFamily: "Helvetica, Arial, sans-serif",
                      position: "relative",
                    }}
                  >
                    {/* Ink accent spine */}
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "10px", background: "#0F766E" }} />

                    {/* Header */}
                    <div style={{ padding: "44px 56px 28px 68px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div
                            style={{
                              fontFamily: "Georgia, 'Times New Roman', serif",
                              fontSize: "34px",
                              fontWeight: 700,
                              letterSpacing: "1px",
                              color: "#14181F",
                              lineHeight: 1,
                            }}
                          >
                            Invoice
                          </div>
                          <div
                            style={{
                              marginTop: "10px",
                              fontFamily: "'Courier New', monospace",
                              fontSize: "12px",
                              letterSpacing: "0.5px",
                              color: "#0F766E",
                              fontWeight: 700,
                            }}
                          >
                            No. {invoice.invoiceNumber || "—"}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontFamily: "Georgia, 'Times New Roman', serif",
                              fontSize: "18px",
                              fontWeight: 700,
                              color: "#14181F",
                            }}
                          >
                            {invoice.companyName || "Your Business Name"}
                          </div>
                          <div style={{ marginTop: "6px", fontSize: "11px", color: "#5B6169", lineHeight: 1.6 }}>
                            {invoice.companyEmail && <div>{invoice.companyEmail}</div>}
                            {invoice.companyPhone && <div>{invoice.companyPhone}</div>}
                            {invoice.companyAddress && <div style={{ maxWidth: "220px", marginLeft: "auto" }}>{invoice.companyAddress}</div>}
                          </div>
                        </div>
                      </div>

                      <div style={{ height: "1px", background: "#E2E5E1", marginTop: "26px" }} />
                    </div>

                    {/* Bill to / dates band */}
                    <div style={{ padding: "0 56px 0 68px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "24px" }}>
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "#8A9089", textTransform: "uppercase", marginBottom: "6px" }}>
                            Billed To
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#14181F" }}>
                            {invoice.clientName || "Client Name"}
                          </div>
                          <div style={{ marginTop: "4px", fontSize: "11px", color: "#5B6169", lineHeight: 1.6 }}>
                            {invoice.clientEmail && <div>{invoice.clientEmail}</div>}
                            {invoice.clientAddress && <div style={{ maxWidth: "240px" }}>{invoice.clientAddress}</div>}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "28px" }}>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "#8A9089", textTransform: "uppercase", marginBottom: "6px" }}>
                              Issued
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 600, fontFamily: "'Courier New', monospace", color: "#14181F" }}>
                              {formatDate(invoice.issueDate)}
                            </div>
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "#8A9089", textTransform: "uppercase", marginBottom: "6px" }}>
                              Due
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 700, fontFamily: "'Courier New', monospace", color: "#B45309" }}>
                              {formatDate(invoice.dueDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items ledger */}
                    <div style={{ padding: "26px 56px 0 68px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th
                              style={{
                                textAlign: "left",
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "1px",
                                color: "#0F766E",
                                textTransform: "uppercase",
                                padding: "0 0 10px 0",
                                borderBottom: "2px solid #0F766E",
                              }}
                            >
                              Description
                            </th>
                            <th
                              style={{
                                textAlign: "center",
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "1px",
                                color: "#0F766E",
                                textTransform: "uppercase",
                                padding: "0 0 10px 0",
                                borderBottom: "2px solid #0F766E",
                                width: "60px",
                              }}
                            >
                              Qty
                            </th>
                            <th
                              style={{
                                textAlign: "right",
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "1px",
                                color: "#0F766E",
                                textTransform: "uppercase",
                                padding: "0 0 10px 0",
                                borderBottom: "2px solid #0F766E",
                                width: "100px",
                              }}
                            >
                              Rate
                            </th>
                            <th
                              style={{
                                textAlign: "right",
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "1px",
                                color: "#0F766E",
                                textTransform: "uppercase",
                                padding: "0 0 10px 0",
                                borderBottom: "2px solid #0F766E",
                                width: "110px",
                              }}
                            >
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.items.map((item, i) => (
                            <tr key={item.id} style={{ background: i % 2 === 1 ? "#F1F5F4" : "transparent" }}>
                              <td style={{ padding: "11px 8px 11px 4px", fontSize: "12px", fontWeight: 600, color: "#14181F" }}>
                                {item.description || `Item ${i + 1}`}
                              </td>
                              <td style={{ padding: "11px 8px", fontSize: "12px", textAlign: "center", color: "#5B6169", fontFamily: "'Courier New', monospace" }}>
                                {item.quantity}
                              </td>
                              <td style={{ padding: "11px 8px", fontSize: "12px", textAlign: "right", color: "#5B6169", fontFamily: "'Courier New', monospace" }}>
                                {currencySymbol}{item.price.toFixed(2)}
                              </td>
                              <td style={{ padding: "11px 4px 11px 8px", fontSize: "12px", textAlign: "right", fontWeight: 700, color: "#14181F", fontFamily: "'Courier New', monospace" }}>
                                {currencySymbol}{(item.quantity * item.price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div style={{ padding: "22px 56px 0 68px", display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ width: "260px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#5B6169", padding: "5px 0" }}>
                          <span>Subtotal</span>
                          <span style={{ fontFamily: "'Courier New', monospace", fontWeight: 600, color: "#14181F" }}>
                            {currencySymbol}{summary.subtotal}
                          </span>
                        </div>
                        {invoice.discountRate > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#0F766E", padding: "5px 0", fontWeight: 600 }}>
                            <span>Discount ({invoice.discountRate}%)</span>
                            <span style={{ fontFamily: "'Courier New', monospace" }}>-{currencySymbol}{summary.discount}</span>
                          </div>
                        )}
                        {invoice.taxRate > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#5B6169", padding: "5px 0" }}>
                            <span>Tax ({invoice.taxRate}%)</span>
                            <span style={{ fontFamily: "'Courier New', monospace", fontWeight: 600, color: "#14181F" }}>
                              {currencySymbol}{summary.tax}
                            </span>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "12px",
                            padding: "13px 16px",
                            background: "#14181F",
                            borderRadius: "6px",
                          }}
                        >
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.5px" }}>TOTAL DUE</span>
                          <span style={{ fontSize: "17px", fontWeight: 800, color: "#5EEAD4", fontFamily: "'Courier New', monospace" }}>
                            {currencySymbol}{summary.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tear-off perforation */}
                    <div style={{ margin: "34px 0 0 0", position: "relative", padding: "0 56px 0 68px" }}>
                      <div
                        style={{
                          borderTop: "2px dashed #C7CCC7",
                          position: "relative",
                        }}
                      >
                        <span style={{ position: "absolute", left: "-52px", top: "-9px", fontSize: "16px", color: "#C7CCC7" }}>✂</span>
                      </div>
                    </div>

                    {/* Payment details + notes */}
                    <div style={{ padding: "22px 56px 40px 68px", display: "flex", gap: "40px" }}>
                      {invoice.bankDetails && (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "#8A9089", textTransform: "uppercase", marginBottom: "6px" }}>
                            Payment Details
                          </div>
                          <div style={{ fontSize: "11px", color: "#5B6169", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                            {invoice.bankDetails}
                          </div>
                        </div>
                      )}
                      {invoice.notes && (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", color: "#8A9089", textTransform: "uppercase", marginBottom: "6px" }}>
                            Notes
                          </div>
                          <div style={{ fontSize: "11px", color: "#5B6169", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                            {invoice.notes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ position: "absolute", bottom: "16px", left: 0, right: 0, textAlign: "center" }}>
                      <span style={{ fontSize: "9px", color: "#A7ACA6", letterSpacing: "0.5px" }}>
                        Generated with SnapConvert · snapconvert.site
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all text-base"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Preparing your PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" /> Download Invoice as PDF
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* ---------- Trust badges ---------- */}
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">100% Free</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">No sign up, no watermark, unlimited invoices.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Runs in Your Browser</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your invoice data never leaves your device.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Real PDF Download</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Get an actual PDF file, not just a print prompt.</p>
          </div>
        </div>
      </div>
    </div>
  );
}