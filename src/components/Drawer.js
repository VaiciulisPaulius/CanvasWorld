import React from 'react'
import {createUseStyles} from 'react-jss'
import { useContext, useEffect } from 'react'
import { SelectedColor } from '../App'
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
    const colorValue = useContext(SelectedColor);
    
    const zoom = props.zoom
    const offset = props.currentCanvasOffsetScreen
    const coordinates = props.coordinates
    const toDraw = props.toDraw
    const highlightDisplay = props.highlightDisplay

    function sendDraw(x, y, colorValue) {
        if(colorValue < 0 || colorValue > 255) return
        if(x < 0 || x > 1000000 || y < 0 || y > 1000000) return

        const offset = x + (1000 * y)
        console.log(offset, colorValue)

        Axios.put("http://localhost:3001/api/canvas/draw/put", {offset: offset, value: colorValue})
    }
    useEffect(() => {
        sendDraw(coordinates.x, coordinates.y, colorValue.value)
        console.log(colorValue.value)
    }, [toDraw])
    return (
        <div style={ { display: highlightDisplay, backgroundColor: zoom > 5 ? 'rgb(0, 0, 0, 0)' : 'red' , width: zoom, height: zoom, transform: `scale(${zoom}, ${zoom}) !important`, position: 'absolute', left: (coordinates.x * zoom) + offset.x - 1, top: (coordinates.y * zoom) + offset.y - 1} } className={s.hightlight}></div>
    )
}
