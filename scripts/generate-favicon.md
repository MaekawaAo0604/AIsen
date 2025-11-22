# favicon.ico 生成手順

`app/icon.svg` から `public/favicon.ico` を生成する方法です。

## 方法1: ImageMagick を使う（推奨）

```bash
# ImageMagick がインストールされている場合
convert app/icon.svg -resize 32x32 -background none public/favicon.ico
```

複数サイズを含める場合：
```bash
convert app/icon.svg \
  -resize 16x16 -background none favicon-16.png \
  -resize 32x32 -background none favicon-32.png \
  -resize 48x48 -background none favicon-48.png

# PNG から ICO へ
convert favicon-16.png favicon-32.png favicon-48.png public/favicon.ico
rm favicon-*.png
```

## 方法2: オンラインツールを使う

1. https://realfavicongenerator.net/ にアクセス
2. `app/icon.svg` をアップロード
3. 設定を調整（デフォルトでOK）
4. 生成された `favicon.ico` を `public/` に配置

## 方法3: Sharp (Node.js) を使う

```bash
npm install --save-dev sharp
```

```javascript
// scripts/generate-favicon.js
const sharp = require('sharp');
const fs = require('fs');

async function generateFavicon() {
  const svg = fs.readFileSync('app/icon.svg');

  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.ico');

  console.log('✓ favicon.ico generated');
}

generateFavicon();
```

実行：
```bash
node scripts/generate-favicon.js
```

## 注意

Next.js 13+ (App Router) では `app/icon.svg` を置くだけで自動的に favicon として配信されます。
`public/favicon.ico` は、古いブラウザ（IE11など）のフォールバック用です。

現代のブラウザでは SVG favicon をサポートしているため、ICO は必須ではありません。
