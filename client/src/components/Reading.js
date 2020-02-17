import React from 'react';
//import './App.css';
import {connect} from 'react-redux'
import * as actionCreators from '../store/actions/creators'

function Reading(props) {

    const handleClickUpdate = () => {
        props.onUpdate(props.token)
    }

    return (
        <div>
            <div>{props.reading.temp}</div>
            <div>{props.reading.humidity}</div>
            <div>{props.reading.time}</div>
            <button onClick={handleClickUpdate}>Update</button>
        </div>
    )
}

const mapStateToProps = (state) => {
    return { token: state.token, 
             reading: state.reading }
}

const mapDispatchToProps = (dispatch) => {
    return { onUpdate: (token) => dispatch(actionCreators.onUpdate(token)) }
}

export default connect(mapStateToProps, mapDispatchToProps)(Reading)