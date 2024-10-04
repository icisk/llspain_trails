import { Box, Center, Container, Flex, HStack, Spacer } from "@open-pioneer/chakra-integration";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { MapAnchor, MapContainer } from "@open-pioneer/map";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import { InfoBoxComponent } from "info-box";
import { Point } from "ol/geom";
import { useIntl } from "open-pioneer:react-hooks";
import { ZoomPointButtonComponent } from "zoom-point-button";

import { ChangeMonth } from "./controls/ChangeMonth";
import { MAP_ID } from "./services/MapProvider";
import { ChangeVariable } from "./controls/ChangeVariable";

import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { useMapModel } from "@open-pioneer/map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";

interface DataResponse {
    ranges: {
        [key: string]: {
            values: number[];
        };
    };
}

export function AppUI() {
    const [data, setData] = useState<DataResponse | null>(null);
    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);
    let options;

    const intl = useIntl();

    useEffect(() => {
        if (!clickedCoordinates) return;

        const [x, y] = clickedCoordinates;

        const url = `https://i-cisk.dev.52north.org/data/collections/creaf_forecast/position?coords=POINT(${x}%20${y})&parameter-name=pc05,pc10,pc25,pc50,pc75,pc90,pc95`;

        setLoading(true);

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched data:", data);
                const hasValidData = Object.values(data.ranges).some(range =>
                    range.values.some(value => value > -1e37 && value < 1e37)
                );
                if (hasValidData) {
                    setData(data);
                } else {
                    console.warn("No valid data available for the selected area.");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data.");
                setLoading(false);
            });
    }, [clickedCoordinates]);

    const mapState = useMapModel(MAP_ID);
    const _months_eng = ["january", "february", "march", "april", "may", "june", "july", "august"];
    const months_esp = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto"];

    const handleMapClick = (event: MapBrowserEvent<MouseEvent>) => {
        const coordinatesEPSG3857 = event.coordinate;
        const coordinatesEPSG25830 = transform(coordinatesEPSG3857, "EPSG:3857", "EPSG:25830");
        setClickedCoordinates(coordinatesEPSG25830);
    };

    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
            olMap.on("click", handleMapClick);

            return () => {
                olMap.un("click", handleMapClick);
            };
        }
    }, [mapState]);

    if (data) {
        const parameters = Object.keys(data.ranges);
        const seriesData = parameters.map((param) => ({
            name: param,
            data: data.ranges[param]?.values || []
        }));

        options = {
            title: {
                text: "Precipitation Data"
            },
            xAxis: {
                //categories: months_eng
                categories: months_esp
            },
            yAxis: {
                title: {
                    text: "Precipitation (mm)"
                }
            },
            series: seriesData
        };
    }

    const completeExtent = {
        geom: new Point([-460000, 4540000]),
        zoom: 8
    };

    const cazorlaPoint = {
        geom: new Point([-3.004167, 37.913611]).transform("EPSG:4326", "EPSG:3857"),
        zoom: 10
    };

    const pedrochesPoint = {
        geom: new Point([-4.7, 38.4]).transform("EPSG:4326", "EPSG:3857"),
        zoom: 9.5
    };

    return (
        <Container minWidth={"container.xl"}>
            <InfoBoxComponent
                header={intl.formatMessage({ id: "heading" })}
                description={intl.formatMessage({ id: "description" })}
            ></InfoBoxComponent>

            <Center pt={2}>
                <HStack>
                    <ChangeMonth></ChangeMonth>
                    <ChangeVariable></ChangeVariable>
                </HStack>
            </Center>

            <Box height={"500px"} pt={2}>
                <MapContainer mapId={MAP_ID} role="main">
                    <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                        <Flex role="bottom-right" direction="column" gap={1} padding={1}>
                            <ZoomIn mapId={MAP_ID} />
                            <ZoomOut mapId={MAP_ID} />
                        </Flex>
                    </MapAnchor>
                </MapContainer>
            </Box>

            <HStack height="24px">
                <CoordinateViewer mapId={MAP_ID} displayProjectionCode="EPSG:4326" precision={3} />
                <Spacer />
                <ScaleBar mapId={MAP_ID}></ScaleBar>
                <ScaleViewer mapId={MAP_ID}></ScaleViewer>
            </HStack>
            <Center pt={2}>
                <HStack>
                    <ZoomPointButtonComponent
                        label="Carzola"
                        mapId={MAP_ID}
                        point={cazorlaPoint.geom}
                        zoom={cazorlaPoint.zoom}
                    ></ZoomPointButtonComponent>
                    <ZoomPointButtonComponent
                        label="Los Pedroches"
                        mapId={MAP_ID}
                        point={pedrochesPoint.geom}
                        zoom={pedrochesPoint.zoom}
                    ></ZoomPointButtonComponent>
                    <ZoomPointButtonComponent
                        label="General"
                        mapId={MAP_ID}
                        point={completeExtent.geom}
                        zoom={completeExtent.zoom}
                    ></ZoomPointButtonComponent>
                </HStack>
            </Center>

            <Box p={4}>
                <div>
                    <HighchartsReact highcharts={Highcharts} options={options} />
                </div>
            </Box>
        </Container>
    );
}