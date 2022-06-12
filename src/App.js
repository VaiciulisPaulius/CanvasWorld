import CanvasManipulator from "./components/CanvasManipulator";
import ColorPicker from "./components/ColorPicker";
import {createUseStyles} from 'react-jss'
import { useState, createContext, useEffect } from 'react'
import colorPalleteFile from './duel.hex'
import jsonColor from './colors.json'

export const ColorValue = createContext({value: 0, hex: '000000'})
export const ColorPallete = createContext([])

const useStyles = createUseStyles({ //
  'canvasContainer': {
    maxHeight: '100vh !important',
    maxWidth: '100vw'
  },
  'colorPickerContainer': {
    position: 'fixed',
    bottom: 10,
    left: 0
  }
})

function App() {
  const s = useStyles()
  const [selectedColor, setSelectedColor] = useState({value: 0, hex: '000000'})
  const [colorPal, setColorPal] = useState([])

  function changeSelectedColor(val) { setSelectedColor(val); console.log(selectedColor) }

  useEffect(() => {
    fetch(colorPalleteFile)
    .then(val => val.text())
    .then(text => {
        const pal = text.split(/\r?\n/)
        setColorPal(pal)
    })
    
}, [])
  return (
    <>
      <div className={s.canvasContainer}>
        <ColorPallete.Provider value={colorPal}>
          <ColorValue.Provider value={selectedColor}>
            <CanvasManipulator/>
          </ColorValue.Provider>
          <div className={s.colorPickerContainer}>
            <ColorPicker changeSelectedColor={changeSelectedColor} />
          </div>
        </ColorPallete.Provider>
      </div>
    </>
  );
}

export default App;
