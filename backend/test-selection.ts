import dotenv from 'dotenv';
dotenv.config();
import { selectionService } from './src/services/selection.service';

async function run() {
  const programId = '1f40991c-9d61-4f9d-a9c3-2e149bc03c82'; // Beasiswa Perguruan Tinggi
  const actorId = '81b4b7a0-f01c-4d74-abd5-3a7cc49b1aeb'; // some user id (doesn't matter much for test)
  
  try {
    console.log('Running selection...');
    const result = await selectionService.runSelection(programId, actorId);
    console.log('Selection run success, total candidates:', result.total_candidates);
    console.log('Ranking:', result.ranking.map(r => ({ name: r.full_name, rank: r.rank, rec: r.status_rekomendasi })));
    
    console.log('Finalizing selection...');
    const finalizeResult = await selectionService.finalizeSelection(programId, actorId);
    console.log('Finalize success:', finalizeResult);
  } catch (err: any) {
    console.error('Error occurred:', err.message);
  }
}
run();
