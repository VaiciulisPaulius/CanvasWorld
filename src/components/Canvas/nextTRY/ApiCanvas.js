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
    const canvasRef = useRef(null)
    const colorPal = useContext(ColorPallete)

    useEffect(() => listenForTileUpdates(), [])
    function listenForTileUpdates() { // Not dependent on anything
        // Create WebSocket connection.
        const socket = new WebSocket('ws://localhost:3001');
        
        // Listen for messages
        socket.addEventListener('message', e => {
            let res = JSON.parse(e.data)
            console.log(res);
            updateTile(res.offset, res.value)
        });
    }

    useEffect(() => {
        if(colorPal.length === 0) return
        const start = performance.now();

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

            Axios.get("http://localhost:3001/api/canvas/get")
            .then(res => {

                const canvas = canvasRef.current
                const ctx = canvas.getContext('2d')

                let imageDataArr = new Uint8ClampedArray((res.data.length - 1) * 4)
                let imageDataArr32Int = new Uint32Array(imageDataArr.buffer)

                for(let i = 0; i < res.data.length; i++) {
                    //const y = Math.floor(res.data[i].offset / 1000)
                    //const x = res.data[i].offset - (y * 1000)

                    imageDataArr32Int[i] = paletteABGR[res.data[i].value]
                }

                let resultImage = new ImageData(imageDataArr, 1000, 1000)
                ctx.putImageData(resultImage, 0, 0)
                setImageData(imageDataArr)
            })
            .then(() => {
                //console.log(performance.now() - start)
            })
    }, [colorPal])

    return {}
}
