describe('CRUD Empresas', () => {
  it('Login, cria, edita e exclui empresa', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/companies');
    cy.contains('Nova Empresa').click();
    cy.get('input[name="name"]').type('Empresa Teste');
    cy.get('input[name="website"]').type('empresa.com');
    cy.contains('Salvar').click();
    cy.contains('Empresa Teste').should('exist');
    // Editar empresa
    cy.contains('Empresa Teste').parent().find('button[aria-label="Editar"]').click();
    cy.get('input[name="name"]').clear().type('Empresa Editada');
    cy.contains('Salvar').click();
    cy.contains('Empresa Editada').should('exist');
    // Excluir empresa
    cy.contains('Empresa Editada').parent().find('button[aria-label="Excluir"]').click();
    cy.contains('Confirmar').click();
    cy.contains('Empresa Editada').should('not.exist');
  });
});
