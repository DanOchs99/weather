import React, {useEffect} from 'react';
import './Reading.css';
import {connect} from 'react-redux'
import * as actionCreators from '../store/actions/creators'

function Reading(props) {

    const initReading = props.onUpdate
    const initToken = props.token
    useEffect(() => {
        initReading(initToken)
    }, [initReading, initToken])

    //const handleClickUpdate = () => {
    //    props.onUpdate(props.token)
    //}

    props.socket.on('newReading', () => {
        props.onUpdate(props.token)
    })

    return (
        <div>
          <div className="displayReadings">
            {props.success ? <div> {props.reading.temp}&deg;F </div> : null}
            {props.success ? <div> {props.reading.humidity}% RH </div> : null}
          </div>
          <div className="displayReadings">
            {props.success ? <div className="info"> {props.reading.devname} </div> : null}  
            {props.success ? <div className="info2"> Device ID: {props.reading.devid} </div> : null}
            {props.success ? <div className="info"> {props.reading.time} </div> : null}
            <div className="info"> {props.message} </div>
          </div>
        </div>
    )
}

// JSX removed - last line of second .displayReadings div
/*

<button onClick={handleClickUpdate}>Update</button>

*/

const mapStateToProps = (state) => {
    return { token: state.token, 
             reading: state.reading,
             success: state.success,
             message: state.readingMessage,
             socket: state.socket }
}

const mapDispatchToProps = (dispatch) => {
    return { onUpdate: (token) => dispatch(actionCreators.onUpdate(token)) }
}

export default connect(mapStateToProps, mapDispatchToProps)(Reading)