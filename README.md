# seiji-tools — くらしと制度のツール

政治見える化プロジェクトの「生活×制度」インタラクティブツール群。
[seiji-mieru.com/tools/](https://seiji-mieru.com/tools/) で公開。

| URL | 内容 |
|---|---|
| `/tools/` | ツール一覧 |
| `/tools/tedori/` | 手取りシミュレーター(年収→手取り内訳→所得税の使い道→社会保険料率の推移) |
| `/tools/kabe/` | 年収の壁シミュレーター(パート・扶養内向け。106万/119万/130万/178万円の壁) |

今後の消費税・年金などのツールもこのリポジトリに追加する。

## 開発

Node 20以上。

```bash
npm ci
npm run dev      # 開発サーバー(http://localhost:5173/tools/)
npm run build    # dist/ へビルド(base=/tools/)
npm run check    # 計算ロジックの回帰チェック(下記)
```

## 構成

```
index.html              … /tools/ インデックス(静的)
tedori/index.html       … 手取り エントリ(マウント先div + meta/OGP + フォントlink)
kabe/index.html         … 年収の壁 エントリ
src/
├ shared/
│ ├ seido.js            … 制度パラメータCONFIG(出典URL・確認日コメント付き)
│ ├ budget2026.js       … 令和8年度予算の按分データ(BUDGET/BUDGET_TOTAL)
│ ├ shahoHistory.js     … 社会保険料率の推移データ(HISTORY)
│ ├ calc.js             … 計算関数(kyuyoKojo/kisoKojo/socialInsurance/…)
│ ├ tokens.js           … デザイントークン(C, S)
│ └ ui.jsx              … Seg / Stepper / ExpandRow
├ tedori/main.jsx + App.jsx
└ kabe/main.jsx + App.jsx
vite.config.js          … rollupOptions.input に3エントリ
```

## 公開のしくみ

[seiji-mieru](https://github.com/AmashimaCreate/seiji-mieru) リポジトリ(ハブ)の `build.sh` が
本リポジトリを clone → `npm ci && npm run build` → `dist/` をハブの `dist/tools/` へコピーする。
Cloudflare Pages はハブ側のみ設定すればよい(このリポジトリ単体のデプロイ設定は不要)。

## 制度更新の運用メモ

- 制度パラメータは **`src/shared/seido.js` に集約**されている。税制改正・料率改定時はこのファイルのみ更新する。
- 値の変更時は必ず**出典URLと確認日をコメントで更新**すること。
- 予算按分(`budget2026.js`)・料率推移(`shahoHistory.js`)は年度データの追記・差し替えで対応する。
- 数値を更新したら `npm run check` の期待値も新しい正解値に更新して回す。
- **次回の定期確認ポイント:**
  - **2026年10月** — 106万円の壁(賃金要件)撤廃の政省令施行
  - **2027年1月** — 改正後の源泉徴収税額表の適用開始(「天引きへの反映は2027年1月から」という解説文言が役目を終える)
  - **2027年度** — 協会けんぽ料率・子ども・子育て支援金率の改定
  - **2027年9月** — 厚生年金の標準報酬月額上限 65万→68万円(`kouseiCapMonthly` と手取り側の「月収65万円ぶんで頭打ち」文言。以後 2028年9月71万・2029年9月75万)
