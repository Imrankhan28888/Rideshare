
// client/src/services/AuthService.js
//auth service defines a single function. It retrieves the rideShare.auth item from the browser's localStorage.
// rideShare.auth the key we use to store the JSON Web Tokens that get returned when a user logs in.If the item is in localStorage, then we take the access token string and split it into it's three constituent parts: The header, the payload, and the signature. (We ignore the header and the signature because we don't need them.)
export const getUser = () => {
    const auth = JSON.parse(window.localStorage.getItem('rideShare.auth'));
    // console.log(auth)
    if (auth) {
        const [, payload,] = auth.access.split('.');
        //decode the payload data using the window.atob() function.
        const decoded = window.atob(payload);
        return JSON.parse(decoded);
    }
    return undefined;
};


export const isDriver = () => {
    const user = getUser();
    return user && user.group === 'driver';
};

export const isRider = () => {
    const user = getUser();
    return user && user.group === 'rider';
};

// This code loads the rideShare.auth item from localStorage, parses it, and returns the access token. Remember we stored the access token in APP.js (check near )
export const getAccessToken = () => {
    const auth = JSON.parse(window.localStorage.getItem('rideShare.auth'));
    if (auth) {
        return auth.access;
    }
    return undefined;
};