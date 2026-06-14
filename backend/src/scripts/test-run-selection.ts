import dotenv from 'dotenv';
dotenv.config();

import { selectionService } from '../services/selection.service';

async function test() {
  try {
    const res = await selectionService.runSelection('4922f677-4e25-4f6d-b188-8d786e884fe4', 'fe6b8bd6-f2a8-4a5e-b7f0-197aa87acc0b');
    console.log('--- RUN SELECTION SUCCESS ---');
    console.log(JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error('--- RUN SELECTION ERROR ---');
    console.error(err.message);
  }
  process.exit(0);
}

test();
