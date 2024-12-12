// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import WebGLTileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import OSM from "ol/source/OSM";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { get as getProjection } from "ol/proj";

// Registrierung von EPSG:25830
proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

export const MAP_ID2= "historical-climate2";

//temperature colors
const pink = '#eb7fe9BC'
const cold_blue = '#4f59cdBC'
const ice_blue = '#1ceae1BC'
const green = '#5fdf65BC'
const yellow = '#eade57BC'
const orange = '#ec8647BC'
const red = '#832525BC'
const dark_red = '#53050aBC'

export class HistoricClimateMapProvider2 implements MapConfigProvider {
    mapId = MAP_ID2;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: -460000, y: 4540000 }, // Übernommene initialView-Einstellungen
                zoom: 8
            },
            projection: "EPSG:3857", // Karte wird in EPSG:25830 projiziert
            layers: [
                // OpenStreetMap als Hintergrund
                new SimpleLayer({
                    title: "OpenStreetMap",
                    olLayer: new TileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                }),
                // GeoTIFF-Rasterlayer für Temperaturdaten
                new SimpleLayer({
                    title: "Mean Temperature (2000-01)",
                    olLayer: new WebGLTileLayer({
                        source: new GeoTIFF({
                            normalize: false,
                            sources: [
                                {
                                    url: "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_2000_02_MeanTemperature_v0.tif",
                                    max: 50,
                                    min: 0
                                }
                            ]
                        }),
                        style: {
                            color: 

                                [
                                "case",
                                    ["all", ["==", ["*", ["band", 1], 50], 0], ["==", ["*", ["band", 2], 50], 0]],
                                    [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
                                    ["<", ["band", 1], -10],
                                    pink,
                                    ["<=", ["band", 1], 0],
                                    cold_blue,
                                    ["<=", ["band", 1], 10],
                                    ice_blue,
                                    ["<=", ["band", 1], 20],
                                    green,
                                    ["<=", ["band", 1], 30],
                                    yellow,
                                    ["<=", ["band", 1], 40],
                                    orange,
                                    ["<=", ["band", 1], 50],
                                    red,
                                    dark_red
                                ]
                        },
                        properties: { title: "Mean Temperature (2000-01)" }
                    }),
                    isBaseLayer: false
                })
            ]
        };
    }
}
