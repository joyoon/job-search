# agent-demo

A minimal example of agentic AI: an LLM that plans, calls tools, observes results,
and loops until it has a final answer (the ReAct pattern).

## How it works

- `index.js` runs the agent loop: send messages to Claude, check if it wants to
  call a tool, run the tool, feed the result back, repeat until it answers in
  plain text.
- `tools/index.js` defines the available tools (`save_note`, `read_note`,
  `calculate`) as JSON schemas plus the functions that actually execute them.

## Setup

```bash
cd agent-demo
npm install
cp .env.example .env   # then add your ANTHROPIC_API_KEY
npm start "What is 17 * 24, and save the result to a note called math.md?"
```

## Ideas to extend

- Add a `web_search` or `fetch_url` tool for research tasks.
- Add a `planner` step that breaks the task into subtasks before acting.
- Cap tool calls per step and add retry/error-handling around tool failures.
- Swap the single agent for two agents (planner + executor) that pass messages
  to each other.
