"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { database } from "@/lib/firebase";
import { ref, push } from "firebase/database";

function Icon({ path, className = "" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

const paths = {
  image: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M3 16l5-5 3 3 5-6 5 7",
  resize: "M4 14h6v6H4zM14 4h6v6h-6zM4 4l6 6M14 14l6 6",
  fileText: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6",
  swap: "M7 4v13M7 4l-3 3M7 4l3 3M17 20V7M17 20l3-3M17 20l-3-3",
  mergePdf: "M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M9 4v16M15 4v16",
  webp: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 9h8v6H8z",
  textPdf: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 3v5h5M8 13h8M8 17h5",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  moon: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z",
  sun: "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  shieldCheck: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4zM9 12l2 2 4-4",
  noSignUp: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4zM9 11l3 3 4-4",
  bolt: "M13 2 3 14h7l-1 8 11-14h-8l1-6z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9z",
  headphones: "M4 14v-2a8 8 0 0 1 16 0v2M4 14a2 2 0 0 0 2 2h1v-5H5a2 2 0 0 0-1 2zM20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 1 2z",
  menu: "M3 6h18M3 12h18M3 18h18",
  x: "M18 6L6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  star: "M12 2l2.9 6 6.6.6-5 4.5 1.5 6.4L12 16.3 6 19.5l1.5-6.4-5-4.5 6.6-.6z",
  users: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  clock: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17 6.8h.01",
  mail: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 6l9 7 9-7",
  mapPin: "M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  sparkle: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  code: "M8 5l-6 7 6 7M16 5l6 7-6 7M13 3l-2 18",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z",
  check: "M20 6 9 17l-5-5",
  quote: "M9 5H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2H4M19 5h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2h-1",
  rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  coffee: "M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3",
  copy: "M9 9h11v11H9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
};

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

const heroFeatures = [
  { icon: paths.noSignUp, title: "100% Free", desc: "All tools are free to use", bg: "bg-blue-100 text-blue-600" },
  { icon: paths.shieldCheck, title: "No Sign Up", desc: "No registration required", bg: "bg-green-100 text-green-600" },
  { icon: paths.globe, title: "Secure", desc: "Your files stay private", bg: "bg-purple-100 text-purple-600" },
  { icon: paths.bolt, title: "Super Fast", desc: "Get results in seconds", bg: "bg-orange-100 text-orange-600" },
];

const tools = [
  { title: "Compress Image", desc: "Reduce image size without losing quality", icon: paths.image, href: "/compress-image", bg: "bg-blue-100 text-blue-600" },
  { title: "Resize Image", desc: "Resize images to any dimension you want", icon: paths.resize, href: "/resize-image", bg: "bg-green-100 text-green-600" },
  { title: "PNG to JPG", desc: "Convert PNG images to JPG format", icon: paths.image, href: "/png-to-jpg", bg: "bg-purple-100 text-purple-600" },
  { title: "JPG to PNG", desc: "Convert JPG images to PNG format", icon: paths.fileText, href: "/jpg-to-png", bg: "bg-orange-100 text-orange-600" },
  { title: "JPG to WebP", desc: "Convert JPG images to WebP format", icon: paths.image, href: "/jpg-to-webp", bg: "bg-pink-100 text-pink-600" },
  { title: "WebP to JPG", desc: "Convert WebP images to JPG format", icon: paths.webp, href: "/webp-to-jpg", bg: "bg-teal-100 text-teal-600" },
  { title: "Image to PDF", desc: "Convert images to PDF document", icon: paths.fileText, href: "/image-to-pdf", bg: "bg-red-100 text-red-600" },
  { title: "Merge PDF", desc: "Merge multiple PDF files into one", icon: paths.mergePdf, href: "/merge-pdf", bg: "bg-blue-100 text-blue-600" },
  { title: "PDF to JPG", desc: "Convert PDF pages to JPG images", icon: paths.fileText, href: "/pdf-to-jpg", bg: "bg-green-100 text-green-600" },
  { title: "Text to PDF", desc: "Convert text or notes to PDF document", icon: paths.textPdf, href: "/text-to-pdf", bg: "bg-purple-100 text-purple-600" },
  {
    title: "Invoice Generator",
    desc: "Create professional invoices online for free",
    icon: paths.fileText,
    href: "/invoices",
    bg: "bg-emerald-100 text-emerald-600",
  },
];

const devTools = [
  { title: "JSON Formatter & Validator", desc: "Format and validate messy JSON data in one click", icon: paths.fileText, href: "/json-formatter", bg: "bg-yellow-100 text-yellow-700" },
  { title: "Bulk Email & Phone Extractor", desc: "Easily extract all emails and phone numbers from raw text", icon: paths.mail, href: "/email-phone-extractor", bg: "bg-cyan-100 text-cyan-700" },
  { title: "Regex Tester & Cheat Sheet", desc: "Test regular expressions live and access a quick formula guide", icon: paths.code, href: "/regex-tester", bg: "bg-indigo-100 text-indigo-700" },
  { title: "Text Case Converter & List Sorter", desc: "Convert text case or sort your lists instantly", icon: paths.swap, href: "/text-case-converter", bg: "bg-rose-100 text-rose-700" },
];

const bottomFeatures = [
  { icon: paths.shieldCheck, title: "Your Privacy, Our Priority", desc: "Files are processed in your browser. We never upload your files." },
  { icon: paths.bolt, title: "Works on All Devices", desc: "Our tools work perfectly on desktop, tablet and mobile devices." },
  { icon: paths.globe, title: "No Limits", desc: "Unlimited conversions and downloads without any restrictions." },
  { icon: paths.headphones, title: "Always Here to Help", desc: "Have questions? Our support team is always ready to help you." },
];

const stats = [
  { icon: paths.rocket, value: 1, suffix: "", label: "Just Launched", isText: true },
  { icon: paths.noSignUp, value: 0, suffix: "", label: "Sign Up Required", isText: true, customText: "Zero" },
  { icon: paths.globe, value: 10, suffix: "+", label: "Tools Available" },
  { icon: paths.clock, value: 3, suffix: "s", label: "Avg. Processing Time" },
];

const steps = [
  { title: "Upload your file", desc: "Drag & drop or choose a file from your device, no size limits.", icon: paths.download },
  { title: "Pick a tool", desc: "Choose compress, resize, convert or merge, whatever you need.", icon: paths.sparkle },
  { title: "Download instantly", desc: "Get your processed file back in seconds, ready to use.", icon: paths.bolt },
];

const faqs = [
  { q: "Is SnapConvert really free to use?", a: "Yes. Every tool on SnapConvert is 100% free with no hidden charges, no watermarks and no daily limits on conversions or downloads." },
  { q: "Do I need to create an account or sign up?", a: "No sign up is required. Just open any tool, upload your file and get your result instantly, no account, no email needed." },
  { q: "Are my files safe and private?", a: "Yes. Most tools process your files directly in your browser, and any files that are processed on our servers are automatically deleted shortly after conversion. We never share or sell your files." },
  { q: "What file formats does SnapConvert support?", a: "SnapConvert supports common image formats like JPG, PNG and WebP, along with PDF documents, covering compression, resizing, format conversion, merging and more." },
  { q: "Is there a limit on file size or number of conversions?", a: "No. You can convert as many files as you like with no restrictions, though very large files may take a little longer to process depending on your connection." },
  { q: "Can I use SnapConvert on my phone or tablet?", a: "Yes. SnapConvert is fully responsive and works smoothly on desktop, tablet and mobile browsers without needing to install any app." },
  { q: "Do you store or keep a copy of my uploaded files?", a: "No. Files are either processed locally in your browser or deleted from our servers shortly after your download completes." },
  { q: "Will converted images lose quality?", a: "Our compression and conversion tools are tuned to keep visual quality as close to the original as possible while reducing file size." },
];

const footerLinks = {
  imageTools: imageToolsMenu,
  pdfTools: pdfToolsMenu,
  devTools: devToolsMenu,
  company: [
    { label: "About Us", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
};

function useCountUp(target: number, start: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

function useInView() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function StatCard({ icon, value, suffix, label, isText, customText }: { icon: string; value: number; suffix: string; label: string; isText?: boolean; customText?: string }) {
  const { ref, inView } = useInView();
  const count = useCountUp(value, inView && !isText);
  return (
    <div ref={ref} className="flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm sm:p-6">
      <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white sm:mb-3 sm:h-12 sm:w-12">
        <Icon path={icon} className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>
      <p className="text-xl font-extrabold text-white sm:text-3xl md:text-4xl">
        {isText ? (customText ?? "New") : count.toLocaleString()}
        {!isText && suffix}
      </p>
      <p className="mt-1 text-xs text-blue-100 sm:text-sm">{label}</p>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const popularToolsRef = useRef<HTMLDivElement | null>(null);

  const scrollToTools = () => {
    popularToolsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText("support@snapconvert");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!reviewName.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }
    if (!reviewMessage.trim()) {
      setSubmitError("Please share a few words about your experience.");
      return;
    }
    if (reviewMessage.trim().length < 5) {
      setSubmitError("Your review is too short. Please write a bit more.");
      return;
    }

    setSubmitting(true);
    try {
      const reviewsRef = ref(database, "reviews");
      await push(reviewsRef, {
        name: reviewName.trim(),
        rating: reviewRating,
        message: reviewMessage.trim(),
        createdAt: Date.now(),
      });
      setSubmitSuccess(true);
      setReviewName("");
      setReviewRating(5);
      setReviewMessage("");
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to submit review", err);
      setSubmitError("Something went wrong while submitting your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="SnapConvert" className="h-20 w-25 object-contain" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">SnapConvert</span>
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              <Link href="/" className="border-b-2 border-blue-600 pb-1 text-sm font-medium text-blue-600">Home</Link>
              <div className="group relative">
                <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                  Image Tools
                  <Icon path={paths.chevronDown} className="h-4 w-4" />
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
                  <Icon path={paths.chevronDown} className="h-4 w-4" />
                </button>
                <div className="invisible absolute left-0 top-full w-56 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-900">
                  {pdfToolsMenu.map((item) => (
                    <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">{item.label}</Link>
                  ))}
                </div>
              </div>
              <div className="group relative">
                <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">
                  Developer Tools
                  <Icon path={paths.chevronDown} className="h-4 w-4" />
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
              <button aria-label="Toggle theme" onClick={() => setDark((v) => !v)} className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:flex">
                <Icon path={dark ? paths.sun : paths.moon} className="h-5 w-5" />
              </button>
              <Link href="/contact-us" className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/40 sm:inline-block">Contact Us</Link>
              <button aria-label="Open menu" onClick={() => setMobileOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden">
                <Icon path={mobileOpen ? paths.x : paths.menu} className="h-6 w-6" />
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="border-t border-slate-200 bg-white px-4 pb-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden max-h-[75vh] overflow-y-auto">
              <Link href="/" className="block py-2 text-sm font-medium text-blue-600">Home</Link>
              <button onClick={() => setImageOpen((v) => !v)} className="flex w-full items-center justify-between py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Image Tools
                <Icon path={paths.chevronDown} className={`h-4 w-4 transition-transform ${imageOpen ? "rotate-180" : ""}`} />
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
                <Icon path={paths.chevronDown} className={`h-4 w-4 transition-transform ${pdfOpen ? "rotate-180" : ""}`} />
              </button>
              {pdfOpen && (
                <div className="ml-3 flex flex-col border-l border-slate-200 pl-3 dark:border-slate-800">
                  {pdfToolsMenu.map((item) => (
                    <Link key={item.href} href={item.href} className="py-2 text-sm text-slate-600 dark:text-slate-300">{item.label}</Link>
                  ))}
                </div>
              )}
              <button onClick={() => setDevOpen((v) => !v)} className="flex w-full items-center justify-between py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Developer Tools
                <Icon path={paths.chevronDown} className={`h-4 w-4 transition-transform ${devOpen ? "rotate-180" : ""}`} />
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

        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 animate-pulse rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
          <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 animate-pulse rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-500/10" style={{ animationDelay: "1s" }} />
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex animate-bounce items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" style={{ animationDuration: "3s" }}>
                  <Icon path={paths.shieldCheck} className="h-3.5 w-3.5" />
                  100% Free • No Sign Up • Secure
                </span>
                <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                  All-in-One Online Tools <br className="hidden sm:block" />
                  for{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Images, PDFs &amp; Data</span>
                </h1>
                <p className="mt-5 max-w-lg text-base text-slate-600 dark:text-slate-400 sm:text-lg">
                  SnapConvert provides a complete set of fast, free and easy-to-use tools to convert, compress, edit, format and manage your files with ease.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={scrollToTools}
                    className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40"
                  >
                    Get Started Free
                    <Icon path={paths.arrowRight} className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                  <Link href="/about-us" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200">Learn More</Link>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {heroFeatures.map((f) => (
                    <div key={f.title} className="flex items-start gap-2">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${f.bg} transition-transform hover:scale-110 hover:rotate-6`}>
                        <Icon path={f.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 transition-transform duration-500 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-6">
                  <div className="mb-4 flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 p-6 dark:bg-slate-800 sm:gap-6 sm:p-10">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-blue-100 sm:h-24 sm:w-24">
                      <Icon path={paths.image} className="h-10 w-10 text-blue-500 sm:h-12 sm:w-12" />
                    </div>
                    <span className="flex h-10 w-10 shrink-0 animate-spin items-center justify-center rounded-full bg-blue-600 text-white" style={{ animationDuration: "3s" }}>
                      <Icon path={paths.swap} className="h-5 w-5" />
                    </span>
                    <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-red-500 text-xs font-bold text-white sm:h-24 sm:w-20">PDF</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-2 hidden h-12 w-12 animate-bounce items-center justify-center rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex" style={{ animationDuration: "2.5s" }}>
                  <Icon path={paths.image} className="h-5 w-5 text-green-500" />
                </div>
                <div className="absolute -bottom-4 left-0 hidden h-12 w-12 animate-bounce items-center justify-center rounded-xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex" style={{ animationDuration: "3s", animationDelay: "0.5s" }}>
                  <Icon path={paths.fileText} className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={popularToolsRef} className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
              <Icon path={paths.sparkle} className="h-3.5 w-3.5" />
              OUR TOOLS
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">Popular Tools</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Everything you need in one place. <span className="font-semibold text-slate-800 dark:text-slate-200">Fast, simple and reliable tools.</span>
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-none">
                <div>
                  <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tool.bg}`}>
                    <Icon path={tool.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tool.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{tool.desc}</p>
                </div>
                <Icon path={paths.arrowRight} className="mt-4 h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Icon path={paths.code} className="h-3.5 w-3.5" />
              DEVELOPER &amp; DATA TOOLS
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">Handy Utilities for Developers</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Quick, free tools to format, extract and test data <span className="font-semibold text-slate-800 dark:text-slate-200">right in your browser.</span>
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {devTools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-none">
                <div>
                  <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tool.bg}`}>
                    <Icon path={tool.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tool.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{tool.desc}</p>
                </div>
                <Icon path={paths.arrowRight} className="mt-4 h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How It Works</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Three simple steps and your file is ready.</p>
          </div>
          <div className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="absolute top-8 left-0 right-0 hidden h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200 sm:block" />
            {steps.map((s, i) => (
              <div key={s.title} className="relative flex flex-col items-center text-center">
                <span className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-lg shadow-slate-200/70 ring-4 ring-blue-50 transition-transform hover:scale-110 dark:bg-slate-900 dark:ring-slate-800">
                  <Icon path={s.icon} className="h-7 w-7" />
                </span>
                <span className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600">Step {i + 1}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12">
            <div className="pointer-events-none absolute -top-10 -right-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="relative mb-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                <Icon path={paths.rocket} className="h-3.5 w-3.5" />
                Freshly Launched
              </span>
            </div>
            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {bottomFeatures.map((f) => (
                <div key={f.title} className="group flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-500/10">
                    <Icon path={f.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{f.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Share Your Experience (Firebase Realtime Database) ---------- */}
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-300">
              <Icon path={paths.quote} className="h-3.5 w-3.5" />
              YOUR VOICE MATTERS
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">Share Your Experience</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Used SnapConvert? Tell us what you think — your review helps other users and helps us improve.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Your Name</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  maxLength={60}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Your Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} aria-label={`Rate ${star} star`} className="transition-transform hover:scale-110">
                      <Icon path={paths.star} className={`h-6 w-6 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{reviewRating} / 5</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Your Experience</label>
                <textarea
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  placeholder="Tell us how SnapConvert helped you..."
                  maxLength={400}
                  className="w-full min-h-[110px] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-y"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">{reviewMessage.length}/400</p>
              </div>
              {submitError && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-lg px-3 py-2.5">{submitError}</div>
              )}
              {submitSuccess && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-lg px-3 py-2.5">
                  <Icon path={paths.check} className="h-4 w-4 flex-shrink-0" />
                  Thank you! Your review has been submitted.
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-sm transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Icon path={paths.send} className="h-4 w-4" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">FAQ</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Still have doubts? Here are answers to the most common questions.</p>
          </div>
          <div className="mt-8 space-y-3">
            {faqs.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.q} className={`overflow-hidden rounded-2xl border bg-white transition-colors dark:bg-slate-900 ${isOpen ? "border-blue-300 dark:border-blue-500/50" : "border-slate-200 dark:border-slate-800"}`}>
                  <button onClick={() => setOpenFaq(isOpen ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className={`text-sm font-semibold sm:text-base ${isOpen ? "text-blue-600" : "text-slate-900 dark:text-white"}`}>{item.q}</span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "rotate-45 bg-blue-600 text-white" : "bg-blue-50 text-blue-600 dark:bg-blue-500/10"}`}>
                      <Icon path={paths.plus} className="h-4 w-4" />
                    </span>
                  </button>
                  <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- Buy Me a Coffee / Support ---------- */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                Love SnapConvert? Support Us! <span>❤️</span>
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                SnapConvert is 100% free, ad-free, and open for everyone.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your support helps us keep the tools free, fast, and better every day.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 sm:p-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {/* Buy Me a Coffee */}
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 mb-3">
                    <Icon path={paths.coffee} className="h-8 w-8 text-amber-500" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Buy Me a Coffee</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                    If SnapConvert saved your time, consider buying us a coffee ☕
                  </p>

                  <a
                    href=""
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition-colors"
                  >
                    Buy me a coffee
                    <Icon path={paths.coffee} className="h-4 w-4" />
                  </a>
                </div>

                {/* Donate via UPI */}
                <div className="flex flex-col items-center text-center border-t border-slate-100 pt-8 dark:border-slate-800 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Donate via UPI</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Scan QR code or send to our UPI ID
                  </p>

                  <img
                    src="/qr-code.png"
                    alt="UPI QR Code"
                    className="mt-4 h-36 w-36 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
                  />

                  <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">UPI ID</p>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                     not available
                    </span>
                    <button
                      onClick={copyUpiId}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label="Copy UPI ID"
                    >
                      <Icon path={copied ? paths.check : paths.copy} className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">Thank you for your support! 🙏</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 p-6 text-center sm:p-14">
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready to simplify your files?</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-blue-100 sm:text-base">
                Join early users converting, compressing and managing their images, PDFs and data every day, completely free.
              </p>
              <button
                onClick={scrollToTools}
                className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start Converting Now
                <Icon path={paths.arrowRight} className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
              <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                <Link href="/" className="flex items-center gap-2">
                  <img src="/logo.png" alt="SnapConvert" className="h-22 w-25 object-contain" />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">SnapConvert</span>
                </Link>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Free, fast and secure online tools to convert, compress, format and manage your images, PDFs and data, no sign up required.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  {/* Paste your Instagram profile link into href="#" below */}
                  <a href="https://www.instagram.com/officialwebcraft/#" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400">
                    <Icon path={paths.instagram} className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Image Tools</p>
                <ul className="mt-4 space-y-3">
                  {footerLinks.imageTools.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">PDF Tools</p>
                <ul className="mt-4 space-y-3">
                  {footerLinks.pdfTools.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Developer Tools</p>
                <ul className="mt-4 space-y-3">
                  {footerLinks.devTools.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Company</p>
                <ul className="mt-4 space-y-3">
                  {footerLinks.company.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400">{item.label}</Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Icon path={paths.mail} className="h-4 w-4 shrink-0" />
                    support@snapconvert.com
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Icon path={paths.mapPin} className="h-4 w-4 shrink-0" />
                    Available worldwide, online
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">
              <p className="text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} SnapConvert. All rights reserved.</p>
              <div className="flex items-center gap-5">
                <Link href="/privacy-policy" className="text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400">Privacy Policy</Link>
                <Link href="/terms-of-service" className="text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}