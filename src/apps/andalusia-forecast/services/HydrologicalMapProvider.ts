// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import View from "ol/View";
import { register } from "ol/proj/proj4";
import OSM from "ol/source/OSM";
import proj4 from "proj4";
import { createCazorlaLayer, createLosPedrochesLayer } from "../components/utils/regionLayers";
import { pedrochesPoint } from "../components/utils/globals";
import { TileWMS } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import { transformExtent } from "ol/proj";
import { Style, Fill, Stroke } from "ol/style";
import WebGLTileLayer from "ol/layer/WebGLTile";
import XYZ from "ol/source/XYZ";

proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

export const MAP_ID = "hydrological-forecast";

export class HydrologicalMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        
        //landuse layer
        const landUseLayer = new ImageLayer({
            source: new Static({
                url: 'https://i-cisk.dev.52north.org/data/collections/maps_api_ll_spain_landuse_dissolved/map?f=png',
                imageExtent: [
                    -5.392816586767803,
                    38.088551680000016,
                    -4.193883430000028,
                    38.72908738000001
                ],
                projection: 'EPSG:4326',
            })
        });
        
        landUseLayer.set("id", "thematic-1");
        landUseLayer.set("thematic", true);
        
        // groundwater layer (VECTOR)
        const groundwaterLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_groundwater/items?f=json",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                fill: new Fill({
                    color: "rgba(128, 0, 128, 0.4)",
                }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
        });

        groundwaterLayer.set("id", "thematic-3");
        groundwaterLayer.set("thematic", true);

        // springs layer (VECTOR)
        const springsLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_springs/items?f=json&limit=150",
                format: new GeoJSON(),
            }),
            visible: false,
        });

        springsLayer.set("id", "springs");
        springsLayer.set("vector", true);


        // hydro network layer (VECTOR)
        const networkLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_hydro_network/items?f=json&limit=555",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                stroke: new Stroke({
                    color: "#00008B",
                    width: 1.5,
                }),
            }),
        });
   
        networkLayer.set("id", "network");
        networkLayer.set("vector", true);

        // municipalities layer (VECTOR)
        const municipalityLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_municipalities/items?f=json",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                // fill: new Fill({
                //     color: "rgba(128, 0, 128, 0.4)",
                // }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
        });
        

        municipalityLayer.set("id", "municipalities");
        municipalityLayer.set("vector", true);

        // geologicalLayer (VECTOR)
        const geologicalPolygonsLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_geological_polygons/items?f=json&limit=7000",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                fill: new Fill({
                    color: "rgba(128, 0, 128, 0.4)",
                }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
        });


        geologicalPolygonsLayer.set("id", "thematic-2");
        geologicalPolygonsLayer.set("thematic", true);

        // geologicalLayer (VECTOR)
        const geologicalLinesLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_geological_lines/items?f=json&limit=15000",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                fill: new Fill({
                    color: "rgba(128, 0, 128, 0.4)",
                }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
        });


        geologicalLinesLayer.set("id", "thematic-2");
        geologicalLinesLayer.set("thematic", true);



        // geologicalLayer (VECTOR)
        const authoritiesLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_authorities/items?f=json&limit=3",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                fill: new Fill({
                    color: "rgba(128, 0, 128, 0.4)",
                }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
        });


        authoritiesLayer.set("id", "thematic-4");
        authoritiesLayer.set("thematic", true);

        return {
            initialView: {
                kind: "position",
                center: { x: pedrochesPoint.geom.getCoordinates()[0] ?? 0, y: pedrochesPoint.geom.getCoordinates()[1] ?? 0 },
                zoom: pedrochesPoint.zoom,
            },
            projection: "EPSG:3857",
            layers: [
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
                    title: "Land Use",
                    olLayer: landUseLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Hydro Network",
                    olLayer: networkLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Hsprings",
                    olLayer: springsLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Municipalities",
                    olLayer: municipalityLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Groundwater",
                    olLayer: groundwaterLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "GeologicalPolygons",
                    olLayer: geologicalPolygonsLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "GeologicalLines",
                    olLayer: geologicalLinesLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "authorities",
                    olLayer: authoritiesLayer,
                    isBaseLayer: false
                }),
            ]
        };
    }
}

