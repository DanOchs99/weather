import * as actionTypes from '../types/types'

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

export const onLogin = (user) => {
    return (dispatch) => {
        fetch("http://localhost:8080/login", {
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
        fetch("http://localhost:8080/verify", {
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
    }
}

export const onRegister = (user) => {
    return (dispatch) => {
        fetch("http://localhost:8080/register", {
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
        fetch("http://localhost:8080", {
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            }
        })
        .then((response)=> {  
            if (response.status === 200) {
                response.json()
                .then((json) => {
                    console.log(json)
                    dispatch(onUpdateActionCreator(json))
                })
            }
            else {
                dispatch(onLoginFailActionCreator(`Server returned code ${response.status}`))
            }
        })
    }
}
