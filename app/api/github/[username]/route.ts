import { NextResponse } from "next/server";
import { fetchUniverse } from "@/lib/github";
import { createPlanets, statsFor } from "@/lib/universe";

export async function GET(_: Request, { params }: { params: { username: string } }) {
  const username = params.username
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/\/.*$/, "");
  if (!/^[a-z\d](?:[a-z\d-]{0,37})$/i.test(username))
    return NextResponse.json({ error: "INVALID_USERNAME" }, { status: 400 });
  try {
    const data = await fetchUniverse(username);
    const repositories = data.repositories.slice(0, 40);
    return NextResponse.json({
      ...data,
      repositories,
      planets: createPlanets(repositories),
      stats: statsFor(repositories),
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "GITHUB_ERROR";
    const status = code === "NOT_FOUND" ? 404 : code === "RATE_LIMIT" ? 429 : 502;
    return NextResponse.json({ error: code }, { status });
  }
}
