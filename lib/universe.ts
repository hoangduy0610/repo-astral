import { Planet, Repository, UniverseStats } from "./types";

const languageColors: Record<string, string> = { TypeScript: "#3178C6", JavaScript: "#F1E05A", Python: "#3572A5", Go: "#00ADD8", Rust: "#DEA584", Java: "#B07219", "C++": "#F34B7D", PHP: "#4F5D95", "C#": "#178600" };
export const ORBIT_ROTATION = -0.18;
export function hash(value: string) { let h = 2166136261; for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619); return h >>> 0; }
export function languageColor(language: string | null) { if (!language) return "#8B8B97"; if (languageColors[language]) return languageColors[language]; return `hsl(${hash(language) % 360} 58% 62%)`; }
export function planetRadius(stars: number) { return 6 + Math.min(16, 4 * Math.log2(stars + 1)); }
export function createPlanets(repositories: Repository[]): Planet[] {
  const planets: Planet[] = [];
  let index = 0;
  let orbitRadius = 155;
  let previousRingRadius = 0;
  let previousRingMaxRadius = 0;

  while (index < repositories.length) {
    const remaining = repositories.length - index;
    const ringRepositories: Repository[] = [];
    let ringMaxRadius = 0;
    const minimumGap = 24;

    while (ringRepositories.length < remaining) {
      const candidate = repositories[index + ringRepositories.length];
      const candidateRadius = planetRadius(candidate.stars);
      ringMaxRadius = Math.max(ringMaxRadius, candidateRadius);
      const capacity = Math.max(3, Math.floor((Math.PI * 2 * orbitRadius * 0.57) / (ringMaxRadius * 2 + minimumGap)));
      ringRepositories.push(candidate);
      if (ringRepositories.length >= capacity) break;
    }

    if (previousRingRadius) {
      orbitRadius = previousRingRadius + Math.ceil((previousRingMaxRadius + ringMaxRadius + minimumGap) / 0.57);
    }
    const ringSpeed = 0.00004 + (hash(`ring-${orbitRadius}`) % 7) * 0.000008;

    ringRepositories.forEach((repo, ringIndex) => {
      const seed = hash(String(repo.id));
      const radius = planetRadius(repo.stars);
      const angleSpacing = (Math.PI * 2) / ringRepositories.length;
      const initialAngle = (seed % 628) / 1000 + ringIndex * angleSpacing;
      const stars = repo.stars;
      planets.push({
        ...repo,
        radius,
        color: languageColor(repo.language),
        orbitRadius,
        initialAngle,
        angularSpeed: ringSpeed,
        glowIntensity: stars >= 1000 ? 1 : stars >= 100 ? .8 : stars >= 10 ? .58 : stars ? .38 : .2
      });
    });

    index += ringRepositories.length;
    previousRingRadius = orbitRadius;
    previousRingMaxRadius = ringMaxRadius;
  }

  return planets;
}
export function statsFor(repositories: Repository[]): UniverseStats {
  const counts = new Map<string, number>();
  repositories.forEach(r => counts.set(r.language || "Other", (counts.get(r.language || "Other") || 0) + 1));
  const languages = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, count]) => ({ name, count, color: languageColor(name === "Other" ? null : name) }));
  return { visualizedRepos: repositories.length, datasetStars: repositories.reduce((sum, r) => sum + r.stars, 0), languages, mostStarred: repositories[0] || null };
}
