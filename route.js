export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  // 1. idパラメータが存在するかチェック
  if (!fileId) {
    return new Response('Error: ?id= parameter is required', { status: 400 });
  }

  // セキュリティ対策（パストラバーサルや不正な文字列の防止などが必要な場合はここでバリデーション）
  // Catboxのファイル名・拡張子の形式に一致するか確認
  if (!/^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/.test(fileId)) {
    return new Response('Error: Invalid file ID format', { status: 400 });
  }

  try {
    // 2. Catboxからファイルを取得する
    const catboxUrl = `https://files.catbox.moe/${fileId}`;
    const catboxResponse = await fetch(catboxUrl);

    if (!catboxResponse.ok) {
      return new Response(`File not found on Catbox (Status: ${catboxResponse.status})`, { 
        status: catboxResponse.status 
      });
    }

    // 3. Catboxからのレスポンスヘッダーやデータを取得
    const contentType = catboxResponse.headers.get('content-type') || 'application/octet-stream';
    const buffer = await catboxResponse.arrayBuffer();

    // 4. ブラウザに返すレスポンスを構築
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // 必要に応じてインライン表示（画像やPDFなど）にするか、ダウンロードさせるかを制御
        // 例: 'Content-Disposition': `inline; filename="${fileId}"`
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
