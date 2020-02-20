import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {createStore, applyMiddleware, compose} from 'redux'
import {Provider} from 'react-redux'
import reducer from './store/reducers/reducer'
import thunk from 'redux-thunk'
import * as actionCreators from './store/actions/creators'
import openSocket from 'socket.io-client'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

const token = localStorage.getItem('token')
if (token) {
    store.dispatch(actionCreators.onAuth(token))
}

const socket = openSocket('https://weather-station-collector.azurewebsites.net')
if (socket) {
    store.dispatch(actionCreators.onConnect(socket))
}

ReactDOM.render(<Provider store={store} >
                  <App />
                </Provider>
                , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
