# DMTicket MCP Server

[Model Context Protocol](https://modelcontextprotocol.io) server for **[DMTicket](https://dmticket.com)** — the omnichannel customer-messaging & CRM platform (Zalo, Facebook, Telegram, groups & communities).

It gives AI agents (Claude, Cursor, ChatGPT, custom agents…) live access to a DMTicket account: contacts, conversations, messages, labels, custom attributes, inboxes, teams, agents, canned responses, automation and reports — so an agent can read, segment, message and automate on your behalf.

## Build the automation, don't just read the data

Most helpdesk integrations stop at "list my conversations". DMTicket exposes the pieces an agent needs to stand up a working business process on its own:

- **Data sources** — register a connection to a Lark sheet, PostgreSQL, or MySQL. The agent references it *by name*; the credentials stay server-side and are never handed to the model. Reads only — SQL that is not a single `SELECT` is rejected.
- **Scheduled flows** — automation that fires on a cron schedule rather than waiting for a conversation to exist. Read rows, filter them, extract fields, skip what was already handled, then draft or send.
- **Dry run** — `POST /scheduled_flows/{id}/run` defaults to a dry run: the pipeline executes for real, but actions are reported instead of performed. An agent can show you exactly what a flow will send before it sends anything.
- **Durable dedupe** — `automation_states` claims a key atomically, so a restart, a redeploy, or an overlapping run never processes the same row twice.

Hand an agent your token and this server, describe the process in plain language, and it can build and test the automation end to end.

## How it works

On startup the server fetches the DMTicket OpenAPI spec from `https://dmticket.com/api/openapi.json` and **auto-generates one MCP tool per API operation** — 129 tools at the time of writing. When DMTicket adds a new endpoint, it becomes an MCP tool on the next restart, with no code changes here.

Point it somewhere else with `DMTICKET_OPENAPI_URL` if you self-host.

## 1. Get your DMTicket API token

1. Sign in to your DMTicket account at **https://app.dmticket.com**
2. Click your avatar (bottom-left) → **Profile settings**
3. Scroll to the bottom and copy the **Access Token**

The token carries your own permissions, so an agent using it can do exactly what you can — no more. Keep it secret; regenerate from the same screen to revoke.

> API base URL: `https://app.dmticket.com` · Auth header: `api-access-token: <token>`
> Quick test: `curl https://app.dmticket.com/api/v1/profile -H "api-access-token: <token>"`
>
> Spell the header with **dashes**. Rails maps `api-access-token` and `api_access_token` to the same value, but proxies strip headers containing underscores, so the underscored spelling arrives empty and every call 401s.

Most endpoints are scoped to one account, so you also need your numeric account id — it is the number in the app URL, e.g. `app.dmticket.com/app/accounts/**3**/dashboard`.

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

Tool names are the OpenAPI `operationId` in `snake_case` — e.g. `list_contacts`, `create_contact`, `list_conversations`, `create_message`, `create_data_source`, `query_data_source`, `create_scheduled_flow`, `run_scheduled_flow`, `list_scheduled_flow_runs`, `claim_automation_state`, `create_webhook`, … The full set is generated live from the spec, so it always matches your DMTicket version.

## Security

- The token is a per-workspace credential — treat it like a password. Do not commit it.
- The server only talks to your configured `DMTICKET_API_URL`.
- Revoke by regenerating the workspace token in DMTicket settings.

## License

ISC. This is the MCP integration for DMTicket (https://dmticket.com).
