import dotenv from 'dotenv';
dotenv.config();

import { scholarshipService } from '../services/scholarship.service';
import { supabaseAdmin } from '../config/supabase';

async function test() {
  try {
    // Let's find a valid application ID with status TERVERIFIKASI
    const { data: apps } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('status', 'TERVERIFIKASI')
      .limit(1);

    if (!apps || apps.length === 0) {
      console.log('No TERVERIFIKASI applications found.');
      process.exit(1);
    }

    const appId = apps[0].id;
    console.log(`Testing with application ID: ${appId}`);

    // Update status to DITERIMA
    console.log('Updating status to DITERIMA...');
    const res = await scholarshipService.updateApplicationStatus(appId, 'DITERIMA');
    console.log('Update return value:', res);

    // Fetch selection_results to verify
    const { data: selRes } = await supabaseAdmin
      .from('selection_results')
      .select('*')
      .eq('application_id', appId)
      .single();

    console.log('Selection result after DITERIMA:', selRes);

    // Revert status to TERVERIFIKASI
    console.log('Reverting status to TERVERIFIKASI...');
    await scholarshipService.updateApplicationStatus(appId, 'TERVERIFIKASI');

    const { data: selResReverted } = await supabaseAdmin
      .from('selection_results')
      .select('*')
      .eq('application_id', appId)
      .maybeSingle();

    console.log('Selection result after reverting (should be null):', selResReverted);

  } catch (err: any) {
    console.error('Error during test:', err);
  }
  process.exit(0);
}

test();
