import React, {useState} from 'react';
import './App.css';
import {connect} from 'react-redux'
import * as actionCreators from './store/actions/creators'
import Reading from './components/Reading'

function App(props) {
  const [login, setLogin] = useState({})

  const handleClickLogin = () => {
    props.onLogin(login)
  }

  const handleClickLogout = () => {
    props.onLogoff()
  }

  const handleClickRegister = () => {
    props.onRegister(login)
  }

  const handleOnChangeLogin = (e) => {
    setLogin({...login, [e.target.name]: e.target.value})
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather Station</h1>
        {!props.isAuthenticated && <div id="loginDiv">
                                     <button id="loginButton" onClick={handleClickLogin}>Login</button>
                                     <button id="registerButton" onClick={handleClickRegister}>Register</button>
                                   </div> }
        {!props.isAuthenticated && <input onChange={handleOnChangeLogin} id="usernameTextbox" type="text" name="username" placeholder="username" />}
        {!props.isAuthenticated && <input onChange={handleOnChangeLogin} id="passwordTextbox" type="password" name="password" placeholder="password" />}
        {props.isAuthenticated && <div id="logoutDiv">
                                    <div id="userDiv">{props.username}</div>
                                    <button id="logoutButton" onClick={handleClickLogout}>Logout</button>
                                  </div> }
        {props.isAuthenticated && <Reading /> }
        <div>{props.message}</div>
      </header>
    </div>
  );
}

const mapStateToProps = (state) => {
  return { isAuthenticated: state.isAuthenticated,
           username: state.username,
           token: state.token,
           message: state.message }
}

const mapDispatchToProps = (dispatch) => {
  return { onLogin: (user) => dispatch(actionCreators.onLogin(user)),
           onRegister: (user) => dispatch(actionCreators.onRegister(user)),
           onLogoff: () => dispatch(actionCreators.onLogoff()) }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
