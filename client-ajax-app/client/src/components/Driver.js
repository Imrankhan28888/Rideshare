// client/src/components/Driver.js
//The only difference between the riders' and drivers' dashboards is that the drivers' dashboard also shows a list of requested trips.
// import React, { useEffect, useState } from 'react';
// import {
//     Breadcrumb, Card, Col, Row
// } from 'react-bootstrap';
// import TripCard from './TripCard';
// import { Redirect } from 'react-router-dom';
// import { isDriver } from '../services/AuthService';
// import { getTrips } from '../services/TripService';

// function Driver(props) {

//     const [trips, setTrips] = useState([]);

//     useEffect(() => {
//         const loadTrips = async () => {
//             const { response, isError } = await getTrips();
//             if (isError) {
//                 setTrips([]);
//             } else {
//                 setTrips(response.data);
//             }
//         }
//         loadTrips();
//     }, []);


//     if (!isDriver()) {
//         return <Redirect to='/' />
//     }


//     const getCurrentTrips = () => {
//         return trips.filter(trip => {
//             return trip.driver !== null && trip.status !== 'COMPLETED';
//         });
//     }


//     const getRequestedTrips = () => {
//         return trips.filter(trip => {
//             return trip.status === 'REQUESTED';
//         });
//     }


//     const getCompletedTrips = () => {
//         return trips.filter(trip => {
//             return trip.status === 'COMPLETED';
//         });
//     }




//     return (
//         <Row>
//             <Col lg={12}>
//                 <Breadcrumb>
//                     <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
//                     <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
//                 </Breadcrumb>

//                 <TripCard
//                     title='Current Trip'
//                     trips={getCurrentTrips()}
//                     group='driver'
//                     otherGroup='rider'
//                 />

//                 {/* changed */}
//                 <TripCard
//                     title='Requested Trips'
//                     trips={getRequestedTrips()}
//                     group='driver'
//                     otherGroup='rider'
//                 />

//                 {/* changed */}
//                 <TripCard
//                     title='Recent Trips'
//                     trips={getCompletedTrips()}
//                     group='driver'
//                     otherGroup='rider'
//                 />

//                 {/* <Card className='mb-3'>
//                     <Card.Header>Current Trip</Card.Header>
//                     <Card.Body>
//                         No trips.
//                     </Card.Body>
//                 </Card>
//                 <Card className='mb-3'>
//                     <Card.Header>Requested Trips</Card.Header>
//                     <Card.Body>
//                         No trips.
//                     </Card.Body>
//                 </Card>
//                 <Card className='mb-3'>
//                     <Card.Header>Recent Trips</Card.Header>
//                     <Card.Body>
//                         No trips.
//                     </Card.Body>
//                 </Card> */}
//             </Col>
//         </Row>
//     );
// }

//Refactoring the code a bit

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import DriverDashboard from './DriverDashboard';
import DriverDetail from './DriverDetail';
import { isDriver } from '../services/AuthService';

function Driver(props) {
    if (!isDriver()) {
        return <Redirect to='/' />
    }
    // Add a Switch statement to Driver with routes to two child components: DriverDashboard and DriverDetail.
    // Made DriverDashboard the default component, so that when a user visits the /#/driver endpoint they are brought to the dashboard.
    return (
        <Switch>
            <Route path='/driver/:id' component={DriverDetail} />
            <Route component={DriverDashboard} />
        </Switch>
    );
}



export default Driver;