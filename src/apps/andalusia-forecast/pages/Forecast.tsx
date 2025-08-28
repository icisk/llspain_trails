import React, { useEffect, useState } from "react";
import { Box, Center, Container, HStack } from "@open-pioneer/chakra-integration";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { MAP_ID } from "../services/MidtermForecastMapProvider";
import { useFetchData } from "../hooks/useFetchData";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMapModel } from "@open-pioneer/map";
import { transform } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { PrecipitationLayerHandler } from "../services/PrecipitationLayerHandler";
import { createMarker, markerStyle } from "../components/utils/marker";
import { Header } from "../components/MainComponents/Header";
import { MainMap } from "../components/MainComponents/MainMap";
import { DynamicLegend } from "../components/Legends/DynamicLegend";
import { espanolChartOptions } from "../components/Charts/ChartOptions";
import { Select, Switch, Text } from "@chakra-ui/react";

const markerSource = new VectorSource();
const markerLayer = new VectorLayer({ source: markerSource, zIndex: 1 });

export function Forecast() {
    const intl = useIntl();
    const [metadata, setMetadata] = useState<any>(null);
    const [startMonths, setStartMonths] = useState<string[]>([]);

    const [selectedStartMonth, setSelectedStartMonth] = useState("2025-03");
    const [selectedForecastMonth, setSelectedForecastMonth] = useState("2025-03");
    const [variable, setVariable] = useState<"temp" | "precip">("temp");
    const [showUncertainty, setShowUncertainty] = useState(false);

    const mapState = useMapModel(MAP_ID);
    const precipitationService = useService<PrecipitationLayerHandler>("app.PrecipitationLayerHandler");

    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);
    const { data } = useFetchData(clickedCoordinates, variable);
    const [chartOptions, setChartOptions] = useState<any>({
        title: { text: "" },
        xAxis: { type: "datetime" },
        yAxis: { title: { text: "" } },
        tooltip: { valueDecimals: 1 },
        series: []
    });
    Highcharts.setOptions(espanolChartOptions());

    useEffect(() => {
        fetch("https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/bias_correction/metadata.json")
            .then(res => res.json())
            .then(setMetadata)
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (metadata) setStartMonths(Object.keys(metadata));
    }, [metadata]);

    function getNextSixMonths(startMonth: string): string[] {
        const monthsEs = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        const [yearStr, monthStr] = startMonth.split("-");
        let year = parseInt(yearStr, 10);
        let month = parseInt(monthStr, 10) - 1;
        const result: string[] = [];
        for (let i=0;i<6;i++){
            const currentMonth = (month + i) % 12;
            const currentYear = year + Math.floor((month+i)/12);
            result.push(`${currentYear}-${String(currentMonth+1).padStart(2,"0")}`);
        }
        return result;
    }

    // Update Start Month and Forecast Months
    useEffect(() => {
        if (!precipitationService || !selectedStartMonth) return;
        const months = getNextSixMonths(selectedStartMonth);
        setSelectedForecastMonth(months[0]);
        precipitationService.setMonths(selectedStartMonth, months[0]);
    }, [selectedStartMonth, precipitationService]);

    // Update Forecast Month
    useEffect(() => {
        if (!precipitationService || !selectedForecastMonth) return;
        precipitationService.setMonths(selectedStartMonth, selectedForecastMonth);
    }, [selectedForecastMonth, precipitationService]);

    // Update Variable and Uncertainty
    useEffect(() => { if (!precipitationService) return; precipitationService.setVariable(variable); }, [variable]);
    useEffect(() => { if (!precipitationService) return; precipitationService.setShowUncert(showUncertainty); }, [showUncertainty]);

    useEffect(() => {
        if (data) setChartOptions((prev:any) => ({ ...prev, series: data }));
    }, [data]);

    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
            olMap.addLayer(markerLayer);

            const handleClick = (event:any) => {
                const coords = transform(event.coordinate, "EPSG:3857", "EPSG:25830");
                setClickedCoordinates(coords);
                markerSource.clear();
                markerSource.addFeature(createMarker(event.coordinate, markerStyle));
            };

            olMap.on("click", handleClick);
            return () => { olMap.removeLayer(markerLayer); olMap.un("click", handleClick); };
        }
    }, [mapState]);

    return (
        <Container minWidth="container.xl">
            <Header subpage="forecast" />
            <Center pt={2}>
                <HStack flex="overflow">
                    <HStack>
                        <Box whiteSpace="nowrap">Seleccionar mes de inicio</Box>
                        <Select value={selectedStartMonth} onChange={e=>setSelectedStartMonth(e.target.value)}>
                            {startMonths.map(month=><option key={month} value={month}>{month}</option>)}
                        </Select>
                    </HStack>
                    <HStack>
                        <Box whiteSpace="nowrap">Seleccionar mes de forecast</Box>
                        <Select value={selectedForecastMonth} onChange={e=>setSelectedForecastMonth(e.target.value)}>
                            {getNextSixMonths(selectedStartMonth).map(month=><option key={month} value={month}>{month}</option>)}
                        </Select>
                    </HStack>
                    <HStack>
                        <Box whiteSpace="nowrap">Variable</Box>
                        <Select value={variable} onChange={e=>setVariable(e.target.value as any)}>
                            <option value="temp">Temperatura</option>
                            <option value="precip">Precipitación</option>
                        </Select>
                    </HStack>
                    <HStack>
                        <Switch size="lg" isChecked={showUncertainty} onChange={e=>setShowUncertainty(e.target.checked)} />
                        <Text>Mostrar incertidumbre</Text>
                    </HStack>
                </HStack>
            </Center>
            <Box position="relative">
                <MainMap MAP_ID={MAP_ID} />
                <DynamicLegend variable={variable} position="right" />
                {showUncertainty && <DynamicLegend variable="uncertainty" position="left" />}
            </Box>
            <Box p={4}>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </Box>
        </Container>
    );
}
