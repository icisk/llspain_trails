// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import { register } from "ol/proj/proj4";
import OSM from "ol/source/OSM";
import proj4 from "proj4";
import { createCazorlaLayer, createLosPedrochesLayer } from "../components/utils/regionLayers";
import WebGLTileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import {tempColorGradient} from "../components/utils/globals";


proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

export const MAP_ID = "bioindicator";
const ex = [
    -794753.04,
    4345052.37,
    -194771.63,
    4757383.53
] //epsg 3857
const getColorStyle = () => {
    return [
        "case",
        ["<=", ["band", 1], 30], [255, 0, 0, 1],  // Red
        ["<=", ["band", 1], 60], [255, 255, 0, 1], // Yellow
        [0, 255, 0, 1]  // Green (default if > 60)
    ];
};
export class BioindicatorMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: -460000, y: 4540000 },
                zoom: 7
            },
            projection: "EPSG:3857",
            layers: [
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                }),
                new SimpleLayer({
                    id: "tif",
                    title: "CDD",
                    olLayer: new WebGLTileLayer({
                        opacity: 0.5,
                        source: new GeoTIFF({
                            normalize: false,
                            sources: [
                                {
                                    url: "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/agro_indicator/CDD/CDD_2025-10-16.tif",
                                    nodata: -5.3e+37

                                }
                            ]
                        }),
                        style: {
                            color: getColorStyle()
                        },
                        extent: ex,
                        properties: { title: "CDD" }
                    }),
                    isBaseLayer: false
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
