describe('Selection Engine Flow', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@simba.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');

    // Go to Selection Page
    cy.get('a[href="/admin/seleksi"]').click();
    cy.url().should('include', '/admin/seleksi');
    cy.get('select').should('not.have.value', '');
    cy.wait(2000);

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Batalkan Pengesahan")').length > 0) {
        cy.get('button').contains('Batalkan Pengesahan').click();
        cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', 'Pengesahan berhasil dibatalkan');
      }
    });
  });

  it('should render Selection Page correctly with sliders', () => {
    cy.get('h1').should('contain', 'Modul Seleksi & Penilaian');
    cy.get('input[type="range"]').should('have.length', 4);
    cy.get('span.bg-green-50').should('contain', '100% ✓ Valid');
  });

  it('should run score calculation and show ranking table', () => {
    cy.get('button').contains('Jalankan Kalkulasi Kelayakan').click();
    cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', 'Kalkulasi selesai');
    
    // Check ranking table
    cy.get('table').should('exist');
    cy.get('tbody tr').should('have.length.at.least', 1);
    cy.get('tbody tr').first().find('td').first().should('contain', '#1');
  });

  it('should successfully finalize (ratify) and rollback selection', () => {
    // 1. Calculate first
    cy.get('button').contains('Jalankan Kalkulasi Kelayakan').click();

    // 2. Click ratify final decision
    cy.get('button').contains('Sahkan Hasil Seleksi Final').click();
    
    // 3. Check Ratify Modal Dialog pops up
    cy.get('h3').should('contain', 'Sahkan Hasil Seleksi?');
    cy.get('button').contains('Ya, Sahkan Hasil').click();

    // 4. Verify locked state banner is rendered
    cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', '✓ Hasil Seleksi Telah Disahkan');

    // 5. Verify Rollback Button is shown and functional
    cy.get('button').contains('Batalkan Pengesahan').click();
    
    // 6. Verify success alert of rollback
    cy.get('div.bg-green-50', { timeout: 10000 }).should('contain', 'Pengesahan berhasil dibatalkan');
    cy.get('button').should('contain', 'Sahkan Hasil Seleksi Final');
  });
});
