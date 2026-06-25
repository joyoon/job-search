import fs from "node:fs/promises";
import path from "node:path";

// Each tool has: a JSON schema describing it to the LLM, and a run() function.

const NOTES_DIR = path.join(import.meta.dirname, "..", "notes");

export const toolDefinitions = [
  {
    name: "save_note",
    description: "Save a short text note to a file for later reference.",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "Name for the note file, e.g. 'findings.md'" },
        content: { type: "string", description: "The note content to save." }
      },
      required: ["filename", "content"]
    }
  },
  {
    name: "read_note",
    description: "Read back a previously saved note by filename.",
    input_schema: {
      type: "object",
      properties: {
        filename: { type: "string" }
      },
      required: ["filename"]
    }
  },
  {
    name: "calculate",
    description: "Evaluate a basic arithmetic expression, e.g. '12 * (3 + 4)'.",
    input_schema: {
      type: "object",
      properties: {
        expression: { type: "string" }
      },
      required: ["expression"]
    }
  }
];

export async function runTool(name, input) {
  switch (name) {
    case "save_note": {
      await fs.mkdir(NOTES_DIR, { recursive: true });
      const filePath = path.join(NOTES_DIR, input.filename);
      await fs.writeFile(filePath, input.content, "utf8");
      return `Saved note to ${input.filename}`;
    }
    case "read_note": {
      const filePath = path.join(NOTES_DIR, input.filename);
      return await fs.readFile(filePath, "utf8");
    }
    case "calculate": {
      if (!/^[\d\s+\-*/().]+$/.test(input.expression)) {
        return "Error: expression contains disallowed characters.";
      }
      return String(Function(`"use strict"; return (${input.expression});`)());
    }
    default:
      return `Error: unknown tool "${name}"`;
  }
}
