import axios from 'axios';

import { getAccessToken } from './AuthService';
// Function to retrieve a single trip and another function to list all of the trips for the user
//Get a single Ride
export const getTrip = async (id) => {
    //const url = `${process.env.REACT_APP_BASE_URL}/api/trip/${id}/`;
    const url = `http://localhost:8000/api/rides/${id}/`;
    // We're importing the getAccessToken() function to retrieve the access token from localStorage. Remeber to add this in AuthService.js
    const token = getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    try {
        const response = await axios.get(url, { headers });
        return { response, isError: false };
    } catch (response) {
        return { response, isError: true };
    }
};
//Get a all Rides
export const getTrips = async () => {
    const url = `http://localhost:8000/api/rides/`;
    const token = getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    try {
        const response = await axios.get(url, { headers });
        console.log(response)
        return { response, isError: false };
    } catch (response) {
        return { response, isError: true };
    }
};