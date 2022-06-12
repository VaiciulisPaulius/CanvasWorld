import Axios from 'axios'

export default function canvasAPI() {
    
    let listenForTileUpdates = () => {
        // Create WebSocket connection.
        const socket = new WebSocket('ws://localhost:3001');
        
        // Listen for messages
        socket.addEventListener('message', e => {
            let res = JSON.parse(e.data)
            console.log(res);
            updateTile(res.offset, res.value)
        });
    }

    let getCanvasData = () => {
        Axios.get("http://localhost:3001/api/canvas/get")
        .then(res => {
            return res.data
        })
    }

    let sendDraw = (x, y, colorValue) => {
        const offset = x + (1000 * y)
        Axios.put("http://localhost:3001/api/canvas/draw/put", {offset: offset, value: colorValue})
        .then(res => console.log(res))
    }

    return {}
}
// Canvas.defaultProps = {
//     transform: `scale(1, 1)`
// }
