import { TEDORI_CONFIG, KABE_CONFIG } from "./seido.js";

/* ---------- 共通 ---------- */
/* 給与所得控除(フル分岐版・手取りシミュレーターが正)。
   壁シミュレーターv1の簡略版(74万固定+190万超のみ分岐)とは対象年収域0〜250万円で
   出力が一致するため、壁シミュレーターでもこちらを共通利用する(指示書3-3)。 */
export function kyuyoKojo(salary) {
  let k;
  if (salary <= 1800000) k = salary * 0.4 - 100000;
  else if (salary <= 3600000) k = salary * 0.3 + 80000;
  else if (salary <= 6600000) k = salary * 0.2 + 440000;
  else if (salary <= 8500000) k = salary * 0.1 + 1100000;
  else k = 1950000;
  return Math.max(TEDORI_CONFIG.kyuyoKojoMin, k);
}

/* ---------- 手取りシミュレーターの計算 ---------- */
export function kisoKojo(shotoku) {
  for (const t of TEDORI_CONFIG.kisoKojoTiers) if (shotoku <= t.limit) return t.amount;
  return 0;
}
export function haiguKojo(shotoku, kind) {
  for (const t of TEDORI_CONFIG.haiguKojo) if (shotoku <= t.limit) return t[kind];
  return 0;
}
export function socialInsuranceTedori(salary, age40to64) {
  const monthly = salary / 12;
  const kenpoBase = Math.min(monthly, TEDORI_CONFIG.kenpoCapMonthly) * 12;
  const kouseiBase = Math.min(monthly, TEDORI_CONFIG.kouseiCapMonthly) * 12;
  const kenpo = kenpoBase * TEDORI_CONFIG.kenpoRate;
  const kaigo = age40to64 ? kenpoBase * TEDORI_CONFIG.kaigoRate : 0;
  const shien = kenpoBase * TEDORI_CONFIG.shienRate;
  const kousei = kouseiBase * TEDORI_CONFIG.kouseiRate;
  const koyo = salary * TEDORI_CONFIG.koyoRate;
  return { kenpo, kaigo, shien, kousei, koyo, total: kenpo + kaigo + shien + kousei + koyo };
}
export function progressiveTax(kazei) {
  for (const b of TEDORI_CONFIG.taxBrackets) if (kazei <= b.limit) return Math.max(0, kazei * b.rate - b.deduct);
  return 0;
}
export function calcTedori(salary, o) {
  const si = socialInsuranceTedori(salary, o.age40to64);
  const shotoku = Math.max(0, salary - kyuyoKojo(salary));
  let kojoIT = kisoKojo(shotoku) + si.total;
  let kojoRT = TEDORI_CONFIG.juminKisoKojo + si.total;
  if (o.spouse) { kojoIT += haiguKojo(shotoku, "it"); kojoRT += haiguKojo(shotoku, "rt"); }
  kojoIT += o.fuyoIppan * TEDORI_CONFIG.fuyoIppan.it + o.fuyoTokutei * TEDORI_CONFIG.fuyoTokutei.it;
  kojoRT += o.fuyoIppan * TEDORI_CONFIG.fuyoIppan.rt + o.fuyoTokutei * TEDORI_CONFIG.fuyoTokutei.rt;
  const kazeiIT = Math.max(0, Math.floor((shotoku - kojoIT) / 1000) * 1000);
  const incomeTax = Math.round(progressiveTax(kazeiIT) * TEDORI_CONFIG.reconstructionSurtax);
  const kazeiRT = Math.max(0, Math.floor((shotoku - kojoRT) / 1000) * 1000);
  const residentTax = shotoku > 450000
    ? Math.max(0, Math.round(kazeiRT * TEDORI_CONFIG.juminRate - TEDORI_CONFIG.juminChoseiKojo)) + TEDORI_CONFIG.juminKintowari
    : 0;
  const net = salary - si.total - incomeTax - residentTax;
  return { salary, si, incomeTax, residentTax, net, netRate: salary > 0 ? net / salary : 1 };
}

/* ---------- 年収の壁シミュレーターの計算(v1と同一) ---------- */
export function socialInsuranceKabe(salary, o) {
  const employeeEligible =
    o.week20 && o.large && !o.student &&
    (o.afterOct ? true : salary >= KABE_CONFIG.shahoWageThreshold);
  if (employeeEligible) {
    return { type: "employee", amount: Math.round(salary * KABE_CONFIG.shahoRate) };
  }
  const needsOwn = o.dependent ? salary >= KABE_CONFIG.fuyo130 : salary > 0;
  if (needsOwn) {
    const shotoku = Math.max(0, salary - kyuyoKojo(salary));
    const kokuho = Math.max(25000, Math.round((Math.max(0, shotoku - 430000)) * 0.10 + 50000));
    return { type: "national", amount: KABE_CONFIG.kokuminNenkin + kokuho };
  }
  return { type: "none", amount: 0 };
}
export function incomeTaxKabe(salary, insurance, o) {
  const shotoku = Math.max(0, salary - kyuyoKojo(salary));
  let kojo = KABE_CONFIG.kisoKojo + insurance;
  if (o.student && shotoku <= KABE_CONFIG.kinroGakuseiLimit) kojo += KABE_CONFIG.kinroGakuseiKojo;
  const kazei = Math.max(0, Math.floor((shotoku - kojo) / 1000) * 1000);
  return Math.round(kazei * KABE_CONFIG.taxRate1 * KABE_CONFIG.reconstructionSurtax);
}
export function residentTaxKabe(salary, insurance, o) {
  const shotoku = Math.max(0, salary - kyuyoKojo(salary));
  if (shotoku <= KABE_CONFIG.juminHikazeiShotoku) return 0;
  let kojo = KABE_CONFIG.juminKisoKojo + insurance;
  if (o.student && shotoku <= KABE_CONFIG.kinroGakuseiLimit) kojo += KABE_CONFIG.kinroGakuseiKojoRT;
  const kazei = Math.max(0, shotoku - kojo);
  return Math.max(0, Math.round(kazei * KABE_CONFIG.juminRate - KABE_CONFIG.juminChoseiKojo)) + KABE_CONFIG.juminKintowari;
}
export function calcKabe(salary, o) {
  const si = socialInsuranceKabe(salary, o);
  const it = incomeTaxKabe(salary, si.amount, o);
  const rt = residentTaxKabe(salary, si.amount, o);
  return { salary, insurance: si.amount, insuranceType: si.type, incomeTax: it, residentTax: rt, net: salary - si.amount - it - rt };
}
