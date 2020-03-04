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

class Form extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedEvent: []
        };
    }
    eventData() {
        const { payload } = this.props
        console.log(payload)
    }

    render() {
        
        
        return (
            <div>
                <FormControl className={useStyles.formControl}>
                    <InputLabel id="eventsLabel">Events</InputLabel>
                    <Select
                    labelId="deventsLabel"
                    id="demo-simple-select"
                    >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                </FormControl>
            </div>
        )
    }
}

export default Form