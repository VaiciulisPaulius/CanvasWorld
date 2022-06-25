import Axios from 'axios'

// Function that fetches and returns the current state of the canvas board stored in the db
export function fetchInitCanvasState() {
    return Axios.get("https://fathomless-river-43523.herokuapp.com/api/canvas/get")
        .then(res => res)
}
/**
 * function that sends a pixel draw update to the api
 * @param  {Number} x Pixel position in x coordinate
 * @param  {Number} y Pixel position in y coordinate
 * @param  {8 bit unsigned Number} colorValue The new color value that was drawn. The value must be within 0-255 (both inclusive) range
 * @return {Number}      The total of the two numbers
 */
export function postPixelUpdate(x, y, colorValue) {
    if(colorValue < 0 || colorValue > 255) return
    if(x < 0 || x > 430*430 || y < 0 || y > 430*430) return

    const offset = x + (430 * y)

    Axios.put("https://fathomless-river-43523.herokuapp.com/api/canvas/draw/put", {offset: offset, value: colorValue})
}