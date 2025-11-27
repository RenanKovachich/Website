describe('Admin - Gestão de Espaços (Funcionais)', () => {
  beforeEach(() => {
    cy.clearTestData();
    cy.seedTestData();
    cy.uiLogin('admin@linkspace.com', 'admin123', 'admin');
  });

  it('deve exibir a lista de espaços existentes', () => {
    cy.get('[data-testid="grid-spaces"]').should('be.visible');
    cy.get('[data-testid="grid-spaces"]').should('contain', 'Sala de Reunião 1');
    cy.get('[data-testid="grid-spaces"]').should('contain', 'Auditório Principal');
  });

  it('deve abrir o diálogo de novo espaço', () => {
    cy.get('[data-testid="btn-new-space"]').click();
    
    // Verifica se o diálogo abriu
    cy.contains('Novo Espaço').should('be.visible');
    cy.get('#space-name').should('be.visible');
    cy.get('#space-desc').should('be.visible');
    cy.get('#space-capacity').should('be.visible');
  });

  it('deve criar um novo espaço', () => {
    // Conta inicial de espaços
    cy.get('[data-testid="grid-spaces"]').find('[role="row"]').should('have.length.at.least', 2);
    
    cy.get('[data-testid="btn-new-space"]').click();
    
    // Aguarda o diálogo abrir completamente
    cy.contains('Novo Espaço').should('be.visible');
    
    // Preenche o formulário
    cy.get('#space-name').clear().type('Sala de Teste');
    cy.get('#space-desc').clear().type('Sala criada via teste E2E');
    cy.get('#space-capacity').clear().type('10');
    
    // Seleciona o tipo clicando no select do Material-UI
    cy.get('#space-type').click();
    cy.get('[data-value="sala_reuniao"]').click();
    
    // Salva
    cy.get('button').contains('Salvar').click();
    
    // Aguarda um pouco para a operação processar
    cy.wait(3000);
    
    // Verifica se o espaço foi criado (independente do diálogo)
    cy.visit('/admin/spaces'); // Força recarregar a página
    cy.get('[data-testid="grid-spaces"]', { timeout: 10000 }).should('contain', 'Sala de Teste');
  });

  it('deve validar campos obrigatórios', () => {
    cy.get('[data-testid="btn-new-space"]').click();
    
    // Tenta salvar sem preencher
    cy.contains('Salvar').click();
    
    // Verifica se há mensagem de erro (o diálogo deve permanecer aberto)
    cy.contains('Novo Espaço').should('be.visible');
  });

  it('deve cancelar criação de espaço', () => {
    cy.get('[data-testid="btn-new-space"]').click();
    
    // Aguarda o diálogo abrir
    cy.contains('Novo Espaço').should('be.visible');
    
    // Preenche alguns campos
    cy.get('#space-name').type('Sala Cancelada');
    
    // Cancela
    cy.get('button').contains('Cancelar').click();
    
    // Aguarda um pouco
    cy.wait(2000);
    
    // Verifica se o espaço não foi criado (independente do diálogo)
    cy.visit('/admin/spaces'); // Força recarregar a página
    cy.get('[data-testid="grid-spaces"]').should('not.contain', 'Sala Cancelada');
  });

  it('deve editar um espaço existente', () => {
    // Aguarda a grid carregar
    cy.get('[data-testid="grid-spaces"]').should('be.visible');
    
    // Clica no botão editar do primeiro espaço
    cy.get('[data-testid="grid-spaces"]').within(() => {
      cy.get('button').contains('Editar').first().click();
    });
    
    // Verifica se o diálogo abriu com dados preenchidos
    cy.contains('Editar Espaço').should('be.visible');
    cy.get('#space-name').should('have.value', 'Sala de Reunião 1');
    
    // Modifica o nome
    cy.get('#space-name').clear().type('Sala Editada');
    
    // Salva
    cy.get('button').contains('Salvar').click();
    
    // Aguarda um pouco para a operação processar
    cy.wait(3000);
    
    // Verifica se o nome foi atualizado (independente do diálogo)
    cy.visit('/admin/spaces'); // Força recarregar a página
    cy.get('[data-testid="grid-spaces"]', { timeout: 10000 }).should('contain', 'Sala Editada');
  });
});
