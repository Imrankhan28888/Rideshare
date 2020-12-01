// client/cypress/integration/authentication.spec.js

//refactor that login code into a reusable function.
const logIn = () => {
    const { username, password } = Cypress.env('credentials-rider');

    // Capture HTTP requests.
    cy.server();
    cy.route('POST', '**/api/log_in/**').as('logIn');
    // cy.route({
    //     method: 'POST',
    //     url: '**/api/log_in/**',
    //     status: 200,
    //     response: {
    //         'access': 'ACCESS_TOKEN',
    //         'refresh': 'REFRESH_TOKEN'
    //     }
    // }).as('logIn');

    // Log into the app.
    cy.visit('/#/log-in');
    cy.get('input#username').type(username);
    cy.get('input#password').type(password, { log: false });
    cy.get('button').contains('Log in').click();
    cy.wait('@logIn');
};

// Our test scenario navigates to the Login Page, types a username into the username field and a password into the password field, and then clicks a "Log in" button.After it clicks the button, it expects the app to navigate to the home page.This scenario tests the happy path where a user has entered valid credentials for an active account.


describe('Authentication', function () {
    it('Can log in.', function () {
        // // Cypress's server() method captures requests to the server
        // cy.server();
        // // The route() method can be used to either stub server calls or actually pass them to the server.In this case, we're capturing any POST requests to the /api/log_in/
        // cy.route({
        //     method: 'POST',
        //     url: '**/api/log_in/**',
        //     status: 200,
        //     response: {
        //         'access': 'ACCESS_TOKEN',
        //         'refresh': 'REFRESH_TOKEN'
        //     }
        // }).as('logIn');

        // cy.visit('/#/log-in');
        // cy.get('input#username').type('gary.cole@example.com');
        // cy.get('input#password').type('pAssw0rd', { log: false });
        // cy.get('button').contains('Log in').click();
        
        // cy.wait('@logIn');
        //refactor that login code into a reusable function.
        logIn();
        
        cy.hash().should('eq', '#/');
        cy.get('button').contains('Log out');
    });
    //New SignUP Test created down 
    // it('Can sign up.', function () {
    //     cy.visit('/#/sign-up');
    //     cy.get('input#username').type('gary.cole@example.com');
    //     cy.get('input#firstName').type('Gary');
    //     cy.get('input#lastName').type('Cole');
    //     cy.get('input#password').type('pAssw0rd', { log: false });
    //     cy.get('select#group').select('driver');
    //     // in future if we need to upload the image ...
    //     // cy.get('input#photo').attachFile('images/photo.jpg');
    //     cy.get('button').contains('Sign up').click();
    //     cy.hash().should('eq', '#/log-in');
    // });
    // This test stubs the log_in API to return an OK response with some dummy data to simulate a successful login event.Then, the test client attempts to visit the "Log In" page, but it should be redirected back to the home page.

    it('Cannot visit the login page when logged in.', function () {
        // Rem: The Cypress.env() API to access environment variables that are scoped to the current test spec file.We need to define these values in the cypress.json file:
        //const { username, password } = Cypress.env('credentials');
        
        // cy.server();
        // cy.route({
        //     method: 'POST',
        //     url: '**/api/log_in/**',
        //     status: 200,
        //     response: {
        //         'access': 'ACCESS_TOKEN',
        //         'refresh': 'REFRESH_TOKEN'
        //     }
        // }).as('logIn');
        // // Log in.
        // cy.visit('/#/log-in')
        // cy.get('input#username').type(username)
        // cy.get('input#password').type(password, { log: false })
        // cy.get('button').contains('Log in').click()
        // cy.hash().should('eq', '#/')
        // cy.get('button').contains('Log out')
        // cy.wait('@logIn')
        logIn();
        cy.visit('/#/log-in');
        cy.hash().should('eq', '#/');
    });

    //An authenticated user has no business signing up for a new account either
    it('Cannot visit the sign up page when logged in.', function () {
        //const { username, password } = Cypress.env('credentials');
        // cy.server();
        // cy.route({
        //     method: 'POST',
        //     url: '**/api/log_in/**',
        //     status: 200,
        //     response: {
        //         'access': 'ACCESS_TOKEN',
        //         'refresh': 'REFRESH_TOKEN'
        //     }
        // }).as('logIn');
        // cy.visit('/#/log-in')
        // cy.get('input#username').type(username)
        // cy.get('input#password').type(password, { log: false })
        // cy.get('button').contains('Log in').click()
        // cy.hash().should('eq', '#/')
        // cy.get('button').contains('Log out')
        // cy.wait('@logIn')
        logIn();
        cy.visit('/#/sign-up');
        cy.hash().should('eq', '#/');
    });
    // Users who are logged in also shouldn't be given links to the Log In and Sign Up pages:

    it('Cannot see links when logged in.', function () {
        //const { username, password } = Cypress.env('credentials');
        // cy.server();
        // cy.route({
        //     method: 'POST',
        //     url: '**/api/log_in/**',
        //     status: 200,
        //     response: {
        //         'access': 'ACCESS_TOKEN',
        //         'refresh': 'REFRESH_TOKEN'
        //     }
        // }).as('logIn');
        // cy.visit('/#/log-in')
        // cy.get('input#username').type(username)
        // cy.get('input#password').type(password, { log: false })
        // cy.get('button').contains('Log in').click()
        // cy.hash().should('eq', '#/')
        // cy.get('button').contains('Log out')
        // cy.wait('@logIn')
        logIn();
        cy.get('button#signUp').should('not.exist');
        cy.get('button#logIn').should('not.exist');
    });

    // it('Shows an alert on login error.', function () {
    //     const { username, password } = Cypress.env('credentials-rider');
    //     cy.server();
    //     cy.route({
    //         method: 'POST',
    //         url: '**/api/log_in/**',
    //         status: 400,
    //         response: {
    //             '__all__': [
    //                 'Please enter a correct username and password. ' +
    //                 'Note that both fields may be case-sensitive.'
    //             ]
    //         }
    //     }).as('logIn');
    //     cy.visit('/#/log-in');
    //     cy.get('input#username').type(username);
    //     cy.get('input#password').type(password, { log: false });
    //     cy.get('button').contains('Log in').click();
    //     cy.wait('@logIn');
    //     cy.get('div.alert').contains(
    //         'Please enter a correct username and password. ' +
    //         'Note that both fields may be case-sensitive.'
    //     );
    //     cy.hash().should('eq', '#/log-in');
    // });
    // //Logout Test
    // it('Can log out.', function () {
    //     logIn();
    //     cy.get('button').contains('Log out').click().should(() => {
    //         expect(window.localStorage.getItem('rideShare.auth')).to.be.null;
    //     });
    //     cy.get('button').contains('Log out').should('not.exist');
    // });

    //New Sign Up Test
    // Our code changes stub the server to return mock data.After we click the "Sign up" button, we wait for the HTTP call to resolve.And we confirm that the user is redirected to the Login Page.


    it('Can sign up.', function () {
        // new
        cy.server();
        cy.route('POST', '**/api/sign_up/**').as('signUp');
        // cy.route({
        //     method: 'POST',
        //     url: '**/api/sign_up/**',
        //     status: 201,
        //     response: {
        //         'id': 1,
        //         'username': 'xyz@example.com',
        //         'first_name': 'Mithun',
        //         'last_name': 'Banerjee',
        //         'group': 'driver',
        //     }
        // }).as('signUp');

        cy.visit('/#/sign-up');
        cy.get('input#username').type('gary.cole@example.com');
        cy.get('input#firstName').type('Gary');
        cy.get('input#lastName').type('Cole');
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('select#group').select('driver');

        // Handle file upload
        //cy.get('input#photo').attachFile('images/photo.jpg');

        cy.get('button').contains('Sign up').click();
        cy.wait('@signUp'); // new
        cy.hash().should('eq', '#/sign-up');
    });


    it('Show invalid fields on sign up error.', function () {
        cy.server();
        cy.route({
            method: 'POST',
            url: '**/api/sign_up/**',
            status: 400,
            response: {
                'username': [
                    'A user with that username already exists.'
                ]
            }
        }).as('signUp');
        cy.visit('/#/sign-up');
        cy.get('input#username').type('gary.cole@example.com');
        cy.get('input#firstName').type('Gary');
        cy.get('input#lastName').type('Cole');
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('select#group').select('driver');

        // Handle file upload
        cy.get('button').contains('Sign up').click();
        cy.wait('@signUp');
        cy.get('div.invalid-feedback').contains(
            'A user with that username already exists'
        );
        cy.hash().should('eq', '#/sign-up');
    });



});