describe('Sessions list spec', () => {

  // Plan de tests — Sessions : vérifie l'affichage des sessions et les boutons selon le rôle de l'utilisateur connecté.
  describe('As admin', () => {

    beforeEach(() => {
      // cy.loginAs() connecte l'utilisateur via le flow complet de login et intercepte GET /api/session avec la fixture sessions.json.
      cy.loginAs('admin');
    });

    // Plan de tests — Sessions : vérifie que la liste des sessions est bien affichée après connexion.
    it('should display sessions list', () => {
      cy.intercept('GET', '/api/session', {
        fixture: 'sessions.json'
      }).as('sessions');

      cy.get('mat-card-title').should('contain', 'Rentals available');
    });

    // Plan de tests — Sessions : vérifie que le bouton Create est affiché pour un admin (permet la création d'une nouvelle session).
    it('should display Create button for admin', () => {
      cy.contains('button', 'Create').should('be.visible');
    });

    // Plan de tests — Sessions : vérifie que le bouton Detail est affiché pour chaque session (accessible à tous les utilisateurs connectés).
    it('should display Detail button for each session', () => {
      cy.contains('button', 'Detail').should('be.visible');
    });

    // Plan de tests — Sessions : vérifie que le bouton Edit est affiché pour chaque session quand l'utilisateur est admin.
    it('should display Edit button for each session as admin', () => {
      cy.contains('button', 'Edit').should('be.visible');
    });

    // Plan de tests — Sessions : vérifie que les noms des sessions sont bien affichés dans la liste.
    it('should display session names', () => {
      cy.contains('Morning Yoga').should('be.visible');
      cy.contains('Evening Yoga').should('be.visible');
    });
  });

  describe('As non-admin user', () => {

    beforeEach(() => {
      cy.loginAs('user');
    });

    // Plan de tests — Sessions : vérifie que le bouton Create n'est PAS affiché pour un utilisateur non-admin.
    it('should not display Create button for non-admin user', () => {
      cy.contains('button', 'Create').should('not.exist');
    });

    // Plan de tests — Sessions : vérifie que le bouton Edit n'est PAS affiché pour un utilisateur non-admin.
    it('should not display Edit button for non-admin user', () => {
      cy.contains('button', 'Edit').should('not.exist');
    });

    // Plan de tests — Sessions : vérifie que le bouton Detail est bien affiché même pour un utilisateur non-admin.
    it('should display Detail button for non-admin user', () => {
      cy.contains('button', 'Detail').should('be.visible');
    });
  });
});