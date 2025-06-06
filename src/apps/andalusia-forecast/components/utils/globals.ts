import {Point} from "ol/geom";
import {useIntl} from "open-pioneer:react-hooks";
import chroma from "chroma-js";
import {s} from "vite/dist/node/types.d-aGj9QkWt";


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
    ...Object.values(tempColors)
];
// const colorScale_temp = chroma.scale(gradientColors_temp).domain(boundaries_temp).mode('lab');
const colorScale_temp = chroma.scale(gradientColors_temp).domain(boundaries_temp).classes(boundaries_temp.length).mode('lab');
export const tempColorGradient = [
    "interpolate",
    ["linear"],
    ["band", 1],
    ...boundaries_temp.flatMap((boundary, i) => [boundary, gradientColors_temp[i]])
];

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
const boundaries_precip = [ -100, 0, 5, 15, 30, 50, 75, 100, 150, 200];
const gradientColors_precip = [
    tempColors.black,
    ...Object.values(precipColors)
];
const colorScale_precip = chroma.scale(gradientColors_precip).domain(boundaries_precip).mode('lab');

export const precipColorGradient = [
    "interpolate",
    ["linear"], // Specify the interpolation type
    ["band", 1], // The data band
    ...boundaries_precip.flatMap((boundary) => [boundary, colorScale_precip(boundary).hex()])
];


export const speicolors = {
    extrem_dry: '#8B1A1AFF',
    very_dry: '#DE2929FF',
    dry: '#F3641DFF',
    little_dry: '#FDC404FF',    
    normal: '#9AFA94FF',
    little_wet: '#03F2FDFF',
    wet: '#12ADF3FF',
    very_wet: '#1771DEFF',
    extrem_wet: '#00008BFF'   
}
const boundaries_spei = [-10, -2.0, -1.5, -1, -0.25, 0.25, 1, 1.5, 2.0]
const gradientColors_spei = [
    tempColors.black,
    ...Object.values(speicolors)
];
const colorScale_spei = chroma.scale(gradientColors_spei).domain(boundaries_spei).mode('lab');
export const speiColorGradient = [
    "interpolate",
    ["linear"], // Specify the interpolation type
    ["band", 1], // The data band
    ...boundaries_spei.flatMap((boundary) => [boundary, colorScale_spei(boundary).hex()])
];


export const phenoColors = {
    "cdd_01": "rgba(0, 191, 255, 0.75)",   // Blue (0 - 20 days)
    "cdd_02": "rgba(42,202,130,0.75)",    // Light Blue (21 - 40 days)
    "cdd_03": "rgba(255, 255, 0, 0.75)",   // Yellow (41 - 60 days)
    "cdd_04": "rgba(255, 165, 0, 0.75)",   // Orange (61 - 80 days)
    "cdd_05": "rgba(255, 0, 0, 0.75)",     // Red (81 - 100 days)
};
const boundaries_pheno = [-10, 0, 20, 40, 60, 80, 100];
const gradientColors_pheno = [
    tempColors.black,
    ...Object.values(phenoColors)
];
const colorScale_pheno = chroma.scale(gradientColors_pheno).domain(boundaries_pheno).mode('lab');
export const phenoColorGradient = [
    "interpolate",
    ["linear"],
    ["band", 1],
    ...boundaries_pheno.flatMap((boundary) => [boundary, colorScale_pheno(boundary).hex()])
];

export const phenocolors_SU = {
    "su_01": "rgba(0, 191, 255, 0.75)",   // Blue (0 - 2 days)
    "su_02": "rgba(42,202,130,0.75)",    // Light Blue (3 - 4 days)
    "su_03": "rgba(255, 255, 0, 0.75)",   // Yellow (5 - 6 days)
    "su_04": "rgba(255, 165, 0, 0.75)",   // Orange (7 - 8 days)
    "su_05": "rgba(255, 0, 0, 0.75)",     // Red (9 - 11 days)
}

const boundaries_pheno_SU = [-10, 0, 3, 5, 7, 9, 11];
const gradientColors_pheno_SU = [
    tempColors.black,
    ...Object.values(phenocolors_SU)
];
const colorScale_pheno_SU = chroma.scale(gradientColors_pheno_SU).domain(boundaries_pheno_SU).mode('lab');
export const phenoColorGradient_SU = [
    "interpolate",
    ["linear"],
    ["band", 1],
    ...boundaries_pheno_SU.flatMap((boundary) => [boundary, colorScale_pheno_SU(boundary).hex()])
];

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
