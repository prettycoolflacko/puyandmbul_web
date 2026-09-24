"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";

export default function SpotifyWebPlayer() {
  const [playerState, setPlayerState] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Fetch the token first
    fetch("/api/spotify/token")
      .then((res) => res.json())
      .then((data) => {
        if (data.token) setToken(data.token);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!token) return;

    // Define the callback before injecting the script
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const player = new (window as any).Spotify.Player({
        name: 'Our Timeline Web Player',
        getOAuthToken: (cb: (token: string) => void) => { cb(token); },
        volume: 0.5
      });

      playerRef.current = player;

      // Error handling
      player.addListener('initialization_error', ({ message }: { message: string }) => { console.error('Init Error:', message); });
      player.addListener('authentication_error', ({ message }: { message: string }) => { console.error('Auth Error (Need to re-login!):', message); });
      player.addListener('account_error', ({ message }: { message: string }) => { console.error('Account Error (Need Premium):', message); });
      player.addListener('playback_error', ({ message }: { message: string }) => { console.error('Playback Error:', message); });

      // Ready
      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      // State Changed
      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        setPlayerState({ ...state });
      });

      player.connect().then((success: boolean) => {
        if (success) console.log('Successfully connected to Spotify!');
      });
    };

    // Inject script
    const existingScript = document.getElementById('spotify-player-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'spotify-player-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  const handlePlayPlaylist = async () => {
    if (!deviceId || !token) return;

    // Start playing the playlist requested by the user
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ context_uri: 'spotify:playlist:1f0dYn5X0SbGSUvavWXxnG' }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
  };

  const handleTogglePlay = async () => {
    if (playerRef.current) {
      playerRef.current.togglePlay();
    }
  };

  const handleNext = async () => {
    if (playerRef.current) {
      playerRef.current.nextTrack();
    }
  };

  const handlePrevious = async () => {
    if (playerRef.current) {
      playerRef.current.previousTrack();
    }
  };

  if (!token) {
    return (
      <div className="p-4 bg-black/5 rounded-2xl border border-black/5 flex flex-col items-center justify-center text-center gap-2">
        <svg className="w-8 h-8 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.72 12.9c.36.181.54.78.241 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <p className="text-xs text-warm-gray/60 mt-1">Connect Spotify to play full music</p>
        <a 
          href="/api/spotify/login" 
          className="mt-2 px-4 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
        >
          Connect Spotify
        </a>
      </div>
    );
  }

  // Determine what to display
  const currentTrack = playerState?.track_window?.current_track;
  const isPlaying = !playerState?.paused;

  return (
    <>
      <div className="p-3 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 flex flex-col gap-3 transition-all shadow-sm">
        
        {/* Track Info */}
        {currentTrack ? (
          <div className="flex items-center gap-3">
            {currentTrack.album.images[0]?.url && (
              <div className="relative shrink-0">
                <img src={currentTrack.album.images[0].url} alt={currentTrack.album.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 shadow-md">
                  <svg className="w-3.5 h-3.5 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.72 12.9c.36.181.54.78.241 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-end gap-1.5 mb-1">
                {isPlaying && (
                  <div className="flex items-end gap-[2px] h-3">
                    <span className="w-[2px] bg-[#1DB954] rounded-full animate-[eq_1s_ease-in-out_infinite_alternate] h-[40%]" />
                    <span className="w-[2px] bg-[#1DB954] rounded-full animate-[eq_1.2s_ease-in-out_infinite_alternate] h-[100%]" style={{ animationDelay: '0.2s' }} />
                    <span className="w-[2px] bg-[#1DB954] rounded-full animate-[eq_0.8s_ease-in-out_infinite_alternate] h-[60%]" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
                <p className="text-[10px] font-bold text-[#1DB954] uppercase tracking-wider leading-none">
                  {isPlaying ? "Playing" : "Paused"}
                </p>
              </div>
              <p className="font-semibold text-warm-gray text-xs truncate">
                {currentTrack.name}
              </p>
              <p className="text-warm-gray/60 text-[11px] truncate">
                {currentTrack.artists[0]?.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs font-medium text-warm-gray">Player Ready</p>
            <p className="text-[10px] text-warm-gray/60 mt-1">Ready to play your playlist!</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mt-1">
          {!currentTrack ? (
            <button
              onClick={handlePlayPlaylist}
              disabled={!isReady}
              className="px-6 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-full transition-colors cursor-pointer w-full shadow-sm"
            >
              {isReady ? "Play Playlist" : "Loading Player..."}
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 w-full">
              <button
                onClick={handlePrevious}
                className="p-1.5 bg-white/50 hover:bg-white text-warm-gray rounded-full border border-warm-gray/20 transition-colors cursor-pointer shadow-sm"
                title="Previous Track"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              
              <button
                onClick={handleTogglePlay}
                className="px-4 py-1.5 bg-white/50 hover:bg-white text-warm-gray text-xs font-bold rounded-full border border-warm-gray/20 transition-colors cursor-pointer flex-1 flex items-center justify-center gap-2 shadow-sm"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Play
                  </>
                )}
              </button>
              
              <button
                onClick={handleNext}
                className="p-1.5 bg-white/50 hover:bg-white text-warm-gray rounded-full border border-warm-gray/20 transition-colors cursor-pointer shadow-sm"
                title="Next Track"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
