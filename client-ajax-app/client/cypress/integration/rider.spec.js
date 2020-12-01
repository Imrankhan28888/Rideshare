// client/cypress/integration/rider.spec.js

const faker = require('faker');

const randomEmail = faker.internet.email();
const randomEmailDriver = faker.internet.email();  // changed
const randomEmailRider = faker.internet.email();  // new


const tripResponse = [
    {
        id: "94fc5eba-de7a-44b2-8000-856ec824609d",
        created: "2020-08-18T21:41:08.112946Z",
        updated: "2020-08-18T21:41:08.112986Z",
        pick_up_address: "A",
        drop_off_address: "B",
        status: "STARTED",
        driver: {
            id: 113,
            //photo: "http://localhost:8003/media/photos/photo_QI0TTYh.jpg",
        },
        rider: {
            id: 112,
            //photo: "http://localhost:8003/media/photos/photo_r3XrvgH.jpg",
        }
    },
    {
        id: "94fc5eba-de7a-44b2-8000-856ec824609d",
        created: "2020-08-18T21:41:08.112946Z",
        updated: "2020-08-18T21:41:08.112986Z",
        pick_up_address: "A",
        drop_off_address: "B",
        status: "COMPLETED",
        driver: {
            id: 113,
            //photo: "http://localhost:8003/media/photos/photo_QI0TTYh.jpg",
        },
        rider: {
            id: 112,
            //photo: "http://localhost:8003/media/photos/photo_r3XrvgH.jpg",
        }
    }
]


const logIn = () => {
    const { username, password } = Cypress.env('credentials-rider');
    // Capture HTTP requests.
    cy.server();
    cy.route('POST', '**/api/log_in/**').as('logIn');

    // Log into the app.
    cy.visit('/#/log-in');
    cy.get('input#username').type(username);
    cy.get('input#password').type(password, { log: false });
    cy.get('button').contains('Log in').click();
    cy.wait('@logIn');
};

//this test will log a driver into the app and show that the user cannot visit the rider's dashboard.
describe('The rider dashboard', function () {
    it('Cannot be visited if the user is not a rider', function () {
        cy.server();
        cy.route('POST', '**/api/sign_up/**').as('signUp');
        cy.route('POST', '**/api/log_in/').as('logIn');

        cy.visit('/#/sign-up');
        cy.get('input#username').type(randomEmail);
        cy.get('input#firstName').type('Mithun');
        cy.get('input#lastName').type('Banerjee');
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('select#group').select('driver');


        cy.get('button').contains('Sign up').click();
        cy.wait('@signUp');
        cy.hash().should('eq', '#/log-in');

        // Log in.
        cy.visit('/#/log-in');
        cy.get('input#username').type(randomEmail);
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('button').contains('Log in').click();
        cy.hash().should('eq', '#/');
        cy.get('button').contains('Log out');
        cy.wait('@logIn');

        cy.visit('/#/rider');
        cy.hash().should('eq', '#/');
    })
    // This test for the rider to prove that authenticated users can visit the dashboard according to their groups.
    it('Can be visited if the user is a rider', function () {
        cy.server();
        cy.route('POST', '**/api/sign_up/**').as('signUp');
        cy.route('POST', '**/api/log_in/').as('logIn');

        cy.visit('/#/sign-up');
        cy.get('input#username').type(randomEmailRider);
        cy.get('input#firstName').type('Gary');
        cy.get('input#lastName').type('Cole');
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('select#group').select('rider');

        cy.get('button').contains('Sign up').click();
        cy.wait('@signUp');
        cy.hash().should('eq', '#/log-in');

        // Log in.
        cy.visit('/#/log-in');
        cy.get('input#username').type(randomEmailRider);
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('button').contains('Log in').click();
        cy.hash().should('eq', '#/');
        cy.get('button').contains('Log out');
        cy.wait('@logIn');

        cy.visit('/#/rider');
        cy.hash().should('eq', '#/rider');
    })

    it('Displays messages for no trips', function () {
        cy.server();
        cy.route({
            method: 'GET',
            url: '**/api/rides/',
            status: 200,
            response: []
        }).as('getTrips');

        //cy.logIn(riderEmail);
        logIn()
        cy.visit('/#/rider');
        cy.wait('@getTrips');

        // Current trips.
        cy.get('[data-cy=trip-card]')
            .eq(0)
            .contains('No trips.');

        // Completed trips.
        cy.get('[data-cy=trip-card]')
            .eq(1)
            .contains('No trips.');
    })

    it('Displays current, requested, and completed trips', function () {
        cy.server();
        cy.route({
            method: 'GET',
            url: '**/api/rides/',
            status: 200,
            response: tripResponse
        }).as('getTrips');

        //cy.logIn(riderEmail);
        logIn();
        cy.visit('/#/rider');
        cy.wait('@getTrips');

        // Current trips.
        cy.get('[data-cy=trip-card]')
            .eq(0)
            .contains('STARTED');

        // Completed trips.
        cy.get('[data-cy=trip-card]')
            .eq(1)
            .contains('COMPLETED');
    })

    it('Shows details about a trip', () => {
        cy.server();
        cy.route({
            method: 'GET',
            url: '**/api/rides/**',
            status: 200,
            response: tripResponse[0]
        }).as('getTrips');

        //cy.logIn(riderEmail);
        logIn();

        cy.visit(`/#/rider/${tripResponse[0].id}`);

        cy.get('[data-cy=trip-card]')
            .should('have.length', 1)
            .and('contain.text', 'STARTED');
    })

    it('Can request a new trip', function () {
        cy.server();
        cy.route('GET', '**/api/rides/').as('getTrips');

        logIn();

        cy.visit('/#/rider/request');

        cy.get('[data-cy=pick-up-address]').type('123 Main Street');
        cy.get('[data-cy=drop-off-address]').type('456 South Street');
        cy.get('[data-cy=submit]').click();

        cy.wait('@getTrips');
        cy.hash().should('eq', '#/rider');
    });
})