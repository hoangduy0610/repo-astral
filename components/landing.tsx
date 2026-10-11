"use client";
import { FormEvent, useState } from "react";
import { ArrowRight, Github, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import brandIcon from "@/assets/icon.png";

export default function Landing() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  function submit(e: FormEvent) {
    e.preventDefault();
    const clean = value
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//, "")
      .replace(/\/.*$/, "");
    if (!/^[a-z\d](?:[a-z\d-]{0,37})$/i.test(clean)) {
      setError("Enter a valid GitHub username or profile URL.");
      return;
    }
    setLoading(true);
    router.push(`/u/${clean}`);
  }
  return (
    <main className="starfield relative flex min-h-screen flex-col overflow-x-clip">
      <header className="sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between border-b border-slate-800/50 bg-[#070b1a]/75 px-6 py-5 backdrop-blur-xl">
        <a
          href="/"
          className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight"
          aria-label="RepoAstral home"
        >
          <Image
            src={brandIcon}
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-lg shadow-[0_0_20px_rgba(99,102,241,.22)]"
          />
          <span>
            Repo<span className="text-accent">Astral</span>
          </span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-slate-400">
          <a href="#about" className="hidden transition hover:text-white sm:block">
            About
          </a>
          <a
            href="https://github.com/hoangduy0610"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-white"
          >
            <Github size={16} /> GitHub
          </a>
        </nav>
      </header>
      <section
        id="create"
        className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-7xl scroll-mt-24 items-center px-6 pb-24 pt-12"
      >
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-indigo-200">
            <Sparkles size={14} /> New way to discover your repositories
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-.045em] text-white sm:text-7xl">
            Your GitHub repos
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-cyan-200 to-white bg-clip-text text-transparent">
              A universe of its own.
            </span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">
            Turn your repositories into planets and explore the universe you've built with code.
          </p>
          <form onSubmit={submit} className="mt-10 max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError("");
                }}
                placeholder="username or https://github.com/username"
                aria-label="GitHub username/URL"
                className="h-14 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-5 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                disabled={loading}
                className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-indigo-400 disabled:opacity-70"
              >
                {loading ? "Mapping universe…" : "Explore universe"} <ArrowRight size={18} />
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </form>
        </div>
        <div className="hidden flex-1 justify-center lg:flex">
          <HeroOrb />
        </div>
      </section>
      <section id="about" className="relative z-10 scroll-mt-24 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 h-px bg-gradient-to-r from-transparent via-indigo-300/20 to-transparent" />
          <div className="grid items-start gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300">
                About RepoAstral
              </p>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-tight tracking-[-.035em] text-white sm:text-5xl">
                Your work tells a story.
              </h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-slate-400">
                Repository lists are useful, but they flatten every project into the same row.
                RepoAstral turns public GitHub data into a spatial portrait-making scale, language
                and relationships visible at a glance.
              </p>
            </div>

            <div className="glass overflow-hidden rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-700/60 px-6 py-5 sm:px-8">
                <p className="font-display text-sm font-semibold text-white">The universe model</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  GitHub → Space
                </p>
              </div>
              <div className="divide-y divide-slate-700/50">
                <MappingRow
                  index="01"
                  source="GitHub profile"
                  result="Central star"
                  detail="The developer anchors the system at its center."
                  color="#66e5ff"
                />
                <MappingRow
                  index="02"
                  source="Repository"
                  result="Planet"
                  detail="Every visualized public repository becomes its own world."
                  color="#a5b4fc"
                />
                <MappingRow
                  index="03"
                  source="Stars & language"
                  result="Scale & surface"
                  detail="Stars shape planet size; language seeds its color palette."
                  color="#f9a8d4"
                />
                <MappingRow
                  index="04"
                  source="Planet size"
                  result="Orbit distance"
                  detail="Larger projects move outward to keep the system readable."
                  color="#fde68a"
                />
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-col gap-5 rounded-3xl border border-indigo-300/10 bg-gradient-to-r from-indigo-500/10 via-cyan-400/5 to-transparent px-7 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div>
              <p className="font-display text-xl font-semibold text-white">
                Ready to chart your code?
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Enter a GitHub username above. The universe is generated in seconds.
              </p>
            </div>
            <a
              href="#create"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Create your universe <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 text-xs text-slate-600">
        <span>Made for developers, by developers.</span>
        <span>Powered by the GitHub API</span>
      </footer>
    </main>
  );
}

