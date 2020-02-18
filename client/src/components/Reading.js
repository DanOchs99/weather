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
            {props.success ? <div> {props.reading.temp} </div> : null}
            {props.success ? <div> {props.reading.humidity} </div> : null}
            {props.success ? <div> {props.reading.time} </div> : null}
            <div> {props.message} </div>
            <button onClick={handleClickUpdate}>Update</button>
        </div>
    )
}

const mapStateToProps = (state) => {
    return { token: state.token, 
             reading: state.reading,
             success: state.success,
             message: state.readingMessage }
}

const mapDispatchToProps = (dispatch) => {
    return { onUpdate: (token) => dispatch(actionCreators.onUpdate(token)) }
}

export default connect(mapStateToProps, mapDispatchToProps)(Reading)