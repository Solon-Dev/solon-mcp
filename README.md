# solon-mcp

MCP server for [Solon AI](https://solonreview.dev) — enforce your team's coding standards directly from Claude Code or Cursor.

## Tools

- **solon_check_standards** — Check code against your team's playbook rules
- **solon_get_playbook** — Get the enabled rules for a connected repo
- **solon_record_review** — Record a review to the Solon AI dashboard

## Setup

1. Get your API key at [solonreview.dev/dashboard/settings](https://solonreview.dev/dashboard/settings)

2. Add to your Claude Code or Cursor MCP config:
```json
{
  "mcpServers": {
    "solon-ai": {
      "command": "npx",
      "args": ["-y", "solon-mcp"],
      "env": {
        "SOLON_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

3. Connect your GitHub repos at [solonreview.dev/dashboard](https://solonreview.dev/dashboard)

## Usage

Once connected, ask Claude Code or Cursor:

- "Check this code against our team standards for myorg/myrepo"
- "What playbook rules are enabled for myorg/myrepo?"
