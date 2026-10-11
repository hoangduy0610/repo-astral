import { Repository, GitHubProfile } from "./types";

const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
export async function fetchUniverse(username: string) {
  const profileResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers, next: { revalidate: 900 } });
  if (profileResponse.status === 404) throw new Error("NOT_FOUND");
  if (profileResponse.status === 403 || profileResponse.status === 429) throw new Error("RATE_LIMIT");
  if (!profileResponse.ok) throw new Error("GITHUB_ERROR");
  const rawProfile = await profileResponse.json();
  const profile: GitHubProfile = { username: rawProfile.login, name: rawProfile.name, avatarUrl: rawProfile.avatar_url, bio: rawProfile.bio, profileUrl: rawProfile.html_url, publicRepos: rawProfile.public_repos, followers: rawProfile.followers };
  const responses = await Promise.all([1, 2, 3].map(page => fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`, { headers, next: { revalidate: 900 } })));
  if (responses.some(r => r.status === 403 || r.status === 429)) throw new Error("RATE_LIMIT");
  if (responses.some(r => !r.ok)) throw new Error("GITHUB_ERROR");
  const all = (await Promise.all(responses.map(r => r.json()))).flat() as Record<string, unknown>[];
  const repositories: Repository[] = all.filter(r => !r.fork).map(r => ({ id: r.id as number, name: r.name as string, description: r.description as string | null, url: r.html_url as string, language: r.language as string | null, stars: r.stargazers_count as number, forks: r.forks_count as number, size: r.size as number, pushedAt: r.pushed_at as string | null, fork: r.fork as boolean, archived: r.archived as boolean })).sort((a, b) => b.stars - a.stars || new Date(b.pushedAt || 0).getTime() - new Date(a.pushedAt || 0).getTime());
  return { profile, repositories, repositoryLimitApplied: all.length >= 300 };
}
