"use client";

import Link from "next/link";
import { useState } from "react";
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
  chevronDown: "M6 9l6 6 6-6",
  menu: "M3 6h18M3 12h18M3 18h18",
  x: "M18 6L6 18M6 6l12 12",
  mail: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 6l9 7 9-7",
  mapPin: "M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z",
  check: "M20 6 9 17l-5-5",
  twitter: "M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.9a4 4 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.9.1c.5 1.6 2 2.8 3.8 2.9A8.2 8.2 0 0 1 2 18.6a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z",
  facebook: "M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h3l1-3h-4V9c0-.6.4-1 1-1z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17 6.8h.01",
  linkedin: "M4 4h4v4H4zM4 10h4v10H4zM12 10h4v1.5c.6-1 1.7-1.8 3.3-1.8 2.7 0 3.7 1.9 3.7 4.5V20h-4v-5c0-1.2-.4-2-1.5-2-1 0-1.5.7-1.5 2v5h-4z",
  bug: "M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6zM12 20v-9M6.53 9c-1-.6-1.5-1.7-1.5-3M17.47 9c1-.6 1.5-1.7 1.5-3M6.53 15c-1.32.35-2.32 1.5-2.5 3M17.47 15c1.32.35 2.32 1.5 2.5 3",
  sparkle: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  messageCircle: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
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

type RequestType = "general" | "bug" | "feature";

const requestTypes: { value: RequestType; label: string; icon: string; desc: string }[] = [
  { value: "general", label: "General Message", icon: paths.messageCircle, desc: "Ask a question or share feedback" },
  { value: "bug", label: "Report a Bug", icon: paths.bug, desc: "Something not working as expected" },
  { value: "feature", label: "Feature Request", icon: paths.sparkle, desc: "Suggest a new tool or improvement" },
];

export default function ContactUsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  const [requestType, setRequestType] = useState<RequestType>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!name.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }
    if (!email.trim() || !isValidEmail(email.trim())) {
      setSubmitError("Please enter a valid email address.");
      return;
    }
    if (!subject.trim()) {
      setSubmitError("Please enter a subject.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setSubmitError("Please write a message of at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const messagesRef = ref(database, "contact_messages");
      await push(messagesRef, {
        type: requestType,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        createdAt: Date.now(),
      });
      setSubmitSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setRequestType("general");
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to submit message", err);
      setSubmitError("Something went wrong while sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <Link href="/" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200">Announcements</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact-us" className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 sm:inline-block">
              Contact Us
            </Link>
            <button aria-label="Open menu" onClick={() => setMobileOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden">
              <Icon path={mobileOpen ? paths.x : paths.menu} className="h-6 w-6" />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 dark:border-slate-800 dark:bg-slate-950 lg:hidden max-h-[75vh] overflow-y-auto">
            <Link href="/" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Home</Link>

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
            <Link href="/announcements" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200">Announcements</Link>
            <Link href="/contact-us" className="mt-2 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">Contact Us</Link>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-500/10" />
        <div className="relative mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <Icon path={paths.mail} className="h-3.5 w-3.5" />
            Get in Touch
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl">
            We&apos;d love to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">hear from you</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
            Questions, bug reports, or ideas for new tools — send us a message and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      {/* ---------- Contact form + info ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            {/* Request type selector */}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">What's this about?</p>
            <div className="grid grid-cols-1 gap-2 mb-6 sm:grid-cols-3">
              {requestTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setRequestType(t.value)}
                  className={`text-left rounded-xl border p-3 transition-colors ${
                    requestType === t.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Icon path={t.icon} className={`h-5 w-5 mb-2 ${requestType === t.value ? "text-blue-600" : "text-slate-400"}`} />
                  <p className={`text-sm font-semibold ${requestType === t.value ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"}`}>{t.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    maxLength={80}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Your Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={100}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your message"
                  maxLength={120}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more..."
                  maxLength={1000}
                  className="w-full min-h-[140px] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-y"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-right">{message.length}/1000</p>
              </div>

              {submitError && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm rounded-lg px-4 py-2.5">
                  <Icon path={paths.check} className="h-4 w-4 flex-shrink-0" />
                  Thanks! Your message has been sent. We&apos;ll get back to you soon.
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon path={paths.send} className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                    <Icon path={paths.mail} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Email</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">support@snapconvert.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10">
                    <Icon path={paths.mapPin} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Location</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Available worldwide, online</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Follow Us</h3>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/officialwebcraft/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-pink-300 hover:text-pink-600 dark:border-slate-800 dark:text-slate-400"
                  aria-label="Instagram"
                >
                  <Icon path={paths.instagram} className="h-5 w-5" />
                </a>
                
                
                 
                
              </div>
              <p className="mt-3 text-xs text-slate-400">
                We post new tool launches and updates on Instagram first.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Response Time</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We typically reply within 24–48 hours. For bug reports, please include as much detail as possible (browser, device, steps to reproduce).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            <div className="col-span-2 sm:col-span-3 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3a3 3 0 0 0-3 3c0 1.3.7 2.3 1.7 2.7C9.7 9.4 9 10.6 9 12c0 1.9 1.3 3.5 3 3.9V19a2 2 0 0 1-2 2H8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="6" r="0.6" fill="currentColor" />
                </svg>
                <span className="text-lg font-bold text-slate-900 dark:text-white">SnapConvert</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Free, fast and secure online tools to convert, compress, format and manage your images, PDFs and data, no sign up required.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a href="https://www.instagram.com/officialwebcraft/#" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-pink-300 hover:text-pink-600 dark:border-slate-800 dark:text-slate-400">
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
  );
}