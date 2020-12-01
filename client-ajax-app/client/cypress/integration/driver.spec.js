// client/cypress/integration/driver.spec.js
import { webSocket } from 'rxjs/webSocket';
const faker = require('faker');

const randomEmail = faker.internet.email();
const randomEmailDriver = faker.internet.email();  
const randomEmailRider = faker.internet.email();  
const riderEmail = faker.internet.email();

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
        status: "REQUESTED",
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
    const { username, password } = Cypress.env('credentials-driver');
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

//this test will log a rider into the app and show that the user cannot visit the driver's dashboard.
describe('The driver dashboard', function () {
    it('Cannot be visited if the user is not a driver', function () {
        cy.server();
        cy.route('POST', '**/api/sign_up/**').as('signUp');
        cy.route('POST', '**/api/log_in/').as('logIn');

        cy.visit('/#/sign-up');
        cy.get('input#username').type(randomEmail);
        cy.get('input#firstName').type('Shane');
        cy.get('input#lastName').type('Cole');
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('select#group').select('rider');


        cy.get('button').contains('Sign up').click();
        cy.wait('@signUp');
        cy.hash().should('eq', '#/log-in');

        // Log in.
        cy.visit('/#/log-in')
        cy.get('input#username').type(randomEmail);
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('button').contains('Log in').click();
        cy.hash().should('eq', '#/');
        cy.get('button').contains('Log out');
        cy.wait('@logIn');

        cy.visit('/#/driver');
        cy.hash().should('eq', '#/');
    })
    // This test for the driver to prove that authenticated users can visit the dashboard according to their groups.
    it('Can be visited if the user is a driver', function () {
        cy.server();
        cy.route('POST', '**/api/sign_up/**').as('signUp');
        cy.route('POST', '**/api/log_in/').as('logIn');

        cy.visit('/#/sign-up');
        cy.get('input#username').type(randomEmailDriver);
        cy.get('input#firstName').type('Gary');
        cy.get('input#lastName').type('Cole');
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('select#group').select('driver');


        cy.get('button').contains('Sign up').click();
        cy.wait('@signUp');
        cy.hash().should('eq', '#/log-in');

        // Log in.
        cy.visit('/#/log-in');
        cy.get('input#username').type(randomEmailDriver);
        cy.get('input#password').type('pAssw0rd', { log: false });
        cy.get('button').contains('Log in').click();
        cy.hash().should('eq', '#/');
        cy.get('button').contains('Log out');
        cy.wait('@logIn');

        cy.visit('/#/driver');
        cy.hash().should('eq', '#/driver');
    })

    // In the test, we're mocking calls to the GET /api/trip/ API so that the response always contains no trips. Then, we're logging a driver into the app, navigating to the driver dashboard, waiting for the trips API to resolve, and checking that no trips loaded into any of the three panels.

    it('Displays messages for no trips', function () {
        cy.server();
        cy.route('POST', '**/api/log_in/').as('logIn');

        cy.route({
            method: 'GET',
            url: '**/api/rides/',
            //url:'http://localhost:8000/api/rides/',
            status: 200,
            response: []
        }).as('getTrips');

        //logIn(riderEmail);
        logIn()

        cy.visit('/#/driver');
        cy.wait('@getTrips');

        // Current trips.
        cy.get('[data-cy=trip-card]')
            .eq(0)
            .contains('No trips.');

        // Requested trips.
        cy.get('[data-cy=trip-card]')
            .eq(1)
            .contains('No trips.');

        // Completed trips.
        cy.get('[data-cy=trip-card]')
            .eq(2)
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

        //cy.logIn(driverEmail);
        logIn()
        cy.visit('/#/driver');
        cy.wait('@getTrips');

        // Current trips.
        cy.get('[data-cy=trip-card]')
            .eq(0)
            .contains('STARTED');

        // Requested trips.
        cy.get('[data-cy=trip-card]')
            .eq(1)
            .contains('REQUESTED');

        // Completed trips.
        cy.get('[data-cy=trip-card]')
            .eq(2)
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

        //cy.logIn(driverEmail);
        logIn()

        cy.visit(`/#/driver/${tripResponse[0].id}`);

        cy.get('[data-cy=trip-card]')
            .should('have.length', 1)
            .and('contain.text', 'STARTED');
    });

    // In this test, we simulate a driver logging in and we confirm that he has no trips.
    // Next, we simulate a rider logging in, connecting to the server, and sending a ride request through a WebSocket connection.
    // Lastly, we confirm that the ride request appears on the drivers' dashboard.


    // it('Can receive a ride request', function () {
    //     cy.server();
    //     cy.route({
    //         method: 'GET',
    //         url: '**/api/rides/',
    //         status: 200,
    //         response: []
    //     }).as('getTrips');

    //     //cy.logIn(driverEmail);
    //     //Driver logs IN
    //     logIn();

    //     cy.visit('/#/driver');
    //     cy.wait('@getTrips');

    //     // Requested trips. It should show no trip as of now
    //     cy.get('[data-cy=trip-card]')
    //         .eq(1)
    //         .contains('No trips.');

    //     // Make trip request as rider.
    //     cy.request({
    //         method: 'POST',
    //         url: 'http://localhost:8000/api/log_in/',
    //         body: {
    //             "username": 'rider@rideShare.com',
    //             "password": "1234"
    //         }
    //     }).then((response) => {
    //         const token = response.body.access;
    //         const ws = webSocket(`ws://localhost:8000/rideShare/?token=${token}`);
    //         ws.subscribe();
    //         ws.next({
    //             type: 'create.ride',
    //             data: {
    //                 pick_up_address: '123 Main Street',
    //                 drop_off_address: '456 Elm Street',
    //                 rider: 2
    //             }
    //         });
    //     });

    //     // Requested trips.
    //     cy.get('[data-cy=trip-card]')
    //         .eq(1)
    //         .contains('REQUESTED');
    // });

})