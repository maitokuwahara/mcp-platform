import {
  createMcpHandler,
  McpServer,
} from "npm:@modelcontextprotocol/server@^2.0.0";

import { z } from "npm:zod@^4.3.6";

import { pipeline } from "npm:@supabase/middleware@1";

import {
  withOAuthProtectedResource,
  withSupabase,
} from "npm:@supabase/server@1";

Deno.serve(
  pipeline(
    [
      // OAuth 2.1 Discovery
      withOAuthProtectedResource(),

      // アクセストークンの検証
      withSupabase({ auth: "user" }),
    ],

    async (req, { userClaims }) => {
      const handler = createMcpHandler(() => {
        const server = new McpServer({
          name: "mcp-platform",
          version: "1.0.0",
        });

        server.registerTool(
          "hello",
          {
            title: "Hello Tool",
            description:
              "Returns a greeting message for an authenticated user",
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

        server.registerTool(
          "whoami",
          {
            title: "Who Am I",
            description:
              "Returns the authenticated user's identity",
            inputSchema: z.object({}),
          },
          async () => ({
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  id: userClaims?.sub,
                  email: userClaims?.email,
                }),
              },
            ],
          }),
        );

        return server;
      });

      return handler.fetch(req);
    },
  ),
);
