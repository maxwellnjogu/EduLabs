import React from "react";

interface LogoProps {
  /** Height in pixels; width follows the original aspect ratio (square artwork). */
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

/** Official MaxLabs logo (graduation cap + open book). Artwork is used unaltered. */
export const MaxLabsLogo: React.FC<LogoProps> = ({
  size = 40,
  className = "",
  showWordmark = false,
  wordmarkClassName = "text-brand-900",
}) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <img
      src="/maxlabs-logo.jpg"
      alt="MaxLabs logo"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
    {showWordmark && (
      <span className={`font-extrabold tracking-tight text-lg ${wordmarkClassName}`}>MaxLabs</span>
    )}
  </span>
);
