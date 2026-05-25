//Test la page Account pour les utilisateurs réguliers et admin, la suppression de compte et la fonctionnalité de logout
describe('Account and Logout spec', () => {

  describe('Account page', () => {
    beforeEach(() => {
      // Intercept la requête user avant la navigation.
      cy.intercept('GET', '/api/user/2', {
        fixture: 'user-account.json'
      }).as('userInfo');

      cy.loginAs('user');

      // Navigation vers la page Account via le lien de la toolbar.
      cy.contains('span', 'Account').click();
      cy.wait('@userInfo');
    });

    // Plan de tests — Account : vérifie que les informations de l'utilisateur sont correctement affichées.
    it('should display user information', () => {
      cy.contains('Regular').should('be.visible');
      cy.contains('USER').should('be.visible');
      cy.contains('user@test.com').should('be.visible');
    });

    // Plan de tests — Account : vérifie que le bouton Delete est affiché pour un utilisateur non-admin.
    it('should display delete button for non-admin user', () => {
      cy.contains('button', 'Detail').should('be.visible');
    });

    // Plan de tests — Account : vérifie que le bouton back navigue vers la page précédente.
    it('should navigate back when back button is clicked', () => {
      cy.get('button[mat-icon-button]').first().click();
      cy.url().should('include', '/sessions');
    });

    // Plan de tests — Account : vérifie que la suppression du compte redirige vers la page d'accueil.
    it('should delete account and redirect to login page', () => {
      cy.intercept('DELETE', '/api/user/2', {
        statusCode: 200,
        body: {}
      }).as('deleteUser');

      cy.contains('button', 'Detail').click();
      cy.wait('@deleteUser');
      cy.url().should('eq', 'http://localhost:4200/login');
    });
  });

  describe('Admin account page', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/user/1', {
        body: {
          id: 1,
          email: 'yoga@studio.com',
          lastName: 'User',
          firstName: 'Admin',
          admin: true,
          createdAt: '2026-01-01T00:00:00.000+00:00',
          updatedAt: '2026-01-01T00:00:00.000+00:00'
        }
      }).as('adminInfo');

      cy.loginAs('admin');
      cy.contains('span', 'Account').click();
      cy.wait('@adminInfo');
    });

    // Plan de tests — Account : vérifie que le message "You are admin" est affiché pour un utilisateur admin.
    it('should display admin badge for admin user', () => {
      cy.contains('You are admin').should('be.visible');
    });

    // Plan de tests — Account : vérifie que le bouton Delete n'est PAS affiché pour un utilisateur admin.
    it('should not display delete button for admin user', () => {
      cy.contains('button', 'Detail').should('not.exist');
    });
  });

  describe('Logout', () => {

    beforeEach(() => {
      cy.loginAs('user');
    });

    // Plan de tests — Logout : vérifie que le clic sur Logout déconnecte l'utilisateur et redirige vers la page d'accueil.
    it('should logout and redirect to login page', () => {
      cy.contains('span', 'Logout').click();
      cy.url().should('eq', 'http://localhost:4200/login');
    });

    // Plan de tests — Logout : vérifie qu'après la déconnexion les liens Login et Register sont affichés dans la toolbar.
    it('should display login and register links after logout', () => {
      cy.contains('span', 'Logout').click();
      cy.get('a').contains('Login').should('be.visible');
      cy.get('a').contains('Register').should('be.visible');
    });

    // Plan de tests — Logout : vérifie qu'après la déconnexion les liens Sessions, Account et Logout ne sont plus affichés.
    it('should not display authenticated links after logout', () => {
      cy.contains('span', 'Logout').click();
      cy.contains('span', 'Sessions').should('not.exist');
      cy.contains('span', 'Account').should('not.exist');
      cy.contains('span', 'Logout').should('not.exist');
    });
  });
});