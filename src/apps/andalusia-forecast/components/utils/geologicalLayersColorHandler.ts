import { Style, Stroke, Circle as CircleStyle, Fill } from "ol/style"

export function getGeologicalPolygonColor(type: string): string {
    let color: string;
    
    switch (type) {
        //hier noch das Muster
        case "00000000":
            color = "#cd9d9";
            break;
        case "00020000":
            color = "d9ffff";
            break;
        case "00040000":
            color = "ffd9ff";
            break;
        case "00100000":
            color = "b2b2ff";
            break;
        case "00290000":
            color = "ff7f7f";
            break;
        case "00390000":
            color = "#4cd9ff";
            break;
        case "00420000":
            color = "#4c4cff";
            break;
        //hier noch die vertikalen Linien
        case "00424013":
            color = "#4c4cff";
            break;
        case "00500000":
            color = "#ff4c4c";
            break;
        case "00510000":
            color = "#ff7f4c";
            break;
        case "00930000":
            color = "#b2d9d9";
            break;
        case "01060000":
            color = "#d9b27f";
            break;
        case "02020000":
            color = "#d900b2";
            break;
        case "02500000":
            color = "#ffcc4c";
            break;
        case "05100000":
            color = "#ced9d9";
            break;
        case "05280000":
            color = "#ffffcc";
            break;
        case "05470000":
            color = "#d0c7c7";
            break;
        default:
            color = "gray";
            break;
    }
    return color;
} 

export function getGeologicalLineColor(type: number): string {
    let color: string;
    switch (type) {
        case 1:
            color = "black";
            break;
        case 2:
            color = "red";
            break;
        default:
            color = "gray";
            break;
    }
    return color;
}

export function getGeologicalLineStyle(type: string): Style {
    let color: string;
    let width: number;
    switch (type) {
        case "1":
            color = "black";
            width = 0.66;
            break;
        case "2":
            color = "red";
            width = 0.66;
            break;
        default:
            color = "gray";
            width = 0.66;
            break;
    }
    return new Style({
        stroke: new Stroke({
            color: color,
            width: width
        })
    });
}

export const getColorByFuente = (fuente: string): string => {
    switch (fuente) {
        case "IGME Base de datos de puntos de agua":
            return "red";
        case "Red piezométrica - C.H.Guadiana":
            return "green";
        case "Red de aforos - C.H.Guadiana":
            return "lightblue";
        case "Red de calidad de aguas subterráneas - C.H.Guadiana":
            return "purple";
        case "Red de calidad de aguas subterráneas - - C.H.Guadalquivir":
            return "yellow";
        case "Universidad de Córdoba":
            return "blue";
        default:
            return "gray";
    }
};

export const styleFuntcionMeasureStations = (feature: any) => {
    const fuente = feature.get("Fuente");
    const color = getColorByFuente(fuente);
    return new Style({
        image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: "black", width: 1 })
        })
    });
};