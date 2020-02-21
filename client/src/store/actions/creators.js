import * as actionTypes from '../types/types'

// for local dev
//const weather_station_server = "http://localhost:8080"
// for production
const weather_station_server = "https://weather-station-collector.azurewebsites.net"


const onLoginSuccessActionCreator = (user) => {
    return ({type: actionTypes.ON_LOGIN_SUCCESS, payload: user})
}

const onLoginFailActionCreator = (message) => {
    return ({type: actionTypes.ON_LOGIN_FAIL, payload: message})
}

const onLogoffActionCreator = () => {
    return({type: actionTypes.ON_LOGOFF})
}

const onUpdateActionCreator = (reading) => {
    return({type: actionTypes.ON_UPDATE, payload: reading})
}

const onConnectActionCreator = (socket) => {
    return({type: actionTypes.ON_CONNECT, payload: socket})
}

export const onLogin = (user) => {
    return (dispatch) => {
        fetch(weather_station_server.concat("/login"), {
            method: 'POST',  
            body: JSON.stringify({user: user }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response)=> {  
            if (response.status === 200) {
                response.json()
                .then((json) => {
                    localStorage.setItem('token', json.token)
                    user['token'] = json.token
                    dispatch(onLoginSuccessActionCreator(user));
                });
            }
            else {
                dispatch(onLoginFailActionCreator(`Server returned code ${response.status}`))
            }
        })
    }
}

export const onAuth = (token) => {
    return (dispatch) => {
        fetch(weather_station_server.concat("/verify"), {
            method: 'POST',  
            body: JSON.stringify({token: token }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response)=> {  
            if (response.status === 200) {
                response.json()
                .then((json) => {
                    // login action needs a {user} which has username & token
                    const user = { username: json.username, token: token }
                    dispatch(onLoginSuccessActionCreator(user));
                });
            }
            else {
                dispatch(onLoginFailActionCreator(`Server returned code ${response.status}`))
            }
        })
        .catch(error => console.log(error))
    }
}

export const onRegister = (user) => {
    return (dispatch) => {
        fetch(weather_station_server.concat("/register"), {
            method: 'POST',  
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response)=> {  
            if (response.status === 200) {
                response.json()
                .then((json) => {
                    localStorage.setItem('token', json.token)
                    user['token'] = json.token
                    dispatch(onLoginSuccessActionCreator(user));
                });
            }
            else {
               dispatch(onLoginFailActionCreator(`Server returned code ${response.status}`))
            }
        })
    }
}

export const onLogoff = () => {
    return (dispatch) => {
        localStorage.removeItem('token')
        dispatch(onLogoffActionCreator())
    }
}

export const onUpdate = (token) => {
    return (dispatch) => {
        fetch(weather_station_server, {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        })
        .then((response)=> {  
            if (response.status === 200) {
                response.json()
                .then((json) => {
                    dispatch(onUpdateActionCreator(json))
                })
            }
            else {
                dispatch(onLoginFailActionCreator(`Server returned code ${response.status}`))
            }
        })
    }
}

export const onConnect = (socket) => {
    return (dispatch) => {
        dispatch(onConnectActionCreator(socket))
    }
}
