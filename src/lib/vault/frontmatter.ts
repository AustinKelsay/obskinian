/**
 * YAML frontmatter parsing and serialization for vault notes.
 * Supports basic key-value pairs, lists, booleans, and numbers.
 */

export type FrontmatterValue = string | number | boolean | string[];

export interface ParsedNote {
  frontmatter: Record<string, FrontmatterValue>;
  body: string;
}

/** Parses raw markdown into frontmatter and body */
export function parseNote(raw: string): ParsedNote {
  const trimmed = raw.startsWith("---") ? raw : raw;
  const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  return {
    frontmatter: parseYamlBlock(match[1]),
    body: match[2],
  };
}

/** Serializes frontmatter and body into raw markdown */
export function serializeNote(
  frontmatter: Record<string, FrontmatterValue>,
  body: string
): string {
  const keys = Object.keys(frontmatter);
  if (keys.length === 0) return body;

  const yaml = stringifyYamlBlock(frontmatter);
  const trimmedBody = body.startsWith("\n") ? body.slice(1) : body;
  return `---\n${yaml}---\n${trimmedBody}`;
}

/** Parses a simple YAML block into key-value pairs */
function parseYamlBlock(yaml: string): Record<string, FrontmatterValue> {
  const result: Record<string, FrontmatterValue> = {};
  const lines = yaml.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const keyMatch = line.match(/^([\w-]+):\s*(.*)$/);
    if (!keyMatch) {
      i += 1;
      continue;
    }

    const key = keyMatch[1];
    const rawValue = keyMatch[2].trim();

    if (rawValue === "") {
      const listItems: string[] = [];
      i += 1;
      while (i < lines.length && lines[i].match(/^\s+-\s+/)) {
        listItems.push(lines[i].replace(/^\s+-\s+/, "").trim());
        i += 1;
      }
      result[key] = listItems;
      continue;
    }

    result[key] = parseScalar(rawValue);
    i += 1;
  }

  return result;
}

/** Parses a YAML scalar value */
function parseScalar(value: string): FrontmatterValue {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/** Serializes frontmatter to a YAML block string (without delimiters) */
function stringifyYamlBlock(fm: Record<string, FrontmatterValue>): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(fm)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
    } else if (typeof value === "boolean") {
      lines.push(`${key}: ${value}`);
    } else if (typeof value === "number") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.length > 0 ? `${lines.join("\n")}\n` : "";
}

/** Builds a VaultFile body + frontmatter from raw disk content */
export function splitRawContent(raw: string): ParsedNote {
  return parseNote(raw);
}
