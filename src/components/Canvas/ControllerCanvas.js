import { useRef, useEffect, useState, useContext } from 'react'
import canvasApi from './canvasAPI'
import getColorPalleteABGR from './getColorPalleteABGR'

export default function ControllerCanvas() {
    // Canvas width and height size
    const width = 1000
    const height = 1000

    const canvasRef = useRef(null)
    let ctx = canvasRef.current

    const selectedColor = useContext(ColorValue);

    const [toDraw, setToDraw] = useState(false)

    const [imageData, setImageData] = useState([])

    let colorPalette = getColorPalleteABGR()

    // buffer will hold color data for the Canvas.
    const buffer = new ArrayBuffer((width * height * 4) - 1)

    // readBuffer will be used to draw the canvas using imageData.
    const readBuffer = new Uint8Array(buffer.buffer)

    // writeBuffer will be used to update color data with a single write.
    const writeBuffer = new Uint32Array(buffer.buffer)


    useEffect(() => {
        ctx.canvas.width = width;
        ctx.canvas.height = height;
    }, [])
    useEffect(() => {
        canvasApi.getCanvasData()
    })

    function arrayToImageData(arr, colorPallete) {
        let imageDataArr = new Uint8ClampedArray((arr.length - 1) * 4)
        let imageDataArr32Int = new Uint32Array(imageDataArr.buffer)

        for(let i = 0; i < res.data.length; i++) {
            imageDataArr32Int[i] = colorPallete[arr[i].value]
        }

        let resultImage = new ImageData(imageDataArr, width, height)
        setImageData(imageDataArr)
    }

    function PopulateCanvas(arrayData) {
        let resultImage = new ImageData(arrayData, width, height)
        ctx.putImageData(resultImage, 0, 0)
        setImageData(imageDataArr)
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
    function drawPixel(e) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#' + selectedColor.hex
        //ctx.fillStyle = 'red'
        ctx.fillRect(canvasPixelPositions.x, canvasPixelPositions.y, 1, 1)

        //sendDraw(canvasPixelPositions.x, canvasPixelPositions.y, 50)
        setToDraw(!toDraw)
    }

    return {}
}