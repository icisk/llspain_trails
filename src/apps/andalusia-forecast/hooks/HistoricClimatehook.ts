import { useEffect, useRef } from "react";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import View from "ol/View";
import GeoTIFF from "ol/source/GeoTIFF";
import XYZ from "ol/source/XYZ";
import { getRenderPixel } from "ol/render";

export const MAP_ID = "historic-climate";

import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import { register } from "ol/proj/proj4";
import OSM from "ol/source/OSM";
import proj4 from "proj4";
import WebGLTileLayer from "ol/layer/WebGLTile";

proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);

const HistoricClimateHook1 = (mapRef: React.RefObject<HTMLDivElement>) => {
    const mapInstanceRef1 = useRef<Map | null>(null); // Ref to store the map instance

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef1.current) return;

        const key = "2sau1xauZfmyliK5rhUv";

        const tile1 = new TileLayer({
            source: new XYZ({
                url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            })
        });

        const cogLayer = new WebGLTileLayer({
            source: new GeoTIFF({
                sources: [
                    {
                        url: "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_2000_01_MeanTemperature_v0.tif"
                    }
                ]
            })
        });

        const map = new Map({
            layers: [tile1, cogLayer],
            target: mapRef.current,
            view: new View({
                center: [-460000, 4540000],
                zoom: 8
            })
        });

        mapInstanceRef1.current = map; // Store the map instance in the ref

        return () => {
            map.setTarget(undefined);
            mapInstanceRef1.current = null;
        };
    }, [mapRef]);

    return null;
};

const HistoricClimateHook2 = (mapRef2: React.RefObject<HTMLDivElement>) => {
    const mapInstanceRef2 = useRef<Map | null>(null); // Ref to store the map instance

    useEffect(() => {
        if (!mapRef2.current || mapInstanceRef2.current) return;

        const key = "2sau1xauZfmyliK5rhUv";

        const tile1 = new TileLayer({
            source: new XYZ({
                url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            })
        });

        const cogLayer = new WebGLTileLayer({
            source: new GeoTIFF({
                sources: [
                    {
                        url: "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_2000_01_MeanTemperature_v0.tif"
                    }
                ]
            })
        });

        const map = new Map({
            layers: [tile1, cogLayer],
            target: mapRef2.current,
            view: new View({
                center: [-460000, 4540000],
                zoom: 8
            })
        });

        mapInstanceRef2.current = map; // Store the map instance in the ref

        return () => {
            map.setTarget(undefined);
            mapInstanceRef2.current = null;
        };
    }, [mapRef2]);

    return null;
};

export { HistoricClimateHook1, HistoricClimateHook2 };
