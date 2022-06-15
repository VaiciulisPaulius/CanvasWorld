import React from 'react'
import { useRef, useEffect, useState, useContext } from 'react'
import {createUseStyles} from 'react-jss'
import Axios from 'axios'
import { SelectedColor, ColorPallete } from '../App'
import colorPalleteJsonFile from '../colors.json';

const useStyles = createUseStyles({
    'canvas': {
        margin: 'auto',
        imageRendering: 'pixelated',
        display: 'table-row',
        zIndex: 10
    },
    'canvasBorder': {
        border: '1px solid gray',
        display: 'table' // Used for sizing the parent exactly to the height and width of its child (canvas)
    }
})

export default function Canvas(props) {
    const s = useStyles()

    // A html canvas reference
    const canvasRef = useRef(null)

    const selectedColor = useContext(SelectedColor);


    const [colorPalleteArr, setColorPallete] = useState([])
    const isCanvasMoving = useRef(false)
    const colorPallete = useContext(ColorPallete)

    // For some reason, the variable colorPallete returns undefined inside the addEventListener (WebSocket) code block, and using another variable that copies it as useRef seems to have solved the problem.
    const colorPalleteRef = useRef()
    useEffect(() => {colorPalleteRef.current = colorPallete}, [colorPallete])

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = 1000;
        ctx.canvas.height = 1000;

        //render()
    }, [])

    useEffect(() => console.log(colorPallete), [colorPallete])

    useEffect(() => listenForTileUpdates(), [])
    
    function listenForTileUpdates() {
        // Create WebSocket connection.
        const socket = new WebSocket('ws://localhost:3001');
        
        // Listen for messages
        socket.addEventListener('message', e => {
            let res = JSON.parse(e.data)
            if(res.offset !== 0 || res.value !== 0) {
                let y = Math.floor(res.offset / 1000)
                let x = res.offset - (y * 1000)
                const colorValue = '#' + colorPalleteRef.current[res.value]
                drawPixel(x, y, colorValue)
            }
        });
    }
    // function updateTileInImageData(offset, value) {
    //     let imageDataCopy = new Uint8ClampedArray(imageData.buffer) 
    //     let imageData32 = new Uint32Array(imageDataCopy.buffer)

    //     imageData32[offset] = colorPallete[value]
    //     console.log(imageDataCopy)
    //     console.log(colorPallete)

    //     const canvas = canvasRef.current
    //     const ctx = canvas.getContext('2d')

    //     let resultImage = new ImageData(imageDataCopy, 1000, 1000)
    //     ctx.putImageData(resultImage, 0, 0)
    //     setImageData(imageDataCopy)
    // }
    function updateTile(offset, value) {
        let y = Math.floor(offset / 1000)
        let x = offset - (y * 1000)

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#' + colorPallete[value]
        console.log(colorPallete[value])
        ctx.fillRect(x, y, 1, 1)
    }
    // A function for generating a color pallete with a 
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
        if(colorPalleteArr.length === 0) return
        Axios.get("http://localhost:3001/api/canvas/get")
        .then(res => {

            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            console.log(res)

            let Uint8CanvasArray = getUint8ClampedArray(res.data)
            let resultImage = new ImageData(Uint8CanvasArray, 1000, 1000)
            ctx.putImageData(resultImage, 0, 0)
            //setImageData(Uint8CanvasArray)
        })
        .then(() => {
            //console.log(performance.now() - start)
        })
    }, [colorPalleteArr])

    function getUint8ClampedArray(arr) {
        let imageDataArr = new Uint8ClampedArray(arr.length * 4)
        let imageDataArr32Int = new Uint32Array(imageDataArr.buffer)

        for(let i = 0; i < arr.length; i++) {
            imageDataArr32Int[i] = colorPalleteArr[arr[i]]
        }

        return imageDataArr
    }
    useEffect(() => {
        const colorValue = '#' + selectedColor.hex
        drawPixel(props.coordinates.x, props.coordinates.y, colorValue)
    }, [props.toDraw])

    function drawPixel(x, y, colorValue) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = colorValue
        ctx.fillRect(x, y, 1, 1)

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
        props.setCurrentCanvasOffsetScreen(ctxOffset)
        const canvasPos = {x: (e.pageX - ctxOffset.x), y: (e.pageY - ctxOffset.y)}
        let newCanvasPixelPositions = {x: Math.floor(canvasPos.x / props.zoom), y: Math.floor(canvasPos.y / props.zoom)}

        if(newCanvasPixelPositions.x < 0) newCanvasPixelPositions = {x: 0, y: newCanvasPixelPositions.y}
        else if(newCanvasPixelPositions.x >= 1000000) newCanvasPixelPositions = {x: 999999, y: newCanvasPixelPositions.y}
        else if(newCanvasPixelPositions.y < 0) newCanvasPixelPositions = {x: newCanvasPixelPositions.x, y: 0}
        else if(newCanvasPixelPositions.y >= 1000000) newCanvasPixelPositions = {x: newCanvasPixelPositions.x, y: 999999}

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
