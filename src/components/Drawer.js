import React from 'react'
import {createUseStyles} from 'react-jss'
import { useContext, useEffect } from 'react'
import { ColorValue } from '../App'
import Axios from 'axios'

const useStyles = createUseStyles({
    'hightlight': {
        backgroundColor: 'rgb(0, 0, 0, 0)',
        border: 'solid 1px red',
        zIndex: 5,
        pointerEvents: 'none',
        userSelect: 'none'
    }
})

export default function Drawer(props) {
    const s = useStyles()
    const colorValue = useContext(ColorValue);
    
    const zoom = props.zoom
    const pos = props.pos
    const offset = props.canvasOffset
    const pixelPos = props.pixelPos
    const toDraw = props.toDraw
    const highlightDisplay = props.highlightDisplay

    useEffect(() => {

    }, [pixelPos])

    function sendDraw(x, y, colorValue) {
        const offset = x + (1000 * y)
        Axios.put("http://localhost:3001/api/canvas/draw/put", {offset: offset, value: colorValue})
    }
    useEffect(() => {
        sendDraw(pixelPos.x, pixelPos.y, colorValue.value)
    }, [toDraw])
    
    return (
        <div style={ { display: highlightDisplay, backgroundColor: zoom > 5 ? 'rgb(0, 0, 0, 0)' : 'red' , width: zoom, height: zoom, transform: `scale(${zoom}, ${zoom}) !important`, position: 'absolute', left: (pixelPos.x * zoom) + offset.x - 1, top: (pixelPos.y * zoom) + offset.y - 1} } className={s.hightlight}></div>
    )
}
