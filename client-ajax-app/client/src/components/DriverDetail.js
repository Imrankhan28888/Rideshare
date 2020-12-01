// client/src/components/DriverDetail.js

import React, { useEffect, useState } from 'react';
import {
    Breadcrumb, Button, Card, Col, Row
} from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap';

import TripMedia from './TripMedia';
import { getTrip } from '../services/TripService';


import { webSocket } from 'rxjs/webSocket';
import { getAccessToken, getUser } from '../services/AuthService';

// DriverDetail component expects a match property to be passed to it.As the React Router documentation states, "a match object contains information about how a <Route path> matched the URL." When a user clicks on a trip card from the dashboard, it will link to the detail via the trip's ID.

// The useEffect() hook listens for changes to the match object and loads the data for the given trip into the component.Whenever the data finishes loading, the component will display the trip information.

function DriverDetail({ match }) {
    const [trip, setTrip] = useState(null);

    useEffect(() => {
        const loadTrip = async (id) => {
            const { response, isError } = await getTrip(id);
            if (isError) {
                setTrip(null);
            } else {
                setTrip(response.data);
            }
        }
        loadTrip(match.params.id);
    }, [match]);
    // Here the updateTripStatus() function accepts a status argument, updates the targeted trip, creates a WebSocket connection with the server, and sends a message with the updated trip over the wire. (Note:- The server will receive the driver's message and will broadcast it to the appropriate rider.) REmember to update the imports in the DriverDetail component to include the webSocket, getAccessToken, and getUser functions.
    const updateTripStatus = (status) => {
        const driver = getUser();
        const updatedTrip = { ...trip, driver, status };
        const token = getAccessToken();
        const ws = webSocket(`ws://localhost:8000/rideShare/?token=${token}`);
        ws.subscribe();
        ws.next({
            type: 'update.ride',
            data: {
                ...updatedTrip,
                driver: updatedTrip.driver.id,
                rider: updatedTrip.rider.id
            }
        });
        setTrip(updatedTrip);
    };


    let tripMedia;

    if (trip === null) {
        tripMedia = <>Loading...</>;
    } else {
        tripMedia = (
            <TripMedia
                trip={trip}
                otherGroup='rider'
            />
        )
    }

    return (
        <Row>
            <Col lg={12}>
                <Breadcrumb>
                    <LinkContainer to='/driver'>
                        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                    </LinkContainer>
                    <Breadcrumb.Item active>Trip</Breadcrumb.Item>
                </Breadcrumb>
                <Card className='mb-3' data-cy='trip-card'>
                    <Card.Header>Trip</Card.Header>
                    <Card.Body>{tripMedia}</Card.Body>
                    <Card.Footer>
                        {
                            trip !== null && trip.status === 'REQUESTED' && (
                                <Button
                                    data-cy='status-button'
                                    block
                                    variant='primary'
                                    onClick={() => updateTripStatus('STARTED')}
                                >Drive to pick up
                                </Button>
                            )
                        }
                        {
                            trip !== null && trip.status === 'STARTED' && (
                                <Button
                                    data-cy='status-button'
                                    block
                                    variant='primary'
                                    onClick={() => updateTripStatus('IN_PROGRESS')}
                                >Drive to drop off
                                </Button>
                            )
                        }
                        {
                            trip !== null && trip.status === 'IN_PROGRESS' && (
                                <Button
                                    data-cy='status-button'
                                    block
                                    variant='primary'
                                    onClick={() => updateTripStatus('COMPLETED')}
                                >Complete trip
                                </Button>
                            )
                        }
                        {
                            trip !== null && !['REQUESTED', 'STARTED', 'IN_PROGRESS'].includes(trip.status) && (
                                <span className='text-center'>Completed</span>
                            )
                        }
                    </Card.Footer>
                </Card>
            </Col>
        </Row>
    );
}

export default DriverDetail;