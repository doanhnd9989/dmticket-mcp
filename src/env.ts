import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    DMTICKET_API_KEY: z.string().default(""),
    DMTICKET_API_URL: z.url().default("https://dmticket.com"),
    // Where to fetch the OpenAPI spec from. Defaults to `${DMTICKET_API_URL}/api/openapi.json`.
    DMTICKET_OPENAPI_URL: z.url().optional(),
    DMTICKET_ALLOW_SELF_SIGNED_CERT: z.enum(["true", "false"]).optional(),
    DMTICKET_MCP_TRANSPORT: z.enum(["stdio", "sse", "both"]).default("both"),
    DMTICKET_MCP_HOST: z.string().default("0.0.0.0"),
    DMTICKET_MCP_PORT: z.coerce.number().int().positive().default(3333),
    DMTICKET_MCP_SSE_PATH: z.string().default("/sse"),
    DMTICKET_MCP_MESSAGES_PATH: z.string().default("/messages"),
    DMTICKET_MCP_CORS_ORIGIN: z.string().default("*"),
    DMTICKET_MCP_SERVER_NAME: z.string().optional(),
    DMTICKET_MCP_SERVER_INSTRUCTIONS: z
      .string()
      .default(
        "This MCP server is connected to the user's live DMTicket workspace. Whenever the user asks about anything related to their DMTicket workspace — tags, contacts, conversations, broadcasts, flows, sequences, team members, inboxes, or any workspace data — you MUST use the available MCP tools to fetch real-time data. Do NOT answer from training knowledge or provide DMTicket product documentation.",
      ),
  },
  runtimeEnv: process.env,
})
