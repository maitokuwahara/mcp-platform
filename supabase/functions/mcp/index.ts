Deno.serve(async (req: Request) => {
  return new Response(
    JSON.stringify({
      message: "Hello from mcp-platform",
      method: req.method,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});
