// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import { register } from "ol/proj/proj4";
import OSM from "ol/source/OSM";
import proj4 from "proj4";
import { createCazorlaLayer, createLosPedrochesLayer } from "../components/utils/regionLayers";
import WebGLTileLayer from "ol/layer/WebGLTile";
import XYZ from "ol/source/XYZ";

proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

export const MAP_ID = "projection";

export class ProjectionMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: -450000, y: 4623000 },
                zoom: 8.5
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: "ESRI Gray",
                    olLayer: new WebGLTileLayer({
                        source: new XYZ({
                            url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                            attributions: "&copy; Esri, HERE, Garmin, OpenStreetMap contributors"
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
                })
            ]
        };
    }
}
