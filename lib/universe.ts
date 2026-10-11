import { Planet, Repository, UniverseStats } from "./types";

const languageColors: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#B07219",
  "C++": "#F34B7D",
  PHP: "#4F5D95",
  "C#": "#178600"
};
export const ORBIT_ROTATION = -0.18;
export function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function languageColor(language: string | null) {
  if (!language) return "#8B8B97";
  if (languageColors[language]) return languageColors[language];
  return `hsl(${hash(language) % 360} 58% 62%)`;
}
export function planetRadius(stars: number) {
  return 6 + Math.min(16, 4 * Math.log2(stars + 1));
}
export function createPlanets(repositories: Repository[]): Planet[] {
  // Rendered planets are proportionally larger than their orbital coordinates.
  // This factor converts a planet radius into safe spacing in orbit units.
  const planetToOrbitScale = 1.95;
  const tangentialGap = 22;
  const radialGap = 18;
  const maxPlanetsPerRing = 10;
  const startingOrbit = 145;
  const orderedRepositories = repositories
    .map((repository) => ({ repository, radius: planetRadius(repository.stars) }))
    .sort(
      (a, b) =>
        a.radius - b.radius ||
        a.repository.stars - b.repository.stars ||
        a.repository.id - b.repository.id
    );
  const planets: Planet[] = [];
  let index = 0;
  let orbitRadius = startingOrbit;
  let previousRingMaxRadius = 0;

  while (index < orderedRepositories.length) {
    const ringRepositories: typeof orderedRepositories = [];
    let ringMaxRadius = 0;

    while (index + ringRepositories.length < orderedRepositories.length) {
      const candidate = orderedRepositories[index + ringRepositories.length];
      const nextMaxRadius = Math.max(ringMaxRadius, candidate.radius);
      const requiredArc = nextMaxRadius * 2 * planetToOrbitScale + tangentialGap;
      const safeCapacity = Math.max(
        3,
        Math.min(maxPlanetsPerRing, Math.floor((Math.PI * 2 * orbitRadius) / requiredArc))
      );
      if (ringRepositories.length && ringRepositories.length + 1 > safeCapacity) break;
      ringRepositories.push(candidate);
      ringMaxRadius = nextMaxRadius;
      if (ringRepositories.length >= maxPlanetsPerRing) break;
    }

    if (previousRingMaxRadius) {
      orbitRadius += Math.ceil(
        (previousRingMaxRadius + ringMaxRadius) * planetToOrbitScale + radialGap
      );
    }
    const ringSpeed = 0.000075 * Math.pow(startingOrbit / orbitRadius, 0.72);
    const ringPhase = (hash(`ring-${orbitRadius}`) % 6283) / 1000;
    const angleSpacing = (Math.PI * 2) / ringRepositories.length;

    ringRepositories.forEach(({ repository: repo, radius }, ringIndex) => {
      const stars = repo.stars;
      planets.push({
        ...repo,
        radius,
        color: languageColor(repo.language),
        orbitRadius,
        initialAngle: ringPhase + ringIndex * angleSpacing,
        angularSpeed: ringSpeed,
        glowIntensity:
          stars >= 1000 ? 1 : stars >= 100 ? 0.8 : stars >= 10 ? 0.58 : stars ? 0.38 : 0.2
      });
    });

    index += ringRepositories.length;
    previousRingMaxRadius = ringMaxRadius;
  }

  return planets;
}
export function statsFor(repositories: Repository[]): UniverseStats {
  const counts = new Map<string, number>();
  repositories.forEach((r) =>
    counts.set(r.language || "Other", (counts.get(r.language || "Other") || 0) + 1)
  );
  const languages = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      count,
      color: languageColor(name === "Other" ? null : name)
    }));
  return {
    visualizedRepos: repositories.length,
    datasetStars: repositories.reduce((sum, r) => sum + r.stars, 0),
    languages,
    mostStarred: repositories[0] || null
  };
}
