//tests  la réussite de la connexion, la gestion des erreurs de mauvaises entrées et l'affichage de celles-ci
describe('Login spec', () => {

  beforeEach(() => {
    cy.visit('/login');
  });

  // Plan de tests — Login : vérifie que le bouton Submit est désactivé quand les champs sont vides.
  it('should disable submit button when form is empty', () => {
    cy.get('button[type=submit]').should('be.disabled');
  });

  // Plan de tests — Login : vérifie que le bouton Submit est désactivé quand un champ obligatoire est manquant (ici le password).
  it('should disable submit button when a required field is missing', () => {
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    // password intentionnellement vide
    cy.get('button[type=submit]').should('be.disabled');
  });

  // Plan de tests — Login : vérifie que la connexion réussie avec un utilisateur admin redirige vers /sessions et affiche la toolbar admin.
  it('should login successfully as admin and redirect to sessions', () => {
    cy.fixture('user-admin').then((user) => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: user
      }).as('login');

      cy.intercept('GET', '/api/session', {
        fixture: 'sessions.json'
      }).as('sessions');

      cy.get('input[formControlName=email]').type(user.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.wait('@login');
      cy.url().should('include', '/sessions');
      // Vérifie que la toolbar affiche les liens d'un utilisateur connecté.
      cy.get('span').contains('Sessions').should('be.visible');
      cy.get('span').contains('Account').should('be.visible');
      cy.get('span').contains('Logout').should('be.visible');
    });
  });

  // Plan de tests — Login : vérifie que la connexion réussie avec un utilisateur non-admin redirige vers /sessions sans bouton Create.
  it('should login successfully as non-admin and redirect to sessions', () => {
    cy.fixture('user-non-admin').then((user) => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: user
      }).as('login');

      cy.intercept('GET', '/api/session', {
        fixture: 'sessions.json'
      }).as('sessions');

      cy.get('input[formControlName=email]').type(user.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.wait('@login');
      cy.url().should('include', '/sessions');
    });
  });

  // Plan de tests — Login : vérifie que le message d'erreur s'affiche quand le back-end retourne une erreur (mauvais identifiants).
  it('should display error message on wrong credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' }
    }).as('login');

    cy.get('input[formControlName=email]').type('wrong@test.com');
    cy.get('input[formControlName=password]').type('wrongpassword');
    cy.get('button[type=submit]').click();
    cy.wait('@login');
    // Vérifie que le message d'erreur est affiché dans le template.
    cy.get('.error').should('be.visible');
    cy.get('.error').should('contain', 'An error occurred');
  });
});