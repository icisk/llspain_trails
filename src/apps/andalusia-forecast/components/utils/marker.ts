import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

// Marker style
export const markerStyle = new Style({
    image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: "red" }),
        stroke: new Stroke({ color: "black", width: 2 })
    })
});

export const createMarker = (coordinates: number[], markerStyle: Style) :Feature<Point> => {
    const marker = new Feature({
        geometry: new Point(coordinates),
    });
    marker.setStyle(markerStyle);
    return marker;
};
