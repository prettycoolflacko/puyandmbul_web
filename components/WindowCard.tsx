"use client";

import React from "react";

interface WindowCardProps {
  title: string;
  children: React.ReactNode;
  /** extra classes on the outer .window-card wrapper */
  className?: string;
  /** If provided, wires up the × button */
  onClose?: () => void;
  /** Icon / emoji shown before the title */
  icon?: string;
}

/**
 * Shared Y2K-style "OS window" card component.
 *
 * Structure:
 *   .window-card
 *     .window-card-titlebar   — dark indigo title bar
 *       .window-card-title    — section name
 *       .window-card-controls — −  □  ×
 *     .window-card-body       — black + starry-dot background
 *       {children}
 */
export default function WindowCard({
  title,
  children,
  className = "",
  onClose,
  icon,
}: WindowCardProps) {
  return (
    <div className={`window-card ${className}`}>
      {/* Title bar */}
      <div className="window-card-titlebar">
        <span className="window-card-title">
          {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
          {title}
        </span>
        <div className="window-card-controls">
          <span className="window-btn">−</span>
          <span className="window-btn">□</span>
          {onClose ? (
            <button className="window-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          ) : (
            <span className="window-btn">×</span>
          )}
        </div>
      </div>

      {/* Body — starry black background */}
      <div className="window-card-body">{children}</div>
    </div>
  );
}
