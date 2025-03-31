import {Point} from "ol/geom";
import {useIntl} from "open-pioneer:react-hooks";
import chroma from "chroma-js";


export const completeExtent = { geom: new Point([-460000, 4540000]), zoom: 8 };
export const cazorlaPoint = { geom: new Point([-3.004167, 38.1]).transform("EPSG:4326", "EPSG:3857"), zoom: 9 };
export const pedrochesPoint = { geom: new Point([-4.7, 38.4]).transform("EPSG:4326", "EPSG:3857"), zoom: 9.5 };

export function getMonthArray() {
    const intl = useIntl();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months.map((mon) => {
        return intl.formatMessage({ id: `global.months.${mon}` }); 
    });
}

export const precipColors = {
    p_01: '#C4DAF6BC',
    p_02: '#588fe1BC',//'rgba(216,88,225,0.74)' //'#588fe1BC',
    p_03: '#1f569eBC',//'rgba(67,158,31,0.74)' //'#1f569eBC',
    p_04: '#103278BC',
    p_05: '#AA4DD8BC',
    p_06: '#912198BC',
    p_07: '#591061BC',
    p_08: '#290A47BC',
    p_09: '#11011eBC',
}
export const tempColors = {
     black : '#00000000',
     pink: '#eb7fe9BC',//eb7fe9BC
     cold_blue: '#4f59cdBC',
     ice_blue: '#1ceae1BC',
     green: '#5fdf65BC',
     yellow: '#eade57BC',
     orange: '#ec8647BC',
     red: '#832525BC',
     dark_red: '#53050aBC', //rgba(83,5,10,0.74)
}

const boundaries_temp = [ -100, 0, 5, 10, 15, 20, 25, 30, 40];
const gradientColors_temp = [
    tempColors.black,
    tempColors.pink,
    tempColors.cold_blue,
    tempColors.ice_blue,
    tempColors.green,
    tempColors.yellow,
    tempColors.orange,
    tempColors.red,
    tempColors.dark_red,
    
];
// const colorScale_temp = chroma.scale(gradientColors_temp).domain(boundaries_temp).mode('lab');
const colorScale_temp = chroma.scale(gradientColors_temp).domain(boundaries_temp).classes(boundaries_temp.length).mode('lab');



// export const tempColorGradient = [
//     "interpolate",
//     ["linear"], // Specify the interpolation type
//     ["band", 1], // The data band
//     ...boundaries_temp.flatMap((boundary) => [boundary, colorScale_temp(boundary).hex()])
// ];
export const tempColorGradient = [
    "interpolate",
    ["linear"],
    ["band", 1],
    ...boundaries_temp.flatMap((boundary, i) => [boundary, gradientColors_temp[i]])
];
const boundaries_precip = [ -100, 0, 5, 15, 30, 50, 75, 100, 150, 200];
const gradientColors_precip = [
    tempColors.black,
    precipColors.p_01,
    precipColors.p_02,
    precipColors.p_03,
    precipColors.p_04,
    precipColors.p_05,
    precipColors.p_06,
    precipColors.p_07,
    precipColors.p_08,
    precipColors.p_09
];
const colorScale_precip = chroma.scale(gradientColors_precip).domain(boundaries_precip).mode('lab');

export const precipColorGradient = [
    "interpolate",
    ["linear"], // Specify the interpolation type
    ["band", 1], // The data band
    ...boundaries_precip.flatMap((boundary) => [boundary, colorScale_precip(boundary).hex()])
];


export const precipColorCase = [
    "case",
    ["all", ["==", ["*", ["band", 1], 150], 0], ["==", ["*", ["band", 2], 150], 0]],
    [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
    ["<=", ["band", 1], 5],
    precipColors.p_01, // Red for actual 0 values within the area of interest
    ["<=", ["band", 1], 15],
    precipColors.p_02,
    ["<=", ["band", 1], 30],
    precipColors.p_03,
    ["<=", ["band", 1], 50],
    precipColors.p_04,
    ["<=", ["band", 1], 75],
    precipColors.p_05,
    ["<=", ["band", 1], 100],
    precipColors.p_06,
    ["<=", ["band", 1], 150],
    precipColors.p_07,
    ["<=", ["band", 1], 200],
    precipColors.p_08,
    precipColors.p_09
]

export const tempColorCase = [
    "case",
    ["==", ["*", ["band", 1], 50], 0], //, ["==", ["*", ["band", 2], 50], 0]
    [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
    ["<", ["band", 1], -10],
    tempColors.pink,
    ["<=", ["band", 1], 0],
    tempColors.cold_blue,
    ["<=", ["band", 1], 10],
    tempColors.ice_blue,
    ["<=", ["band", 1], 20],
    tempColors.green,
    ["<=", ["band", 1], 30],
    tempColors.yellow,
    ["<=", ["band", 1], 40],
    tempColors.orange,
    ["<=", ["band", 1], 50],
    tempColors.red,
    tempColors.dark_red
]

export const stationValueColors = {
    red: "#e01616", //#e01616
    blue: "#1f1fd6", //#1f1fd6
    purple: "#800080", //rgba(128,0,128,0.74)
}


export const mesesEnEspanol = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const uncertaintyColors = {
    red: '#fa0000',
    green: '#00ff00',
    yellow: '#fffa00',
}
