import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Circle, Fill } from 'ol/style';
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { createCazorlaLayer, createLosPedrochesLayer } from "../components/utils/regionLayers";

// Registrierung von EPSG:25830
proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
proj4.defs(
    "EPSG:4326",
    "+proj=longlat +datum=WGS84 +no_defs"  // WGS84 (für GeoJSON)
);
register(proj4);

export const MAP_ID = "historical-climate-stations";

export class HistoricClimateStationsMapProvider implements MapConfigProvider {
    mapId = MAP_ID;
    stationsLayer: VectorLayer;
    studyAreaOutlineLayer: VectorLayer;

    constructor() {
        this.stationsLayer = new VectorLayer({
            source: new VectorSource({
                url: 'https://i-cisk.dev.52north.org/data/collections/ll_spain_creaf_in_boundary/items?f=json&limit=1000',
                format: new GeoJSON(),
                projection: 'EPSG:4326'
            }),
            style: (feature) => {
                return new Style({
                    image: new Circle({
                        radius: 5, 
                        fill: new Fill({
                            color: 'grey'
                        }),
                        stroke: new Stroke({
                            color: 'black',
                            width: 1
                        })
                    })
                });
            },
            zIndex: 200
        });
        this.stationsLayer.set('title', 'Stations');

        this.studyAreaOutlineLayer = new VectorLayer({
            source: new VectorSource({
                url: 'https://i-cisk.dev.52north.org/data/collections/ll_spain_ll_area/items?f=json',
                format: new GeoJSON(),
                projection: 'EPSG:4326'
            }),
            style: new Style({
                stroke: new Stroke({
                    color: 'black',
                    width: 2
                })
            }),
            zIndex: 100
        });
        this.studyAreaOutlineLayer.set('title', 'Study Area Outline');
    }

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: -460000, y: 4540000 }, 
                zoom: 8
            },
            projection: "EPSG:3857", 
            layers: [
                // OpenStreetMap as background
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                }),
                new SimpleLayer({
                    title: "Cazorla",
                    olLayer: createCazorlaLayer(),
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Los Pedroches",
                    olLayer: createLosPedrochesLayer(),
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Study Area Outline",
                    olLayer: this.studyAreaOutlineLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Stations",
                    olLayer: this.stationsLayer,
                    isBaseLayer: false
                })
                
            ]
        };
    }
}