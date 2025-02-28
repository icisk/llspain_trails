// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
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
        const landUseLayer = new TileLayer({
            source: new TileWMS({
                url: "https://i-cisk.dev.52north.org/data/collections/maps_api_ll_spain_landuse_dissolved/map",
                params: {
                    "bbox-crs": 4326,
                },
                serverType: "mapserver",
                crossOrigin: "anonymous"
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
        });

        groundwaterLayer.set("id", "groundwater");
        groundwaterLayer.set("vector", true);

        // authorities layer (VECTOR)
        const authoritiesLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_authorities/items?f=json",
                format: new GeoJSON(),
            }),
            visible: false,
        });

        authoritiesLayer.set("id", "authorities");
        authoritiesLayer.set("vector", true);

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
                fill: new Fill({
                    color: "rgba(128, 0, 128, 0.4)",
                }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
        });
        

        municipalityLayer.set("id", "municipalities");
        municipalityLayer.set("vector", true);

        return {
            initialView: {
                kind: "position",
                center: { x: pedrochesPoint.geom.getCoordinates()[0], y: pedrochesPoint.geom.getCoordinates()[1] },
                zoom: pedrochesPoint.zoom,
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM()
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
                    title: "Municipalities",
                    olLayer: municipalityLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Groundwater",
                    olLayer: groundwaterLayer,
                    isBaseLayer: false
                }),
            ]
        };
    }
}

