/* ============================================================
   制度パラメータ CONFIG — 政治見える化プロジェクト くらしと制度のツール共通
   税制改正・料率改定時はこのファイルのみ更新する。
   値を変えるときは必ず出典URLと確認日コメントもあわせて更新すること。
   次回の定期確認ポイント:
   - 2026年10月: 106万円の壁(賃金要件)撤廃の政省令施行
   - 2027年度: 協会けんぽ料率・子ども・子育て支援金率の改定
   ============================================================ */

/* ---------- 手取りシミュレーター用(制度パラメータ確認日: 2026-06-12(令和8年分・令和8年度)) ---------- */
export const TEDORI_CONFIG = {
  kyuyoKojoMin: 740000,
  kisoKojoTiers: [
    { limit: 4890000, amount: 1040000 },
    { limit: 6550000, amount: 670000 },
    { limit: 23500000, amount: 620000 },
  ],
  taxBrackets: [
    { limit: 1950000, rate: 0.05, deduct: 0 },
    { limit: 3300000, rate: 0.10, deduct: 97500 },
    { limit: 6950000, rate: 0.20, deduct: 427500 },
    { limit: 9000000, rate: 0.23, deduct: 636000 },
    { limit: 18000000, rate: 0.33, deduct: 1536000 },
    { limit: 40000000, rate: 0.40, deduct: 2796000 },
    { limit: Infinity, rate: 0.45, deduct: 4796000 },
  ],
  reconstructionSurtax: 1.021,
  haiguKojo: [{ limit: 9000000, it: 380000, rt: 330000 }, { limit: 9500000, it: 260000, rt: 220000 }, { limit: 10000000, it: 130000, rt: 110000 }],
  fuyoIppan: { it: 380000, rt: 330000 },
  fuyoTokutei: { it: 630000, rt: 450000 },
  juminKisoKojo: 430000,
  juminRate: 0.10,
  juminKintowari: 5000,
  juminChoseiKojo: 2500,
  kenpoRate: 0.0495, // 健康保険 本人負担分(令和8年度 全国平均9.90%の折半)
  kaigoRate: 0.0081, // 介護保険 本人負担分(令和8年度 1.62%の折半)
  shienRate: 0.00115, // 子ども・子育て支援金 本人負担分(令和8年度 0.23%の折半)
  kenpoCapMonthly: 1390000,
  kouseiRate: 0.0915,
  kouseiCapMonthly: 650000,
  koyoRate: 0.005, // 雇用保険 労働者負担(令和8年度・一般の事業)
  sources: {
    nta: { url: "https://www.nta.go.jp/publication/pamph/gensen/2026kaisei.pdf", label: "国税庁(令和8年改正)" },
    soumu: { url: "https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/150790_06.html", label: "総務省(住民税)" },
    kenpo: { url: "https://www.kyoukaikenpo.or.jp/g7/cat330/sb3150/", label: "協会けんぽ(保険料率)" },
    nenkin: { url: "https://www.nenkin.go.jp/", label: "日本年金機構" },
    mhlw: { url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000108634.html", label: "厚生労働省(雇用保険)" },
    mof: { url: "https://www.mof.go.jp/policy/budget/budger_workflow/budget/fy2026/index.html", label: "財務省 令和8年度予算" },
    kenpoSuii: { url: "https://www.kyoukaikenpo.or.jp/shibu/osaka/public_relations/013", label: "協会けんぽ 保険料率の推移" },
  },
};

/* ---------- 年収の壁シミュレーター用(制度パラメータ確認日: 2026-06-12) ---------- */
export const KABE_CONFIG = {
  taxYear: 2026, // 令和8年分
  kyuyoKojoMin: 740000, // 給与所得控除 最低保障74万(恒久69万+令和8・9年特例5万)
  kisoKojo: 1040000, // 基礎控除 本則62万+特例42万(対象範囲〜300万円では常に満額)
  taxRate1: 0.05,
  reconstructionSurtax: 1.021,
  kinroGakuseiKojo: 270000,
  kinroGakuseiLimit: 890000, // 令和8年分から合計所得89万円以下
  juminKisoKojo: 430000,
  juminHikazeiShotoku: 450000, // 単身の非課税限度額(1級地)
  juminRate: 0.10,
  juminKintowari: 5000,
  juminChoseiKojo: 2500, // 調整控除(概算)
  kinroGakuseiKojoRT: 260000, // 勤労学生控除(住民税)
  shahoWageThreshold: 1060000, // 賃金要件(月8.8万円)。令和8年10月1日施行予定で撤廃(政省令は意見募集段階)
  shahoRate: 0.147, // 本人負担の概算: 健保4.95+厚年9.15+雇用0.5+支援金0.115=14.715%(令和8年度)
  fuyo130: 1300000,
  kokuminNenkin: 17920 * 12, // 令和8年度月額17,920円
  sources: {
    mof: { url: "https://www.mof.go.jp/tax_policy/tax_reform/outline/index.html", label: "財務省(税制改正)" },
    nta: { url: "https://www.nta.go.jp/publication/pamph/gensen/2026kaisei.pdf", label: "国税庁(令和8年改正)" },
    soumu: { url: "https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/150790_06.html", label: "総務省(住民税)" },
    nenkinTanjikan: { url: "https://www.nenkin.go.jp/service/kounen/tekiyo/jigyosho/tanjikan.html", label: "日本年金機構(社会保険の加入条件)" },
    nenkinFuyo: { url: "https://www.nenkin.go.jp/service/kounen/jigyosho-hiho/hihokensha1/20141204.html", label: "日本年金機構(扶養の条件)" },
  },
};
