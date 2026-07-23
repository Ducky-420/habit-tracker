export const ACCENT = "#8B5CF6";
export const ACCENT_2 = "#d946ef";

export const CANVAS_BACKGROUND =
  "radial-gradient(120% 70% at 50% -10%, rgba(139,92,246,0.30) 0%, rgba(139,92,246,0) 55%)," +
  "radial-gradient(90% 60% at 90% 10%, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0) 55%)," +
  "linear-gradient(180deg, #0B0B0E 0%, #000000 100%)";

export function glass(radius = 22) {
  return {
    background: "rgba(20,15,30,0.65)",
    backdropFilter: "blur(40px) saturate(190%)",
    WebkitBackdropFilter: "blur(40px) saturate(190%)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderTopColor: "rgba(255,255,255,0.3)",
    boxShadow:
      "inset 0 1px 1px rgba(255,255,255,0.35)," +
      "inset 0 -1px 12px -6px rgba(139,92,246,0.4)," +
      "0 20px 50px rgba(0,0,0,0.6)," +
      "0 10px 25px rgba(139,92,246,0.15)",
    borderRadius: radius,
  };
}

export function ctaGradient() {
  return {
    background: "linear-gradient(155deg, #a78bfa, #7c3aed)",
    boxShadow:
      "0 10px 26px rgba(124,58,237,0.45)," +
      "0 2px 8px rgba(124,58,237,0.35)," +
      "inset 0 1px 0 rgba(255,255,255,0.35)",
    color: "#fff",
  };
}
