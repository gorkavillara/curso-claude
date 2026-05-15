// Hook PreToolUse (matcher Bash) de ejemplo "crudo" (vídeo 39).
// Bloquea cualquier `git push --force` / `-f`. Resto pasa.
let buf = "";
process.stdin.on("data", (c) => (buf += c));
process.stdin.on("end", () => {
  let cmd = "";
  try {
    cmd = (JSON.parse(buf).tool_input || {}).command || "";
  } catch {
    process.exit(0);
  }
  if (/\bgit\s+push\b.*(--force|\s-f\b)/.test(cmd)) {
    console.error("⛔ guard.js: `git push --force` bloqueado por política.");
    process.exit(2);
  }
  process.exit(0);
});
