/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";

function getPlaylistContextUri(input?: string): string {
  const val = (
    input ||
    process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID ||
    "63IZYR9lMFKvE0VVl9L2ww"
  ).trim();

  if (val.startsWith("spotify:playlist:") || val.startsWith("spotify:album:") || val.startsWith("spotify:artist:")) {
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
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [embedExpanded, setEmbedExpanded] = useState(false);
  const [useEmbed, setUseEmbed] = useState(false);
  const playerRef = useRef<any>(null);

  // Refresh token on demand
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
        }
      })
      .catch((err) => console.error("Failed to fetch Spotify token:", err));

    return () => {
      ignore = true;
    };
  }, []);

  // Setup Web Playback SDK
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const setupPlayer = () => {
      const spotifyWindow = window as any;
      if (!spotifyWindow.Spotify || !isMounted) return;

      // Disconnect any existing player instance
      if (playerRef.current) {
        playerRef.current.disconnect();
      }

      const player = new spotifyWindow.Spotify.Player({
        name: "puyandmbul Web Player",
        getOAuthToken: async (cb: (t: string) => void) => {
          const freshToken = await refreshToken();
          cb(freshToken || token);
        },
        volume: 0.5,
      });

      playerRef.current = player;

      player.addListener("initialization_error", ({ message }: { message: string }) => {
        console.error("Spotify Init Error:", message);
        setError(message);
      });

      player.addListener("authentication_error", ({ message }: { message: string }) => {
        console.error("Spotify Auth Error:", message);
        setError("Spotify token expired. Reconnect below.");
      });

      player.addListener("account_error", ({ message }: { message: string }) => {
        console.error("Spotify Account Error:", message);
        setError("Spotify Premium required for Web Playback SDK.");
      });

      player.addListener("playback_error", ({ message }: { message: string }) => {
        console.error("Spotify Playback Error:", message);
        setError(message);
      });

      player.addListener("ready", async ({ device_id }: { device_id: string }) => {
        if (!isMounted) return;
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);

        // Inform Spotify to transfer playback to this web player
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
          // Non-critical if transfer fails
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

    // If SDK is already loaded on window
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
  }, [token]);

  // Start playing the playlist
  const handlePlayPlaylist = async () => {
    if (!token) return;
    setError(null);
    setIsLoading(true);

    // Official Web Playback SDK method to unlock audio context in browsers
    if (playerRef.current?.activateElement) {
      try {
        await playerRef.current.activateElement();
      } catch {
        // Continue even if activateElement fails
      }
    }

    const contextUri = getPlaylistContextUri();

    try {
      let currentToken = token;
      let targetId = deviceId;

      // Helper to fetch devices from Spotify
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

      // Helper to transfer active playback to the web player
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
          // Non-blocking
        }
      };

      if (targetId) {
        await transferToDevice(targetId, currentToken);
        await new Promise((r) => setTimeout(r, 400));
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

      // Handle 404 (device propagation / not ready delay on Spotify's network) with retry
      let retries = 0;
      while ((res.status === 404 || res.status === 502) && retries < 3) {
        retries++;
        await new Promise((r) => setTimeout(r, retries * 800));
        // Check if token needs refresh or re-fetch active device
        const refreshed = await refreshToken();
        if (refreshed) currentToken = refreshed;

        const updatedDevice = await fetchDevices(currentToken);
        if (updatedDevice) {
          targetId = updatedDevice;
          await transferToDevice(targetId, currentToken);
          await new Promise((r) => setTimeout(r, 300));
        }

        res = await sendPlay(targetId, currentToken);
      }

      if (!res.ok && res.status !== 204) {
        const errJson = await res.json().catch(() => null);
        console.warn("Play error details:", res.status, errJson);
        if (res.status === 403) {
          setError("Spotify Premium is required for Web Playback SDK.");
        } else if (res.status === 404) {
          setError("Device initializing on Spotify. Try clicking Play again, or switch to Embed Player.");
        } else {
          setError(errJson?.error?.message || `Play error (${res.status})`);
        }
      } else {
        setError(null);
      }
    } catch (err: any) {
      console.error("Play request error:", err);
      setError("Failed to start playback. Check connection.");
    } finally {
      setIsLoading(false);
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
        await fetch(`https://api.spotify.com/v1/me/player/${endpoint}${deviceId ? `?device_id=${deviceId}` : ""}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
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
        await fetch(`https://api.spotify.com/v1/me/player/next${deviceId ? `?device_id=${deviceId}` : ""}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
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
        await fetch(`https://api.spotify.com/v1/me/player/previous${deviceId ? `?device_id=${deviceId}` : ""}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err: any) {
      console.error("Previous track error:", err);
    }
  };

  /* ── No token or embed mode: show embedded Spotify player directly ── */
  if (!token || useEmbed) {
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
          {token ? (
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
              ⇄ SDK Player
            </button>
          ) : (
            <a
              href="/api/spotify/login"
              style={{
                color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-vt323)",
                fontSize: 13,
                textDecoration: "none",
              }}
              title="Requires SPOTIFY_CLIENT_ID in .env"
            >
              connect sdk →
            </a>
          )}
        </div>
      </div>
    );
  }

  const currentTrack = playerState?.track_window?.current_track;
  const isPlaying = !playerState?.paused && !!currentTrack;

  return (
    <div
      style={{
        border: "2px solid rgba(79,216,240,0.4)",
        background: "rgba(0,0,0,0.3)",
        padding: "10px",
        margin: "0 10px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Error message banner */}
      {error && (
        <div
          style={{
            background: "rgba(255,63,164,0.15)",
            border: "1px solid #ff3fa4",
            padding: "5px 7px",
            fontSize: 11,
            color: "#ff3fa4",
            fontFamily: "var(--font-vt323)",
            lineHeight: 1.3,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                color: "#ff3fa4",
                cursor: "pointer",
                fontSize: 12,
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
          <button
            onClick={() => {
              setError(null);
              setUseEmbed(true);
            }}
            style={{
              background: "rgba(255,63,164,0.25)",
              border: "1px solid #ff3fa4",
              color: "#fff",
              fontFamily: "var(--font-vt323)",
              fontSize: 12,
              cursor: "pointer",
              padding: "2px 4px",
              textAlign: "center",
              marginTop: 2,
            }}
          >
            ⇄ Switch to embed player (instant playback)
          </button>
        </div>
      )}

      {/* Track info */}
      {currentTrack ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {currentTrack.album?.images?.[0]?.url && (
            <img
              src={currentTrack.album.images[0].url}
              alt={currentTrack.album.name || ""}
              style={{
                width: 36,
                height: 36,
                objectFit: "cover",
                border: "2px solid #4fd8f0",
                display: "block",
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 6,
                color: "#1DB954",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {isPlaying ? "▶ Playing" : "⏸ Paused"}
            </p>
            <p
              style={{
                fontFamily: "var(--font-vt323)",
                fontSize: 16,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={currentTrack.name}
            >
              {currentTrack.name}
            </p>
            <p
              style={{
                fontFamily: "var(--font-vt323)",
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={currentTrack.artists?.[0]?.name}
            >
              {currentTrack.artists?.[0]?.name}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4px 0" }}>
          <p style={{ fontFamily: "var(--font-vt323)", fontSize: 16, color: "#4fd8f0" }}>
            {isReady ? "♪ Player Ready" : "Initializing player..."}
          </p>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {!currentTrack ? (
          <button
            onClick={handlePlayPlaylist}
            disabled={!isReady || isLoading}
            className="pixel-btn pixel-btn-sm"
            style={{
              width: "100%",
              background: isReady ? "#1DB954" : "#555",
              borderColor: isReady ? "#1DB954" : "#555",
              boxShadow: isReady ? "2px 2px 0 #15803d" : "none",
              fontSize: 7,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Starting..." : isReady ? "▶ Play Playlist" : "Loading..."}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
            <button
              onClick={handlePrevious}
              className="pixel-btn pixel-btn-sm pixel-btn-cyan"
              style={{ padding: "3px 6px", fontSize: 9 }}
              title="Previous Track (Skip Back)"
            >
              ◀◀
            </button>
            <button
              onClick={handleTogglePlay}
              className="pixel-btn pixel-btn-sm"
              style={{
                flex: 1,
                background: "#1DB954",
                borderColor: "#1DB954",
                boxShadow: "2px 2px 0 #15803d",
                fontSize: 9,
              }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              onClick={handleNext}
              className="pixel-btn pixel-btn-sm pixel-btn-cyan"
              style={{ padding: "3px 6px", fontSize: 9 }}
              title="Next Track (Skip Forward)"
            >
              ▶▶
            </button>
          </div>
        )}
      </div>

      {/* Switch to embed button */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <button
          onClick={() => setUseEmbed(true)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-vt323)",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ⇄ Switch to embed player
        </button>
      </div>
    </div>
  );
}
