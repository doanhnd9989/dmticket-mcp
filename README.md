# DMTicket MCP Server

[Model Context Protocol](https://modelcontextprotocol.io) server for **[DMTicket](https://dmticket.com)** — the omnichannel customer-messaging & CRM platform (Zalo, Facebook, Telegram, groups & communities).

It gives AI agents (Claude, Cursor, ChatGPT, custom agents…) live access to a DMTicket workspace: contacts, conversations, messages, tags, custom fields, broadcasts, sequences, flows, triggers and webhooks — so an agent can read, segment, message and automate on your behalf.

## How it works

On startup the server fetches `${DMTICKET_API_URL}/api/public-spec.json` (the DMTicket OpenAPI spec) and **auto-generates one MCP tool per API operation**. When DMTicket adds a new endpoint, it becomes an MCP tool on the next restart — no code changes needed.

## 1. Get your DMTicket API token

1. Sign in to your DMTicket workspace at **https://dmticket.com**
2. Go to **Settings → Integrations → Workspace Token**
3. Click **Generate** (or **Regenerate**) and **Copy** the token — it looks like `wsId.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

The token is scoped to that one workspace and grants access to its public API. Keep it secret; regenerate any time to revoke.

> API base URL: `https://dmticket.com/api` · Auth header: `Authorization: Bearer <token>`
> Quick test: `curl https://dmticket.com/api/v1/contacts -H "Authorization: Bearer <token>"`

## 2. Install

```bash
git clone https://github.com/doanhnd9989/dmticket-mcp.git
cd dmticket-mcp
npm install
npm run build     # outputs dist/
```

## 3. Configure your agent

Set two environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `DMTICKET_API_KEY` | ✅ | — | Your workspace token from step 1 |
| `DMTICKET_API_URL` | — | `https://dmticket.com` | Your DMTicket origin |
| `DMTICKET_MCP_TRANSPORT` | — | `both` | `stdio`, `sse`, or `both` |

### Claude Code / Claude Desktop

```bash
claude mcp add dmticket \
  -e DMTICKET_API_KEY=<your-workspace-token> \
  -e DMTICKET_API_URL=https://dmticket.com \
  -- node /absolute/path/to/dmticket-mcp/dist/index.mjs
```

Or in `claude_desktop_config.json` / `.mcp.json`:

```json
{
  "mcpServers": {
    "dmticket": {
      "command": "node",
      "args": ["/absolute/path/to/dmticket-mcp/dist/index.mjs"],
      "env": {
        "DMTICKET_API_KEY": "<your-workspace-token>",
        "DMTICKET_API_URL": "https://dmticket.com"
      }
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "dmticket": {
      "command": "node",
      "args": ["/absolute/path/to/dmticket-mcp/dist/index.mjs"],
      "env": { "DMTICKET_API_KEY": "<your-workspace-token>" }
    }
  }
}
```

### Remote (SSE) mode

```bash
DMTICKET_API_KEY=<token> DMTICKET_MCP_TRANSPORT=sse DMTICKET_MCP_PORT=3333 node dist/index.mjs
# then point your agent at http://<host>:3333/sse
```

## Tools

Tool names are the OpenAPI `operationId` in `snake_case` — e.g. `list_contacts`, `create_contact`, `add_contact_tag`, `list_conversations`, `send_contact_message`, `list_broadcasts`, `create_broadcast`, `list_flows`, `list_tags`, `create_webhook`, … The full set is generated live from the spec, so it always matches your DMTicket version.

## Security

- The token is a per-workspace credential — treat it like a password. Do not commit it.
- The server only talks to your configured `DMTICKET_API_URL`.
- Revoke by regenerating the workspace token in DMTicket settings.

## License

ISC. This is the MCP integration for DMTicket (https://dmticket.com).
