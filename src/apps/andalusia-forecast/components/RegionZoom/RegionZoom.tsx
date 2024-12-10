import React from "react";
import {Center, HStack} from "@open-pioneer/chakra-integration";
import {ZoomPointButtonComponent} from "zoom-point-button";
import {MAP_ID} from "../../services/MidtermForecastMapProvider";
import {cazorlaPoint, completeExtent, pedrochesPoint} from "../utils/globals";

interface RegionZoomProps {
    MAP_ID: string; 
}

export function RegionZoom({ MAP_ID } : RegionZoomProps) {
    return(
        <Center pt={2}>
            <HStack>
                <ZoomPointButtonComponent
                    label="Cazorla"
                    mapId={MAP_ID}
                    point={cazorlaPoint.geom}
                    zoom={cazorlaPoint.zoom}
                />
                <ZoomPointButtonComponent
                    label="Los Pedroches"
                    mapId={MAP_ID}
                    point={pedrochesPoint.geom}
                    zoom={pedrochesPoint.zoom}
                />
                <ZoomPointButtonComponent
                    label="General"
                    mapId={MAP_ID}
                    point={completeExtent.geom}
                    zoom={completeExtent.zoom}
                />
            </HStack>
        </Center>
    )
}
