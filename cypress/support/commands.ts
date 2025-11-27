/// <reference types="cypress" />

// Comando para fazer logout
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('@LinkSpace:user');
  });
  cy.visit('/login');
});

// Comando para fazer login via UI
Cypress.Commands.add('uiLogin', (email: string, password: string, role: 'admin' | 'usuario') => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Verifica se foi redirecionado corretamente baseado no perfil
  if (role === 'admin') {
    cy.url().should('include', '/admin/spaces');
  } else {
    cy.url().should('include', '/usuario/reservations');
  }
});

// Comando para navegar para a página de espaços do admin
Cypress.Commands.add('gotoAdminSpaces', () => {
  cy.visit('/admin/spaces');
  cy.get('[data-testid="admin-spaces-title"]').should('contain', 'Espaços');
});

// Comando para navegar para a página de reservas do usuário
Cypress.Commands.add('gotoUserReservations', () => {
  cy.visit('/usuario/reservations');
  cy.get('[data-testid="user-res-title"]').should('contain', 'Minhas Reservas');
});

// Comando para limpar dados de teste
Cypress.Commands.add('clearTestData', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('@LinkSpace:user');
    win.localStorage.removeItem('@LinkSpace:data');
  });
});

// Comando para popular dados de teste
Cypress.Commands.add('seedTestData', () => {
  cy.window().then((win) => {
    const testData = {
      users: [
        {
          id: '1',
          name: 'Administrador',
          email: 'admin@linkspace.com',
          password: 'admin123',
          profile: 'admin',
          company: 'LinkSpace',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Usuário Teste',
          email: 'user@linkspace.com',
          password: 'user123',
          profile: 'usuario',
          company: 'Empresa Teste',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      spaces: [
        {
          id: '1',
          name: 'Sala de Reunião 1',
          type: 'sala_reuniao',
          capacity: 10,
          status: 'active',
          description: 'Sala de reunião para pequenos grupos',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Auditório Principal',
          type: 'auditorio',
          capacity: 50,
          status: 'active',
          description: 'Auditório para eventos e apresentações',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      reservations: [],
    };
    win.localStorage.setItem('@LinkSpace:data', JSON.stringify(testData));
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      logout(): Chainable<void>;
      uiLogin(email: string, password: string, role: 'admin' | 'usuario'): Chainable<void>;
      gotoAdminSpaces(): Chainable<void>;
      gotoUserReservations(): Chainable<void>;
      clearTestData(): Chainable<void>;
      seedTestData(): Chainable<void>;
    }
  }
}