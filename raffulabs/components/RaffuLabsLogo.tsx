import React from "react";

interface Props {
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export function RaffuLabsLogo({ theme = "light", size = "md" }: Props) {
  const isDark = theme === "dark";
  const textColor = isDark ? "#FBF7F2" : "#1A1A1A";
  const subColor = isDark ? "#8B8478" : "#8B8478";
  const accentColor = "#C4704B";

  const sizes = {
    sm: { hindi: 20, roman: 11, sub: 7, dot: 3, gap: 10 },
    md: { hindi: 26, roman: 13, sub: 8, dot: 4, gap: 14 },
    lg: { hindi: 34, roman: 17, sub: 10, dot: 5, gap: 16 },
  }[size];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: sizes.gap, userSelect: "none" }}>
      {/* Devanagari mark */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "baseline" }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: sizes.hindi,
            fontWeight: 900,
            color: textColor,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          र
          <span style={{ position: "relative", display: "inline-block", lineHeight: 1 }}>
            फू
            <span
              style={{
                position: "absolute",
                width: sizes.dot,
                height: sizes.dot,
                background: accentColor,
                borderRadius: "50%",
                left: "44%",
                bottom: 3,
              }}
            />
          </span>
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: sizes.hindi * 0.9,
          background: isDark ? "rgba(139, 132, 120, 0.3)" : "#E8DDD0",
        }}
      />

      {/* Text wordmark */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: sizes.roman,
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
              width: sizes.dot - 1,
              height: sizes.dot - 1,
              background: accentColor,
              borderRadius: "50%",
              marginBottom: 1.5,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: sizes.sub,
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
