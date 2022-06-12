import React from 'react'
import { useRef, useState, useEffect } from 'react'
import {createUseStyles} from 'react-jss'
import Drawer from './Drawer'
import Canvas from './Canvas'

const useStyles = createUseStyles({
    'zoom': {
        width: '100vw',
        height: '100vh'
    },
    'inputField': {
        width: '100vw',
        height: '100vh'
    },
    'canvasWrapper': {
        display: 'inline-block'
    }
})

export default function CanvasManipulator() {
    // CSS styles
    const s = useStyles()

    // For zooming the canvas
    const [zoom, setZoom] = useState(1.5)

    // For canvas navigation. pan value is stored during canvas navigation movement, value is reseted with new movement.
    const [pan, setPan] = useState({x: 0, y: 0})

    // Stores the initial coordinates (in event.page data) of where a mouse clicked in the canvas. Used for handling canvas movement logic.
    const initialMouseClickPos = useRef({x: 0, y: 0})

    // The current canvas element offset coordinates relative to it's original position on init.
    const currentCanvasOffset = useRef({x: 0, y: 0})

    // True when a mouse has clicked in the canvas and hasnt let go, false when a mouse release event occurs afterwards.
    const isMouseHolding = useRef(false)

    // The current canvas element offset coordinates relative to page top left most corner.
    const [currentCanvasOffsetScreen, setCurrentCanvasOffsetScreen] = useState({x: 0, y: 0})

    // The current pixel highlighter coordinates in Canvas coords (x: 1, x: 2, etc..)
    let [coordinates, setCoordinates] = useState({x: 0, y: 0})

    // For turning off/on pixel highlighter whenever mouse exits/enters canvas area
    const [highlightDisplay, setHighlightDisplay] = useState('none')

    const [toDraw, setToDraw] = useState(false)
    useEffect(() => {
        console.log("fadfsdfasd" + highlightDisplay)
    }, [highlightDisplay])

    function zoomCanvas(e) {
        let direction = e.deltaY;

        let zoomCopy = zoom;
        if(zoom < 1) zoomCopy = 1
        zoomCopy = direction === -100 ? zoomCopy * 1.2 : zoomCopy * 0.8
        
        setZoom(zoomCopy)
    }
    function panCanvas(e) {
        const offset = getMouseOffset(e, zoom)
        const result = { x: offset.x + currentCanvasOffset.current.x, y: offset.y + currentCanvasOffset.current.y}

        const isCanvasWithinBrowserScreen = (result.x > -800 && result.x < 1600) && (result.y < 800 && result.y > -900)
        if(isCanvasWithinBrowserScreen) setPan(result)
    }
    function handleInput(e) {
        const type = e.type //Type of mouse event

        if(type === "mousedown") { //Init params for camera movement, drawing logic.
            isMouseHolding.current = true

            initialMouseClickPos.current = {x: e.pageX, y: e.pageY}
            currentCanvasOffset.current = pan
        }
        else if(isMouseHolding.current === true && type === "mousemove") { //During mouse drag.
            const offsetRaw = getMouseOffset(e, 1)
            const distanceToInitial = Math.sqrt(Math.pow(offsetRaw.x, 2) + Math.pow(offsetRaw.y, 2))

            const offset = getMouseOffset(e, zoom)
            if(distanceToInitial >= 5) panCanvas(e)
        }
        else if(type === "mouseup") {
            const offsetRaw = getMouseOffset(e, 1)
            const distanceToInitial = Math.sqrt(Math.pow(offsetRaw.x, 2) + Math.pow(offsetRaw.y, 2))

            if(distanceToInitial < 5) setToDraw(e)
            //if(distanceToInitial < 5) drawPixel(e) //If camera not moved enough, register as a pixel draw.
            isMouseHolding.current = false
            // setInitialPos(null)
            // setInitialCanvasPos(null)

        }
    }
    function getMouseOffset(e, scale) { //scale === zoom, just an optional thing
        if(initialMouseClickPos.current == null) return;
        return { x: (e.pageX - initialMouseClickPos.current.x) / scale, y: (e.pageY - initialMouseClickPos.current.y) / scale}
    }

    return (
        <div onWheel={e => zoomCanvas(e)} className={s.inputField} onMouseDown={e => handleInput(e)} onMouseMove={e => handleInput(e)} onMouseUp={e => handleInput(e)}>
            <Drawer toDraw={toDraw} highlightDisplay={highlightDisplay} coordinates={coordinates} currentCanvasOffsetScreen={currentCanvasOffsetScreen} zoom={zoom}/>
            <div style={ { transform: `scale(${zoom}, ${zoom})` } } className={s.zoom}>
                <div style={ { transform: `translate(${pan.x}px, ${pan.y}px)`} } className={s.pan}>
                    <div onMouseEnter={e => setHighlightDisplay('block')} onMouseLeave={e => setHighlightDisplay('none')} className={s.canvasWrapper}>
                        <Canvas toDraw={toDraw} coordinates={coordinates} zoom={zoom} setCurrentCanvasOffsetScreen={setCurrentCanvasOffsetScreen} setCoordinates={setCoordinates} className={s.canvas}/>
                    </div>
                    {/* onMouseDown={e => drawPixel(e)} */}
                </div>
            </div>
        </div>
    )
}