//Test la modification de session, la validation du formulaire, l'affichage d'erreurs et la redirection après modification
describe('Session update spec', () => {

  beforeEach(() => {
    // Seul un admin peut modifier une session.
    cy.loginAs('admin');

    // Intercepts pour le chargement du formulaire d'édition.
    cy.intercept('GET', '/api/session/1', {
      fixture: 'session-detail.json'
    }).as('sessionDetail');

    cy.intercept('GET', '/api/teacher', {
      fixture: 'teachers.json'
    }).as('teachers');

    // Clic sur le bouton Edit de la première session.
    cy.contains('button', 'Edit').first().click();
    cy.wait('@sessionDetail');
    cy.wait('@teachers');
  });

  // Vérifie que le titre "Update session" est affiché et que le formulaire est bien en mode modification.
  it('should display update session form', () => {
    cy.contains('Update session').should('be.visible');
  });

  // Plan de tests — Modification session : vérifie que le formulaire est pré-rempli avec les données de la session existante.
  it('should pre-fill form with existing session data', () => {
    cy.get('input[formControlName=name]').should('have.value', 'Morning Yoga');
    cy.get('input[formControlName=date]').should('have.value', '2026-06-01');
    cy.get('textarea[formControlName=description]')
      .should('have.value', 'Start your day with energy');
  });

  // Plan de tests — Modification session : vérifie que le bouton Save est désactivé si un champ obligatoire est vidé.
  it('should disable Save button when a required field is cleared', () => {
    cy.get('input[formControlName=name]').clear();
    cy.get('button[type=submit]').should('be.disabled');
  });

  // Plan de tests — Modification session : vérifie que la session est modifiée avec succès et que l'utilisateur est redirigé vers la liste.
  it('should update session successfully and redirect to sessions list', () => {
    cy.intercept('PUT', '/api/session/1', {
      statusCode: 200,
      fixture: 'session-detail.json'
    }).as('updateSession');

    cy.intercept('GET', '/api/session', {
      fixture: 'sessions.json'
    }).as('sessions');

    // Modification du nom de la session
    cy.get('input[formControlName=name]').clear().type('Updated Yoga Session');
    cy.get('button[type=submit]').should('not.be.disabled').click();
    cy.wait('@updateSession');
    cy.url().should('include', '/sessions');
  });

  // Vérifie que le bouton back navigue vers la page précédente.
  it('should navigate back when back button is clicked', () => {
    cy.get('button[mat-icon-button]').first().click();
    cy.url().should('include', '/sessions');
  });
});