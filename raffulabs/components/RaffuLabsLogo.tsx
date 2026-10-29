import React from "react";

interface Props {
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { hindi: 20, roman: 11, sub: 7, dot: 3, dotLeft: 17, dotBottom: 2, gap: 10 },
  md: { hindi: 26, roman: 13, sub: 8, dot: 4, dotLeft: 22, dotBottom: 2.5, gap: 14 },
  lg: { hindi: 34, roman: 17, sub: 10, dot: 5, dotLeft: 29, dotBottom: 3.5, gap: 16 },
} as const;

export function RaffuLabsLogo({ theme = "light", size = "md" }: Props) {
  const isDark = theme === "dark";
  const textColor = isDark ? "#FBF7F2" : "#1A1A1A";
  const subColor = isDark ? "#8B8478" : "#8B8478";
  const accentColor = "#C4704B";

  const currentSize = SIZES[size] || SIZES.md;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: currentSize.gap,
        userSelect: "none",
      }}
    >
      {/* 1. Devanagari mark */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: currentSize.hindi,
            fontWeight: 900,
            color: textColor,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          र
          <span style={{ position: "relative", display: "inline-block", lineHeight: 1 }}>
            फू
            {/* Terracotta accent dot nestled in the ukar of fu */}
            <span
              style={{
                position: "absolute",
                width: currentSize.dot,
                height: currentSize.dot,
                background: accentColor,
                borderRadius: "50%",
                left: currentSize.dotLeft,
                bottom: currentSize.dotBottom,
              }}
            />
          </span>
        </span>
      </div>

      {/* 2. Vertical Divider */}
      <div
        style={{
          width: 1,
          height: currentSize.hindi * 0.9,
          background: isDark ? "rgba(139, 132, 120, 0.3)" : "#E8DDD0",
        }}
      />

      {/* 3. Text wordmark column */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Top row: RAFFU + dot */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: currentSize.roman,
              fontWeight: 800,
              color: textColor,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            RAFFU
          </span>
          <span
            style={{
              display: "inline-block",
              width: currentSize.dot - 1,
              height: currentSize.dot - 1,
              background: accentColor,
              borderRadius: "50%",
              marginBottom: 1.5,
            }}
          />
        </div>

        {/* Bottom row: LABS */}
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: currentSize.sub,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: subColor,
            marginTop: 3,
            lineHeight: 1,
          }}
        >
          LABS
        </span>
      </div>
    </div>
  );
}
