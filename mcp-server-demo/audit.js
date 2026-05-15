// Hook PreToolUse: registra cada llamada a una tool de fake-tracker.
// Recibe el evento por stdin (JSON). Sale 0 = deja pasar; 2 = bloquea.
let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  try {
    const e = JSON.parse(input);
    const line = `${new Date().toISOString()} ${e.tool_name} ${JSON.stringify(e.tool_input || {})}\n`;
    require("fs").appendFileSync("logs/mcp-audit.log", line);
  } catch {
    /* si el evento no parsea, no bloqueamos la sesión */
  }
  process.exit(0);
});
