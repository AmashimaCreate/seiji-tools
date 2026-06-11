import React, { useMemo, useState } from "react";
import {
  ComposedChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { Wallet, HeartPulse, PiggyBank, Umbrella, Landmark, Home, HandHeart, Baby } from "lucide-react";
import { TEDORI_CONFIG as CONFIG } from "../shared/seido.js";
import { HISTORY } from "../shared/shahoHistory.js";
import { BUDGET, BUDGET_TOTAL } from "../shared/budget2026.js";
import { calcTedori as calc } from "../shared/calc.js";
import { C, S } from "../shared/tokens.js";
import { Seg, Stepper, ExpandRow } from "../shared/ui.jsx";

/* ============================================================
   手取りシミュレーター(税金の使い道 統合版) — 政治見える化プロジェクト
   制度パラメータ確認日: 2026-06-12(令和8年分・令和8年度)
   - 手取りの内訳 → 納めた所得税を令和8年度予算の構成比で按分、まで一気通貫
   - 条件(配偶者・扶養・年齢)は使い道の計算にもそのまま反映される
   - 制度パラメータは src/shared/seido.js、計算は src/shared/calc.js に分離
   ============================================================ */

const yen = (v) => Math.round(v).toLocaleString("ja-JP") + "円";
const man = (v) => `${Math.round(v / 10000).toLocaleString("ja-JP")}万円`;
const manS = (v) => `約${(v / 10000).toFixed(0)}万円`;

export default function App() {
  const [salary, setSalary] = useState(4500000);
  const [age40to64, setAge] = useState(false);
  const [spouse, setSpouse] = useState(false);
  const [fuyoIppan, setFuyoIppan] = useState(0);
  const [fuyoTokutei, setFuyoTokutei] = useState(0);

  const o = { age40to64, spouse, fuyoIppan, fuyoTokutei };
  const r = calc(salary, o);

  const data = useMemo(() => {
    const arr = [];
    for (let s = 1000000; s <= 20000000; s += 100000) {
      const c = calc(s, o);
      arr.push({ salaryMan: s / 10000, netRatePct: Math.round(c.netRate * 1000) / 10 });
    }
    return arr;
  }, [age40to64, spouse, fuyoIppan, fuyoTokutei]);

  const suiiData = useMemo(() => HISTORY.map((d) => ({
    y: d.y,
    厚生年金: +(d.kosei / 2).toFixed(3),
    健康保険: +(d.kenpo / 2).toFixed(3),
    介護保険: age40to64 ? +(d.kaigo / 2).toFixed(3) : 0,
    支援金: +(d.shien / 2).toFixed(3),
    total: +(((d.kosei + d.kenpo + (age40to64 ? d.kaigo : 0) + d.shien) / 2)).toFixed(2),
  })), [age40to64]);
  const suiiFirst = suiiData[0];
  const suiiLast = suiiData[suiiData.length - 1];
  const monthlyPay = salary / 12;

  const seg = [
    { name: "手取り", v: r.net, color: C.net },
    { name: "社会保険料", v: r.si.total, color: C.shaho },
    { name: "所得税", v: r.incomeTax, color: C.shotokuzei },
    { name: "住民税", v: r.residentTax, color: C.juminzei },
  ];

  return (
    <div style={S.page}>
      <header style={{ padding: "30px 0 8px" }}>
        <div style={S.wrap}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", color: C.sub, marginBottom: 6 }}>政治見える化プロジェクト</div>
          <h1 style={{ fontSize: 24, margin: 0, fontWeight: 700, letterSpacing: "0.03em" }}>手取りシミュレーター</h1>
          <p style={{ fontSize: 13.5, color: "#6A6E76", margin: "8px 0 16px", lineHeight: 1.8 }}>
            給料から何がいくら引かれて、引かれたお金がどこへ行って、その率はどう変わってきたのか。ぜんぶつなげて見てみませんか。
          </p>
        </div>
      </header>

      <div style={S.wrap}>
        {/* 条件 */}
        <section style={{ ...S.card, textAlign: "center" }}>
          <h2 style={S.h2}>あなたの条件</h2>
          <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
            <div><div style={S.label}>年齢</div>
              <Seg value={age40to64} onChange={setAge} options={[[false, "40歳未満"], [true, "40〜64歳"]]} />
            </div>
            <div><div style={S.label}>収入のない(少ない)配偶者</div>
              <Seg value={spouse} onChange={setSpouse} options={[[false, "いない"], [true, "いる"]]} />
            </div>
            <div style={{ display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center" }}>
              <div><div style={S.label}>養っている家族(16〜18歳・23歳以上)</div><Stepper value={fuyoIppan} onChange={setFuyoIppan} /></div>
              <div><div style={S.label}>養っている家族(19〜22歳)</div><Stepper value={fuyoTokutei} onChange={setFuyoTokutei} /></div>
            </div>
          </div>
        </section>

        {/* 結果 */}
        <section style={S.card}>
          <h2 style={S.h2}>年収と手取り</h2>
          <input type="range" min={1000000} max={20000000} step={100000} value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            style={{ width: "100%", accentColor: C.accent }} aria-label="年収" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "10px 0 4px", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 13, color: C.sub }}>年収(額面)</span>
              <input type="number" inputMode="numeric" min={0} max={2000} step={1}
                value={Math.round(salary / 10000)}
                onChange={(e) => {
                  const v = e.target.value === "" ? 0 : Number(e.target.value);
                  setSalary(Math.max(0, Math.min(2000, v)) * 10000);
                }}
                onBlur={() => setSalary(Math.max(1000000, Math.min(20000000, salary)))}
                aria-label="年収(万円)"
                style={{ width: 92, fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", fontFamily: "inherit", color: C.ink, border: "none", borderBottom: `2px solid ${C.accent}`, background: "transparent", textAlign: "right", outline: "none", padding: "0 2px" }} />
              <span style={{ fontSize: 16, fontWeight: 700 }}>万円</span>
            </div>
            <div style={{ textAlign: "right" }}><span style={{ fontSize: 13, color: C.sub }}>手取りは、ざっくり </span>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#28618A", fontVariantNumeric: "tabular-nums" }}>年{manS(r.net)}</span></div>
          </div>
          <div style={{ fontSize: 13, color: "#6A6E76", marginBottom: 14 }}>
            月にすると{manS(r.net / 12)}。額面の{(r.netRate * 100).toFixed(0)}%が手元に残り、引かれているのは合計{((1 - r.netRate) * 100).toFixed(1)}%(税{(((r.incomeTax + r.residentTax) / r.salary) * 100).toFixed(1)}%+社会保険{((r.si.total / r.salary) * 100).toFixed(1)}%)です。
          </div>

          <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
            {seg.map((s) => s.v > 0 && (
              <div key={s.name} style={{ width: `${(s.v / r.salary) * 100}%`, background: s.color }} title={`${s.name} ${yen(s.v)}`} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11.5, color: "#6A6E76", marginBottom: 16, fontWeight: 700 }}>
            {seg.map((s) => (
              <span key={s.name}><span style={{ display: "inline-block", width: 9, height: 9, background: s.color, borderRadius: 3, marginRight: 4 }} />{s.name} {((s.v / r.salary) * 100).toFixed(0)}%</span>
            ))}
          </div>

          <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 2 }}>タップでひとこと解説</div>
          <ExpandRow icon={HeartPulse} color={C.shaho} name="健康保険料" amount={"−" + manS(r.si.kenpo)}
            oneLiner="病院の窓口が3割負担で済む保険"
            detail="病院代の7割をみんなで出し合うしくみです。料率は2026年度の全国平均で9.9%(34年ぶりの引き下げ)。半分は会社が払ってくれていて、ここに出ているのは自分の分です。都道府県や会社の健保組合によって少し違います。"
            source={CONFIG.sources.kenpo} />
          {age40to64 && (
            <ExpandRow icon={HandHeart} color={C.shaho} name="介護保険料" amount={"−" + manS(r.si.kaigo)}
              oneLiner="40歳から加わる、介護のための保険"
              detail="介護サービスを社会全体で支えるための保険料で、40歳の誕生月から自動的に始まります。2026年度は1.62%(本人はその半分)。これも会社と半分ずつです。"
              source={CONFIG.sources.kenpo} />
          )}
          <ExpandRow icon={Baby} color={C.shaho} name="子ども・子育て支援金" amount={"−" + yen(r.si.shien)}
            oneLiner="2026年に始まった、いちばん新しい項目"
            detail="児童手当の拡充など子育て支援の財源として、2026年度から医療保険を通じて集められることになりました。今年度は0.23%(本人はその半分)で、2028年度まで段階的に引き上げられる予定です。"
            source={CONFIG.sources.kenpo} />
          <ExpandRow icon={PiggyBank} color={C.shaho} name="厚生年金保険料" amount={"−" + manS(r.si.kousei)}
            oneLiner="将来の年金のために納めるお金"
            detail="いま集めた保険料が、いまの高齢者への年金給付に使われるしくみです(自分の分は将来の現役世代が支えます)。給料の18.3%を会社と半分ずつ負担。月収65万円ぶんで頭打ちになります。"
            source={CONFIG.sources.nenkin} />
          <ExpandRow icon={Umbrella} color={C.shaho} name="雇用保険料" amount={"−" + manS(r.si.koyo)}
            oneLiner="失業や育休のときに給付をもらえる保険"
            detail="仕事を失ったときの失業手当や、育児休業中の給付金のもとになるお金です。2026年度は給料の0.5%。料率は毎年国が見直していて、今年は少し下がりました。"
            source={CONFIG.sources.mhlw} />
          <ExpandRow icon={Landmark} color={C.shotokuzei} name="所得税" amount={"−" + manS(r.incomeTax)}
            oneLiner="国に納める税金。使い道はこの下で"
            detail="収入が多い部分ほど高い税率(5%〜45%)がかかるしくみです。2026年からは「年収178万円までは所得税ゼロ」に変わりました(いわゆる年収の壁の引き上げ)。ただし毎月の天引きに反映されるのは2027年1月からで、今年の分は年末調整でまとめて戻ってきます。納めたお金がどこへ行くかは、すぐ下のセクションでどうぞ。"
            source={CONFIG.sources.nta} />
          <ExpandRow icon={Home} color={C.juminzei} name="住民税" amount={"−" + manS(r.residentTax)}
            oneLiner="住んでいる市区町村と都道府県の税金"
            detail="ごみ収集や学校など、身近な行政サービスのもとになるお金です。去年の所得の約10%が、今年の6月から翌年5月の給料で引かれます。新社会人の1年目に住民税がないのはこのためです。使い道はあなたの住む自治体が毎年公表しています。"
            source={CONFIG.sources.soumu} />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 2px 0", fontSize: 14, fontWeight: 700, color: "#6A6E76" }}>
            <span>引かれた合計</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>−{yen(r.salary - r.net)}<span style={{ fontSize: 12, marginLeft: 6 }}>(額面の{((1 - r.netRate) * 100).toFixed(1)}%)</span></span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 2px 4px", fontSize: 15, fontWeight: 700 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Wallet size={18} color={C.net} />残る手取り</span>
            <span style={{ color: "#28618A", fontVariantNumeric: "tabular-nums" }}>{yen(r.net)}</span>
          </div>
        </section>

        {/* 納めた所得税のゆくえ */}
        <section style={S.card}>
          <h2 style={S.h2}>納めた所得税のゆくえ</h2>
          {r.incomeTax === 0 ? (
            <p style={{ fontSize: 13.5, color: "#5A5E66", lineHeight: 1.9, margin: 0 }}>
              いまの条件では所得税は0円なので、ここに出るものはありません。年収を増やすか、条件を変えてみてください。
            </p>
          ) : (
            <>
              <p style={{ fontSize: 13.5, color: "#5A5E66", lineHeight: 1.9, margin: "0 0 14px" }}>
                あなたが納める所得税<b>年{yen(r.incomeTax)}</b>を、国の予算(令和8年度・総額約122兆円)の使われ方のとおりに割ってみると——
              </p>
              <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                {BUDGET.map((b) => (
                  <div key={b.key} style={{ width: `${(b.amount / BUDGET_TOTAL) * 100}%`, background: b.color }} title={b.name} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "#6A6E76", marginBottom: 12, fontWeight: 700 }}>
                {BUDGET.map((b) => (
                  <span key={b.key}><span style={{ display: "inline-block", width: 9, height: 9, background: b.color, borderRadius: 3, marginRight: 4 }} />{b.name} {((b.amount / BUDGET_TOTAL) * 100).toFixed(0)}%</span>
                ))}
              </div>
              {BUDGET.map((b) => (
                <ExpandRow key={b.key} icon={b.icon} color={b.color} name={b.name}
                  amount={yen(r.incomeTax * b.amount / BUDGET_TOTAL)}
                  subAmount={`月あたり${yen(r.incomeTax * b.amount / BUDGET_TOTAL / 12)}`}
                  oneLiner={b.one} detail={b.detail} source={CONFIG.sources.mof} />
              ))}
              <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.8, margin: "10px 0 0" }}>
                実際のお金に色はついていません。「歳出の構成比のとおりに割ったら」という見方です。住民税{r.residentTax > 0 ? `(年${yen(r.residentTax)})` : ""}はあなたの住む自治体へ行きます。
              </p>
            </>
          )}
        </section>

        {/* 社会保険料の推移 */}
        <section style={S.card}>
          <h2 style={S.h2}>社会保険料は、どう変わってきた?</h2>
          <div style={{ display: "flex", gap: 12, textAlign: "center", marginBottom: 12 }}>
            <div style={{ flex: 1, background: "#F7F3EA", borderRadius: 14, padding: "14px 10px" }}>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>2008年度</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{suiiFirst.total}%</div>
              <div style={{ fontSize: 12.5, color: "#6A6E76" }}>いまの月収なら<br /><b>月{yen(monthlyPay * suiiFirst.total / 100)}</b></div>
            </div>
            <div style={{ alignSelf: "center", fontSize: 18, color: C.sub }}>→</div>
            <div style={{ flex: 1, background: "#F2F7FA", borderRadius: 14, padding: "14px 10px" }}>
              <div style={{ fontSize: 12, color: "#28618A", fontWeight: 700 }}>2026年度</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#28618A", fontVariantNumeric: "tabular-nums" }}>{suiiLast.total}%</div>
              <div style={{ fontSize: 12.5, color: "#4A7596" }}>いまの月収なら<br /><b>月{yen(monthlyPay * suiiLast.total / 100)}</b></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={suiiData} margin={{ top: 20, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke="#F2EDE2" />
              <XAxis dataKey="y" ticks={[2008, 2012, 2017, 2022, 2026]} fontSize={11} />
              <YAxis domain={[0, 16]} tickFormatter={(v) => `${v}%`} fontSize={11} width={40} />
              <Tooltip formatter={(v, n) => [`${v}%`, n]} labelFormatter={(v) => `${v}年度`} />
              <Area dataKey="厚生年金" stackId="a" stroke="#8FA8C8" fill="#8FA8C8" fillOpacity={0.85} type="stepAfter" />
              <Area dataKey="健康保険" stackId="a" stroke={C.shaho} fill={C.shaho} fillOpacity={0.85} type="stepAfter" />
              {age40to64 && <Area dataKey="介護保険" stackId="a" stroke={C.shotokuzei} fill={C.shotokuzei} fillOpacity={0.85} type="stepAfter" />}
              <Area dataKey="支援金" stackId="a" stroke="#A4C09A" fill="#A4C09A" fillOpacity={0.9} type="stepAfter" />
              <ReferenceLine x={2017} stroke="#A8A092" strokeDasharray="3 3"
                label={{ value: "年金18.3%で固定", position: "top", fontSize: 10, fill: "#8A8478" }} />
            </AreaChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 12.5, color: "#5A5E66", lineHeight: 1.9, margin: "8px 0 0" }}>
            本人負担分の率の推移です(雇用保険0.3〜0.6%程度は含みません)。
            いちばん大きく増えたのは厚生年金で、2004年の法改正で「2017年まで毎年すこしずつ上げて固定する」と決められ、そのとおりに上がって止まりました。
            健康保険は2012年から続いた10%が2026年度に34年ぶりに下がり、かわりに子ども・子育て支援金という新しい項目が加わりました。
          </p>
        </section>

        {/* 手取り率カーブ */}
        <section style={S.card}>
          <h2 style={S.h2}>年収が上がると、手取り率はどうなる?</h2>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 24, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke="#F2EDE2" />
              <XAxis dataKey="salaryMan" tickFormatter={(v) => `${v}万`} ticks={[100, 300, 500, 700, 1000, 1500, 2000]} fontSize={11} />
              <YAxis domain={[55, 90]} tickFormatter={(v) => `${v}%`} fontSize={11} width={44} />
              <Tooltip formatter={(v) => [`${v}%`, "手取り率"]} labelFormatter={(v) => `年収 ${v}万円`} />
              <Line dataKey="netRatePct" stroke={C.net} strokeWidth={2.5} dot={false} type="monotone" />
              <ReferenceLine x={salary / 10000} stroke="#B9821F" strokeWidth={1.5}
                label={{ value: "いまの設定", position: "top", fontSize: 11, fill: "#B9821F" }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 12.5, color: "#5A5E66", lineHeight: 1.9, margin: "8px 0 0" }}>
            稼ぐほど税率が上がるので、手取り率はゆっくり下がっていきます。
            高年収で下がり方がゆるむのは、厚生年金の保険料に上限があるためです。
          </p>
        </section>

        {/* 前提(折りたたみ) */}
        <details style={{ ...S.card, fontSize: 12.5, color: "#6A6E76" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 13.5, color: C.ink }}>この試算のこまかい前提</summary>
          <ul style={{ lineHeight: 1.9, margin: "10px 0 0", paddingLeft: 18 }}>
            <li>2026年(令和8年)分の所得税・令和8年度の保険料率で計算しています。</li>
            <li>賞与は月給に均して計算しています(賞与の比率で社会保険料は少し変わります)。</li>
            <li>健康保険料率は協会けんぽの全国平均(2026年度9.9%)ベース。都道府県・健保組合により異なります。</li>
            <li>生命保険料控除・iDeCo・住宅ローン控除などは含みません(あれば手取りは増えます)。</li>
            <li>住民税の均等割・調整控除は概算です(自治体により数千円の差)。</li>
            <li>配偶者は収入なし(配偶者控除満額)の想定です。</li>
            <li>「ゆくえ」の按分は令和8年度一般会計予算(2026年4月7日成立)。「地方への仕送り」と「そのほか」は公表数値からの差し引きです。国の歳出は税金だけでなく新たな借金(国債)でもまかなわれており(歳入の約4分の1)、年度途中の補正予算で変わることがあります。</li>
            <li>推移グラフの健康保険・介護保険は協会けんぽ(全国平均)、厚生年金は〜2017年は年度内9月改定後の率を代表値にしています。2008年度より前は健康保険の集計のしくみが異なるため表示していません。率が同じでも給料が上がれば払う金額は増えます。</li>
          </ul>
        </details>

        <footer style={{ fontSize: 11.5, color: "#A09A8C", lineHeight: 1.8, padding: "4px 4px 0" }}>
          制度確認日 2026年6月12日 ／ 数字のもと:
          <a href="https://www.nta.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>国税庁</a>
          <a href="https://www.soumu.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>総務省</a>
          <a href="https://www.kyoukaikenpo.or.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>協会けんぽ</a>
          <a href="https://www.nenkin.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>日本年金機構</a>
          <a href="https://www.mhlw.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>厚生労働省</a>
          <a href="https://www.mof.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: "#8A93A3", margin: "0 5px" }}>財務省</a>
        </footer>
      </div>
    </div>
  );
}
