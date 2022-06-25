import React from 'react'
import { useRef, useEffect, useState, useContext } from 'react'
import { createUseStyles } from 'react-jss'
import { SelectedColor, ColorPallete } from '../App'
import colorPalleteJsonFile from '../assets/colorPalette/colors.json';
import { fetchInitCanvasState } from '../api/canvasApi'

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
    const ctx = useRef(null)

    // Currently selected color.
    const selectedColor = useContext(SelectedColor);

    // Used for populating the canvas with data. Used only for init (not tile updates).
    const [imageDataUInt8Arr, setImageDataUInt8Arr] = useState([])

    // An array of mapped hex colors, array index corresponds the id of the color.
    const colorPallete = useContext(ColorPallete)

    // The width/height of the whole canvas
    const CANVAS_SIZE = 430

    // For some reason, the variable colorPallete returns undefined inside the addEventListener (WebSocket) code block, and using another variable that copies it as useRef seems to have solved the problem.
    const colorPalleteRef = useRef()

    useEffect(() => {colorPalleteRef.current = colorPallete}, [colorPallete])

    // Init canvas params.
    useEffect(() => {
        const context = canvasRef.current.getContext('2d')
        context.canvas.width = CANVAS_SIZE;
        context.canvas.height = CANVAS_SIZE;
        ctx.current = context
    }, [])

    // Start listening for tile updates immediately.
    useEffect(() => {
        listenForTileUpdates()
    }, [])
    
    // Init websocket and listen for tile updates. Draw a pixel at the specified position with a specified color id once tile update is received.
    function listenForTileUpdates() {
        const socket = new WebSocket('ws://fathomless-river-43523.herokuapp.com');
        socket.addEventListener('message', e => {
            let res = JSON.parse(e.data)
            if(res.offset !== 0 || res.value !== 0) {
                let y = Math.floor(res.offset / CANVAS_SIZE)
                let x = res.offset - (y * CANVAS_SIZE)

                const colorValue = '#' + colorPalleteRef.current[res.value]
                
                drawPixel(x, y, colorValue)
            }
        });
    }

    // A function for generating a color pallete in Uint8Array format. [Alpha value, Blue value, Green value, Red val
    function getColorPalleteABGR() {
        var dataView = new DataView(new ArrayBuffer(4))

        // The first byte is alpha, which is always going to be 0xFF
        dataView.setUint8(0, 0xFF)
        let paletteABGR = colorPalleteJsonFile.map(colorArr => {
            dataView.setUint8(1, colorArr[1])
            dataView.setUint8(2, colorArr[2])
            dataView.setUint8(3, colorArr[3])
            return dataView.getUint32(0)
        });
        setImageDataUInt8Arr(paletteABGR)
    }
    useEffect(() => getColorPalleteABGR(), [])


    // Fetch canvas state and render it on the canvas.
    useEffect(() => {
        if(imageDataUInt8Arr.length === 0) return

        fetchInitCanvasState().then(res => {
            if(res.data != undefined || res.data.length !== 0) {
                let Uint8CanvasArray = getUint8ClampedArray(res.data)
                let resultImage = new ImageData(Uint8CanvasArray, CANVAS_SIZE, CANVAS_SIZE)
                ctx.current.putImageData(resultImage, 0, 0)
            }
        }, rejected => {
            console.error(rejected)
        })
    }, [imageDataUInt8Arr])

    // arr to Uint8ClampedArray converter.
    function getUint8ClampedArray(arr) {
        let imageDataArr = new Uint8ClampedArray(arr.length * 4)
        let imageDataArr32Int = new Uint32Array(imageDataArr.buffer)

        for(let i = 0; i < arr.length; i++) {
            imageDataArr32Int[i] = imageDataUInt8Arr[arr[i]]
        }

        return imageDataArr
    }

    // Draw a pixel in the client side without update pixel request
    useEffect(() => {
        const colorValue = '#' + selectedColor.hex
        drawPixel(props.coordinates.x, props.coordinates.y, colorValue)
    }, [props.toDraw])

    function drawPixel(x, y, colorValue) {
        ctx.current.fillStyle = colorValue
        ctx.current.fillRect(x, y, 1, 1)
    }
    function updateCoordinates(e) {
        const ctxOffset = getPosition(canvasRef.current)
        props.setCurrentCanvasOffsetScreen(ctxOffset)
        
        const canvasPos = {x: (e.pageX - ctxOffset.x), y: (e.pageY - ctxOffset.y)}

        // mouse position in canvas pixel coordinates.
        let coordinates = {x: Math.floor(canvasPos.x / props.zoom), y: Math.floor(canvasPos.y / props.zoom)}

        //Ensure the coordinates are in range of the canvas. Due to floating point calculations and math flooring, highlight sometimes highlights outside of canvas boundary.
        if(coordinates.x < 0) coordinates = {x: 0, y: coordinates.y}
        else if(coordinates.x >= CANVAS_SIZE*CANVAS_SIZE) coordinates = {x: CANVAS_SIZE*CANVAS_SIZE - 1, y: coordinates.y}
        else if(coordinates.y < 0) coordinates = {x: coordinates.x, y: 0}
        else if(coordinates.y >= CANVAS_SIZE*CANVAS_SIZE) coordinates = {x: coordinates.x, y: CANVAS_SIZE*CANVAS_SIZE - 1}

        if(coordinates.x !== props.coordinates.x || coordinates.y !== props.coordinates.y) {
            props.setCoordinates(coordinates)
        }
    }

    // Calculates the canvas element position relative to the top left most browser view
    function getPosition(element) {
        let clientRect = element.getBoundingClientRect()
        return {x: clientRect.left + document.body.scrollLeft, y: clientRect.top + document.body.scrollTop}
    }

    return (
        <div className={s.canvasBorder}>
            <canvas onMouseMove={e => updateCoordinates(e)} className={s.canvas} ref={canvasRef}>
            </canvas>
        </div>
    )
}
