describe('Register spec', () => {

  beforeEach(() => {
    cy.visit('/register');
  });

  // Plan de tests — Register : vérifie que le bouton Submit est désactivé quand les champs obligatoires sont vides.
  it('should disable submit button when form is empty', () => {
    cy.get('button[type=submit]').should('be.disabled');
  });

  // Plan de tests — Register : vérifie que le bouton Submit est désactivé quand un champ obligatoire est manquant (ici le lastName).
  it('should disable submit button when a required field is missing', () => {
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=email]').type('john@test.com');
    cy.get('input[formControlName=password]').type('password123');
    // lastName intentionnellement vide
    cy.get('button[type=submit]').should('be.disabled');
  });

  // Plan de tests — Register : vérifie que la création de compte réussie redirige l'utilisateur vers la page de login.
  it('should register successfully and redirect to login', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {}
    }).as('register');
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('john@test.com');
    cy.get('input[formControlName=password]').type('password123');
    cy.get('button[type=submit]').should('not.be.disabled').click();
    cy.wait('@register');
    cy.url().should('include', '/login');
  });

  // Plan de tests — Register : vérifie que le message d'erreur s'affiche quand le back-end retourne une erreur (email déjà pris).
  it('should display error message when registration fails', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { message: 'Email already taken' }
    }).as('register');
    cy.get('input[formControlName=firstName]').type('John');
    cy.get('input[formControlName=lastName]').type('Doe');
    cy.get('input[formControlName=email]').type('existing@test.com');
    cy.get('input[formControlName=password]').type('password123');
    cy.get('button[type=submit]').click();
    cy.wait('@register');
    cy.get('.error').should('be.visible');
  });
});