export const ACCENT = "#FF7A50";

export function glass(radius = 22) {
  return {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(34px) saturate(165%)",
    WebkitBackdropFilter: "blur(34px) saturate(165%)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 28px rgba(0,0,0,0.35)",
    borderRadius: radius,
  };
}
