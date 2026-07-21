import { ScoutService } from '../services/scout.service';
import { initDatabase } from '../database/db';

export async function testScoutService() {
  await initDatabase();
  const service = new ScoutService();
  const status = service.getStatus();
  console.log('[Test Passed] Database status:', status);
}

if (require.main === module) {
  testScoutService();
}


