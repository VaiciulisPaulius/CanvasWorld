import colorPalleteJsonFile from '../../colors.json';

export default function getColorPalleteABGR() {
    var dataView = new DataView(new ArrayBuffer(4));

    // The first byte is alpha, which is always going to be 0xFF
    dataView.setUint8(0, 0xFF);
    let paletteABGR = colorPalleteJsonFile.map(colorArr => {
        dataView.setUint8(1, colorArr[1]);
        dataView.setUint8(2, colorArr[2]);
        dataView.setUint8(3, colorArr[3]);
        return dataView.getUint32(0);
    });
    return paletteABGR
}
