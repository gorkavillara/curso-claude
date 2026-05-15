// Hook PreToolUse (matcher Bash) del plugin acme-format.
// Lee el evento por stdin. Si el comando es un `git commit`, ejecuta `npm run lint`.
// Lint OK -> exit 0 (deja pasar). Lint KO -> exit 2 (Claude BLOQUEA el commit).
let buf = "";
process.stdin.on("data", (c) => (buf += c));
process.stdin.on("end", () => {
  let cmd = "";
  try {
    const e = JSON.parse(buf);
    cmd = (e.tool_input && e.tool_input.command) || "";
  } catch {
    process.exit(0); // evento no parseable -> no bloqueamos
  }
  if (!/\bgit\s+commit\b/.test(cmd)) process.exit(0); // no es commit -> pasa

  const r = require("child_process").spawnSync("npm", ["run", "lint"], {
    shell: true,
    cwd: process.cwd()
  });
  if (r.status === 0) process.exit(0); // lint OK -> commit pasa

  console.error("❌ acme-format: el lint (tsc --noEmit) falla. Commit bloqueado. Ejecuta `npm run lint`, corrige y reintenta.");
  process.exit(2); // lint KO -> Claude bloquea el commit
});
