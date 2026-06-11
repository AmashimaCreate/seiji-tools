/* 指示書「7-1. 計算の同一性」の受け入れチェック。
   移植元(tedori-simulator.jsx / nenshu-kabe-simulator.jsx)の検証済み出力と
   完全一致(円)することを確認する。制度パラメータ(src/shared/seido.js)を
   更新したときは、このスクリプトの期待値も新しい正解値に更新すること。
   使い方: npm run check */
import { calcTedori, calcKabe } from "../src/shared/calc.js";

const tedoriCases = [
  { label: "450万・40歳未満・単身",
    salary: 4500000, o: { age40to64: false, spouse: false, fuyoIppan: 0, fuyoTokutei: 0 },
    expect: { shaho: 662175, it: 74380, rt: 209200, net: 3554245 } },
  { label: "450万・40〜64・配偶者あり・19〜22歳扶養1人",
    salary: 4500000, o: { age40to64: true, spouse: true, fuyoIppan: 0, fuyoTokutei: 1 },
    expect: { shaho: 698625, it: 20982, rt: 127600, net: 3652793 } },
  { label: "800万・40歳未満・単身",
    salary: 8000000, o: { age40to64: false, spouse: false, fuyoIppan: 0, fuyoTokutei: 0 },
    expect: { shaho: 1158900, it: 435661, rt: 453600, net: 5951839 } },
  { label: "1500万・40〜64・単身",
    salary: 15000000, o: { age40to64: true, spouse: false, fuyoIppan: 0, fuyoTokutei: 0 },
    expect: { shaho: 1669950, it: 2057111, rt: 1097500, net: 10175439 } },
];

const kabeCases = [
  { label: "105万・配偶者扶養・51人以上・週20h以上・9月まで",
    salary: 1050000, o: { dependent: true, student: false, large: true, week20: true, afterOct: false },
    expect: { shaho: 0, it: 0, rt: 0, net: 1050000 } },
  { label: "106万・同上",
    salary: 1060000, o: { dependent: true, student: false, large: true, week20: true, afterOct: false },
    expect: { shaho: 155820, it: 0, rt: 0, net: 904180 } },
  { label: "150万・学生(親扶養)・50人以下",
    salary: 1500000, o: { dependent: true, student: true, large: false, week20: true, afterOct: false },
    expect: { shaho: 298040, it: 0, rt: 5000, net: 1196960 } },
  { label: "129万・配偶者扶養・50人以下",
    salary: 1290000, o: { dependent: true, student: false, large: false, week20: true, afterOct: false },
    expect: { shaho: 0, it: 0, rt: 14500, net: 1275500 } },
  { label: "130万・同上",
    salary: 1300000, o: { dependent: true, student: false, large: false, week20: true, afterOct: false },
    expect: { shaho: 278040, it: 0, rt: 5000, net: 1016960 } },
];

let failed = 0;
function check(tool, label, got, expect) {
  const pairs = [["社保", got.shaho, expect.shaho], ["所得税", got.it, expect.it], ["住民税", got.rt, expect.rt], ["手取り", got.net, expect.net]];
  const bad = pairs.filter(([, g, w]) => g !== w);
  if (bad.length === 0) {
    console.log(`✓ [${tool}] ${label}`);
  } else {
    failed++;
    console.error(`✗ [${tool}] ${label}`);
    for (const [name, g, w] of bad) console.error(`    ${name}: got ${g.toLocaleString()} / want ${w.toLocaleString()}`);
  }
}

for (const c of tedoriCases) {
  const r = calcTedori(c.salary, c.o);
  check("手取り", c.label, { shaho: Math.round(r.si.total), it: r.incomeTax, rt: r.residentTax, net: Math.round(r.net) }, c.expect);
}
for (const c of kabeCases) {
  const r = calcKabe(c.salary, c.o);
  check("壁", c.label, { shaho: r.insurance, it: r.incomeTax, rt: r.residentTax, net: r.net }, c.expect);
}

if (failed > 0) {
  console.error(`\n${failed}件不一致`);
  process.exit(1);
}
console.log("\n全9ケース一致(指示書7-1)");
