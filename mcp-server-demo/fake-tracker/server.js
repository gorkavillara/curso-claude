import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "node:fs";

const tickets = JSON.parse(readFileSync(new URL("./tickets.json", import.meta.url)));
const server = new McpServer({ name: "fake-tracker", version: "1.0.0" });

server.registerTool(
  "get_ticket",
  {
    description: "Devuelve título, estado y descripción de un ticket por su id (ej. EV-101).",
    inputSchema: { id: z.string() }
  },
  async ({ id }) => {
    const t = tickets[id];
    return { content: [{ type: "text", text: t ? JSON.stringify(t, null, 2) : "Ticket no encontrado" }] };
  }
);

server.registerTool(
  "search_tickets",
  {
    description: "Busca tickets por texto (read-only).",
    inputSchema: { q: z.string() }
  },
  async ({ q }) => {
    const hits = Object.entries(tickets)
      .filter(([, t]) => (t.title + t.desc).toLowerCase().includes(q.toLowerCase()))
      .map(([id]) => id);
    return { content: [{ type: "text", text: hits.join(", ") || "Sin resultados" }] };
  }
);

server.registerTool(
  "deploy",
  {
    description: "Despliega un entorno (WRITE, peligrosa).",
    inputSchema: { env: z.string() }
  },
  async ({ env }) => {
    // Simulado: NO despliega nada de verdad.
    return { content: [{ type: "text", text: `[SIMULADO] deploy(${env}) ejecutado` }] };
  }
);

await server.connect(new StdioServerTransport());
