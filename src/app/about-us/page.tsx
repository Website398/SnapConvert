"use client";

import Link from "next/link";
import { useState } from "react";

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
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  shieldCheck: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4zM9 12l2 2 4-4",
  bolt: "M13 2 3 14h7l-1 8 11-14h-8l1-6z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  users: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  clock: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  noSignUp: "M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4zM9 11l3 3 4-4",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  sparkle: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  mail: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 6l9 7 9-7",
  mapPin: "M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  twitter: "M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.9a4 4 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.9.1c.5 1.6 2 2.8 3.8 2.9A8.2 8.2 0 0 1 2 18.6a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z",
  facebook: "M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h3l1-3h-4V9c0-.6.4-1 1-1z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17 6.8h.01",
  linkedin: "M4 4h4v4H4zM4 10h4v10H4zM12 10h4v1.5c.6-1 1.7-1.8 3.3-1.8 2.7 0 3.7 1.9 3.7 4.5V20h-4v-5c0-1.2-.4-2-1.5-2-1 0-1.5.7-1.5 2v5h-4z",
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

const values = [
  { icon: paths.shieldCheck, title: "Privacy First", desc: "Your files are processed right in your browser. We never store, view, or share what you upload.", bg: "bg-blue-100 text-blue-600" },
  { icon: paths.noSignUp, title: "No Barriers", desc: "No sign up, no email, no credit card. Open a tool and get to work in seconds.", bg: "bg-green-100 text-green-600" },
  { icon: paths.bolt, title: "Built for Speed", desc: "Every tool is optimized to give you results in seconds, not minutes.", bg: "bg-orange-100 text-orange-600" },
  { icon: paths.heart, title: "Made with Care", desc: "We obsess over small details so your everyday file tasks feel effortless.", bg: "bg-rose-100 text-rose-600" },
];

const stats = [
  { icon: paths.users, value: "500K+", label: "Happy Users" },
  { icon: paths.download, value: "2.5M+", label: "Files Converted" },
  { icon: paths.globe, value: "190+", label: "Countries Reached" },
  { icon: paths.clock, value: "3s", label: "Avg. Processing Time" },
];

const timeline = [
  { year: "2023", title: "The Idea", desc: "Frustrated with clunky, ad-heavy converters, we set out to build something faster and cleaner." },
  { year: "2024", title: "First Launch", desc: "SnapConvert went live with a handful of image and PDF tools, all free and sign-up free." },
  { year: "2025", title: "Growing Toolkit", desc: "We expanded into PDF tools and developer utilities based on direct user feedback." },
  { year: "Today", title: "Trusted Worldwide", desc: "Hundreds of thousands of people use SnapConvert every month across 190+ countries." },
];

const teamPrinciples = [
  { icon: paths.target, title: "Our Mission", desc: "To make everyday file tasks, compressing, converting, formatting, effortless and free for everyone, everywhere." },
  { icon: paths.lock, title: "Our Promise", desc: "No hidden fees, no watermarks, no selling your data. What you upload stays yours, always." },
  { icon: paths.sparkle, title: "Our Approach", desc: "We build tools that work entirely in your browser whenever possible, so your files never have to leave your device." },
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

export default function AboutUsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

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

            <Link href="/about-us" className="border-b-2 border-blue-600 pb-1 text-sm font-medium text-blue-600">About Us</Link>
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

            <Link href="/about-us" className="block py-2 text-sm font-medium text-blue-600">About Us</Link>
            <Link href="/contact-us" className="mt-2 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">Contact Us</Link>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-500/10" />
        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <Icon path={paths.heart} className="h-3.5 w-3.5" />
            Our Story
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl">
            Built to make your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              file tasks effortless
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
            SnapConvert started as a simple idea: everyday tasks like compressing an image or merging a PDF
            shouldn&apos;t require sign ups, subscriptions, or slow uploads. Today we help hundreds of thousands
            of people around the world get their files done in seconds, for free.
          </p>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-10">
          <div className="pointer-events-none absolute -top-10 -right-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm sm:p-6">
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white sm:mb-3 sm:h-12 sm:w-12">
                  <Icon path={s.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <p className="text-xl font-extrabold text-white sm:text-3xl md:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-blue-100 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Mission / Promise / Approach ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Icon path={paths.target} className="h-3.5 w-3.5" />
            WHAT DRIVES US
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">Mission, Promise &amp; Approach</h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {teamPrinciples.map((p) => (
            <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                <Icon path={p.icon} className="h-6 w-6" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Values ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
            <Icon path={paths.sparkle} className="h-3.5 w-3.5" />
            OUR VALUES
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">What We Stand For</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">The principles that guide every tool we build.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-none">
              <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${v.bg}`}>
                <Icon path={v.icon} className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{v.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Timeline ---------- */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Our Journey</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">From a simple idea to a tool used worldwide.</p>
        </div>

        <div className="mt-10 space-y-5">
          {timeline.map((t, i) => (
            <div key={t.year} className="flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:h-12 sm:w-12 sm:text-sm">
                  {t.year === "Today" ? "★" : t.year.slice(2)}
                </span>
                {i !== timeline.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />}
              </div>
              <div className="pb-6">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{t.year}</p>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA banner ---------- */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 p-6 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready to try SnapConvert?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-blue-100 sm:text-base">
              No sign up, no cost, no catch. Just fast, reliable tools whenever you need them.
            </p>
            <Link href="/" className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              Explore Our Tools
              <Icon path={paths.arrowRight} className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
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
                {[paths.twitter, paths.facebook, paths.instagram, paths.linkedin].map((p, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400">
                    <Icon path={p} className="h-4 w-4" />
                  </a>
                ))}
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