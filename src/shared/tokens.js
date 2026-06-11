/* ---------- デザイントークン(手取り・年収の壁 共通) ---------- */
// wallMoney / wallTax は年収の壁シミュレーターのみ使用
export const C = {
  bg: "#FAF6EF", card: "#FFFFFF", ink: "#3A3C40", sub: "#7A7E86", line: "#EFE9DD",
  net: "#3D7EA6", shaho: "#E8B45A", shotokuzei: "#D98E6B", juminzei: "#C9B8A3",
  accent: "#3D7EA6", wallMoney: "#B9821F", wallTax: "#A8A092",
};
export const S = {
  page: { background: C.bg, minHeight: "100vh", color: C.ink, fontFamily: "'Zen Maru Gothic','Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif", padding: "0 0 64px" },
  wrap: { maxWidth: 680, margin: "0 auto", padding: "0 18px" },
  card: { background: C.card, borderRadius: 18, border: `1.5px solid ${C.line}`, padding: "20px 20px", marginBottom: 14, boxShadow: "0 2px 8px rgba(80,70,50,0.04)" },
  h2: { fontSize: 16, fontWeight: 700, margin: "0 0 12px", letterSpacing: "0.03em" },
  label: { fontSize: 12.5, color: "#7A7E86", marginBottom: 6, fontWeight: 700 },
};
