describe('Login e Navegação', () => {
  beforeEach(() => {
    cy.clearTestData();
    cy.seedTestData();
  });

  it('deve fazer login como admin e navegar para espaços', () => {
    cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
    
    // Verifica se está na página correta
    cy.url().should('include', '/admin/spaces');
    cy.get('[data-testid="admin-spaces-title"]').should('contain', 'Espaços');
    
    // Verifica se o layout está correto
    cy.contains('Administrador').should('be.visible');
    cy.contains('Espaços').should('be.visible');
  });

  it('deve fazer login como usuário e navegar para reservas', () => {
    cy.uiLogin('user@linkspace.com', 'user123', 'usuario');
    
    // Verifica se está na página correta
    cy.url().should('include', '/usuario/reservations');
    cy.get('[data-testid="user-res-title"]').should('contain', 'Minhas Reservas');
    
    // Verifica se o layout está correto
    cy.contains('Usuário Teste').should('be.visible');
    cy.contains('Minhas Reservas').should('be.visible');
  });

  it('deve redirecionar admin de /admin para /admin/spaces', () => {
    cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
    cy.visit('/admin');
    cy.url().should('include', '/admin/spaces');
  });

  it('deve redirecionar usuário de /usuario para /usuario/reservations', () => {
    cy.uiLogin('user@linkspace.com', 'user123', 'usuario');
    cy.visit('/usuario');
    cy.url().should('include', '/usuario/reservations');
  });

  it('deve falhar login com credenciais inválidas', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@linkspace.com');
    cy.get('input[type="password"]').type('senhaerrada');
    cy.get('button[type="submit"]').click();
    
    // Deve permanecer na página de login
    cy.url().should('include', '/login');
  });

  it('deve fazer logout corretamente', () => {
    cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
    cy.logout();
    cy.url().should('include', '/login');
  });
});
