import React, { useEffect } from "react";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import { SimpleLayer } from "@open-pioneer/map";
import { MAP_ID } from "../../services/MidtermForecastMapProvider";

interface PrecipitationMapProps {
    month: string;
    variable: string;
}

const PrecipitationMap: React.FC<PrecipitationMapProps> = ({ month, variable }) => {
    useEffect(() => {
        const layer = new WebGLTileLayer({
            source: new GeoTIFF({
                sources: [
                    {
                        url: `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip_forecats/cog_PLforecast_${month}_2024_pc50_NoNDVI_RegMult_E3_MAP_Corrected.tif`,
                        max: 100,
                        min: 0
                    },
                    {
                        url: `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip_forecats/cog_PLforecast_${month}_2024_pc95_NoNDVI_RegMult_E3_MAP_Corrected.tif`,
                        max: 100,
                        min: 0
                    }
                ]
            }),
            zIndex: 0, // Order of the Layers
            style: {
                color: [
                    "case",
                    ["all", ["==", ["band", 1], 0], ["==", ["band", 2], 0]],
                    [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
                    ["==", ["band", 1], 0],
                    "red", // Red for actual 0 values within the area of interest
                    ["<=", ["band", 1], 15],
                    "red",
                    ["<=", ["band", 1], 30],
                    "orange",
                    ["<=", ["band", 1], 45],
                    "yellow",
                    ["<=", ["band", 1], 60],
                    "green",
                    ["<=", ["band", 1], 75],
                    "blue",
                    ["<=", ["band", 1], 90],
                    "indigo",
                    "violet"
                ]
            }
        });

        // Add the layer to the map
        const mapModel = mapRegistry.getMapModel(MAP_ID);
        mapModel?.layers.addLayer(
            new SimpleLayer({
                title: "Precipitation Forecast",
                olLayer: layer
            })
        );
    }, [month, variable]);

    return <div id="map" style={{ width: "100%", height: "100%" }} />;
};

export default PrecipitationMap;