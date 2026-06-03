describe('Fund Report & Verification Flow', () => {
  before(() => {
    // 1. Prepare data by running selection and finalizing it as Admin
    // This turns top students into 'DITERIMA' state, allowing them to report fund usage
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@simba.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');

    cy.get('a[href="/admin/seleksi"]').click();
    cy.url().should('include', '/admin/seleksi');
    cy.get('select').should('not.have.value', '');
    cy.wait(2000);
    
    // Self-healing check: if already finalized, click Batalkan Pengesahan first so we can finalize cleanly
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Batalkan Pengesahan")').length > 0) {
        cy.get('button').contains('Batalkan Pengesahan').click();
        cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', 'Pengesahan berhasil dibatalkan');
      }
    });

    cy.get('button').contains('Jalankan Kalkulasi Kelayakan').click();
    cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', 'Kalkulasi selesai');
    cy.get('button').contains('Sahkan Hasil Seleksi Final').click();
    cy.get('button').contains('Ya, Sahkan Hasil').click();
    cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', '✓ Hasil Seleksi Telah Disahkan');

    // Logout
    cy.get('aside button').contains('Keluar').click({ force: true });
  });

  it('should allow accepted student to submit monthly report', () => {
    // 2. Login as Ani Lestari (which ranked highly and is now DITERIMA)
    cy.visit('/login');
    cy.get('input[type="email"]').type('ani@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // 3. Go to Laporan Dana Page
    cy.get('a[href="/laporan-dana"]').click();
    cy.url().should('include', '/laporan-dana');
    cy.get('h1').should('contain', 'Laporan Penggunaan Dana');

    // 4. Fill in report form
    cy.get('select').first().select('Juni');
    cy.get('select').eq(1).select('Peralatan Akademik');
    cy.get('input[type="number"]').type('450000');
    cy.get('textarea').type('Buku referensi Algoritma & Struktur Data');

    // Select mock file
    const mockFileContent = 'mock text for receipt';
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(mockFileContent),
      fileName: 'receipt.pdf',
      mimeType: 'application/pdf',
    });

    cy.get('button[type="submit"]').click();

    // 5. Verify success banner & new row in history table
    cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', 'Laporan penggunaan dana berhasil dikirim');
    cy.get('.border-gray-100').should('contain', 'Juni');
    cy.get('.border-gray-100').should('contain', 'Menunggu Verifikasi');

    // Logout
    cy.get('aside button').contains('Keluar').click({ force: true });
  });

  it('should allow admin to verify student report and lock it (BR-30)', () => {
    // 6. Login as Admin again
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@simba.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // 7. Go to Admin Laporan Dana verification
    cy.get('a[href="/admin/laporan-dana"]').click();
    cy.url().should('include', '/admin/laporan-dana');
    cy.get('h1').should('contain', 'Verifikasi Laporan Dana Bulanan');

    // 8. Find Ani\'s report (it is marked as "Menunggu Verifikasi")
    cy.get('tbody').should('contain', 'Ani Lestari');
    cy.get('tbody tr').contains('Ani Lestari').parent().parent().within(() => {
      cy.get('button').contains('Tinjau').click();
    });

    // 9. Approve report
    cy.get('h3').should('contain', 'Tinjau Laporan Bulanan');
    cy.get('button').contains('Setujui Laporan').click();

    // 10. Verify state is locked as "Valid" (BR-30 constraint test)
    cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', 'Laporan berhasil diverifikasi');
    
    // Find the report again, verify status is Valid
    cy.get('tbody tr').contains('Ani Lestari').parent().parent().within(() => {
      cy.get('span').should('contain', 'Valid');
      cy.get('button').contains('Detail').click();
    });

    // Verify detail view displays locking message and no decision buttons (BR-30 compliance)
    cy.get('.text-green-700').should('contain', 'Laporan Valid & Terkunci (BR-30)');
    cy.get('button').contains('Setujui Laporan').should('not.exist');
    cy.get('button').contains('Minta Revisi').should('not.exist');
  });
});
