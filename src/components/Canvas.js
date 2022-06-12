import React from 'react'
import { useRef, useEffect, useState, useContext } from 'react'
import {createUseStyles} from 'react-jss'
import Axios from 'axios'
import { ColorValue } from '../App'
import colorPalleteJsonFile from '../colors.json';

const useStyles = createUseStyles({
    'canvas': {
        margin: 'auto',
        imageRendering: 'pixelated',
        display: 'table-row'
    },
    'canvasBorder': {
        border: '1px solid gray',
        display: 'table' // Used for sizing the parent exactly to the height and width of its child (canvas)
    }
})

export default function Canvas(props) {
    const s = useStyles()
    const canvasRef = useRef(null)
    const [canvasPixelPositions, setCanvasPixelPositions] = useState({x: 0, y: 0})
    const selectedColor = useContext(ColorValue);
    const [toDraw, setToDraw] = useState(false) //When this value changes, the Drawer component picks it up and sends draw attempt to API
    const [imageData, setImageData] = useState([])
    const [colorPallete, setColorPallete] = useState([])
    const isCanvasMoving = useRef(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = 1000;
        ctx.canvas.height = 1000;

        //render()
    }, [])

    useEffect(() => listenForTileUpdates(), [])
    
    function listenForTileUpdates() {
        // Create WebSocket connection.
        const socket = new WebSocket('ws://localhost:3001');
        console.log("hiii")
        
        // Listen for messages
        socket.addEventListener('message', e => {
            let res = JSON.parse(e.data)
            console.log(res);
            if(res.offset !== 0 || res.value !== 0) updateTile(res.offset, res.value)
        });
    }
    function updateTile(offset, value) {
        let imageDataCopy = new Uint8ClampedArray(imageData.buffer) 
        let imageData32 = new Uint32Array(imageDataCopy.buffer)

        imageData32[offset] = colorPallete[value]
        console.log(imageData)
        console.log(colorPallete)

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        let resultImage = new ImageData(imageDataCopy, 1000, 1000)
        ctx.putImageData(resultImage, 0, 0)
        setImageData(imageDataCopy)
    }
    function getColorPalleteABGR() {
        var dataView = new DataView(new ArrayBuffer(4));

        // The first byte is alpha, which is always going to be 0xFF
        dataView.setUint8(0, 0xFF);
        let paletteABGR = colorPalleteJsonFile.map(colorArr => {
            dataView.setUint8(1, colorArr[1]);
            dataView.setUint8(2, colorArr[2]);
            dataView.setUint8(3, colorArr[3]);
            return dataView.getUint32(0);
        });
        setColorPallete(paletteABGR)
    }
    useEffect(() => getColorPalleteABGR(), [])

    useEffect(() => {
        Axios.get("http://localhost:3001/api/canvas/get")
        .then(res => {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')

            let Uint8CanvasArray = getUint8ClampedArray(res.data)
            let resultImage = new ImageData(Uint8CanvasArray, 1000, 1000)
            ctx.putImageData(resultImage, 0, 0)
            setImageData(Uint8CanvasArray)
        })
        .then(() => {
            //console.log(performance.now() - start)
        })
    }, [colorPallete])

    function getUint8ClampedArray(arr) {
        let imageDataArr = new Uint8ClampedArray((arr.length - 1) * 4)
        let imageDataArr32Int = new Uint32Array(imageDataArr.buffer)

        for(let i = 0; i < arr.length; i++) {
            imageDataArr32Int[i] = colorPallete[arr[i].value]
        }

        return imageDataArr
    }
    useEffect(() => {
        drawPixel(props.toDraw)
    }, [props.toDraw])
    function drawPixel(e) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#' + selectedColor.hex
        //ctx.fillStyle = 'red'
        ctx.fillRect(props.coordinates.x, props.coordinates.y, 1, 1)

        //sendDraw(canvasPixelPositions.x, canvasPixelPositions.y, 50)
        //setToDraw(!toDraw)
    }

    function sendDraw(x, y, colorValue) {
        const offset = x + (1000 * y)
        Axios.put("http://localhost:3001/api/canvas/draw/put", {offset: offset, value: colorValue})
        .then(res => console.log(res))
    }
    function updateCoordinates(e) {
        const ctxOffset = getPosition(canvasRef.current)
        if(isCanvasMoving.current) props.setCurrentCanvasOffsetScreen(ctxOffset)
        const canvasPos = {x: (e.pageX - ctxOffset.x), y: (e.pageY - ctxOffset.y)}
        const newCanvasPixelPositions = {x: Math.floor(canvasPos.x / props.zoom), y: Math.floor(canvasPos.y / props.zoom)}
        if(newCanvasPixelPositions.x !== props.coordinates.x || newCanvasPixelPositions.y !== props.coordinates.y) {
            props.setCoordinates(newCanvasPixelPositions)
        }
    }
    function getPosition(element) {
        var clientRect = element.getBoundingClientRect();
        return {x: clientRect.left + document.body.scrollLeft,
                y: clientRect.top + document.body.scrollTop};
    }

    return (
        <div className={s.canvasBorder}>
            <canvas onWheel={() => isCanvasMoving.current = true} onMouseUp={() => isCanvasMoving.current = false} onMouseDown={() => isCanvasMoving.current = true} onMouseMove={e => updateCoordinates(e)} className={s.canvas} ref={canvasRef}>
            </canvas>
        </div>
    )
}
// Canvas.defaultProps = {
//     transform: `scale(1, 1)`
// }
