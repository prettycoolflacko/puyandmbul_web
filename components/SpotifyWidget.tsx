export default function SpotifyWidget() {
  return (
    <div className="mt-2 w-full">
      <iframe
        style={{ borderRadius: "12px" }}
        src="https://open.spotify.com/embed/playlist/1f0dYn5X0SbGSUvavWXxnG?utm_source=generator&theme=0&autoplay=1"
        width="100%"
        height="152"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Player"
        className="shadow-lg"
      />
    </div>
  );
}
