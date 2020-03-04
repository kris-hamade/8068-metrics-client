import React from 'react'
import './Form.css'
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

var events = []

class Form extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            events: []
        };
    }
    componentDidUpdate() {


    }

    renderEventDropdown() {
        const { payload } = this.props
        //console.log(payload.events)

        if (payload.events != undefined) {
                return payload.events.map((event, index) => {
                    return (
                        <MenuItem value={event.tbaEventKey}>{event.tbaEventName}</MenuItem>
                    )
                })
        }
    }
    render() {

        console.log(this.renderEventDropdown())
        return (
            <div>
                <FormControl id="eventsLabel" className={useStyles.formControl}>
                    <InputLabel id="eventsInputLabel">Events</InputLabel>
                    <Select
                        labelId="eventsLabel"
                        id="demo-simple-select"
                    >
                        {this.renderEventDropdown()}
                    </Select>
                </FormControl>
            </div>
        )
    }
}

export default Form