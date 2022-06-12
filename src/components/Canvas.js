import React from 'react'
import { useRef, useEffect, useState, useContext } from 'react'
import {createUseStyles} from 'react-jss'
import './globalVars.css'
import Drawer from './Drawer'
import Axios from 'axios'
import { ColorValue, ColorPallete } from '../App'
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
    },
    'zoom': {
        width: '100vw',
        height: '100vh'
    },
    'pan': {
        
    },
    'inputField': {
        width: '100vw',
        height: '100vh'
    }
})

export default function Canvas() {
    const s = useStyles()
    const canvasRef = useRef(null)
    const [zoom, setZoom] = useState(1.5)
    const [pan, setPan] = useState({x: 0, y: 0})
    const [initialPos, setInitialPos] = useState(null)
    const [initialCanvasPos, setInitialCanvasPos] = useState(null)
    const [isHolding, setIsHolding] = useState(false)
    const [canvasPosition, setCanvasPosition] = useState({x: 0, y: 0})
    const [canvasOffset, setCanvasOffset] = useState({x: 0, y: 0})
    const [canvasPixelPositions, setCanvasPixelPositions] = useState({x: 0, y: 0})
    const [highlightDisplay, setHighlightDisplay] = useState('none')
    const selectedColor = useContext(ColorValue);
    const [toDraw, setToDraw] = useState(false) //When this value changes, the Drawer component picks it up and sends draw attempt to API
    const [imageData, setImageData] = useState([])
    const [colorPallete, setColorPallete] = useState([])

    let zoomStyle = {
        transform: `scale(1.5, 1.5)`
    };
    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = 1000;
        ctx.canvas.height = 1000;

        //render()
    }, [])

    useEffect(() => listenForTileUpdates(), [])
    
    function listenForTileUpdates() { // Not dependent on anything
        // Create WebSocket connection.
        const socket = new WebSocket('ws://localhost:3001');
        
        // Listen for messages
        socket.addEventListener('message', e => {
            let res = JSON.parse(e.data)
            console.log(res);
            if(res.offset !== 0 && res.value !== 0) updateTile(res.offset, res.value)
        });
    }
    function updateTile(offset, value) {
        let imageDataCopy = new Uint8ClampedArray(imageData.buffer) 
        let imageData32 = new Uint32Array(imageDataCopy.buffer)
        console.log(imageDataCopy)

        imageData32[offset] = colorPallete[value]

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
            console.log(Uint8CanvasArray)
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

    function zoomCanvas(e) {
        let direction = e.deltaY;

        let zoomCopy = zoom;
        if(zoom < 1) zoomCopy = 1
        zoomCopy = direction === -100 ? zoomCopy * 1.2 : zoomCopy * 0.8
        
        setZoom(zoomCopy)
    }
    function panCanvas(e) {
        const offset = getMouseOffset(e, zoom)
        const result = { x: offset.x + initialCanvasPos.x, y: offset.y + initialCanvasPos.y}

        const isCanvasWithinScreen = (result.x > -800 && result.x < 1600) && (result.y < 800 && result.y > -900)
        if(isCanvasWithinScreen) setPan(result)
    }
    function handleInput(e) {
        const type = e.type //Type of mouse event

        if(type === "mousedown") { //Init params for camera movement, drawing logic.
            setIsHolding(true)
            setInitialPos({x: e.pageX, y: e.pageY})
            setInitialCanvasPos(pan)
        }
        else if(isHolding === true && type === "mousemove") { //During mouse drag.
            const offsetRaw = getMouseOffset(e, 1)
            const distanceToInitial = Math.sqrt(Math.pow(offsetRaw.x, 2) + Math.pow(offsetRaw.y, 2))

            const offset = getMouseOffset(e, zoom)
            if(distanceToInitial >= 5) panCanvas(e)
        }
        else if(type === "mouseup") {
            const offsetRaw = getMouseOffset(e, 1)
            const distanceToInitial = Math.sqrt(Math.pow(offsetRaw.x, 2) + Math.pow(offsetRaw.y, 2))

            if(distanceToInitial < 5) drawPixel(e) //If camera not moved enough, register as a pixel draw.
            setIsHolding(false)
            // setInitialPos(null)
            // setInitialCanvasPos(null)

        }
    }
    function getMouseOffset(e, scale) { //scale === zoom, just an optional thing
        if(initialPos == null) return;
        return { x: (e.pageX - initialPos.x) / scale, y: (e.pageY - initialPos.y) / scale}
    }
    function updateCoordinates(e) {
        const ctxOffset = getPosition(canvasRef.current)
        setCanvasOffset(ctxOffset)
        const canvasPos = {x: (e.pageX - ctxOffset.x), y: (e.pageY - ctxOffset.y)}
        const newCanvasPixelPositions = {x: Math.floor(canvasPos.x / zoom), y: Math.floor(canvasPos.y / zoom)}
        if(newCanvasPixelPositions.x !== canvasPixelPositions.x || newCanvasPixelPositions.y !== canvasPixelPositions.y)setCanvasPixelPositions(newCanvasPixelPositions)
        setCanvasPosition(canvasPos)
    }
    function drawPixel(e) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#' + selectedColor.hex
        //ctx.fillStyle = 'red'
        ctx.fillRect(canvasPixelPositions.x, canvasPixelPositions.y, 1, 1)

        //sendDraw(canvasPixelPositions.x, canvasPixelPositions.y, 50)
        setToDraw(!toDraw)
    }


    function getPosition(element) {
        var clientRect = element.getBoundingClientRect();
        return {x: clientRect.left + document.body.scrollLeft,
                y: clientRect.top + document.body.scrollTop};
    }

    function sendDraw(x, y, colorValue) {
        const offset = x + (1000 * y)
        Axios.put("http://localhost:3001/api/canvas/draw/put", {offset: offset, value: colorValue})
        .then(res => console.log(res))
    }

    return (
        <div onWheel={e => zoomCanvas(e)} className={s.inputField} onMouseDown={e => handleInput(e)} onMouseMove={e => handleInput(e)} onMouseUp={e => handleInput(e)}>
            <Drawer toDraw={toDraw} highlightDisplay={highlightDisplay} pixelPos={canvasPixelPositions} pos={canvasPosition} canvasOffset={canvasOffset} zoom={zoom}/>
            <div style={ { transform: `scale(${zoom}, ${zoom})` } } className={s.zoom}>
                <div style={ { transform: `translate(${pan.x}px, ${pan.y}px)`} } className={s.pan}>
                    <div className={s.canvasBorder}>
                        <canvas onMouseEnter={e => setHighlightDisplay('block')} onMouseLeave={e => setHighlightDisplay('none')} onMouseMove={e => updateCoordinates(e)} className={s.canvas} ref={canvasRef}>
                        </canvas>
                    </div>
                    {/* onMouseDown={e => drawPixel(e)} */}
                </div>
            </div>
        </div>
    )
}
// Canvas.defaultProps = {
//     transform: `scale(1, 1)`
// }
