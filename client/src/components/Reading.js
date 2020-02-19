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

    const handleClickUpdate = () => {
        props.onUpdate(props.token)
    }

    return (
        <div className="displayReadings">
            {props.success ? <div> {props.reading.temp}&deg;F </div> : null}
            {props.success ? <div> {props.reading.humidity}% RH </div> : null}
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