# スバル検定クイズ

QR コードを読み取ると、指定した級からランダムに3問出題されます。

- `index.html?level=3` で3級から出題します。`2`・`1` も同じです。`level` を指定しなければ全級から出題します。

## 問題を更新する
```
python3 scripts/build_questions.py <問題案のExcel>
```
`questions.json` が作り直されるので、commit して push します。

## 公開（GitHub Pages）
1. このフォルダを GitHub リポジトリに push する
2. Settings → Pages → Branch を `main` / `(root)` にして保存
3. 初回のみ `pip3 install "qrcode[pil]"` を実行してから、表示された URL で QR を作る
```
python3 scripts/make_qr.py https://<ユーザー名>.github.io/subaru-quiz/
```
`qr/level3.png` などができます。

## 手元で確認する
```
python3 -m http.server 8000
```
ブラウザで http://localhost:8000/?level=3 を開く。
