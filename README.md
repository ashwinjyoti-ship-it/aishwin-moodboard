# Aishwin Mood Board

A mood board generator app for health & wellness websites. Built with React + TypeScript + Vite.

## Kimi K2.6 API (coding & vision)

This project uses [Moonshot Kimi K2.6](https://platform.moonshot.ai) for inspiration image analysis (vision) and includes a CLI for general coding tasks.

### 1. Get an API key

1. Sign in at [platform.moonshot.ai](https://platform.moonshot.ai)
2. Create an API key in the console
3. Export it:

```bash
export MOONSHOT_API_KEY="sk-..."
```

If you are in China, use the domestic endpoint:

```bash
export MOONSHOT_BASE_URL="https://api.moonshot.cn/v1"
```

### 2. Code from the terminal

```bash
npm run kimi:code -- "Add TypeScript types to the project context hook"
npm run kimi:code -- --file src/App.tsx "Extract step routing into a separate component"
```

Thinking mode is enabled by default for harder coding tasks. The API is [OpenAI-compatible](https://platform.moonshot.ai/docs/api/chat): model `kimi-k2.6`, base URL `https://api.moonshot.ai/v1`.

### 3. Mood board image analysis (Worker)

Set the secret on your Cloudflare Worker (never in the frontend):

```bash
wrangler secret put MOONSHOT_API_KEY
```

Optional:

```bash
wrangler secret put MOONSHOT_BASE_URL   # e.g. https://api.moonshot.cn/v1
```

Step 4 (inspiration images) calls `POST /api/analyze-image`, which uses Kimi K2.6 vision to suggest mood words and palette colors.

### OpenAI SDK example (any project)

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["MOONSHOT_API_KEY"],
    base_url="https://api.moonshot.ai/v1",
)

completion = client.chat.completions.create(
    model="kimi-k2.6",
    messages=[{"role": "user", "content": "Write a React hook for debounced search"}],
    extra_body={"thinking": {"type": "enabled"}},
)
print(completion.choices[0].message.content)
```

For fast replies without extended reasoning, use `thinking: {"type": "disabled"}`.
