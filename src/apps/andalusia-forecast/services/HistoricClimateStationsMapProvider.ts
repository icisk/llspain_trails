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
import { stationValueColors } from "../components/utils/globals";
import WebGLTileLayer from "ol/layer/WebGLTile";
import XYZ from "ol/source/XYZ";
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
                url: 'https://i-cisk.dev.52north.org/data/collections/ll_spain_aemet_stations/items?f=json&limit=1000',
                format: new GeoJSON(),
                projection: 'EPSG:4326'
            }),
            style: (feature) => {
                const val = feature.get('VARS');
                let color;
        
                if (val === "both") {
                    color = stationValueColors.purple;
                } else if (val === "precip") {
                    color = stationValueColors.blue;
                } else {
                    color = stationValueColors.red;
                }
        
                return new Style({
                    image: new Circle({
                        radius: 5,
                        fill: new Fill({
                            color: color
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
                    title: "ESRI Gray",
                    olLayer: new WebGLTileLayer({
                        source: new XYZ({
                            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                            attributions: '&copy; Esri, HERE, Garmin, OpenStreetMap contributors'
                        }),
                        properties: { title: "ESRI Gray" }
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