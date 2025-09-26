// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import {  createLosPedrochesLayer } from "../components/utils/regionLayers";
import WebGLTileLayer from "ol/layer/WebGLTile";
import XYZ from "ol/source/XYZ";

proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

export const MAP_ID = "oliveoil";

export class OliveOilMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: -540000, y: 4635000 },
                zoom: 9.5
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
                    title: "Los Pedroches",
                    olLayer: createLosPedrochesLayer(),
                    isBaseLayer: false
                })
            ]
        };
    }
}
