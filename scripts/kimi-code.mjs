#!/usr/bin/env node
/**
 * Run coding tasks with Kimi K2.6 (Moonshot API).
 *
 * Setup:
 *   export MOONSHOT_API_KEY="sk-..."   # from https://platform.moonshot.ai
 *   # China: export MOONSHOT_BASE_URL="https://api.moonshot.cn/v1"
 *
 * Usage:
 *   node scripts/kimi-code.mjs "Refactor this function to use async/await"
 *   node scripts/kimi-code.mjs --file src/App.tsx "Add loading state"
 *   echo "Write a React hook for debounced search" | node scripts/kimi-code.mjs
 */

const BASE_URL = (process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1').replace(/\/$/, '');
const API_KEY = process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY;

const SYSTEM = `You are an expert software engineer. Write clear, production-ready code.
Match the user's stack and conventions. Prefer minimal, correct changes over verbose explanations.
When editing existing code, show complete updated snippets or diffs the user can apply directly.`;

function parseArgs(argv) {
  const files = [];
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--file' || argv[i] === '-f') {
      files.push(argv[++i]);
    } else {
      positional.push(argv[i]);
    }
  }
  return { files, prompt: positional.join(' ').trim() };
}

async function readStdin() {
  if (process.stdin.isTTY) return '';
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

async function loadFileContext(paths) {
  const fs = await import('fs/promises');
  const parts = [];
  for (const p of paths) {
    const content = await fs.readFile(p, 'utf8');
    parts.push(`--- ${p} ---\n${content}`);
  }
  return parts.join('\n\n');
}

async function main() {
  if (!API_KEY) {
    console.error('Missing MOONSHOT_API_KEY. Get one at https://platform.moonshot.ai/console/api-keys');
    process.exit(1);
  }

  const { files, prompt: argPrompt } = parseArgs(process.argv);
  const stdinPrompt = await readStdin();
  let prompt = argPrompt || stdinPrompt;

  if (!prompt) {
    console.error('Usage: node scripts/kimi-code.mjs [--file path] "your coding task"');
    process.exit(1);
  }

  if (files.length > 0) {
    const context = await loadFileContext(files);
    prompt = `Context files:\n\n${context}\n\nTask:\n${prompt}`;
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'kimi-k2.6',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'enabled' },
      max_completion_tokens: 8192,
      temperature: 1,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(data?.error?.message || res.statusText);
    process.exit(1);
  }

  const msg = data.choices?.[0]?.message;
  if (msg?.reasoning_content) {
    console.error('--- thinking ---\n' + msg.reasoning_content + '\n--- answer ---\n');
  }
  console.log(msg?.content ?? '(empty response)');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
