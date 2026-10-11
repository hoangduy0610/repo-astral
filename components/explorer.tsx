"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Info,
  Link2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Share2,
  Minus,
  X
} from "lucide-react";
import brandIcon from "@/assets/icon.png";
import { Planet, Universe } from "@/lib/types";
import UniverseCanvas from "./universe-canvas";

export default function Explorer({ username }: { username: string }) {
  const [universe, setUniverse] = useState<Universe | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Planet | null>(null);
  const [zoom, setZoom] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const load = () => {
    setError("");
    fetch(`/api/github/${username}`)
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error);
        setUniverse(body);
      })
      .catch((e) => setError(e.message));
  };
  useEffect(load, [username]);

  if (error)
    return (
      <main className="starfield flex min-h-screen items-center justify-center p-6">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-400/10 text-2xl">
            ✦
          </div>
          <h1 className="font-display text-2xl font-semibold">
            {error === "NOT_FOUND" ? "Universe not found" : "The stars are cloudy"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error === "NOT_FOUND"
              ? `We couldn’t find a GitHub profile for “${username}”.`
              : error === "RATE_LIMIT"
                ? "GitHub is temporarily limiting requests. Please try again in a moment."
                : "We couldn’t reach GitHub right now."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={load}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold"
            >
              Try again
            </button>
            <a href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-sm">
              Go home
            </a>
          </div>
        </div>
      </main>
    );

  if (!universe)
    return (
      <main className="starfield flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-display text-sm text-slate-400">Mapping your universe…</p>
        </div>
      </main>
    );
  const { profile, stats, planets } = universe;
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share)
        await navigator.share({ title: `${profile.username} on RepoAstral`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* cancelled native share */
    }
  }
  function exportPng() {
    window.dispatchEvent(new Event("repoastral:export-png"));
  }
  return (
    <main className="starfield relative h-screen overflow-hidden">
      <UniverseCanvas
        planets={planets}
        username={profile.username}
        selected={selected}
        onSelect={setSelected}
        paused={paused}
        zoom={zoom}
        onZoom={setZoom}
        resetKey={resetKey}
      />
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
        <a
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold"
          aria-label="RepoAstral home"
        >
          <Image
            src={brandIcon}
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            priority
            className="h-7 w-7 rounded-[7px] shadow-[0_0_18px_rgba(99,102,241,.24)]"
          />
          <span>
            Repo<span className="text-accent">Astral</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="hidden items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-300 hover:text-white sm:flex"
          >
            <ArrowLeft size={15} /> New universe
          </a>
          <button
            onClick={share}
            className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/40 px-3 py-2 text-sm text-slate-300 hover:text-white"
          >
            <Share2 size={15} />{" "}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </button>
          <button
            onClick={exportPng}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold shadow-lg shadow-primary/20"
          >
            Export
          </button>
        </div>
      </header>
      <aside className="glass absolute left-4 top-24 z-10 hidden w-72 rounded-2xl p-5 lg:block">
        <div className="flex items-center gap-3">
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-11 w-11 rounded-full border border-slate-600"
          />
          <div>
            <p className="font-medium">{profile.name || profile.username}</p>
            <p className="font-mono text-xs text-slate-500">@{profile.username}</p>
          </div>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
          {profile.bio || "A universe built with code."}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-700/60 pt-4">
          <Metric label="Public repos" value={profile.publicRepos} />
          <Metric label="Visualized" value={stats.visualizedRepos} />
          <Metric label="Followers" value={profile.followers} />
          <Metric label="Dataset stars" value={stats.datasetStars} />
        </div>
        <div className="mt-5">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">Top languages</p>
          <div className="space-y-2">
            {stats.languages.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <i className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  {l.name}
                </span>
                <span className="font-mono text-slate-500">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-xl border border-slate-700/60 bg-slate-950/70 p-1.5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-1">
          <Control
            label="Zoom out"
            icon={<Minus size={16} />}
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
          />
          <Control
            label="Reset view"
            icon={<RotateCcw size={15} />}
            onClick={() => {
              setZoom(1);
              setResetKey((key) => key + 1);
            }}
          />
          <Control
            label={paused ? "Resume" : "Pause"}
            icon={paused ? <Play size={15} /> : <Pause size={15} />}
            onClick={() => setPaused(!paused)}
          />
          <Control
            label="Zoom in"
            icon={<Plus size={16} />}
            onClick={() => setZoom(Math.min(2.5, zoom + 0.2))}
          />
        </div>
      </div>
      {selected && (
        <section className="glass absolute bottom-20 left-4 right-4 z-20 rounded-2xl p-5 sm:bottom-auto sm:left-auto sm:right-6 sm:top-24 sm:w-80">
          <button
            onClick={() => setSelected(null)}
            aria-label="Close details"
            className="absolute right-3 top-3 rounded p-1 text-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
          <div className="flex items-start gap-3">
            <div
              className="mt-1 h-3 w-3 rounded-full"
              style={{ background: selected.color, boxShadow: `0 0 15px ${selected.color}` }}
            />
            <div>
              <h2 className="font-display text-lg font-semibold">{selected.name}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {selected.language || "Other"} · {selected.archived ? "Archived" : "Active"}
              </p>
            </div>
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
            {selected.description || "No description provided for this repository."}
          </p>
          <div className="mt-4 flex gap-4 font-mono text-xs text-slate-400">
            <span>★ {selected.stars.toLocaleString()}</span>
            <span>⑂ {selected.forks.toLocaleString()}</span>
          </div>
          <a
            href={selected.url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-white/10 py-2.5 text-sm font-medium hover:bg-white/15"
          >
            View on GitHub <ExternalLink size={14} />
          </a>
        </section>
      )}
      <div className="absolute bottom-7 left-5 z-10 hidden text-xs text-slate-500 sm:block">
        Drag to orbit · Scroll to travel · Right-drag to pan · Click a planet
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 translate-y-12 text-center">
        <p className="font-display text-sm font-medium text-white/80">@{profile.username}</p>
        <p className="text-[10px] text-slate-500">{stats.visualizedRepos} worlds</p>
      </div>
    </main>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono text-sm text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
function Control({
  label,
  icon,
  onClick
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-lg p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
    >
      {icon}
    </button>
  );
}
