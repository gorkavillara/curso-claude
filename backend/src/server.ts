import { createApp } from './app';
import { initDatabase } from './db/connection';

const PORT = Number(process.env.PORT ?? 3000);

function main(): void {
  initDatabase();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`TaskMaster-TS API listening on http://localhost:${PORT}`);
  });
}

main();
