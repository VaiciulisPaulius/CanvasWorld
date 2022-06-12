import React from 'react'
import { useState, useEffect, useContext } from 'react'
import {createUseStyles} from 'react-jss'
import { ColorPallete } from '../App';

const useStyles = createUseStyles({
    'colorPicker': {
        boxSizing: 'border-box',
        width: '100vw',
        height: 60,
        padding: '5px 20px',
        display: 'flex',
        flexWrap: 'wrap'
    },
    'color': {
        width: 20,
        height: 20,
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

    //const [colorPal, setColorPal] = useState([])
    const colorPal = useContext(ColorPallete)
    const [selectedColorId, setSelectedColorId] = useState('color-0')

    // useEffect(() => {
    //     fetch(colorPallete)
    //     .then(val => val.text())
    //     .then(text => {
    //         const pal = text.split(/\r?\n/)
    //         setColorPal(pal)
    //     })
    // }, [])

    function selectColor(e) {
        console.log(e)
        console.log(e.target.attributes[0].nodeValue)
        let prevHighLightColorRef = document.getElementById(`${selectedColorId}`)
        prevHighLightColorRef.style.border = "solid white 1px"

        let newHighLightColorRef = document.getElementById(`${e.target.id}`)
        newHighLightColorRef.style.border = "solid black 2px"

        setSelectedColorId(e.target.id)
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
