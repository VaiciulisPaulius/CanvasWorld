import React from 'react'
import { useRef, useEffect, useState, useContext } from 'react'
import {createUseStyles} from 'react-jss'
import './globalVars.css'
import Drawer from './Drawer'
import { ColorValue, ColorPallete } from '../App'
import colorPalleteJsonFile from '../colors.json';

import getColorPalleteABGR from './getColorPalleteABGR'
import ControllerCanvas from './ControllerCanvas'
import ModelCanvas from './canvasAPI'

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



    return (
        <div onWheel={e => zoomCanvas(e)} className={s.inputField} onMouseDown={e => handleInput(e)} onMouseMove={e => handleInput(e)} onMouseUp={e => handleInput(e)}>
            {/* {colorPal.map(val => {
                return <div style={{backgroundColor: '#' + val, width: 100, height: 100}}></div>
            })} */}
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