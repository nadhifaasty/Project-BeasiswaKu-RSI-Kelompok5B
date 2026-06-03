describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login page correctly', () => {
    cy.get('h1').should('contain', 'Masuk Akun');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should display validation error on blank login', () => {
    cy.get('button[type="submit"]').click();
    cy.get('.bg-red-50').should('contain', 'Email dan password wajib diisi.');
  });

  it('should successfully login as admin', () => {
    cy.get('input[type="email"]').type('admin@simba.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin/dashboard');
    cy.get('aside').should('contain', 'ADMIN');
  });

  it('should successfully navigate and submit Forgot Password', () => {
    cy.get('a[href="/forgot-password"]').click();
    cy.url().should('include', '/forgot-password');
    cy.get('h1').should('contain', 'Lupa Kata Sandi');

    cy.get('input[type="email"]').type('siswa@simba.com');
    cy.get('button[type="submit"]').click();

    cy.get('.bg-green-50').should('contain', 'pemulihan kata sandi berhasil dikirim');
  });

  it('should successfully logout from admin console', () => {
    cy.get('input[type="email"]').type('admin@simba.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.get('aside button').contains('Keluar').click({ force: true });
    cy.url().should('include', '/login');
  });
});
