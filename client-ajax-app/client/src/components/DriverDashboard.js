// client/src/components/DriverDashboard.js
//The only difference between the riders' and drivers' dashboards is that the drivers' dashboard also shows a list of requested trips.
import React, { useEffect, useState } from 'react';
import {
    Breadcrumb, Card, Col, Row
} from 'react-bootstrap';
import TripCard from './TripCard';
// import { Redirect } from 'react-router-dom';
// import { isDriver } from '../services/AuthService';
import { webSocket } from 'rxjs/webSocket';
import { getAccessToken } from '../services/AuthService';

import { getTrips } from '../services/TripService';

import { toast } from 'react-toastify';


function DriverDashboard(props) {

    const [trips, setTrips] = useState([]);

    useEffect(() => {
        const loadTrips = async () => {
            const { response, isError } = await getTrips();
            if (isError) {
                setTrips([]);
            } else {
                setTrips(response.data);
            }
        }
        loadTrips();
    }, []);
    // This code establishes a WebSocket connection to the server and listens for incoming messages.
    // When the server pushes a message to the client, the component updates the list of trips. 
    // useEffect() hook returns a function that unsubscribes from the WebSocket subscription.
    useEffect(() => {
        const token = getAccessToken();
        const ws = webSocket(`ws://localhost:8000/rideShare/?token=${token}`);
        const subscription = ws.subscribe((message) => {
            setTrips(prevTrips => [
                ...prevTrips.filter(trip => trip.id !== message.data.id),
                message.data
            ]);
            updateToast(message.data);
        }); 
        return () => {
            subscription.unsubscribe();
        }
    }, []);

    // if (!isDriver()) {
    //     return <Redirect to='/' />
    // }


    const getCurrentTrips = () => {
        return trips.filter(trip => {
            return trip.driver !== null && trip.status !== 'COMPLETED';
        });
    }


    const getRequestedTrips = () => {
        return trips.filter(trip => {
            return trip.status === 'REQUESTED';
        });
    }


    const getCompletedTrips = () => {
        return trips.filter(trip => {
            return trip.status === 'COMPLETED';
        });
    }

    const updateToast = (trip) => {
        if (trip.driver === null) {
            toast.info(`Rider ${trip.rider.username} has requested a trip.`);
        }
    };

    return (
        <Row>
            <Col lg={12}>
                <Breadcrumb>
                    <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
                    <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
                </Breadcrumb>

                <TripCard
                    title='Current Trip'
                    trips={getCurrentTrips()}
                    group='driver'
                    otherGroup='rider'
                />

                {/* changed */}
                <TripCard
                    title='Requested Trips'
                    trips={getRequestedTrips()}
                    group='driver'
                    otherGroup='rider'
                />

                {/* changed */}
                <TripCard
                    title='Recent Trips'
                    trips={getCompletedTrips()}
                    group='driver'
                    otherGroup='rider'
                />

                {/* <Card className='mb-3'>
                    <Card.Header>Current Trip</Card.Header>
                    <Card.Body>
                        No trips.
                    </Card.Body>
                </Card>
                <Card className='mb-3'>
                    <Card.Header>Requested Trips</Card.Header>
                    <Card.Body>
                        No trips.
                    </Card.Body>
                </Card>
                <Card className='mb-3'>
                    <Card.Header>Recent Trips</Card.Header>
                    <Card.Body>
                        No trips.
                    </Card.Body>
                </Card> */}
            </Col>
        </Row>
    );
}

export default DriverDashboard;