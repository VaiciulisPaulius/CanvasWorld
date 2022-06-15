import World from "./components/World";
import ColorPicker from "./components/ColorPicker";
import {createUseStyles} from 'react-jss'
import { useState, createContext, useEffect, useRef } from 'react'
import colorPalleteFile from './duel.hex'

export const SelectedColor = createContext({value: 0, hex: '000000'})
export const ColorPallete = createContext([])

const useStyles = createUseStyles({ //
  'canvasContainer': {
    maxHeight: '100vh !important',
    maxWidth: '100vw'
  },
  'colorPickerContainer': {
    position: 'absolute',
    bottom: 5,
    left: 0
  }
})

function App() {
  const s = useStyles()

  // Currently selected color.
  // Value: 0-255, both inclusive.
  // Hex color thats mapped to one of the 0-255 values.
  const [selectedColor, setSelectedColor] = useState({value: 0, hex: '000000'})

  // Color pallete stored as an array of hex (without the #)
  const [colorPal, setColorPal] = useState([])

  function changeSelectedColor(val) { setSelectedColor(val) }

  // Fetch the color palette file and store.
  useEffect(() => {
    fetch(colorPalleteFile)
    .then(val => val.text())
    .then(text => {
        const pal = text.split(/\r?\n/)
        setColorPal(pal)
        console.log(pal)
    })  
  }, [])
  useEffect(() => console.log(colorPal), [colorPal])

  return (
    <>
      <div className={s.canvasContainer}>
        <ColorPallete.Provider value={colorPal}>
          <SelectedColor.Provider value={selectedColor}>
            <World/>
          </SelectedColor.Provider>
          <div className={s.colorPickerContainer}>
            <ColorPicker changeSelectedColor={changeSelectedColor} />
          </div>
        </ColorPallete.Provider>
      </div>
    </>
  );
}

export default App;
