import React from 'react'
import './Main.css'
import Box from '@material-ui/core/Box';
import moment from 'moment'

let ws;
/*let wsLocation = parseQuery(window.location.search).dev !== undefined
    ? `ws://localhost:8180/`
    : 'wss://ourfrc.com/hook/'
*/
/* Purpose of the following let wsLocation line
Uncomment the below line when working in a development environment 
where you are running the api server locally and looking
for faster updates to come through for testing purposes 
*/
let wsLocation = "wss://ourfrc.com/api/"

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
            const payload = JSON.parse(e.data);
            console.log(payload)
            if (debug) console.log(payload);
            // update is sent after each job completes
            if (payload.action === 'update') {

            }
            // fullUpdate is sent once after connection. Contains entire state.
            if (payload.action === 'fullUpdate') {

            }
            if (payload.action === 'refresh') {
                window.location.reload()
                console.log(payload)

            }
            if (payload.action === 'setDashboard') {
                window.location.href = `/${payload.data}.html${window.location.search}`
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

    timeout = 250; // Initial timeout duration as a class variable
    render() {
        return (
            <Box>
                <p>Test</p>
            </Box>
        )
    }

}






export default Main;