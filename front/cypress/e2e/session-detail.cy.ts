describe('Session detail spec', () => {

  // Intercepts communs pour le chargement de la page detail. La page detail fait 2 requêtes en chaîne : session puis teacher.
  const interceptDetailRequests = () => {
    cy.intercept('GET', '/api/session/1', {
      fixture: 'session-detail.json'
    }).as('sessionDetail');

    cy.intercept('GET', '/api/teacher/1', {
      fixture: 'teacher-1.json'
    }).as('teacher');
  };

  describe('As admin', () => {

    beforeEach(() => {
      interceptDetailRequests();
      cy.loginAs('admin');
      cy.contains('button', 'Detail').first().click();
      cy.wait('@sessionDetail');
      cy.wait('@teacher');
    });

    // Plan de tests — Informations session : vérifie que le nom et la description de la session sont correctement affichés.
    it('should display session information', () => {
      cy.contains('Morning Yoga').should('be.visible');
      cy.contains('Start your day with energy').should('be.visible');
    });

    // Plan de tests — Informations session : vérifie que le nom du professeur est correctement affiché.
    it('should display teacher information', () => {
      cy.contains('Jane').should('be.visible');
      cy.contains('Smith').should('be.visible');
    });

    // Plan de tests — Informations session : vérifie que le bouton Delete est affiché pour un admin.
    it('should display Delete button for admin', () => {
      cy.contains('button', 'Delete').should('be.visible');
    });

    // Plan de tests — Informations session : vérifie que les boutons Participate et Do not participate ne sont PAS affichés pour un admin.
    it('should not display Participate button for admin', () => {
      cy.contains('button', 'Participate').should('not.exist');
      cy.contains('button', 'Do not participate').should('not.exist');
    });

    // Plan de tests — Suppression session : vérifie que le clic sur Delete envoie un DELETE HTTP et redirige vers la liste des sessions.
    it('should delete session and redirect to sessions list', () => {
      cy.intercept('DELETE', '/api/session/1', {
        statusCode: 200,
        body: {}
      }).as('deleteSession');

      cy.intercept('GET', '/api/session', {
        fixture: 'sessions.json'
      }).as('sessions');

      cy.contains('button', 'Delete').click();
      cy.wait('@deleteSession');
      cy.url().should('include', '/sessions');
    });
  });

  describe('As non-admin user (not participating)', () => {

    beforeEach(() => {
      interceptDetailRequests();
      cy.loginAs('user');
      cy.contains('button', 'Detail').first().click();
      cy.wait('@sessionDetail');
      cy.wait('@teacher');
    });

    // Plan de tests — Informations session : vérifie que le bouton Delete n'est PAS affiché pour un utilisateur non-admin.
    it('should not display Delete button for non-admin', () => {
      cy.contains('button', 'Delete').should('not.exist');
    });

    // Plan de tests — Informations session : vérifie que le bouton Participate est affiché pour un user qui ne participe pas encore.
    it('should display Participate button for non-participating user', () => {
      cy.contains('button', 'Participate').should('be.visible');
    });

    // Plan de tests — Informations session : vérifie que le clic sur Participate envoie un POST HTTP et rafraîchit les données.
    it('should participate in session', () => {
      cy.intercept('POST', '/api/session/1/participate/2', {
        statusCode: 200,
        body: {}
      }).as('participate');

      // Après participate, le composant recharge la session avec users: [2]
      cy.intercept('GET', '/api/session/1', {
        body: {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2026-06-01T00:00:00.000+00:00',
          teacher_id: 1,
          users: [2]
        }
      }).as('sessionRefresh');

      cy.intercept('GET', '/api/teacher/1', {
        fixture: 'teacher-1.json'
      }).as('teacherRefresh');

      cy.contains('button', 'Participate').click();
      cy.wait('@participate');
      cy.wait('@sessionRefresh');
      // Après participation, le bouton doit switcher
      cy.contains('button', 'Do not participate').should('be.visible');
    });
  });

  describe('As non-admin user (already participating)', () => {

    beforeEach(() => {
      // Session avec users: [2] — le user (id: 2) participe déjà
      cy.intercept('GET', '/api/session/1', {
        body: {
          id: 1,
          name: 'Morning Yoga',
          description: 'Start your day with energy',
          date: '2026-06-01T00:00:00.000+00:00',
          teacher_id: 1,
          users: [2]
        }
      }).as('sessionDetail');

      cy.intercept('GET', '/api/teacher/1', {
        fixture: 'teacher-1.json'
      }).as('teacher');

      cy.loginAs('user');
      cy.contains('button', 'Detail').first().click();
      cy.wait('@sessionDetail');
      cy.wait('@teacher');
    });

    // Plan de tests — Informations session : vérifie que le bouton Do not participate est affiché quand le user participe déjà.
    it('should display Do not participate button when already participating', () => {
      cy.contains('button', 'Do not participate').should('be.visible');
    });

    // Plan de tests — Informations session : vérifie que le clic sur Do not participate envoie un DELETE HTTP et rafraîchit les données.
    it('should unparticipate from session', () => {
      cy.intercept('DELETE', '/api/session/1/participate/2', {
        statusCode: 200,
        body: {}
      }).as('unParticipate');

      cy.intercept('GET', '/api/session/1', {
        fixture: 'session-detail.json'
      }).as('sessionRefresh');

      cy.intercept('GET', '/api/teacher/1', {
        fixture: 'teacher-1.json'
      }).as('teacherRefresh');

      cy.contains('button', 'Do not participate').click();
      cy.wait('@unParticipate');
      cy.wait('@sessionRefresh');
      cy.contains('button', 'Participate').should('be.visible');
    });
  });
});