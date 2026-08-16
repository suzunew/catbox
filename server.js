const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const fileId = req.query.id;

  // 1. パラメータの検証
  if (!fileId) {
    return res.status(400).send('Error: ?id= parameter is required');
  }

  // 2. セキュリティバリデーション (ファイルIDの形式チェック)
  if (!/^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/.test(fileId)) {
    return res.status(400).send('Error: Invalid file ID format');
  }

  try {
    // 3. Catboxからファイルを取得
    const catboxUrl = `https://files.catbox.moe/${fileId}`;
    const catboxResponse = await fetch(catboxUrl);

    if (!catboxResponse.ok) {
      return res.status(catboxResponse.status).send(`Failed to fetch from Catbox. Status: ${catboxResponse.status}`);
    }

    // 4. Content-Typeの引き継ぎ
    const contentType = catboxResponse.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // 5. データのストリーミング
    // バッファを生成してレスポンスとして返す
    const buffer = await catboxResponse.buffer();
    
    return res.send(buffer);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).send('Internal Server Error: Unable to proxy file.');
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
