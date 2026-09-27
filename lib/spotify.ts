import { prisma } from "@/lib/prisma";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const _REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`
  : "http://localhost:3000/api/spotify/callback";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const _NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";

const getBasicAuth = () => Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

export async function getAccessToken() {
  if (process.env.SPOTIFY_TOKEN) {
    return process.env.SPOTIFY_TOKEN;
  }

  const setting = await prisma.setting.findUnique({
    where: { key: "SPOTIFY_REFRESH_TOKEN" }
  });

  if (!setting || !setting.value) {
    return null;
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getBasicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: setting.value,
    }),
    cache: "no-store",
  });

  const data = await response.json();
  if (data.error || !data.access_token) {
    console.error("Spotify refresh error:", data.error, data.error_description);
    return null;
  }

  if (data.refresh_token) {
    await prisma.setting.update({
      where: { key: "SPOTIFY_REFRESH_TOKEN" },
      data: { value: data.refresh_token },
    });
  }

  return data.access_token;
}

export async function getNowPlaying() {
  // Hardcoded mock data based on user's request
  return {
    isPlaying: true,
    title: "Timber (feat. Ke$ha)",
    artist: "Pitbull",
    album: "Global Warming: Meltdown",
    albumImageUrl: "https://i.scdn.co/image/ab6761610000e5eb8d8ac7290d0fe2d12fb6e4d9",
    songUrl: "https://open.spotify.com/artist/0TnOYISbd1XYRBk9myaseg",
  };
}
