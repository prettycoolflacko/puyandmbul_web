"use client";

interface MinecraftHeartProps {
  size?: number;
  className?: string;
  bounce?: boolean;
  delay?: number;
}

export default function MinecraftHeart({
  size = 36,
  className = "",
  bounce = false,
  delay = 0,
}: MinecraftHeartProps) {
  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        ...(bounce
          ? {
              animation: `mcHeartBounce 0.8s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }
          : {}),
      }}
    >
      <svg
        viewBox="0 0 9 9"
        width={size}
        height={size}
        style={{
          display: "block",
          imageRendering: "pixelated",
          shapeRendering: "crispEdges",
        }}
      >
        {/* Row 0 */}
        <rect x="1" y="0" width="2" height="1" fill="#000" />
        <rect x="6" y="0" width="2" height="1" fill="#000" />

        {/* Row 1 */}
        <rect x="0" y="1" width="1" height="1" fill="#000" />
        <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
        <rect x="2" y="1" width="1" height="1" fill="#ff7070" />
        <rect x="3" y="1" width="1" height="1" fill="#000" />
        <rect x="5" y="1" width="1" height="1" fill="#000" />
        <rect x="6" y="1" width="1" height="1" fill="#e01212" />
        <rect x="7" y="1" width="1" height="1" fill="#870a0a" />
        <rect x="8" y="1" width="1" height="1" fill="#000" />

        {/* Row 2 */}
        <rect x="0" y="2" width="1" height="1" fill="#000" />
        <rect x="1" y="2" width="1" height="1" fill="#ffffff" />
        <rect x="2" y="2" width="2" height="1" fill="#e01212" />
        <rect x="4" y="2" width="1" height="1" fill="#000" />
        <rect x="5" y="2" width="2" height="1" fill="#e01212" />
        <rect x="7" y="2" width="1" height="1" fill="#870a0a" />
        <rect x="8" y="2" width="1" height="1" fill="#000" />

        {/* Row 3 */}
        <rect x="0" y="3" width="1" height="1" fill="#000" />
        <rect x="1" y="3" width="6" height="1" fill="#e01212" />
        <rect x="7" y="3" width="1" height="1" fill="#870a0a" />
        <rect x="8" y="3" width="1" height="1" fill="#000" />

        {/* Row 4 */}
        <rect x="1" y="4" width="1" height="1" fill="#000" />
        <rect x="2" y="4" width="4" height="1" fill="#e01212" />
        <rect x="6" y="4" width="1" height="1" fill="#870a0a" />
        <rect x="7" y="4" width="1" height="1" fill="#000" />

        {/* Row 5 */}
        <rect x="2" y="5" width="1" height="1" fill="#000" />
        <rect x="3" y="5" width="2" height="1" fill="#e01212" />
        <rect x="5" y="5" width="1" height="1" fill="#870a0a" />
        <rect x="6" y="5" width="1" height="1" fill="#000" />

        {/* Row 6 */}
        <rect x="3" y="6" width="1" height="1" fill="#000" />
        <rect x="4" y="6" width="1" height="1" fill="#e01212" />
        <rect x="5" y="6" width="1" height="1" fill="#000" />

        {/* Row 7 */}
        <rect x="4" y="7" width="1" height="1" fill="#000" />
      </svg>
    </div>
  );
}
