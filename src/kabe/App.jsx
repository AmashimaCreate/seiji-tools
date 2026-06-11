import React, { useMemo, useState } from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { Wallet, HeartPulse, Landmark, Home } from "lucide-react";
import { KABE_CONFIG as CONFIG } from "../shared/seido.js";
import { calcKabe as calc } from "../shared/calc.js";
import { C, S } from "../shared/tokens.js";
import { Seg, ExpandRow } from "../shared/ui.jsx";

/* ============================================================
   年収の壁シミュレーター v2 — 政治見える化プロジェクト
   制度パラメータ確認日: 2026-06-12
   v2: 手取りシミュレーターv3とトーンを統一
   - やわらかい配色・丸ゴシック・ピル型ボタン
   - 解説はタップ開閉(閉時は一言のみ)・条件欄は中央揃え
   - 計算ロジック・CONFIGはv1から変更なし(勤労学生89万円反映済み)
   - 制度パラメータは src/shared/seido.js、計算は src/shared/calc.js に分離
   ============================================================ */

const yen = (v) => Math.round(v).toLocaleString("ja-JP") + "円";
const man = (v) => `${Math.round(v / 10000)}万円`;
const manS = (v) => `約${(v / 10000).toFixed(0)}万円`;

export default function App() {
  const [salary, setSalary] = useState(1200000);
  const [dependent, setDependent] = useState("spouse"); // spouse | parent | none
  const [large, setLarge] = useState(true);
  const [week20, setWeek20] = useState(true);
  const [afterOct, setAfterOct] = useState(false);

  const o = { dependent: dependent !== "none", student: dependent === "parent", large, week20, afterOct };
  const r = calc(salary, o);
  const deducted = r.salary - r.net;

  const data = useMemo(() => {
    const arr = [];
    for (let s = 0; s <= 2500000; s += 10000) arr.push({ ...calc(s, o), salaryMan: s / 10000 });
    return arr;
  }, [dependent, large, week20, afterOct]);

  const employeeTrack = large && week20 && !o.student;
  const walls = [];
  if (!afterOct && employeeTrack) walls.push({ x: 106, name: "106万円(社会保険)", tone: C.wallMoney });
  if (o.dependent && !employeeTrack) walls.push(o.student
    ? { x: 150, name: "150万円(扶養)", tone: C.wallMoney }
    : { x: 130, name: "130万円(扶養)", tone: C.wallMoney });
  walls.push({ x: 119, name: "住民税(目安)", tone: C.wallTax });
  walls.push({ x: 178, name: "所得税(178万円)", tone: C.wallTax });

  const siSub = r.insuranceType === "employee" ? "勤め先の健康保険・厚生年金など"
    : r.insuranceType === "national" ? "国民年金+国民健康保険"
    : "いまは負担なし(家族の扶養の中)";
  const siDetail = r.insuranceType === "employee"
    ? "勤め先の社会保険に入っている状態です。給料の約15%が保険料ですが、会社も同じくらい負担しています。手取りは減りますが、将来の年金が増え、病気やけがで休んだときの傷病手当金ももらえるようになります。"
    : r.insuranceType === "national"
    ? "家族の扶養から外れて、自分で国民年金(令和8年度は月17,920円)と国民健康保険に入る状態です。国民健康保険の額は住む自治体でかなり違うので、ここはざっくりの概算です。なお収入が少ない場合は、申請すれば国民年金の免除や国保の軽減が使えることが多く、実際の負担はこの表示よりかなり小さくなる場合があります。"
    : `年収${o.student ? "150" : "130"}万円未満で家族の扶養に入っているあいだは、自分で保険料を払う必要がありません(家族の保険料も増えません)。`;

  return (
    <div style={S.page}>
      <header style={{ padding: "30px 0 8px" }}>
        <div style={S.wrap}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", color: C.sub, marginBottom: 6 }}>政治見える化プロジェクト</div>
          <h1 style={{ fontSize: 24, margin: 0, fontWeight: 700, letterSpacing: "0.03em" }}>年収の壁シミュレーター</h1>
          <p style={{ fontSize: 13.5, color: "#6A6E76", margin: "8px 0 16px", lineHeight: 1.8 }}>
            パートやアルバイトの手取りが、年収によってどう変わるか見てみませんか。2026年(令和8年)の制度で計算します。
          </p>
        </div>
      </header>

      <div style={S.wrap}>
        {/* 条件 */}
        <section style={{ ...S.card, textAlign: "center" }}>
          <h2 style={S.h2}>あなたの働き方</h2>
          <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
            <div><div style={S.label}>立場</div>
              <Seg value={dependent} onChange={setDependent} options={[["spouse", "配偶者の扶養内で働く"], ["parent", "親の扶養内で働く(学生)"], ["none", "扶養に入っていない"]]} />
            </div>
            <div><div style={S.label}>勤め先の従業員数</div>
              <Seg value={large} onChange={setLarge} options={[[true, "51人以上"], [false, "50人以下"]]} />
            </div>
            <div><div style={S.label}>週の労働時間</div>
              <Seg value={week20} onChange={setWeek20} options={[[true, "20時間以上"], [false, "20時間未満"]]} />
            </div>
            <div><div style={S.label}>いつの話?(今年10月に社会保険のルールが変わる予定)</div>
              <Seg value={afterOct} onChange={setAfterOct} options={[[false, "2026年9月まで"], [true, "2026年10月以降"]]} />
            </div>
          </div>
        </section>

        {/* 結果 */}
        <section style={S.card}>
          <h2 style={S.h2}>年収と手取り</h2>
          <input type="range" min={0} max={2500000} step={10000} value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.accent }} aria-label="年収" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "10px 0 4px", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 13, color: C.sub }}>年収(額面)</span>
              <input type="number" inputMode="numeric" min={0} max={250} step={1}
                value={Math.round(salary / 10000)}
                onChange={(e) => {
                  const v = e.target.value === "" ? 0 : Number(e.target.value);
                  setSalary(Math.max(0, Math.min(250, v)) * 10000);
                }}
                aria-label="年収(万円)"
                style={{ width: 76, fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "inherit", color: C.ink, border: "none", borderBottom: `2px solid ${C.accent}`, background: "transparent", textAlign: "right", outline: "none", padding: "0 2px" }} />
              <span style={{ fontSize: 16, fontWeight: 700 }}>万円</span>
            </div>
            <div style={{ textAlign: "right" }}><span style={{ fontSize: 13, color: C.sub }}>手取りは、ざっくり </span>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#28618A", fontVariantNumeric: "tabular-nums" }}>{yen(r.net)}</span></div>
          </div>
          {deducted > 0 && (
            <div style={{ fontSize: 13, color: "#6A6E76", marginBottom: 8 }}>
              引かれているのは合計{((deducted / r.salary) * 100).toFixed(1)}%(年{manS(deducted)})です。
            </div>
          )}

          <div style={{ fontSize: 11.5, color: C.sub, margin: "8px 0 2px" }}>タップでひとこと解説</div>
          <ExpandRow icon={HeartPulse} color={C.shaho} name="社会保険料" amount={r.insurance > 0 ? "−" + manS(r.insurance) : "0円"}
            oneLiner={siSub} detail={siDetail} source={CONFIG.sources.nenkinTanjikan} />
          <ExpandRow icon={Landmark} color={C.shotokuzei} name="所得税" amount={r.incomeTax > 0 ? "−" + yen(r.incomeTax) : "0円"}
            oneLiner="国の税金。178万円までは0円"
            detail="2026年からは、年収178万円までは所得税がかかりません(いわゆる年収の壁の引き上げ)。社会保険料を払っている場合はその分も差し引かれるので、実際にかかり始めるのはさらに上の年収からです。"
            source={CONFIG.sources.nta} />
          <ExpandRow icon={Home} color={C.juminzei} name="住民税" amount={r.residentTax > 0 ? "−" + yen(r.residentTax) : "0円"}
            oneLiner="住んでいる自治体の税金。119万円ごろから"
            detail="2026年の所得からは、ひとり暮らし(単身)の場合およそ年収119万円を超えるとかかります。基準は住む自治体で少し違い、約112万〜119万円。所得税が0円でも住民税はかかることがあります。"
            source={CONFIG.sources.soumu} />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 2px 4px", fontSize: 15, fontWeight: 700 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Wallet size={18} color={C.net} />残る手取り</span>
            <span style={{ color: "#28618A", fontVariantNumeric: "tabular-nums" }}>{yen(r.net)}</span>
          </div>
        </section>

        {/* グラフ */}
        <section style={S.card}>
          <h2 style={S.h2}>手取りカーブ — 壁はどこにある?</h2>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={data} margin={{ top: 28, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke="#F2EDE2" />
              <XAxis dataKey="salaryMan" tickFormatter={(v) => `${v}万`} ticks={[0, 50, 100, 130, 160, 200, 250]} fontSize={11} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 10000)}万`} fontSize={11} width={48} />
              <Tooltip formatter={(v, n) => [yen(v), n === "net" ? "手取り" : "額面"]} labelFormatter={(v) => `年収 ${v}万円`} />
              <Area dataKey="salary" name="額面" stroke="#D8D0C0" fill="none" strokeDasharray="4 4" dot={false} type="monotone" />
              <Line dataKey="net" name="手取り" stroke={C.net} strokeWidth={2.5} dot={false} type="monotone" />
              {walls.map((w) => (
                <ReferenceLine key={w.name} x={w.x} stroke={w.tone} strokeDasharray="3 3"
                  label={{ value: w.name, angle: -90, position: "insideTopRight", fontSize: 10, fill: w.tone, dx: -4, dy: 8 }} />
              ))}
              <ReferenceLine x={salary / 10000} stroke="#B9821F" strokeWidth={1.5}
                label={{ value: "いまの設定", position: "top", fontSize: 11, fill: "#B9821F" }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 12.5, color: "#5A5E66", lineHeight: 1.9, margin: "8px 0 0" }}>
            点線が額面、青い線が手取り。線がガクッと落ちるところが「壁」です。
            社会保険に入ると手取りは減りますが、将来の年金や病気のときの給付は増えます(このグラフには給付は含まれません)。
          </p>
        </section>

        {/* 壁の解説(タップで開く) */}
        <section style={S.card}>
          <h2 style={S.h2}>それぞれの壁 <span style={{ fontSize: 11.5, fontWeight: 400, color: C.sub }}>タップでひとこと解説</span></h2>
          <ExpandRow badge="106万" color={C.wallMoney} name="社会保険の壁(今年9月まで)"
            oneLiner="勤め先の社会保険に入るライン"
            detail="従業員51人以上の職場で週20時間以上働き、月収8.8万円(年収約106万円)以上などの条件がそろうと、勤め先の健康保険・厚生年金に入ります。このライン(賃金の条件)は2026年10月1日になくなる予定で、以降は「週20時間」が主な基準になります。"
            source={CONFIG.sources.nenkinTanjikan} />
          <ExpandRow badge="119万" color={C.wallTax} name="住民税の壁(目安)"
            oneLiner="住民税がかかりはじめるライン"
            detail="ひとり暮らし(単身)の場合、2026年の所得からはおよそ年収119万円超で住民税がかかります。基準は住む自治体で少し違います(約112万〜119万円)。"
            source={CONFIG.sources.soumu} />
          <ExpandRow badge="130万" color={C.wallMoney} name="扶養の壁"
            oneLiner="家族の扶養から外れるライン。19〜22歳は150万円"
            detail="配偶者の健康保険の扶養でいられるのは年収130万円未満まで。19〜22歳(配偶者を除く)が親などの扶養に入っている場合は、2025年10月から150万円未満に引き上げられました。超えると自分で国民年金・国民健康保険(または勤め先の社会保険)に入ることになり、手取りが一時的に大きく下がります。2026年時点で実質的にいちばん大きい壁です。"
            source={CONFIG.sources.nenkinFuyo} />
          <ExpandRow badge="178万" color={C.wallTax} name="所得税の壁"
            oneLiner="所得税がかかりはじめるライン(2026年から)"
            detail="基礎控除と給与所得控除の引き上げで、2026年からは年収178万円まで所得税がかかりません。ただし毎月の天引きに反映されるのは2027年1月からで、2026年分は年末調整でまとめて精算されます。"
            source={CONFIG.sources.nta} />
          <ExpandRow badge="家族側" color={C.wallTax} name="家族の税金が変わるライン"
            oneLiner="あなたの収入で、配偶者や親の税金も変わる"
            detail="このシミュレーターはあなた自身の手取りだけを計算しています。配偶者控除・扶養控除など、家族側の税金が変わるライン(配偶者特別控除の逓減、19〜22歳の特定親族特別控除など)は、出典のページで確認してください。"
            source={CONFIG.sources.mof} />
        </section>

        {/* 前提(折りたたみ) */}
        <details style={{ ...S.card, fontSize: 12.5, color: "#6A6E76" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 13.5, color: C.ink }}>この試算のこまかい前提</summary>
          <ul style={{ lineHeight: 1.9, margin: "10px 0 0", paddingLeft: 18 }}>
            <li>社会保険料率は協会けんぽ全国平均(2026年度9.9%)をもとにした概算(健康保険・厚生年金・雇用保険・子ども・子育て支援金あわせて約14.7%)。実際は都道府県・健保組合・標準報酬月額で異なります。</li>
            <li>国民健康保険料は自治体差が非常に大きいざっくり概算です。国民年金の申請免除・国保の軽減は反映していないため、「扶養に入っていない」で低い年収にすると実際より重い負担(手取りがマイナス)で表示されることがあります。</li>
            <li>住民税の非課税基準は自治体の級地区分で異なります(本試算は1級地・単身ベース)。</li>
            <li>106万円の壁の撤廃は令和8年10月1日施行予定です(政省令の改正案が意見募集の段階にあり、内容が変わる可能性があります)。</li>
            <li>「親の扶養内で働く(学生)」は19〜22歳を想定しています。19歳以上23歳未満(配偶者を除く)の扶養の収入基準は2025年10月から150万円未満です(18歳以下・23歳以上の学生は130万円未満のまま)。</li>
            <li>家族側の税(配偶者控除等)は計算していません。</li>
          </ul>
        </details>

        <footer style={{ fontSize: 11.5, color: "#A09A8C", lineHeight: 1.8, padding: "4px 4px 0" }}>
          制度確認日 2026年6月12日 ／ 数字のもと:
          <a href="https://www.mof.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>財務省</a>
          <a href="https://www.nta.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>国税庁</a>
          <a href="https://www.soumu.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>総務省</a>
          <a href="https://www.nenkin.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>日本年金機構</a>
          <a href="https://www.mhlw.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>厚生労働省</a>
        </footer>
      </div>
    </div>
  );
}
