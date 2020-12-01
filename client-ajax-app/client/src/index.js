// client/src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'; // new
import 'bootswatch/dist/lumen/bootstrap.css'; // new
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken'; // new
axios.defaults.xsrfHeaderName = 'X-CSRFToken'; // new


ReactDOM.render( // changed
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();