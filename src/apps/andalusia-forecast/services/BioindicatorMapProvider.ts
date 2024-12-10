// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import { register } from "ol/proj/proj4";
import OSM from "ol/source/OSM";
import proj4 from "proj4";

proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

export const MAP_ID = "bioindicator";

export class BioindicatorMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        return {
            initialView: {
                kind: "position",
                center: { x: -460000, y: 4540000 },
                zoom: 8
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
                })
            ]
        };
    }
}