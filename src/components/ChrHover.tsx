import React from "react";

interface ChrHoverProps {
  text: string;
  as?: "span" | "a" | "button" | "div";
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  hoverColor?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  children?: React.ReactNode;
}

export default function ChrHover({
  text,
  as: Component = "span",
  href,
  onClick,
  className = "",
  hoverColor,
  target,
  rel,
  "aria-label": ariaLabel,
  children,
}: ChrHoverProps) {
  const chars = Array.from(text);

  const style: React.CSSProperties & { [key: string]: any } = {};
  if (hoverColor) {
    style["--hover-color"] = hoverColor;
  }

  const content = (
    <>
      {chars.map((char, index) => (
        <span
          key={index}
          className="ch-wrap"
          style={{ "--i": index } as React.CSSProperties}
        >
          <span className="ch-top">
            {char === " " ? "\u00A0" : char}
          </span>
          <span className="ch-bot">
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
      {children}
    </>
  );

  if (Component === "a") {
    return (
      <a
        href={href}
        onClick={onClick}
        target={target}
        rel={rel}
        aria-label={ariaLabel || text}
        className={`chr-hover ${className}`}
        style={style}
      >
        {content}
      </a>
    );
  }

  if (Component === "button") {
    return (
      <button
        onClick={onClick}
        aria-label={ariaLabel || text}
        className={`chr-hover ${className}`}
        style={style}
      >
        {content}
      </button>
    );
  }

  if (Component === "div") {
    return (
      <div
        onClick={onClick}
        aria-label={ariaLabel || text}
        className={`chr-hover ${className}`}
        style={style}
      >
        {content}
      </div>
    );
  }

  return (
    <span
      onClick={onClick}
      aria-label={ariaLabel || text}
      className={`chr-hover ${className}`}
      style={style}
    >
      {content}
    </span>
  );
}
