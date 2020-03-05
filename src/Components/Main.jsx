import React from 'react'
import './Main.css'
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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



var selectedEvent

let ws;
let wsLocation = parseQuery(window.location.search).dev !== undefined
    ? `ws://localhost:8180/`
    : 'wss://ourfrc.com/api/'

/* Purpose of the following let wsLocation line
Uncomment the below line when working in a development environment 
where you are running the api server locally and looking
for faster updates to come through for testing purposes 
*/
//let wsLocation = "ws://localhost:8180/"

wsLocation += window.location.pathname.split('/').slice(-1)[0];
ws = new WebSocket(wsLocation);
const debug = parseQuery(window.location.search).debug !== undefined;

function parseQuery(queryString) {
    const query = {};
    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i += 1) {
        const pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}
class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }


    // single websocket instance for the own application and constantly trying to reconnect.
    componentDidMount() {

        //this.connect();
        console.log(ws)
        ws.onopen = function () {
            if (debug) console.log('connected');
            ws.send(JSON.stringify({
                action: 'getEvents',
                data: parseQuery(window.location.search).id
            }));
        };
        ws.onmessage = (e) => {
            const payload = JSON.parse(e.data)
            console.log(payload)
            if (debug) console.log(payload)
            // update is sent after each job completes
            if (payload.action === 'update') {
                for (let entry in payload.data){
                    this.setState({ [entry]: payload.data[entry] })
                }
            }
            // fullUpdate is sent once after connection. Contains entire state.
            if (payload.action === 'fullUpdate') {
                payload.data.forEach(entry => { this.setState({ [entry.name]: entry.value }) })
            }
            if (payload.action === 'refresh') {
                window.location.reload()
                console.log(payload)

            }
            if (payload.action === 'setSession') {
                //app.session = payload.data;
            }
        }
        // If socket is closed, retry connection every 5 seconds
        ws.onclose = function () {
            if (debug) console.log('session closed');
        };


    }
    handleChange(event){
        selectedEvent = event.target.value
        console.log(selectedEvent)
        
    }
    handleClick(event){
        console.log(selectedEvent)
        //currentComponent.setState({ eventValue: selectedEvent})
    }

    timeout = 250; // Initial timeout duration as a class variable
    render() {
        return (
            <Box>
                <Form handleClick={this.handleClick.bind(this)} handleChange={this.handleChange.bind(this)} payload={this.state}/>
            </Box>
        )
    }

}

class Form extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            eventValue: []
        };
    }

    renderEventDropdown() {
        const { payload } = this.props
        if (payload.events != undefined) {
            return payload.events.map((event, index) => {
                return (
                    <MenuItem key={index} value={event.tbaEventKey}>{event.tbaEventName}</MenuItem>
                )
            })
        }
    }

    render() {
        return (
            <div>
                <FormControl id="eventsLabel" className={useStyles.formControl}>
                    <InputLabel id="eventsInputLabel">Events</InputLabel>
                    <Select
                        labelId="eventsLabel"
                        id="eventSelect"
                        autoWidth
                        defaultValue=''
                        onChange={this.props.handleChange}
                    >
                        {this.renderEventDropdown()}
                        
                    </Select>
                    <Button onClick={this.props.handleClick} variant="contained">Default</Button>
                    <FormHelperText>Select District Event</FormHelperText>
                </FormControl>
            </div>
        )
    }
}





export default Main