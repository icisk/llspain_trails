import { Point } from "ol/geom";


export const completeExtent = { geom: new Point([-460000, 4540000]), zoom: 8 };
export const cazorlaPoint = { geom: new Point([-3.004167, 37.913611]).transform("EPSG:4326", "EPSG:3857"), zoom: 10 };
export const pedrochesPoint = { geom: new Point([-4.7, 38.4]).transform("EPSG:4326", "EPSG:3857"), zoom: 9.5 };
