import React from 'react'
import { useState, useContext } from 'react'
import {createUseStyles} from 'react-jss'
import { ColorPallete } from '../App';

const useStyles = createUseStyles({
    'colorPicker': {
        width: '100vw',
        height: 63,
        padding: '0 30px',
        display: 'flex',
        flexWrap: 'wrap',
        boxSizing: 'border-box'
    },
    'color': {
        width: 21,
        height: 21,
        border: "1px solid white",
        userSelect: 'none',
        boxSizing: 'border-box',

        '&:hover': {
            border: "1px solid black"
        }
    }
})

export default function ColorPicker(props) {
    const s = useStyles()

    const colorPal = useContext(ColorPallete)
    const [selectedColorId, setSelectedColorId] = useState('color-0')

    function selectColor(e) {
        console.log(e)
        console.log(e.target.attributes[0].nodeValue)

        // Get the current highlighted color and set to default styling.
        let prevHighLightColorRef = document.getElementById(`${selectedColorId}`)
        prevHighLightColorRef.style.border = "solid white 1px"

        // Get the new highlighted color and set it to be highlighted.
        let newHighLightColorRef = document.getElementById(`${e.target.id}`)
        newHighLightColorRef.style.border = "solid black 2px"

        setSelectedColorId(e.target.id)

        // Set new selected color.
        const id = e.target.attributes[0].nodeValue
        props.changeSelectedColor({value: id, hex: colorPal[id]})
    }

    return (
        <div className={s.colorPicker}>
            {colorPal.map((val, i) => {
                return <div value={i} onClick={e => selectColor(e)} key={i} id={'color-' + i} style={{backgroundColor: `#${val}`}} className={s.color}></div>
            })}
        </div>
    )
}
