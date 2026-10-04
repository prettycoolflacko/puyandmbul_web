/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";

function getPlaylistContextUri(input?: string): string {
  const val = (
    input ||
    process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID ||
    "63IZYR9lMFKvE0VVl9L2ww"
  ).trim();

  if (
    val.startsWith("spotify:playlist:") ||
    val.startsWith("spotify:album:") ||
    val.startsWith("spotify:artist:")
  ) {
    return val;
  }
  const match = val.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match) {
    return `spotify:playlist:${match[1]}`;
  }
  return `spotify:playlist:${val}`;
}

export default function SpotifyWebPlayer() {
  const [playerState, setPlayerState] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("▶ Play Music");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useEmbed, setUseEmbed] = useState(false);
  const [embedExpanded, setEmbedExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playlistMeta, setPlaylistMeta] = useState<{
    name: string;
    artist: string;
    coverUrl: string;
  }>({
    name: "WINDY SUMMER",
    artist: "Anri — Timely!!",
    coverUrl: "https://i.scdn.co/image/ab67616d00001e02cfd93d36fe2365f9436587d1",
  });

  const playerRef = useRef<any>(null);
  const deviceIdRef = useRef<string | null>(null);

  // Keep ref synced
  useEffect(() => {
    deviceIdRef.current = deviceId;
  }, [deviceId]);

  // Fetch token on mount
  const refreshToken = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/spotify/token");
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          return data.token as string;
        }
      }
    } catch (err) {
      console.error("Failed to fetch Spotify token:", err);
    }
    return null;
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/spotify/token")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data?.token) {
          setToken(data.token);

          // Optionally fetch live playlist metadata to ensure latest cover & song name
          const cleanId = (process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID || "63IZYR9lMFKvE0VVl9L2ww")
            .replace(/^spotify:playlist:/, "")
            .replace(/.*playlist\//, "")
            .split("?")[0];

          fetch(`https://api.spotify.com/v1/playlists/${cleanId}`, {
            headers: { Authorization: `Bearer ${data.token}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((pl) => {
              if (pl && !ignore) {
                const firstItem = pl.items?.items?.[0] || pl.tracks?.items?.[0];
                const track = firstItem?.item || firstItem?.track;
                const cover =
                  track?.album?.images?.[0]?.url ||
                  pl.images?.[0]?.url ||
                  "https://i.scdn.co/image/ab67616d00001e02cfd93d36fe2365f9436587d1";

                setPlaylistMeta({
                  name: track?.name || pl.name || "Our Playlist",
                  artist: track?.artists?.[0]?.name ? `${track.artists[0].name} — our playlist` : "our playlist ♡",
                  coverUrl: cover,
                });
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => console.error("Failed to fetch Spotify token:", err));

    return () => {
      ignore = true;
    };
  }, []);

  // Setup Web Playback SDK
  useEffect(() => {
    if (!token || useEmbed) return;

    let isMounted = true;

    const setupPlayer = () => {
      const spotifyWindow = window as any;
      if (!spotifyWindow.Spotify || !isMounted) return;

      if (playerRef.current) {
        playerRef.current.disconnect();
      }

      const player = new spotifyWindow.Spotify.Player({
        name: "puyandmbul Web Player",
        getOAuthToken: async (cb: (t: string) => void) => {
          const freshToken = await refreshToken();
          cb(freshToken || token);
        },
        volume: 0.7,
      });

      playerRef.current = player;

      player.addListener("initialization_error", ({ message }: { message: string }) => {
        console.warn("Spotify Init Error:", message);
      });

      player.addListener("authentication_error", async () => {
        console.warn("Spotify Token refresh needed");
        await refreshToken();
      });

      player.addListener("account_error", ({ message }: { message: string }) => {
        console.warn("Spotify Account Error:", message);
      });

      player.addListener("playback_error", ({ message }: { message: string }) => {
        console.warn("Spotify Playback Error:", message);
      });

      player.addListener("ready", async ({ device_id }: { device_id: string }) => {
        if (!isMounted) return;
        setDeviceId(device_id);
        deviceIdRef.current = device_id;
        setIsReady(true);
        setError(null);

        // Pre-transfer device playback
        try {
          await fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              device_ids: [device_id],
              play: false,
            }),
          });
        } catch {
          // Non-critical
        }
      });

      player.addListener("not_ready", () => {
        if (!isMounted) return;
        setIsReady(false);
      });

      player.addListener("player_state_changed", (state: any) => {
        if (!isMounted) return;
        if (!state) {
          setPlayerState(null);
          return;
        }
        setPlayerState({ ...state });
      });

      player.connect().then((success: boolean) => {
        if (success) {
          console.log("Connected to Spotify Web Playback SDK");
        }
      });
    };

    if ((window as any).Spotify) {
      setupPlayer();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = setupPlayer;

      const existingScript = document.getElementById("spotify-player-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "spotify-player-script";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token, useEmbed]);

  // Start playing the playlist with smooth wait-and-retry
  const handlePlayPlaylist = async () => {
    if (!token) return;
    setError(null);
    setIsLoading(true);
    setLoadingText("Starting...");

    // Unlocks browser Web Audio Context
    if (playerRef.current?.activateElement) {
      try {
        await playerRef.current.activateElement();
      } catch {
        // Ignore
      }
    }

    const contextUri = getPlaylistContextUri();

    try {
      let currentToken = token;
      let targetId = deviceIdRef.current;

      // If device hasn't finished connecting, give it up to 2.5 seconds
      if (!targetId) {
        setLoadingText("Connecting audio...");
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 400));
          if (deviceIdRef.current) {
            targetId = deviceIdRef.current;
            break;
          }
        }
      }

      // Query active devices from Spotify API as backup
      const fetchDevices = async (t: string) => {
        try {
          const devRes = await fetch("https://api.spotify.com/v1/me/player/devices", {
            headers: { Authorization: `Bearer ${t}` },
          });
          if (devRes.ok) {
            const devData = await devRes.json();
            const found =
              devData.devices?.find((d: any) => d.name === "puyandmbul Web Player") ||
              devData.devices?.find((d: any) => d.is_active) ||
              devData.devices?.[0];
            if (found?.id) {
              setDeviceId(found.id);
              deviceIdRef.current = found.id;
              return found.id;
            }
          }
        } catch (e) {
          console.error("Device lookup error:", e);
        }
        return null;
      };

      if (!targetId) {
        targetId = await fetchDevices(currentToken);
      }

      // Transfer playback to target device
      const transferToDevice = async (id: string | null | undefined, t: string) => {
        if (!id) return;
        try {
          await fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`,
            },
            body: JSON.stringify({
              device_ids: [id],
              play: false,
            }),
          });
        } catch {
          // Ignore
        }
      };

      if (targetId) {
        await transferToDevice(targetId, currentToken);
        await new Promise((r) => setTimeout(r, 300));
      }

      // Send the play request
      const sendPlay = async (id: string | null, t: string) => {
        const playUrl = id
          ? `https://api.spotify.com/v1/me/player/play?device_id=${id}`
          : `https://api.spotify.com/v1/me/player/play`;

        return fetch(playUrl, {
          method: "PUT",
          body: JSON.stringify({ context_uri: contextUri }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
        });
      };

      let res = await sendPlay(targetId, currentToken);

      // Handle 404/502 device delay with progressive retry
      let retries = 0;
      while ((res.status === 404 || res.status === 502) && retries < 3) {
        retries++;
        setLoadingText("Buffering audio...");
        await new Promise((r) => setTimeout(r, retries * 800));

        const refreshed = await refreshToken();
        if (refreshed) currentToken = refreshed;

        const updatedDevice = await fetchDevices(currentToken);
        if (updatedDevice) {
          targetId = updatedDevice;
          await transferToDevice(targetId, currentToken);
          await new Promise((r) => setTimeout(r, 200));
        }

        res = await sendPlay(targetId, currentToken);
      }

      if (!res.ok && res.status !== 204) {
        const errJson = await res.json().catch(() => null);
        console.warn("Play error details:", res.status, errJson);
        if (res.status === 403) {
          setError("Playback restricted. Try clicking again.");
        } else if (res.status === 404) {
          setError("Audio stream connecting. Click Play once more.");
        } else {
          setError(errJson?.error?.message || `Play error (${res.status})`);
        }
      } else {
        setError(null);
      }
    } catch (err: any) {
      console.error("Play request error:", err);
      setError("Audio connecting... click Play again.");
    } finally {
      setIsLoading(false);
      setLoadingText("▶ Play Music");
    }
  };

  // Toggle Play / Pause
  const handleTogglePlay = async () => {
    setError(null);
    try {
      if (playerRef.current?.activateElement) {
        await playerRef.current.activateElement().catch(() => {});
      }
      if (playerRef.current) {
        await playerRef.current.togglePlay();
      } else if (token) {
        const endpoint = isPlaying ? "pause" : "play";
        await fetch(
          `https://api.spotify.com/v1/me/player/${endpoint}${
            deviceId ? `?device_id=${deviceId}` : ""
          }`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err: any) {
      console.error("Toggle play error:", err);
    }
  };

  // Skip to next track
  const handleNext = async () => {
    setError(null);
    try {
      if (playerRef.current?.activateElement) {
        await playerRef.current.activateElement().catch(() => {});
      }
      if (playerRef.current) {
        await playerRef.current.nextTrack();
      } else if (token) {
        await fetch(
          `https://api.spotify.com/v1/me/player/next${
            deviceId ? `?device_id=${deviceId}` : ""
          }`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err: any) {
      console.error("Next track error:", err);
    }
  };

  // Skip to previous track
  const handlePrevious = async () => {
    setError(null);
    try {
      if (playerRef.current?.activateElement) {
        await playerRef.current.activateElement().catch(() => {});
      }
      if (playerRef.current) {
        await playerRef.current.previousTrack();
      } else if (token) {
        await fetch(
          `https://api.spotify.com/v1/me/player/previous${
            deviceId ? `?device_id=${deviceId}` : ""
          }`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err: any) {
      console.error("Previous track error:", err);
    }
  };

  // Toggle Mute
  const handleToggleMute = async () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        await playerRef.current.setVolume(0.7);
        setIsMuted(false);
      } else {
        await playerRef.current.setVolume(0);
        setIsMuted(true);
      }
    } catch {}
  };

  /* ── Embed Mode (Only if explicitly toggled by user) ── */
  if (useEmbed) {
    const rawId = (
      process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID ||
      "63IZYR9lMFKvE0VVl9L2ww"
    ).trim();
    const cleanId = rawId
      .replace(/^spotify:playlist:/, "")
      .replace(/.*playlist\//, "")
      .split("?")[0];

    return (
      <div style={{ padding: "0 8px" }}>
        <div
          style={{
            border: "2px solid #ff3fa4",
            boxShadow: "3px 3px 0 #2e1f5e",
            borderRadius: 8,
            overflow: "hidden",
            background: "#000",
          }}
        >
          <iframe
            style={{ borderRadius: "6px", display: "block" }}
            src={`https://open.spotify.com/embed/playlist/${cleanId}?utm_source=generator&theme=0`}
            width="100%"
            height={embedExpanded ? "352" : "152"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Playlist"
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
            padding: "0 2px",
          }}
        >
          <button
            onClick={() => setEmbedExpanded(!embedExpanded)}
            style={{
              background: "none",
              border: "none",
              color: "#4fd8f0",
              fontFamily: "var(--font-vt323)",
              fontSize: 14,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {embedExpanded ? "▲ Compact view" : "▼ Show tracklist"}
          </button>
          <button
            onClick={() => setUseEmbed(false)}
            style={{
              background: "none",
              border: "none",
              color: "#ff3fa4",
              fontFamily: "var(--font-vt323)",
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
            }}
          >
            ⇄ Pixel Player
          </button>
        </div>
      </div>
    );
  }

  /* ── Primary Seamless Web Player View ── */
  const currentTrack = playerState?.track_window?.current_track;
  const isPlaying = !playerState?.paused && !!currentTrack;

  return (
    <div
      style={{
        border: "2px solid #ff3fa4",
        boxShadow: "3px 3px 0 #2e1f5e",
        background: "rgba(10, 5, 24, 0.75)",
        padding: "10px",
        margin: "0 8px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        borderRadius: 4,
      }}
    >
      {/* Friendly error banner if needed */}
      {error && (
        <div
          style={{
            background: "rgba(255,63,164,0.18)",
            border: "1px solid #ff3fa4",
            padding: "4px 6px",
            fontSize: 12,
            color: "#ff3fa4",
            fontFamily: "var(--font-vt323)",
            lineHeight: 1.2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚠ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#ff3fa4",
              cursor: "pointer",
              fontSize: 12,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Track Info Box */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Album Artwork */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src={
              currentTrack?.album?.images?.[0]?.url ||
              playlistMeta.coverUrl ||
              "https://i.scdn.co/image/ab67616d00001e02cfd93d36fe2365f9436587d1"
            }
            alt="Album cover"
            style={{
              width: 44,
              height: 44,
              objectFit: "cover",
              border: isPlaying ? "2px solid #1DB954" : "2px solid #ff3fa4",
              display: "block",
              borderRadius: 3,
              boxShadow: isPlaying ? "0 0 8px rgba(29, 185, 84, 0.5)" : "none",
              transition: "border 0.2s ease",
            }}
          />
          {isPlaying && (
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#1DB954",
                boxShadow: "0 0 6px #1DB954",
              }}
              title="Full track playing"
            />
          )}
        </div>

        {/* Title & Artist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 2,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isPlaying ? "#1DB954" : isReady ? "#4fd8f0" : "#ff3fa4",
                boxShadow: isPlaying ? "0 0 4px #1DB954" : "none",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 6,
                color: isPlaying ? "#1DB954" : isReady ? "#4fd8f0" : "#ff3fa4",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {isPlaying ? "Full Song Playing" : isReady ? "Audio Ready" : "Connecting..."}
            </p>
          </div>

          <p
            style={{
              fontFamily: "var(--font-vt323)",
              fontSize: 17,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.1,
            }}
            title={currentTrack?.name || playlistMeta.name}
          >
            {currentTrack?.name || playlistMeta.name}
          </p>

          <p
            style={{
              fontFamily: "var(--font-vt323)",
              fontSize: 14,
              color: "rgba(255,255,255,0.6)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={
              currentTrack?.artists?.[0]?.name || playlistMeta.artist
            }
          >
            {currentTrack?.artists?.[0]?.name || playlistMeta.artist}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div>
        {!currentTrack ? (
          <button
            onClick={handlePlayPlaylist}
            disabled={isLoading}
            className="pixel-btn"
            style={{
              width: "100%",
              background: "#1DB954",
              borderColor: "#1DB954",
              boxShadow: "2px 2px 0 #15803d",
              color: "#fff",
              fontSize: 8,
              padding: "7px 6px",
              cursor: isLoading ? "wait" : "pointer",
              opacity: isLoading ? 0.8 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span>{isLoading ? loadingText : "▶ PLAY FULL AUDIO"}</span>
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 5, width: "100%" }}>
            {/* Previous track */}
            <button
              onClick={handlePrevious}
              className="pixel-btn pixel-btn-sm pixel-btn-cyan"
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 10,
                textAlign: "center",
              }}
              title="Previous song (skip back)"
            >
              ◀◀
            </button>

            {/* Play / Pause toggle */}
            <button
              onClick={handleTogglePlay}
              className="pixel-btn pixel-btn-sm"
              style={{
                flex: 1.5,
                padding: "5px 0",
                fontSize: 10,
                background: isPlaying ? "#ff3fa4" : "#1DB954",
                borderColor: isPlaying ? "#ff3fa4" : "#1DB954",
                boxShadow: isPlaying ? "2px 2px 0 #2e1f5e" : "2px 2px 0 #15803d",
                color: "#fff",
                textAlign: "center",
              }}
              title={isPlaying ? "Pause music" : "Resume music"}
            >
              {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
            </button>

            {/* Next track */}
            <button
              onClick={handleNext}
              className="pixel-btn pixel-btn-sm pixel-btn-cyan"
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 10,
                textAlign: "center",
              }}
              title="Next song (skip forward)"
            >
              ▶▶
            </button>

            {/* Mute button */}
            <button
              onClick={handleToggleMute}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                color: isMuted ? "#ff3fa4" : "rgba(255,255,255,0.7)",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 3,
                fontSize: 12,
              }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        )}
      </div>

      {/* Subtle fallback switch */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "2px 2px 0",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-vt323)",
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          ♪ our special playlist
        </span>
        <button
          onClick={() => setUseEmbed(true)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(79, 216, 240, 0.5)",
            fontFamily: "var(--font-vt323)",
            fontSize: 12,
            cursor: "pointer",
            padding: 0,
          }}
          title="Switch to official Spotify iframe view"
        >
          ⇄ embed view
        </button>
      </div>
    </div>
  );
}
