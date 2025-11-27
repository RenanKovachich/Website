describe('Usuário - Gestão de Reservas (Funcionais)', () => {
  beforeEach(() => {
    cy.clearTestData();
    cy.seedTestData();
    cy.uiLogin('user@linkspace.com', 'user123', 'usuario');
  });

  it('deve exibir a lista de reservas (inicialmente vazia)', () => {
    cy.get('[data-testid="grid-reservations"]').should('be.visible');
    // A lista pode estar vazia inicialmente
  });

  it('deve abrir o diálogo de nova reserva', () => {
    cy.get('[data-testid="btn-new-reservation"]').click();
    
    // Verifica se o diálogo abriu
    cy.contains('Nova Reserva').should('be.visible');
    cy.get('#res-title').should('be.visible');
    cy.get('#res-start').should('be.visible');
    cy.get('#res-end').should('be.visible');
  });

  it('deve criar uma nova reserva', () => {
    // Obtém a data atual e adiciona 1 dia
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // Define 10:00 AM
    const startDate = tomorrow.toISOString().slice(0, 16);
    
    const endDate = new Date(tomorrow);
    endDate.setHours(12, 0, 0, 0); // Define 12:00 PM (2 horas depois)
    const endDateStr = endDate.toISOString().slice(0, 16);

    cy.get('[data-testid="btn-new-reservation"]').click();
    
    // Aguarda o diálogo abrir
    cy.contains('Nova Reserva').should('be.visible');
    
    // Preenche o formulário
    cy.get('#res-title').clear().type('Teste Criação Formulário');
    cy.get('#res-start').clear().type(startDate);
    cy.get('#res-end').clear().type(endDateStr);
    
    // Seleciona um espaço clicando no select do Material-UI
    cy.get('#res-space').click();
    cy.get('[data-value="1"]').click();
    
    // Define número de participantes
    cy.get('input[type="number"]').clear().type('5');
    
    // Salva
    cy.get('button').contains('Salvar').click();
    
    // Aguarda um pouco para a operação processar
    cy.wait(5000);
    
    // Se chegou até aqui e a reserva foi criada, consideramos sucesso
    // Verifica se a reserva foi criada no localStorage
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('@LinkSpace:data') || '{}');
      const reservasCriadas = data.reservations.filter((r: any) => r.description === 'Teste Criação Formulário');
      
      // Se a reserva foi criada, o teste passa
      if (reservasCriadas.length > 0) {
        expect(reservasCriadas.length).to.be.greaterThan(0);
        cy.log('✅ Reserva criada com sucesso no localStorage');
        return;
      }
      
      // Se não foi criada, falha o teste
      throw new Error('Reserva não foi criada no localStorage');
    });
  });

  it('deve validar campos obrigatórios', () => {
    cy.get('[data-testid="btn-new-reservation"]').click();
    
    // Tenta salvar sem preencher
    cy.contains('Salvar').click();
    
    // Verifica se há mensagem de erro (o diálogo deve permanecer aberto)
    cy.contains('Nova Reserva').should('be.visible');
  });

  it('deve cancelar criação de reserva', () => {
    cy.get('[data-testid="btn-new-reservation"]').click();
    
    // Aguarda o diálogo abrir
    cy.contains('Nova Reserva').should('be.visible');
    
    // Preenche alguns campos
    cy.get('#res-title').type('Reserva Cancelada');
    
    // Cancela
    cy.get('button').contains('Cancelar').click();
    
    // Aguarda um pouco
    cy.wait(2000);
    
    // Verifica se a reserva não foi criada (independente do diálogo)
    cy.visit('/usuario/reservations'); // Força recarregar a página
    cy.get('[data-testid="grid-reservations"]').should('not.contain', 'Reserva Cancelada');
  });

  it('deve validar que data de fim é posterior à data de início', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().slice(0, 16);
    
    // Data de fim anterior à data de início
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = yesterday.toISOString().slice(0, 16);

    cy.get('[data-testid="btn-new-reservation"]').click();
    
    // Preenche com datas inválidas
    cy.get('#res-title').type('Reserva Inválida');
    cy.get('#res-start').type(startDate);
    cy.get('#res-end').type(endDate);
    
    // Tenta salvar
    cy.contains('Salvar').click();
    
    // Verifica se o diálogo ainda está aberto (validação falhou)
    cy.contains('Nova Reserva').should('be.visible');
  });
});
