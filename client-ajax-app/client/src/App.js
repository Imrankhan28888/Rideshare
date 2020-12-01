// client/src/App.js

import React, { useState } from 'react';
//import { Route } from 'react-router-dom'; 
import { Button, Container, Form, Nav, Navbar } from 'react-bootstrap'; // new
import { LinkContainer } from 'react-router-bootstrap'; // new
import { Link, Route, Switch, Redirect } from 'react-router-dom';

import SignUp from './components/SignUp'; // SingUp 
import LogIn from './components/LogIn'; // LogIn
import Driver from './components/Driver.js';// Driver
import Rider from './components/Rider.js'; //Rider
import { isDriver, isRider } from './services/AuthService';

import axios from 'axios';

import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'

import './App.css';


function App() {
  // Here i modified our hook to determine the value of isLoggedIn based on whether the window.localStorage object contains an authenticated data resource.If the data is present, we know the user is logged in.If it is missing, then the user is not authenticated.
  const [isLoggedIn, setLoggedIn] = useState(() => {
    return window.localStorage.getItem('rideShare.auth') !== null;
  });
  // Changed the logIn() function to make an HTTP request.Our edits made logIn() asynchronous-- e.g., it runs asynchronously on the event loop and uses an implicit Promise to return its result.The await keyword pauses the function until the Promise is resolved or rejected.In our case, the logIn() function pauses until the the Axios HTTP client receives a response from the server.If the call succeeds, then we store the response data in window.localStorage.
  const logIn = async (username, password) => { 
    //const url = '/api/log_in/';
    const url = 'http://localhost:8000/api/log_in/';
    //http://localhost:8000/api/log_in/
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem(
        'rideShare.auth', JSON.stringify(response.data)
      );
      setLoggedIn(true);
      // When the user submits the form, the submit() function will invoke the logIn() function to send the credentials to the server.If the call fails, then the form will display the errors.
      return { response, isError: false };
    }
    catch (error) {
      console.error(error);
      return { response: error, isError: false };
    }
  };

  const logOut = () => {
    window.localStorage.removeItem('rideShare.auth');
    setLoggedIn(false);
  };
  return (
    <div>
      <Navbar bg='light' expand='lg' variant='light'>
        <LinkContainer to='/'>
          <Navbar.Brand className='logo'>RideShare APP</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse>
          {
            isRider() && (
              <Nav className='mr-auto'>
                <LinkContainer to='/rider/request'>
                  <Nav.Link>Request a trip</Nav.Link>
                </LinkContainer>
              </Nav>
            )
          }

          {
            isLoggedIn &&
            <Form inline className='ml-auto'>
              <Button type='button' onClick={() => logOut()}>Log out</Button>
            </Form>
          }
        </Navbar.Collapse>
      </Navbar>
      <Container className='pt-3'> 
        <Switch>
          <Route exact path='/' render={() => (
              <div className='middle-center'>
                <h1 className='landing logo'>RideShare</h1>
                {
                  !isLoggedIn &&
                  <Link
                    id='signUp'
                    className='btn btn-primary'
                    to='/sign-up'
                  >Sign up</Link>
                }
                {
                  !isLoggedIn &&
                  <Link
                    id='logIn'
                    className='btn btn-primary'
                    to='/log-in'
                  >Log in</Link>
                }           
                {/* Here we are adding two conditional views. If the user is a rider, then the app adds a button that links to the riders' dashboard. If the user is a driver, then the app adds a button that links to the drivers' dashboard. */}
              {
                isRider() && (
                  <Link
                    className='btn btn-primary'
                    to='/rider'
                  >Dashboard</Link>
                )
              }
              {
                isDriver() && (
                  <Link
                    className='btn btn-primary'
                    to='/driver'
                  >Dashboard</Link>
                )
              }
              </div>
          )} />
          <Route path='/sign-up' render={() => (
            isLoggedIn ? (
              <Redirect to='/' />
            ) : (
                <SignUp />
              )
          )} />
          <Route path='/log-in' render={() => (
            isLoggedIn ? (
              <Redirect to='/' />
            ) : (
            <LogIn logIn={logIn} />
            )
          )} />
          <Route path='/driver' render={() => (
            <Driver />
          )} />
          <Route path='/rider' render={() => (
            <Rider />
          )} />
        </Switch>
      </Container>
       {/* The ToastContainer will allow us to display pop-up alerts at the top of the page, overlaid on whatever is currently on the screen. */}
      <ToastContainer />
    </div>
  );
}

export default App;