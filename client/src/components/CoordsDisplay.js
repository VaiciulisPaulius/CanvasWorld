// This component displays the current x & y coordinates of the mouse position inside the canvas.

import React from 'react'
import {createUseStyles} from 'react-jss'

const useStyles = createUseStyles({
    'coordinateDisplay': {
        width: 200,
        height: 60,
        backgroundColor: 'lightGray',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2rem',
        userSelect: 'none',
        borderRadius: 5
    }
})

export default function CoordsDisplay(props) {
    const s = useStyles()
    return (
        <div className={s.coordinateDisplay}>x: {props.coordinates.x} y: {props.coordinates.y}</div>
    )
}
