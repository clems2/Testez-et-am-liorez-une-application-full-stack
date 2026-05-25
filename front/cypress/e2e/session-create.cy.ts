//Test la création de session, la validation du formulaire, l'affichage d'erreurs et la redirection après création
describe('Session create spec', () => {

  beforeEach(() => {
    // Seul un admin peut créer une session.
    cy.loginAs('admin');

    // Intercept la liste des teachers pour le select du formulaire.
    cy.intercept('GET', '/api/teacher', {
      fixture: 'teachers.json'
    }).as('teachers');

    cy.contains('button', 'Create').click();
    cy.wait('@teachers');
  });

  // Vérifie que le titre "Create session" est affiché et que le formulaire est bien en mode création.
  it('should display create session form', () => {
    cy.contains('Create session').should('be.visible');
  });

  // Plan de tests — Création session : vérifie que le bouton Save est désactivé quand les champs sont vides.
  it('should disable Save button when form is empty', () => {
    cy.get('button[type=submit]').should('be.disabled');
  });

  // Plan de tests — Création session : vérifie que le bouton Save est désactivé quand un champ obligatoire est manquant.
  it('should disable Save button when a required field is missing', () => {
    cy.get('input[formControlName=name]').type('New Yoga Session');
    cy.get('input[formControlName=date]').type('2026-06-01');
    // teacher et description intentionnellement vides
    cy.get('button[type=submit]').should('be.disabled');
  });

  // Plan de tests — Création session : vérifie que la session est créée avec succès et que l'utilisateur est redirigé vers la liste.
  it('should create session successfully and redirect to sessions list', () => {
    cy.intercept('POST', '/api/session', {
      statusCode: 200,
      fixture: 'session-detail.json'
    }).as('createSession');

    cy.intercept('GET', '/api/session', {
      fixture: 'sessions.json'
    }).as('sessions');

    // Remplissage du formulaire
    cy.get('input[formControlName=name]').type('New Yoga Session');
    cy.get('input[formControlName=date]').type('2026-06-01');

    // Sélection du teacher dans le mat-select
    cy.get('mat-select[formControlName=teacher_id]').click();
    cy.get('mat-option').first().click();
    cy.get('textarea[formControlName=description]').type('A great new session');
    cy.get('button[type=submit]').should('not.be.disabled').click();
    cy.wait('@createSession');
    cy.url().should('include', '/sessions');
  });

  // Vérifie que le bouton back navigue vers la page précédente.
  it('should navigate back when back button is clicked', () => {
    cy.get('button[mat-icon-button]').first().click();
    cy.url().should('include', '/sessions');
  });
});