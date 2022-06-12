// This is only used to directly interact with the canvas, no fetch requests or WebSocket connections

// It needs to:
// Init the canvas with given params
// get index coords
// write and display new canvas
// 

class CanvasLogic {
    constructor(ctx, width, height) {
        this.ctx = ctx
        this.width = width
        this.height = height

        // buffer will hold color data for the Canvas.
        this.buffer = new ArrayBuffer((width * height * 4) - 1)

        // readBuffer will be used to draw the canvas using imageData.
        this.readBuffer = new Uint8Array(this.buffer.buffer)

        // writeBuffer will be used to update color data with a single write.
        this.writeBuffer = new Uint32Array(this.buffer.buffer)
    }
    //
    //canvas.initCanvas()
    /**
     * Draws the whole canvas with a given Uint8ClampedArray
     * @function
     * @param {Uint8ClampedArray} arrData
     */
    initCanvas(arrData) {

    }
    /**
     * Gets the index of the pixel coordinates
     * @function
     * @param {int} x
     * @param {int} y
     */
    getIndexFromCoords(x, y) {
        return x + (y * this.width)
    }
    /**
     * Draws a pixel at a specified coordinates with a specified color directly to the Canvas instantly.
     * color param - accepts hex 
     * @function
     * @param {int} x
     * @param {int} y
     * @param {string} color Any css color string
     */
    drawPixelToCanvas(x, y, color) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, 1, 1)
    }





}