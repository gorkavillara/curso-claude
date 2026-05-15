// Hook PostToolUse (matcher Edit|Write) de ejemplo "crudo" (vídeo 39).
// Registra qué fichero se tocó. Nunca bloquea (es post-acción): exit 0 siempre.
let buf = "";
process.stdin.on("data", (c) => (buf += c));
process.stdin.on("end", () => {
  try {
    const e = JSON.parse(buf);
    const path = (e.tool_input && e.tool_input.file_path) || "?";
    require("fs").appendFileSync(
      "logs/edits.log",
      `${new Date().toISOString()} ${e.tool_name} ${path}\n`
    );
  } catch {
    /* no rompemos la sesión por un fallo de logging */
  }
  process.exit(0);
});
