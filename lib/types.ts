export type GitHubProfile = {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  profileUrl: string;
  publicRepos: number;
  followers: number;
};
export type Repository = {
  id: number;
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  size: number;
  pushedAt: string | null;
  fork: boolean;
  archived: boolean;
};
export type Planet = Repository & {
  radius: number;
  color: string;
  orbitRadius: number;
  initialAngle: number;
  angularSpeed: number;
  glowIntensity: number;
};
export type UniverseStats = {
  visualizedRepos: number;
  datasetStars: number;
  languages: { name: string; count: number; color: string }[];
  mostStarred: Repository | null;
};
export type Universe = {
  profile: GitHubProfile;
  repositories: Repository[];
  planets: Planet[];
  stats: UniverseStats;
  generatedAt: string;
  repositoryLimitApplied: boolean;
};
