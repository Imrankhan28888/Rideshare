// client/src/components/Rider.js
//The rider should see the trip that they are currently on and the trips that they recently took.

// import React, { useEffect, useState } from 'react'; 
// import {
//     Breadcrumb, Card, Col, Row
// } from 'react-bootstrap';
// import { Redirect } from 'react-router-dom'; 
// import { isRider } from '../services/AuthService';
// import { getTrips } from '../services/TripService';

// import TripCard from './TripCard';

// function Rider(props) {

//     const [trips, setTrips] = useState([]);
//     // The useEffect() function takes two arguments.The first argument is a function that gets executed whenever the Rider component refreshes.The second argument is a list of variables that React should monitor.When the monitored code changes, it should trigger React to reload the useEffect() function.Passing an empty list ensures that the useEffect() function only runs once.
//     // Inside useEffect(), we're defining a loadTrips() function that calls the getTrips() service function and then updates the trips data. The trips data is an empty list by default, before the component loads.
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

//     //Added these functions filter the trips so that we can put them in the right buckets.

//     // Current trips are any trips that have been requested but not started yet.A trip that does not have a driver and is not completed is considered a current trip
//     const getCurrentTrips = () => {
//         return trips.filter(trip => {
//             return (
//                 trip.driver !== null &&
//                 trip.status !== 'REQUESTED' &&
//                 trip.status !== 'COMPLETED'
//             );
//         });
//     };

//     //Completed trips are ones that have a COMPLETED status.
//     const getCompletedTrips = () => {
//         return trips.filter(trip => {
//             return trip.status === 'COMPLETED';
//         });
//     };

//     // Here checks to see if the user is a rider.If they are, then the code execution proceeds; and if they are not, then the code immediately redirects the user to the home screen.
//     if (!isRider()) {
//         return <Redirect to='/' />
//     }
//     return (
//         <Row>
//             <Col lg={12}>
//                 <Breadcrumb>
//                     <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
//                     <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
//                 </Breadcrumb>
//                 {/* If the user is a rider, then they'll see two panels: current trips and completed trips. */}
//                 <TripCard
//                     title='Current Trip'
//                     trips={getCurrentTrips()}
//                     group='rider'
//                     otherGroup='driver'
//                 />

//                 <TripCard
//                     title='Recent Trips'
//                     trips={getCompletedTrips()}
//                     group='rider'
//                     otherGroup='driver'
//                 />

//                 {/* <Card className='mb-3'>
//                     <Card.Header>Current Trip</Card.Header>
//                     <Card.Body>
//                         No trips.
//             </Card.Body>
//                 </Card>
//                 <Card className='mb-3'>
//                     <Card.Header>Recent Trips</Card.Header>
//                     <Card.Body>
//                         No trips.
//             </Card.Body>
//                 </Card> */}
//             </Col>
//         </Row>
//     );
// }


import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import RiderDashboard from './RiderDashboard';
import RiderDetail from './RiderDetail';
import RiderRequest from './RiderRequest';
import { isRider } from '../services/AuthService';

function Rider(props) {
    if (!isRider()) {
        return <Redirect to='/' />
    }

    return (
        <Switch>
            {/* This new code adds the routing to explicitly point to the RiderRequest component. Note that the /rider/request route comes before the /rider/:id route. This is important because the /rider/:id route will match any /rider/* pattern. The order matters. */}
            <Route path='/rider/request' component={RiderRequest}/>
            <Route path='/rider/:id' component={RiderDetail} />
            <Route component={RiderDashboard} />
        </Switch>
    )
}


export default Rider;