# Vercel Status Line Setup

Display real-time Vercel deployment status in your Claude Code status bar.

## Setup

1. Get your Vercel token from [vercel.com/account/tokens](https://vercel.com/account/tokens)

2. Get your project ID from Vercel dashboard (Project Settings → General)

3. Add to your shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
export VERCEL_TOKEN="your-token-here"
export VERCEL_PROJECT_ID="your-project-id"
```

4. Add to your Claude Code settings (`~/.claude/settings.json`):
```json
{
  "statusLine": {
    "command": "bash -c 'if [ -z \"$VERCEL_TOKEN\" ] || [ -z \"$VERCEL_PROJECT_ID\" ]; then echo \"▲ Vercel: Not configured\"; exit 0; fi; RESP=$(curl -s -H \"Authorization: Bearer $VERCEL_TOKEN\" \"https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&limit=1\"); STATE=$(echo $RESP | jq -r \".deployments[0].state // \\\"unknown\\\"\"); URL=$(echo $RESP | jq -r \".deployments[0].url // \\\"--\\\"\"); case $STATE in READY) ICON=\"✅\";; BUILDING) ICON=\"🔨\";; ERROR) ICON=\"❌\";; QUEUED) ICON=\"⏳\";; *) ICON=\"❓\";; esac; echo \"▲ Vercel $ICON $STATE | $URL\"'",
    "refreshInterval": 30000
  }
}
```

## What It Shows

```
▲ Vercel ✅ READY | my-app-abc123.vercel.app
```

| Icon | State |
|------|-------|
| ✅ | Ready (deployed successfully) |
| 🔨 | Building |
| ❌ | Error |
| ⏳ | Queued |

## Troubleshooting

**"Not configured"**: Set `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` environment variables.

**No updates**: Check that your token has read access to the project.

**Rate limits**: The status refreshes every 30 seconds. Vercel allows 100 requests/hour on free tier.
