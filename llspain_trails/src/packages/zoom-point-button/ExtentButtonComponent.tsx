// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Button } from "@open-pioneer/chakra-integration";
import { useMapModel } from "@open-pioneer/map";
import { CommonComponentProps, useCommonComponentProps } from "@open-pioneer/react-utils";
import { Point } from "ol/geom";
import { FC } from "react";

export interface ZoomPointButtonComponentProps extends CommonComponentProps {
    label: string;
    mapId: string;
    point: Point;
    zoom: number;
}

export const ZoomPointButtonComponent: FC<ZoomPointButtonComponentProps> = (props) => {
    const { label, mapId, point, zoom } = props;
    const { containerProps } = useCommonComponentProps("simple-ui", props);

    const mapModel = useMapModel(mapId);

    function center(): void {
        const view = mapModel.map?.olMap.getView();
        view?.animate({ zoom, center: point.getCoordinates() });
    }

    return (
        <Button {...containerProps} onClick={center}>
            {label}
        </Button>
    );
};
