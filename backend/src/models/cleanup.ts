import { getDatabase } from '../db/connection';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function cleanupCompletedTasks(now: Date = new Date()): number {
  const cutoff = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS).toISOString();

  const result = getDatabase()
    .prepare(
      "DELETE FROM tasks WHERE completed = 1 AND completed_at IS NOT NULL AND datetime(completed_at) < datetime(?)",
    )
    .run(cutoff);

  return result.changes;
}
