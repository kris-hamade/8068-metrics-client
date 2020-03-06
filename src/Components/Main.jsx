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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    table: {
        minWidth: 650,
    },
}));



var selectedEvent
var eventHeader = []
var matchDataForTable = []

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
                for (let entry in payload.data) {
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
    dataSend() {

        if (selectedEvent !== undefined) {
            ws.send((JSON.stringify({
                action: 'getMatchData',
                data: selectedEvent
            })))
        }
    }
    handleChange(event) {
        selectedEvent = event.target.value
        console.log(selectedEvent)

    }
    handleClick(event) {
        this.dataSend()
        //currentComponent.setState({ eventValue: selectedEvent})
    }

    timeout = 250; // Initial timeout duration as a class variable
    render() {
        return (
            <Box>
                <Form handleClick={this.handleClick.bind(this)} handleChange={this.handleChange.bind(this)} payload={this.state} />
                <MatchDataTable payload={this.state} />
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
        if (payload.events !== undefined) {
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

class MatchDataTable extends React.Component {

    renderTableHeader() {
        let eventTopLevelHeader = []
        const { payload } = this.props
        if (payload.matchData !== undefined) {
            payload.matchData.forEach((key, index) => {
                if (index === 0) {
                    let eventMatchKeyPreFilter = Object.keys(key)
                    function removeUnwantedHeaderRed(headers) {
                        return headers !== "redMatchScoreBreakdown"
                    }
                    function removeUnwantedHeaderBlue(headers) {
                        return headers !== "blueMatchScoreBreakdown"
                    }
                    let eventMatchKeyPreFilterRedRemoved = eventMatchKeyPreFilter.filter(removeUnwantedHeaderRed)
                    eventTopLevelHeader = eventMatchKeyPreFilterRedRemoved.filter(removeUnwantedHeaderBlue)

                    Object(eventTopLevelHeader).forEach((item, key) => {
                        if (eventHeader.includes(item) === false) eventHeader.push(item)
                    })
                    Object.keys(key.redMatchScoreBreakdown).forEach((item, key) => {
                        let redScoringItem = "red" + item.replace(/^\w/, c => c.toUpperCase())
                        if (eventHeader.includes(redScoringItem) === false) eventHeader.push(redScoringItem)
                    })
                    Object.keys(key.blueMatchScoreBreakdown).forEach((item, key) => {
                        let blueScoringItem = "blue" + item.replace(/^\w/, c => c.toUpperCase())
                        if (eventHeader.includes(blueScoringItem) === false) eventHeader.push(blueScoringItem)
                    })
                }

            })

        }
        return eventHeader.map((key, index) => {
            return <TableCell key={index}>{key}</TableCell>
        })
    }

    renderTableData() {
        const { payload } = this.props


        if (payload.matchData !== undefined) {
            payload.matchData.forEach((data, index) => {
                matchDataForTable.push(data)
            })
        }
        return matchDataForTable.map((data, index) => {

            return (
                <TableRow key={index}>
                    <TableCell>{data.matchKey}</TableCell>
                    <TableCell>{data.matchCompLevel}</TableCell>
                    <TableCell>{data.redMatchScore}</TableCell>
                    <TableCell>{data.redMatchTeams}</TableCell>
                    <TableCell>{data.blueMatchScore}</TableCell>
                    <TableCell>{data.blueMatchTeams}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.adjustPoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.autoCellPoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.autoCellsBottom}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.autoCellsInner}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.autoCellsOuter}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.autoInitLinePoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.autoPoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.controlPanelPoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.endgamePoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.endgameRobot1}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.endgameRobot2}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.endgameRobot3}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.endgameRungIsLevel}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.foulCount}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.foulPoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.initLineRobot1}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.initLineRobot2}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.initLineRobot3}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.rp}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.shieldEnergizedRankingPoint}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.shieldOperationalRankingPoint}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.stage1Activated}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.stage2Activated}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.stage3Activated}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.stage3TargetColor}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.tba_numRobotsHanging}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.tba_shieldEnergizedRankingPointFromFoul}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.techFoulCount}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.teleopCellPoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.teleopCellsBottom}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.teleopCellsInner}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.teleopCellsOuter}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.teleopPoints}</TableCell>
                    <TableCell>{data.redMatchScoreBreakdown.totalPoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.adjustPoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.autoCellPoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.autoCellsBottom}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.autoCellsInner}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.autoCellsOuter}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.autoInitLinePoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.autoPoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.controlPanelPoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.endgamePoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.endgameRobot1}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.endgameRobot2}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.endgameRobot3}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.endgameRungIsLevel}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.foulCount}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.foulPoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.initLineRobot1}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.initLineRobot2}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.initLineRobot3}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.rp}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.shieldEnergizedRankingPoint}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.shieldOperationalRankingPoint}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.stage1Activated}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.stage2Activated}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.stage3Activated}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.stage3TargetColor}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.tba_numRobotsHanging}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.tba_shieldEnergizedRankingPointFromFoul}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.techFoulCount}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.teleopCellPoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.teleopCellsBottom}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.teleopCellsInner}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.teleopCellsOuter}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.teleopPoints}</TableCell>
                    <TableCell>{data.blueMatchScoreBreakdown.totalPoints}</TableCell>

                </TableRow>
            )
        })

    }


    render() {
        return (
            <TableContainer component={Paper}>
                <Table className={useStyles.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {this.renderTableHeader()}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.renderTableData()}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}



export default Main