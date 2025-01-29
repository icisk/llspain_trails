// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {MapConfig, MapConfigProvider, SimpleLayer} from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import OSM from "ol/source/OSM";
import {register} from "ol/proj/proj4";
import proj4 from "proj4";
import {createCazorlaLayer, createLosPedrochesLayer} from "../components/utils/regionLayers";
import {tempColorGradient} from "../components/utils/globals";
import {transformExtent} from 'ol/proj';


// Registrierung von EPSG:25830
proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

export const MAP_ID = "historical-climate";

//temperature colors
const pink = '#eb7fe9BC'
const cold_blue = '#4f59cdBC'
const ice_blue = '#1ceae1BC'
const green = '#5fdf65BC'
const yellow = '#eade57BC'
const orange = '#ec8647BC'
const red = '#832525BC'
const dark_red = '#53050aBC'
const ex = [
    -752185.7477688787,
    4412572.1318028895,
    -244344.30302071414,
    4679055.100963466
]
const extent = transformExtent([173000, 4080000, 570000, 4284000], 'EPSG:25830', 'EPSG:3857')
const extent2 = transformExtent([165066.802, 4065718.615, 572550.337, 4288803.688], 'EPSG:25830', 'EPSG:3857')
// console.log(extent);

export class HistoricClimateMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

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
                    id: "osm",
                    olLayer: new WebGLTileLayer({
                        source: new OSM(),
                        properties: { title: "OSM" }
                    }),
                    isBaseLayer: true
                }),
                // GeoTIFF-Rasterlayer für Temperaturdaten
                new SimpleLayer({
                    id: "left", 
                    title: "Mean Temperature (2000-01)",
                    olLayer: new WebGLTileLayer({
                        source: new GeoTIFF({
                            normalize: false,
                            sources: [
                                {
                                    url: "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_2004_07_MeanTemperature_v0.tif",
                                    nodata: -5.3e+37
                                    
                                }
                            ]
                        }),
                        style: {
                            color: tempColorGradient
                        },
                        extent: ex,
                        properties: { title: "Mean Temperature (2000-01)" }
                    }),
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    id: "right",
                    title: "Mean Temperature (2000-01)",
                    olLayer: new WebGLTileLayer({
                        source: new GeoTIFF({
                            normalize: false,
                            sources: [
                                {
                                    url: "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_2000_02_MeanTemperature_v0.tif",
                                    nodata: -5.3e+37
                                }
                            ]
                        }),
                        style: {
                            color: tempColorGradient
                        },
                        extent: ex,
                        properties: { title: "Mean Temperature (2000-01)" }
                    }),
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    id: "cazorla",
                    title: "Cazorla",
                    olLayer: createCazorlaLayer(),
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    id: "los_pedroches",
                    title: "Los Pedroches",
                    olLayer: createLosPedrochesLayer(),
                    isBaseLayer: false
                })
            ]
        };
    }
}
