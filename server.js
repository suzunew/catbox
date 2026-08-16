const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const fileId = req.query.id;

  // 1. idパラメータが存在するかチェック
  if (!fileId) {
    return res.status(400).send('Error: ?id= parameter is required');
  }

  // セキュリティ対策（不正な文字列やパストラバーサルを防ぐための簡易バリデーション）
  if (!/^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/.test(fileId)) {
    return res.status(400).send('Error: Invalid file ID format');
  }

  try {
    // 2. Catboxからファイルを取得
    const catboxUrl = `https://files.catbox.moe/${fileId}`;
    const catboxResponse = await fetch(catboxUrl);

    if (!catboxResponse.ok) {
      return res.status(catboxResponse.status).send(`File not found on Catbox (Status: ${catboxResponse.status})`);
    }

    // 3. Content-Typeを取得してクライアントに転送
    const contentType = catboxResponse.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // 画像やPDFなどをブラウザで直接表示させたい場合（必要に応じて有効化）
    // res.setHeader('Content-Disposition', `inline; filename="${fileId}"`);

    // ArrayBufferに変換して送信
    const arrayBuffer = await catboxResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return res.send(buffer);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
