Deno.serve((_req: Request) => {
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>MCP Platform Login</title>
      </head>
      <body>
        <h1>MCP Platform</h1>
        <h2>ログイン</h2>

        <p>Supabase OAuth認証画面のテストです。</p>

        <form>
          <div>
            <label>メールアドレス</label>
            <input type="email" name="email" required>
          </div>

          <div>
            <label>パスワード</label>
            <input type="password" name="password" required>
          </div>

          <button type="button">ログイン</button>
        </form>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
});
