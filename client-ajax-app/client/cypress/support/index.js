// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-file-upload';
// Alternatively you can use CommonJS syntax:
// require('./commands')

const addUser = (email, firstName, lastName, userType) => {
    cy.server();
    cy.route('POST', '**/api/sign_up/**').as('signUp');

    cy.visit('/#/sign-up');
    cy.get('input#username').type(email);
    cy.get('input#firstName').type(firstName);
    cy.get('input#lastName').type(lastName);
    cy.get('input#password').type('1234', { log: false });
    cy.get('select#group').select(userType);


    cy.get('button').contains('Sign up').click();
    cy.wait('@signUp');
    cy.hash().should('eq', '#/log-in');
}

const logIn = (email) => {
    cy.server();
    cy.route('POST', '**/api/log_in/**').as('logIn');

    // Log into the app.
    cy.visit('/#/log-in');
    cy.get('input#username').type(email);
    cy.get('input#password').type('1234', { log: false });
    cy.get('button').contains('Log in').click();
    cy.wait('@logIn');
}

// Cypress.Commands.add('addUser', addUser);
Cypress.Commands.add('logIn', logIn);