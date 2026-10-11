"use client";
import { useEffect, useRef } from "react";
import { Planet } from "@/lib/types";
import { ORBIT_ROTATION } from "@/lib/universe";

type Props = { planets: Planet[]; username: string; selected: Planet | null; onSelect: (planet: Planet) => void; paused: boolean; zoom: number; onZoom: (value: number) => void; onPan: (x: number, y: number) => void };
function withAlpha(color: string, alpha: number) {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const normalized = hex.length === 3 ? hex.split("").map(value => value + value).join("") : hex;
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
  return color.replace(")", ` / ${alpha})`);
}
export default function UniverseCanvas({ planets, username, selected, onSelect, paused, zoom, onZoom, onPan }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null); const positions = useRef(new Map<number, { x: number; y: number }>()); const state = useRef({ zoom: 1, panX: 0, panY: 0, dragging: false, x: 0, y: 0 });
  useEffect(() => { state.current.zoom = zoom; }, [zoom]);
  useEffect(() => {
    const el = canvas.current; if (!el) return; const ctx = el.getContext("2d"); if (!ctx) return;
    let frame = 0; const stars = Array.from({ length: 180 }, (_, i) => { const n = i * 99991; return { x: (n * 13 % 1000) / 1000, y: (n * 7 % 1000) / 1000, r: i % 9 === 0 ? 1.4 : .65, a: .25 + (i % 5) * .1 }; });
    const resize = () => { const rect = el.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); el.width = rect.width * dpr; el.height = rect.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    const draw = (time: number) => { const rect = el.getBoundingClientRect(); const w = rect.width, h = rect.height; const s = state.current; ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#080d20"; ctx.fillRect(0, 0, w, h);
      const nebula = ctx.createRadialGradient(w * .5, h * .45, 0, w * .5, h * .45, Math.max(w, h) * .7); nebula.addColorStop(0, "rgba(76,79,178,.18)"); nebula.addColorStop(.45, "rgba(49,88,160,.06)"); nebula.addColorStop(.75, "rgba(16,25,62,.04)"); nebula.addColorStop(1, "transparent"); ctx.fillStyle = nebula; ctx.fillRect(0, 0, w, h);
      const haze = ctx.createRadialGradient(w * .15, h * .8, 0, w * .15, h * .8, Math.min(w, h) * .45); haze.addColorStop(0, "rgba(102,229,255,.06)"); haze.addColorStop(1, "transparent"); ctx.fillStyle = haze; ctx.fillRect(0, 0, w, h);
      stars.forEach(star => { ctx.globalAlpha = star.a + Math.sin(time / 900 + star.x * 20) * .08; ctx.fillStyle = "#cbd5ff"; ctx.beginPath(); ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1;
      const cx = w / 2 + s.panX, cy = h / 2 + s.panY; ctx.save(); ctx.translate(cx, cy); ctx.scale(s.zoom, s.zoom);
      const orbitRadii = [...new Set(planets.map(planet => planet.orbitRadius))]; ctx.strokeStyle = "rgba(147,163,255,.14)"; ctx.lineWidth = 1 / s.zoom;
      orbitRadii.forEach((r, index) => { ctx.globalAlpha = index % 2 ? .65 : 1; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .57, ORBIT_ROTATION, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; });
      const coreGlow = ctx.createRadialGradient(0, 0, 8, 0, 0, 100); coreGlow.addColorStop(0, "rgba(196,240,255,.95)"); coreGlow.addColorStop(.2, "rgba(108,229,255,.55)"); coreGlow.addColorStop(1, "transparent"); ctx.fillStyle = coreGlow; ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(149,235,255,.2)"; ctx.lineWidth = 1.5 / s.zoom; ctx.beginPath(); ctx.arc(0, 0, 38 + Math.sin(time / 800) * 2, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "#dffbff"; ctx.shadowBlur = 28; ctx.shadowColor = "#66e5ff"; ctx.beginPath(); ctx.arc(0, 0, 25 + Math.sin(time / 700) * 1.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      planets.forEach(planet => { const angle = planet.initialAngle + (paused ? 0 : time * planet.angularSpeed); const orbitX = Math.cos(angle) * planet.orbitRadius, orbitY = Math.sin(angle) * planet.orbitRadius * .57; const x = orbitX * Math.cos(ORBIT_ROTATION) - orbitY * Math.sin(ORBIT_ROTATION), y = orbitX * Math.sin(ORBIT_ROTATION) + orbitY * Math.cos(ORBIT_ROTATION); positions.current.set(planet.id, { x, y }); const isSelected = selected?.id === planet.id; const glow = ctx.createRadialGradient(x, y, planet.radius * .5, x, y, planet.radius * (isSelected ? 4.5 : 3)); glow.addColorStop(0, withAlpha(planet.color, isSelected ? .8 : .53)); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, planet.radius * (isSelected ? 4.5 : 3), 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = planet.color; ctx.shadowBlur = isSelected ? 18 : 7 + planet.glowIntensity * 8; ctx.shadowColor = planet.color; ctx.beginPath(); ctx.arc(x, y, planet.radius * (isSelected ? 1.15 : 1), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }); ctx.fillStyle = "rgba(245,247,255,.8)"; ctx.textAlign = "center"; ctx.font = "600 14px Arial"; ctx.fillText(`@${username}`, 0, 48); ctx.fillStyle = "rgba(148,163,184,.8)"; ctx.font = "10px Arial"; ctx.fillText(`${planets.length} worlds`, 0, 64); ctx.restore();
      if (!paused) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw); return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [planets, selected, paused]);
  useEffect(() => {   const el = canvas.current; if (!el) return; const point = (e: PointerEvent) => { const rect = el.getBoundingClientRect(); const s = state.current; const x = (e.clientX - rect.left - rect.width / 2 - s.panX) / s.zoom, y = (e.clientY - rect.top - rect.height / 2 - s.panY) / s.zoom; const hit = planets.find(p => { const position = positions.current.get(p.id); return position ? Math.hypot(x - position.x, y - position.y) < Math.max(18, p.radius * 1.8) : false; }); if (hit) onSelect(hit); };
    const down = (e: PointerEvent) => { state.current.dragging = true; state.current.x = e.clientX; state.current.y = e.clientY; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { const s = state.current; if (!s.dragging) return; s.panX += e.clientX - s.x; s.panY += e.clientY - s.y; s.x = e.clientX; s.y = e.clientY; onPan(s.panX, s.panY); };
    const up = (e: PointerEvent) => { if (Math.abs(e.clientX - state.current.x) < 4 && Math.abs(e.clientY - state.current.y) < 4) point(e); state.current.dragging = false; };
    const wheel = (e: WheelEvent) => { e.preventDefault(); onZoom(Math.min(2.5, Math.max(.5, state.current.zoom * (e.deltaY > 0 ? .9 : 1.1)))); };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("wheel", wheel, { passive: false }); return () => { el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("wheel", wheel); };
  }, [planets, onSelect, onPan, onZoom]);
  return <canvas ref={canvas} aria-label={`Interactive universe for ${username}`} className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing" />;
}
