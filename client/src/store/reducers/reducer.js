import * as actionTypes from '../types/types'

const initialState = { isAuthenticated: false, username: null, message: '', reading: {}, success: true, readingMessage: '', socket: null }

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.ON_LOGIN_FAIL:
            return {...state,
                isAuthenticated: false,
                username: null,
                token: '',
                message: action.payload.message }
        case actionTypes.ON_LOGIN_SUCCESS:
            return {...state,
                isAuthenticated: true,
                username: action.payload.username,
                token: action.payload.token,
                message: '' }
        case actionTypes.ON_LOGOFF:
            return {...state,
                isAuthenticated: false,
                username: null,
                token: '',
                message: '' }
        case actionTypes.ON_UPDATE:
            return {...state,
                reading: action.payload.reading,
                success: action.payload.success,
                readingMessage: action.payload.message  }
        case actionTypes.ON_CONNECT:
            return {...state,
                socket: action.payload }
        default:
            return state;
    }
}

export default reducer