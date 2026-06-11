import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { C } from "./tokens.js";

export function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
      {options.map(([v, label]) => (
        <button key={String(v)} onClick={() => onChange(v)}
          style={{
            padding: "9px 15px", borderRadius: 999, fontSize: 13, cursor: "pointer",
            border: value === v ? `2px solid ${C.accent}` : `1.5px solid #DDD6C8`,
            background: value === v ? "#EAF3F8" : "#fff",
            color: value === v ? "#28618A" : "#6A6E76", fontWeight: 700, fontFamily: "inherit",
          }}>{label}</button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, max = 5 }) {
  const btn = { width: 36, height: 36, borderRadius: 999, border: "1.5px solid #DDD6C8", background: "#fff", fontSize: 17, cursor: "pointer", color: "#28618A", fontWeight: 700 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
      <button style={btn} onClick={() => onChange(Math.max(0, value - 1))} aria-label="減らす">−</button>
      <span style={{ fontSize: 16, fontWeight: 700, minWidth: 34, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{value}人</span>
      <button style={btn} onClick={() => onChange(Math.min(max, value + 1))} aria-label="増やす">＋</button>
    </div>
  );
}

/* 開閉式の行: 先頭はアイコン or 金額バッジ(壁版)。subAmount は手取り版の予算行で使用 */
export function ExpandRow({ icon: Icon, badge, color, name, amount, subAmount, oneLiner, detail, source }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1.5px solid ${C.line}` }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 2px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
        aria-expanded={open}>
        <span style={{ minWidth: 44, height: 36, borderRadius: 12, background: color + "26", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "0 6px" }}>
          {Icon ? <Icon size={18} color={color} strokeWidth={2.2} /> :
            <span style={{ fontSize: 12, fontWeight: 700, color }}>{badge}</span>}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.ink }}>{name}</span>
          <span style={{ display: "block", fontSize: 11.5, color: C.sub }}>{oneLiner}</span>
        </span>
        {amount && <span style={{ textAlign: "right", whiteSpace: "nowrap" }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{amount}</span>
          {subAmount && <span style={{ display: "block", fontSize: 11, color: C.sub }}>{subAmount}</span>}
        </span>}
        <ChevronDown size={16} color={C.sub} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ padding: "0 2px 14px 58px", fontSize: 13, color: "#5A5E66", lineHeight: 1.85 }}>
          {detail}
          {source && <div style={{ marginTop: 6 }}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, fontSize: 12 }}>くわしくは → {source.label}</a>
          </div>}
        </div>
      )}
    </div>
  );
}
