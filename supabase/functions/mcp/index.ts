import {
  createMcpHandler,
  McpServer,
} from "npm:@modelcontextprotocol/server@^2.0.0";

import { z } from "npm:zod@^4.3.6";

const handler = createMcpHandler(() => {
  const server = new McpServer({
    name: "mcp-platform",
    version: "1.0.0",
  });

  server.registerTool(
    "hello",
    {
      title: "Hello Tool",
      description: "Returns a greeting message",
      inputSchema: z.object({
        name: z.string(),
      }),
    },
    async ({ name }) => ({
      content: [
        {
          type: "text",
          text: `Hello, ${name}!`,
        },
      ],
    }),
  );

  return server;
});

Deno.serve((req) => handler.fetch(req));
