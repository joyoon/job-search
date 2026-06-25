import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, runTool } from "./tools/index.js";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const SYSTEM_PROMPT = `You are a helpful agent with access to tools.
Think step by step. Use tools when they help you answer accurately.
When you have a final answer, reply with plain text and no further tool calls.`;

async function runAgent(userMessage, { maxSteps = 8 } = {}) {
  const messages = [{ role: "user", content: userMessage }];

  for (let step = 0; step < maxSteps; step++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages
    });

    messages.push({ role: "assistant", content: response.content });

    const toolCalls = response.content.filter((block) => block.type === "tool_use");

    if (toolCalls.length === 0) {
      const text = response.content.find((b) => b.type === "text")?.text ?? "";
      return text;
    }

    console.log(
      `[step ${step + 1}] calling tools:`,
      toolCalls.map((t) => `${t.name}(${JSON.stringify(t.input)})`).join(", ")
    );

    const toolResults = [];
    for (const call of toolCalls) {
      const result = await runTool(call.name, call.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: call.id,
        content: String(result)
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  return "Reached max steps without a final answer.";
}

const question = process.argv.slice(2).join(" ") || "What is 17 * 24, and save the result to a note called math.md?";

console.log(`User: ${question}\n`);
const answer = await runAgent(question);
console.log(`\nAgent: ${answer}`);
