describe('Multi-tenant - Isolamento por Empresa', () => {
  beforeEach(() => {
    cy.clearTestData();
    cy.seedTestData();
  });

  describe('Isolamento de Dados', () => {
    it('deve mostrar apenas espaços da empresa do usuário logado', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Verificar se só vê espaços da LinkSpace
      cy.get('[data-testid="grid-spaces"]').should('be.visible');
      cy.get('[data-testid="grid-spaces"]').should('contain', 'Sala de Reunião 1');
      cy.get('[data-testid="grid-spaces"]').should('contain', 'Auditório Principal');
      cy.get('[data-testid="grid-spaces"]').should('not.contain', 'Sala TechCorp');
      cy.get('[data-testid="grid-spaces"]').should('not.contain', 'Laboratório Inovação');
    });

    it('deve mostrar apenas usuários da empresa do admin logado', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Navegar para usuários
      cy.visit('/admin/users');
      
      // Verificar se só vê usuários da LinkSpace
      cy.get('[data-testid="grid-users"]').should('be.visible');
      cy.get('[data-testid="grid-users"]').should('contain', 'Administrador LinkSpace');
      cy.get('[data-testid="grid-users"]').should('contain', 'Usuário LinkSpace');
      cy.get('[data-testid="grid-users"]').should('not.contain', 'Admin TechCorp');
      cy.get('[data-testid="grid-users"]').should('not.contain', 'João Silva');
    });

    it('deve permitir criar usuário apenas na empresa do admin', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Navegar para usuários
      cy.visit('/admin/users');
      
      // Criar novo usuário
      cy.get('[data-testid="btn-new-user"]').click();
      cy.get('#user-name').type('Novo Usuário LinkSpace');
      cy.get('#user-email').type('novo@linkspace.com');
      cy.get('#user-password').type('novo123');
      cy.get('#user-profile').click();
      cy.get('[data-value="usuario"]').click();
      
      cy.get('button').contains('Salvar').click();
      cy.wait(2000);
      
      // Verificar se o usuário foi criado
      cy.visit('/admin/users');
      cy.get('[data-testid="grid-users"]').should('contain', 'Novo Usuário LinkSpace');
    });

    it('deve permitir criar espaço apenas na empresa do admin', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Criar novo espaço
      cy.get('[data-testid="btn-new-space"]').click();
      cy.get('#space-name').type('Nova Sala LinkSpace');
      cy.get('#space-desc').type('Sala criada pelo admin da LinkSpace');
      cy.get('#space-capacity').type('15');
      cy.get('#space-type').click();
      cy.get('[data-value="sala_reuniao"]').click();
      
      cy.get('button').contains('Salvar').click();
      cy.wait(2000);
      
      // Verificar se o espaço foi criado
      cy.visit('/admin/spaces');
      cy.get('[data-testid="grid-spaces"]').should('contain', 'Nova Sala LinkSpace');
    });
  });

  describe('Cross-Empresa Access', () => {
    it('deve negar acesso a recursos de outra empresa', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Tentar acessar diretamente um espaço de outra empresa (simulado)
      // Em um ambiente real, isso seria testado via API
      cy.window().then((win) => {
        // Simular tentativa de acesso cross-empresa
        cy.request({
          method: 'GET',
          url: '/api/spaces/3', // ID do espaço da TechCorp
          failOnStatusCode: false,
        }).then((response) => {
          // Deve retornar 403 ou 404
          expect(response.status).to.be.oneOf([403, 404]);
        });
      });
    });

    it('deve validar que reservas só podem ser feitas com espaços da mesma empresa', () => {
      // Login como usuário da LinkSpace
      cy.uiLogin('user@linkspace.com', 'user123', 'usuario');
      
      // Navegar para reservas
      cy.visit('/usuario/reservations');
      
      // Tentar criar reserva
      cy.get('[data-testid="btn-new-reservation"]').click();
      
      // Verificar se só aparecem espaços da LinkSpace
      cy.get('#reservation-space').click();
      cy.get('[data-value="1"]').should('be.visible'); // Sala LinkSpace
      cy.get('[data-value="2"]').should('be.visible'); // Auditório LinkSpace
      cy.get('[data-value="3"]').should('not.exist'); // Sala TechCorp
      cy.get('[data-value="4"]').should('not.exist'); // Laboratório Inovação
    });
  });

  describe('RBAC por Empresa', () => {
    it('deve negar acesso administrativo para usuário comum', () => {
      // Login como usuário comum da LinkSpace
      cy.uiLogin('user@linkspace.com', 'user123', 'usuario');
      
      // Tentar acessar páginas administrativas
      cy.visit('/admin/spaces');
      cy.url().should('not.include', '/admin/spaces');
      cy.url().should('include', '/usuario');
      
      cy.visit('/admin/users');
      cy.url().should('not.include', '/admin/users');
      cy.url().should('include', '/usuario');
    });

    it('deve permitir acesso administrativo para admin da empresa', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Verificar acesso às páginas administrativas
      cy.visit('/admin/spaces');
      cy.url().should('include', '/admin/spaces');
      cy.get('[data-testid="admin-spaces-title"]').should('be.visible');
      
      cy.visit('/admin/users');
      cy.url().should('include', '/admin/users');
      cy.get('[data-testid="admin-users-title"]').should('be.visible');
    });
  });

  describe('Múltiplas Empresas', () => {
    it('deve permitir login de diferentes empresas simultaneamente (em abas diferentes)', () => {
      // Abrir nova aba e fazer login como admin da TechCorp
      cy.window().then((win) => {
        win.open('/login', '_blank');
      });
      
      // Na nova aba, fazer login como admin da TechCorp
      cy.origin('http://localhost:3000', () => {
        cy.visit('/login');
        cy.get('input[type="email"]').type('admin@techcorp.com');
        cy.get('input[type="password"]').type('admin123');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/admin/spaces');
        
        // Verificar se só vê espaços da TechCorp
        cy.get('[data-testid="grid-spaces"]').should('contain', 'Sala TechCorp');
        cy.get('[data-testid="grid-spaces"]').should('not.contain', 'Sala de Reunião 1');
      });
    });

    it('deve manter isolamento entre empresas em sessões diferentes', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Verificar dados da LinkSpace
      cy.get('[data-testid="grid-spaces"]').should('contain', 'Sala de Reunião 1');
      
      // Logout
      cy.logout();
      
      // Login como admin da TechCorp
      cy.uiLogin('admin@techcorp.com', 'admin123', 'admin');
      
      // Verificar dados da TechCorp
      cy.get('[data-testid="grid-spaces"]').should('contain', 'Sala TechCorp');
      cy.get('[data-testid="grid-spaces"]').should('not.contain', 'Sala de Reunião 1');
    });
  });

  describe('Auditoria e Logs', () => {
    it('deve registrar ações de auditoria com empresa_id', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Criar um espaço para gerar log de auditoria
      cy.get('[data-testid="btn-new-space"]').click();
      cy.get('#space-name').type('Sala de Auditoria');
      cy.get('#space-desc').type('Sala para teste de auditoria');
      cy.get('#space-capacity').type('10');
      cy.get('#space-type').click();
      cy.get('[data-value="sala_reuniao"]').click();
      
      cy.get('button').contains('Salvar').click();
      cy.wait(2000);
      
      // Verificar se o log de auditoria foi criado
      // Em um ambiente real, isso seria verificado via API ou interface de logs
      cy.window().then((win) => {
        cy.request({
          method: 'GET',
          url: '/api/audit-logs',
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          
          // Verificar se há logs da empresa 1
          const empresa1Logs = response.body.filter((log: any) => log.empresaId === '1');
          expect(empresa1Logs.length).to.be.greaterThan(0);
        });
      });
    });

    it('deve mostrar apenas logs de auditoria da empresa do admin', () => {
      // Login como admin da LinkSpace
      cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
      
      // Acessar logs de auditoria
      cy.visit('/admin/audit-logs');
      
      // Verificar se só mostra logs da empresa 1
      cy.get('[data-testid="audit-logs-grid"]').should('be.visible');
      cy.get('[data-testid="audit-logs-grid"]').within(() => {
        cy.get('[data-field="empresaId"]').each(($el) => {
          cy.wrap($el).should('contain', '1');
        });
      });
    });
  });
});
