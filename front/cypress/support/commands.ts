// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/// <reference types="cypress" />

// Custom command : connexion en tant qu'admin ou user via les fixtures.
// Ce raccourci évite de répéter le flow complet de login dans chaque test.
Cypress.Commands.add('loginAs', (role: 'admin' | 'user') => {
  const fixture = role === 'admin' ? 'user-admin' : 'user-non-admin';

  cy.fixture(fixture).then((userFixture) => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: userFixture
    }).as('login');

    cy.intercept('GET', '/api/session', { fixture: 'sessions.json' }).as('sessions');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type(userFixture.username);
    cy.get('input[formControlName=password]').type('test!1234{enter}');
    cy.wait('@login');
    cy.url().should('include', '/sessions');
  });
});

// Déclaration TypeScript pour que le custom command soit reconnu.
declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'admin' | 'user'): Chainable<void>;
    }
  }
}

export {};