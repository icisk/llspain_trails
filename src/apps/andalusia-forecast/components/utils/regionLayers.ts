import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { Style, Stroke, Fill } from 'ol/style';
import { Geometry } from 'ol/geom';
import { Feature } from 'ol';
import { createHatchPattern } from "./hatchpattern";

export function createCazorlaLayer(): VectorLayer<Feature<Geometry>> {
    return new VectorLayer<Feature<Geometry>>({
      source: new VectorSource<Feature<Geometry>>({
        url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_area_cazorla/items/0?f=json",
        format: new GeoJSON(),
      }),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(105, 105, 105, 1)',
          width: 2,
        }),
        // fill: new Fill({
        //   color: createHatchPattern(),
        // }),
      }),
      zIndex: 100,
    });
  }
  
  export function createLosPedrochesLayer(): VectorLayer<Feature<Geometry>> {
    return new VectorLayer<Feature<Geometry>>({
      source: new VectorSource<Feature<Geometry>>({
        url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_area_los_pedroches/items/0?f=json",
        format: new GeoJSON(),
      }),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(105, 105, 105, 1)',
          width: 3,
        }),
        // fill: new Fill({
        //   color: createHatchPattern(),
        // }),
      }),
      zIndex: 100,
    });
  }