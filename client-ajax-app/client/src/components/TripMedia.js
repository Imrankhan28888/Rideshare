// client/src/components/TripMedia.js

import React from 'react';
import { Button, Media } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

// The TripMedia component takes a trip and an otherGroup property and uses them to display data.The otherGroup property is used to find the user of the opposite group.In other words, if the user is a rider, then the other user is the driver, and vice versa.

function TripMedia({ trip, group, otherGroup }) {
    const user = trip[otherGroup];
    console.log(user);
    // const userFirstName = user.first_name
    // const userLastName = user.last_name
    const href = group ? `/${group}/${trip.id}` : undefined;

    return (
        <Media as='li'>
            {/* <img
                alt={user}
                className='mr-3 rounded-circle'
            /> */}
            <Media.Body>
                <h5 className='mt-0 mb-1'>{user.first_name} {user.last_name}</h5>
                {/* <p className='mt-0 mb-1'>{userFirstName} {userLastName}</p> */}
                {trip.pick_up_address} to {trip.drop_off_address}<br />
                {trip.status}
                {
                    href &&
                    <LinkContainer to={href}>
                        <Button variant='primary' block>Detail</Button>
                    </LinkContainer>
                }
            </Media.Body>
        </Media>
    );
}

export default TripMedia;