function MappingRow({
  index,
  source,
  result,
  detail,
  color
}: {
  index: string;
  source: string;
  result: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="grid gap-4 px-6 py-6 sm:grid-cols-[42px_1fr_auto] sm:items-center sm:px-8">
      <span className="font-mono text-xs text-slate-600">{index}</span>
      <div>
        <div className="flex items-center gap-3">
          <i
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 18px ${color}` }}
          />
          <p className="text-sm font-medium text-white">
            {source} <span className="mx-2 text-slate-600">→</span> {result}
          </p>
        </div>
        <p className="mt-2 pl-[22px] text-xs leading-5 text-slate-500">{detail}</p>
      </div>
      <span className="hidden font-mono text-[10px] uppercase tracking-widest text-slate-600 sm:block">
        mapped
      </span>
    </div>
  );
}

function HeroOrb() {
  return (
    <div className="relative h-[500px] w-[500px]" aria-hidden="true">
      <div className="absolute inset-20 rounded-full bg-indigo-500/10 blur-3xl" />
      <svg viewBox="0 0 460 460" className="relative h-full w-full overflow-visible">
        <defs>
          <radialGradient id="hero-sun" cx="35%" cy="28%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".28" stopColor="#bdf7ff" />
            <stop offset=".68" stopColor="#66e5ff" />
            <stop offset="1" stopColor="#5965dc" />
          </radialGradient>
          <radialGradient id="hero-planet-cyan" cx="34%" cy="28%">
            <stop offset="0" stopColor="#e7fdff" />
            <stop offset=".45" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#176b87" />
          </radialGradient>
          <radialGradient id="hero-planet-rose" cx="34%" cy="28%">
            <stop offset="0" stopColor="#fff1f5" />
            <stop offset=".42" stopColor="#f9a8d4" />
            <stop offset="1" stopColor="#9f3c68" />
          </radialGradient>
          <radialGradient id="hero-planet-amber" cx="34%" cy="28%">
            <stop offset="0" stopColor="#fffbd9" />
            <stop offset=".48" stopColor="#fde68a" />
            <stop offset="1" stopColor="#a56621" />
          </radialGradient>
          <filter id="hero-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="planet-glow" x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="rotate(-11 230 230)">
          <path
            id="hero-orbit-inner"
            d="M130 230a100 58 0 1 0 200 0a100 58 0 1 0-200 0"
            fill="none"
            stroke="rgba(103,232,249,.24)"
          />
          <path
            id="hero-orbit-middle"
            d="M80 230a150 87 0 1 0 300 0a150 87 0 1 0-300 0"
            fill="none"
            stroke="rgba(165,180,252,.18)"
          />
          <path
            id="hero-orbit-outer"
            d="M25 230a205 119 0 1 0 410 0a205 119 0 1 0-410 0"
            fill="none"
            stroke="rgba(148,163,184,.14)"
            strokeDasharray="3 7"
          />

          <g filter="url(#planet-glow)">
            <animateMotion dur="12s" begin="-2s" repeatCount="indefinite">
              <mpath href="#hero-orbit-inner" />
            </animateMotion>
            <circle r="8" fill="url(#hero-planet-amber)" />
          </g>
          <g filter="url(#planet-glow)">
            <animateMotion dur="12s" begin="-8s" repeatCount="indefinite">
              <mpath href="#hero-orbit-inner" />
            </animateMotion>
            <circle r="4" fill="#c4b5fd" />
          </g>

          <g filter="url(#planet-glow)">
            <animateMotion dur="19s" begin="-5s" repeatCount="indefinite">
              <mpath href="#hero-orbit-middle" />
            </animateMotion>
            <circle r="13" fill="url(#hero-planet-cyan)" />
            <ellipse rx="19" ry="5" fill="none" stroke="rgba(207,250,254,.65)" />
          </g>
          <g filter="url(#planet-glow)">
            <animateMotion dur="19s" begin="-14s" repeatCount="indefinite">
              <mpath href="#hero-orbit-middle" />
            </animateMotion>
            <circle r="5" fill="#93c5fd" />
          </g>

          <g filter="url(#planet-glow)">
            <animateMotion dur="29s" begin="-7s" repeatCount="indefinite">
              <mpath href="#hero-orbit-outer" />
            </animateMotion>
            <circle r="17" fill="url(#hero-planet-rose)" />
            <path
              d="M-11-5c7 3 14 3 22 0M-14 4c9-2 18-2 28 0"
              fill="none"
              stroke="rgba(255,255,255,.28)"
            />
          </g>
        </g>

        <circle cx="230" cy="230" r="73" fill="rgba(102,229,255,.08)" filter="url(#hero-glow)" />
        <circle cx="230" cy="230" r="49" fill="url(#hero-sun)" filter="url(#hero-glow)" />
        <circle cx="216" cy="215" r="11" fill="rgba(255,255,255,.42)" />

        <g fill="#dbeafe">
          <circle cx="51" cy="89" r="1.2" opacity=".72" />
          <circle cx="411" cy="121" r="1.5" opacity=".6" />
          <circle cx="392" cy="357" r="1" opacity=".5" />
          <circle cx="72" cy="377" r="1.4" opacity=".52" />
          <circle cx="341" cy="47" r=".9" opacity=".7" />
        </g>
      </svg>
    </div>
  );
}
