import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Flex } from "@open-pioneer/chakra-integration";
import { Button, HStack } from "@chakra-ui/react";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { MapAnchor, MapContainer, SimpleLayer, useMapModel } from "@open-pioneer/map";
import { Header } from "../components/MainComponents/Header";
import { MainMap } from "../components/MainComponents/MainMap";
import { HistoricClimateHook2 } from "../hooks/HistoricClimatehook";
import Layer from "ol/layer/Layer";
import { MAP_ID } from "../services/HistoricClimateMapProvider";
import { DynamicLegend, DynamicPrecipitationLegend } from "../components/Legends/DynamicLegend";
import { LayerSwipe } from "../components/LayerSwipe/LayerSwipe";
import Highcharts, { ChartOptions } from "highcharts";
import { HistoricPickerLeft, SelectionLeft } from "../components/VariablePicker/HistoricPickerLeft";
import {
    HistoricPickerRight,
    SelectionRight
} from "../components/VariablePicker/HistoricPickerRight";
import { Knecht } from "../components/Legends/Knecht";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";
import { createMarker, markerStyle } from "../components/utils/marker";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import HighchartsReact from "highcharts-react-official";
import { set } from "ol/transform";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { HistoricLayerHandler } from "../services/HistoricLayerHandler";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { CoordsScaleBar } from "../components/CoordsScaleBar/CoordsScaleBar";
import { RegionZoom } from "../components/RegionZoom/RegionZoom";
import {
    espanolChartOptions,
    CS02_initChartOptions,
    CS02_compareChartOptions,
    CS02_TPfullTimeSeriesChartOptions,
    CS02_SPEIfullTimeSeriesChartOptions
} from "../components/Charts/ChartOptions";

import Swipe from "ol-ext/control/Swipe";

// Marker layer for displaying clicks
const markerSource = new VectorSource();
const markerLayer = new VectorLayer({ source: markerSource, zIndex: 100 });

const HistoricClimateData1 = () => {
    const intl = useIntl();
    Highcharts.setOptions(espanolChartOptions(intl));

    const histLayerHandler = useService<HistoricLayerHandler>("app.HistoricLayerHandler");

    const months = [
        intl.formatMessage({ id: "global.months.jan" }),
        intl.formatMessage({ id: "global.months.feb" }),
        intl.formatMessage({ id: "global.months.mar" }),
        intl.formatMessage({ id: "global.months.apr" }),
        intl.formatMessage({ id: "global.months.may" }),
        intl.formatMessage({ id: "global.months.jun" }),
        intl.formatMessage({ id: "global.months.jul" }),
        intl.formatMessage({ id: "global.months.aug" }),
        intl.formatMessage({ id: "global.months.sep" }),
        intl.formatMessage({ id: "global.months.oct" }),
        intl.formatMessage({ id: "global.months.nov" }),
        intl.formatMessage({ id: "global.months.dec" })
    ];
    const [varLeft, varRight] = useReactiveSnapshot(
        () => [histLayerHandler.currentVarLeft, histLayerHandler.currentVarRight],
        [histLayerHandler]
    );
    const mapRef = useRef<HTMLDivElement>(null);
    const [leftLayers, setLeftLayers] = useState<Layer[]>();
    const [rightLayers, setRightLayers] = useState<Layer[]>();
    const [sliderValue, setSliderValue] = useState<number>(50);

    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);
    const [yearLeft, setYearLeft] = useState<number>(2000);
    const [yearRight, setYearRight] = useState<number>(2005);

    //states for comparison mode
    const [precipData1, setPrecipData1] = useState(null);
    const [tempData1, setTempData1] = useState(null);
    const [precipData2, setPrecipData2] = useState(null);
    const [tempData2, setTempData2] = useState(null);

    //states for single mode
    // const [tempprecipData, setTempPrecipData] = useState(null);
    // const [speiData, setSpeiData] = useState(null);

    const [precipData, setPrecipData] = useState(null);
    const [tempData, setTempData] = useState(null);
    const [spei3Data, setSpei3Data] = useState(null);
    const [spei6Data, setSpei6Data] = useState(null);
    const [spei9Data, setSpei9Data] = useState(null);
    const [spei12Data, setSpei12Data] = useState(null);
    const [spei24Data, setSpei24Data] = useState(null);
    const [spi3Data, setSpi3Data] = useState(null);
    const [spi6Data, setSpi6Data] = useState(null);
    const [spi9Data, setSpi9Data] = useState(null);
    const [spi12Data, setSpi12Data] = useState(null);
    const [spi24Data, setSpi24Data] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [precipTimeSeries, setPrecipTimeSeries] = useState<String>(null);
    const [tempTimeSeries, setTempTimeSeries] = useState<String>(null);

    const [spei3TimeSeries, setSpei3TimeSeries] = useState<String>(null);
    const [spei6TimeSeries, setSpei6TimeSeries] = useState<String>(null);
    const [spei9TimeSeries, setSpei9TimeSeries] = useState<String>(null);
    const [spei12TimeSeries, setSpei12TimeSeries] = useState<String>(null);
    const [spei24TimeSeries, setSpei24TimeSeries] = useState<String>(null);

    const [spi3TimeSeries, setSpi3TimeSeries] = useState<String>(null);
    const [spi6TimeSeries, setSpi6TimeSeries] = useState<String>(null);
    const [spi9TimeSeries, setSpi9TimeSeries] = useState<String>(null);
    const [spi12TimeSeries, setSpi12TimeSeries] = useState<String>(null);
    const [spi24TimeSeries, setSpi24TimeSeries] = useState<String>(null);

    const [oldestDateOfAllTS, setOldestDateOfAllTS] = useState<Date>(null);
    const [newestDateOfAllTS, setNewestDateOfAllTS] = useState<Date>(null);

    const [spiTimeSeries, setSpiTimeSeries] = useState<String>(null);

    const [precipTSDATA, setPrecipTSDATA] = useState<String>(null);
    const [tempTSDATA, setTempTSDATA] = useState<String>(null);

    const [spei3TSDATA, setSpei3TSDATA] = useState<String>(null);
    const [spei6TSDATA, setSpei6TSDATA] = useState<String>(null);
    const [spei9TSDATA, setSpei9TSDATA] = useState<String>(null);
    const [spei12TSDATA, setSpei12TSDATA] = useState<String>(null);
    const [spei24TSDATA, setSpei24TSDATA] = useState<String>(null);

    const [spi3TSDATA, setSpi3TSDATA] = useState<String>(null);
    const [spi6TSDATA, setSpi6TSDATA] = useState<String>(null);
    const [spi9TSDATA, setSpi9TSDATA] = useState<String>(null);
    const [spi12TSDATA, setSpi12TSDATA] = useState<String>(null);
    const [spi24TSDATA, setSpi24TSDATA] = useState<String>(null);

    const[indicatorDataLeft, setIndicatorDataLeft] = useState<any>(null);
    const[indicatorDataRight, setIndicatorDataRight] = useState<any>(null);

    const [spiTSDATA, setSpiTSDATA] = useState<String>(null);

    const [chartInstance, setChartInstance] = useState(null);

    const [isComparisonMode, setIsComparisonMode] = useState(false);

    const [chartOptions, setChartOptions] = useState(CS02_initChartOptions(intl));
    const [speiChartOptions, setSpeiChartOptions] = useState<ChartOptions>();
    const [spiChartOptions, setSpiChartOptions] = useState<ChartOptions>();

    const mapModel = useMapModel(MAP_ID);

    //useEffect to get datetimes for Timeseries
    useEffect(() => {
        const meta2TS = (metaData) => {
            return Object.keys(metaData).map((timestamp) => new Date(timestamp).getTime());
        };
        function coords2TS(startISO, endISO, steps) {
            const startDate = new Date(startISO);
            const endDate = new Date(endISO);
            if (steps === 1) {
                return [startDate.getTime()];
            }
            const timeSeries = [];
            const monthsInterval = Math.floor(
                (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    endDate.getMonth() -
                    startDate.getMonth()
            );

            for (let i = 0; i < steps; i++) {
                const currentDate = new Date(startDate);
                currentDate.setMonth(
                    startDate.getMonth() + Math.round((monthsInterval * i) / (steps - 1))
                );
                timeSeries.push(currentDate.getTime());
            }

            return timeSeries;
        }

        function getDataRange({tempMetrics, precipMetrics, spei3Metrics, spei6Metrics, spei9Metrics, spei12Metrics, spei24Metrics, spi3Metrics, spi6Metrics, spi9Metrics, spi12Metrics, spi24Metrics}){
            const dates = [];

            if (Array.isArray(tempMetrics)) {
                dates.push(new Date(tempMetrics[0]));
                dates.push(new Date(tempMetrics[tempMetrics.length - 1]));
            };

            if (Array.isArray(precipMetrics)) {
                dates.push(new Date(precipMetrics[0]));
                dates.push(new Date(precipMetrics[precipMetrics.length -1]));
            }

            const rangeMetrics = [spei3Metrics, spei6Metrics, spei9Metrics, spei12Metrics, spei24Metrics, spi3Metrics, spi6Metrics, spi9Metrics, spi12Metrics, spi24Metrics]

            for (const metric of rangeMetrics) {
                if (metric?.start && metric?.stop) {
                    dates.push(new Date(metric.start));
                    dates.push(new Date(metric.stop));
                }
            }

            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            
            // console.log(minDate, maxDate)

            setOldestDateOfAllTS(minDate);
            setNewestDateOfAllTS(maxDate);
        }

        const fetchMetaData = async () => {
            const tempMetadataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_temperature/position?coords=POINT(0 0)&f=json";
                //"https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_temperature_metrics.zarr/.zmetadata";
            const precipMetadataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_precip/position?coords=POINT(0 0)&f=json";
                //"https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_precip_metrics.zarr/.zmetadata";

            const spei3MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_3months/position?coords=POINT(0 0)&f=json";
            const spei6MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_6months/position?coords=POINT(0 0)&f=json";
            const spei9MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_9months/position?coords=POINT(0 0)&f=json";
            const spei12MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_12months/position?coords=POINT(0 0)&f=json";
            const spei24MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_24months/position?coords=POINT(0 0)&f=json";

            const spi3MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_3months/position?coords=POINT(0 0)&f=json";
            const spi6MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_6months/position?coords=POINT(0 0)&f=json";
            const spi9MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_9months/position?coords=POINT(0 0)&f=json";
            const spi12MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_12months/position?coords=POINT(0 0)&f=json";
            const spi24MetaDataUrl =
                "https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_24months/position?coords=POINT(0 0)&f=json";

            try {
                const [
                    precipMetadata,
                    tempMetadata,
                    spei3Metadata,
                    spei6Metadata,
                    spei9Metadata,
                    spei12Metadata,
                    spei24Metadata,
                    spi3Metadata,
                    spi6Metadata,
                    spi9Metadata,
                    spi12Metadata,
                    spi24Metadata
                ] = await Promise.all([
                    fetch(precipMetadataUrl).then((res) => res.json()),
                    fetch(tempMetadataUrl).then((res) => res.json()),

                    fetch(spei3MetaDataUrl).then((res) => res.json()),
                    fetch(spei6MetaDataUrl).then((res) => res.json()),
                    fetch(spei9MetaDataUrl).then((res) => res.json()),
                    fetch(spei12MetaDataUrl).then((res) => res.json()),
                    fetch(spei24MetaDataUrl).then((res) => res.json()),

                    fetch(spi3MetaDataUrl).then((res) => res.json()),
                    fetch(spi6MetaDataUrl).then((res) => res.json()),
                    fetch(spi9MetaDataUrl).then((res) => res.json()),
                    fetch(spi12MetaDataUrl).then((res) => res.json()),
                    fetch(spi24MetaDataUrl).then((res) => res.json())
                ]);
                
                //
                //const tempMetrics = tempMetadata.metadata[".zattrs"].metrics;
                //const precipMetrics = precipMetadata.metadata[".zattrs"].metrics;

                const tempMetrics = tempMetadata?.domain.axes.time;
                const precipMetrics = precipMetadata?.domain.axes.time;

                const spei3Metrics = spei3Metadata?.domain.axes.time;
                const spei6Metrics = spei6Metadata?.domain.axes.time;
                const spei9Metrics = spei9Metadata?.domain.axes.time;
                const spei12Metrics = spei12Metadata?.domain.axes.time;
                const spei24Metrics = spei24Metadata?.domain.axes.time;

                const spi3Metrics = spi3Metadata?.domain.axes.time;
                const spi6Metrics = spi6Metadata?.domain.axes.time;
                const spi9Metrics = spi9Metadata?.domain.axes.time;
                const spi12Metrics = spi12Metadata?.domain.axes.time;
                const spi24Metrics = spi24Metadata?.domain.axes.time;

                //const tempTimeSeries = meta2TS(tempMetrics);
                //const precipTimeSeries = meta2TS(precipMetrics);
                
                const tempTimeSeries = coords2TS(
                    tempMetrics.start,
                    tempMetrics.stop,
                    tempMetrics.num
                )
                
                const precipTimeSeries = coords2TS(
                    precipMetrics.start,
                    precipMetrics.stop,
                    precipMetrics.num
                )

                const spei3TimeSeries = coords2TS(
                    spei3Metrics.start,
                    spei3Metrics.stop,
                    spei3Metrics.num
                );
                const spei6TimeSeries = coords2TS(
                    spei6Metrics.start,
                    spei6Metrics.stop,
                    spei6Metrics.num
                );
                const spei9TimeSeries = coords2TS(
                    spei9Metrics.start,
                    spei9Metrics.stop,
                    spei9Metrics.num
                );
                const spei12TimeSeries = coords2TS(
                    spei12Metrics.start,
                    spei12Metrics.stop,
                    spei12Metrics.num
                );
                const spei24TimeSeries = coords2TS(
                    spei24Metrics.start,
                    spei24Metrics.stop,
                    spei24Metrics.num
                );

                const spi3TimeSeries = coords2TS(
                    spi3Metrics.start,
                    spi3Metrics.stop,
                    spi3Metrics.num
                );
                const spi6TimeSeries = coords2TS(
                    spi6Metrics.start,
                    spi6Metrics.stop,
                    spi6Metrics.num
                );
                const spi9TimeSeries = coords2TS(
                    spi9Metrics.start,
                    spi9Metrics.stop,
                    spi9Metrics.num
                );
                const spi12TimeSeries = coords2TS(
                    spi12Metrics.start,
                    spi12Metrics.stop,
                    spi12Metrics.num
                );
                const spi24TimeSeries = coords2TS(
                    spi24Metrics.start,
                    spi24Metrics.stop,
                    spi24Metrics.num
                );

                setTempTimeSeries(tempTimeSeries);
                setPrecipTimeSeries(precipTimeSeries);

                setSpei3TimeSeries(spei3TimeSeries);
                setSpei6TimeSeries(spei6TimeSeries);
                setSpei9TimeSeries(spei9TimeSeries);
                setSpei12TimeSeries(spei12TimeSeries);
                setSpei24TimeSeries(spei24TimeSeries);

                setSpi3TimeSeries(spi3TimeSeries);
                setSpi6TimeSeries(spi6TimeSeries);
                setSpi9TimeSeries(spi9TimeSeries);
                setSpi12TimeSeries(spi12TimeSeries);
                setSpi24TimeSeries(spi24TimeSeries);

                // get the oldest and newest date of all time series
                getDataRange({tempMetrics, precipMetrics, spei3Metrics, spei6Metrics, spei9Metrics, spei12Metrics, spei24Metrics, spi3Metrics, spi6Metrics, spi9Metrics, spi12Metrics, spi24Metrics});

            } catch (err) {
                setError(err.message);
            }
        };

        fetchMetaData();

    }, []);

    //get values for full timeseries
    useEffect(() => {
        if (!clickedCoordinates) return;

        const fetchData = async (x, y) => {
            const precipUrl = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_precip/position?coords=POINT(${x}%20${y})`;
            const tempUrl = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_temperature/position?coords=POINT(${x}%20${y})`;

            const spei3Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_3months/position?coords=POINT(${x}%20${y})`;
            const spei6Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_6months/position?coords=POINT(${x}%20${y})`;
            const spei9Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_9months/position?coords=POINT(${x}%20${y})`;
            const spei12Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_12months/position?coords=POINT(${x}%20${y})`;
            const spei24Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_24months/position?coords=POINT(${x}%20${y})`;

            const spi3Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_3months/position?coords=POINT(${x}%20${y})`;
            const spi6Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_6months/position?coords=POINT(${x}%20${y})`;
            const spi9Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_9months/position?coords=POINT(${x}%20${y})`;
            const spi12Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_12months/position?coords=POINT(${x}%20${y})`;
            const spi24Url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPI_24months/position?coords=POINT(${x}%20${y})`;

            try {
                const [
                    precipResponse,
                    tempResponse,
                    spei3Response,
                    spei6Response,
                    spei9Response,
                    spei12Response,
                    spei24Response,
                    spi3Response,
                    spi6Response,
                    spi9Response,
                    spi12Response,
                    spi24Response
                ] = await Promise.all([
                    fetch(precipUrl),
                    fetch(tempUrl),

                    fetch(spei3Url),
                    fetch(spei6Url),
                    fetch(spei9Url),
                    fetch(spei12Url),
                    fetch(spei24Url),

                    fetch(spi3Url),
                    fetch(spi6Url),
                    fetch(spi9Url),
                    fetch(spi12Url),
                    fetch(spi24Url)
                ]);
                if (
                    !precipResponse.ok ||
                    !tempResponse.ok ||
                    !spei3Response.ok ||
                    !spei6Response.ok ||
                    !spei9Response.ok ||
                    !spei12Response.ok ||
                    !spei24Response.ok ||
                    !spi3Response.ok ||
                    !spi6Response.ok ||
                    !spi9Response.ok ||
                    !spi12Response.ok ||
                    !spi24Response.ok
                )
                    throw new Error("Network response was not ok");

                const precipJsonData = await precipResponse.json();
                const tempJsonData = await tempResponse.json();

                const spei3JsonData = await spei3Response.json();
                const spei6JsonData = await spei6Response.json();
                const spei9JsonData = await spei9Response.json();
                const spei12JsonData = await spei12Response.json();
                const spei24JsonData = await spei24Response.json();

                const spi3JsonData = await spi3Response.json();
                const spi6JsonData = await spi6Response.json();
                const spi9JsonData = await spi9Response.json();
                const spi12JsonData = await spi12Response.json();
                const spi24JsonData = await spi24Response.json();

                setPrecipData(precipJsonData?.ranges.historic_precip.values);
                setTempData(tempJsonData?.ranges.historic_temperature.values);

                setSpei3Data(spei3JsonData?.ranges.historic_SPEI_3months.values);
                setSpei6Data(spei6JsonData?.ranges.historic_SPEI_6months.values);
                setSpei9Data(spei9JsonData?.ranges.historic_SPEI_9months.values);
                setSpei12Data(spei12JsonData?.ranges.historic_SPEI_12months.values);
                setSpei24Data(spei24JsonData?.ranges.historic_SPEI_24months.values);

                setSpi3Data(spi3JsonData?.ranges.historic_SPI_3months.values);
                setSpi6Data(spi6JsonData?.ranges.historic_SPI_6months.values);
                setSpi9Data(spi9JsonData?.ranges.historic_SPI_9months.values);
                setSpi12Data(spi12JsonData?.ranges.historic_SPI_12months.values);
                setSpi24Data(spi24JsonData?.ranges.historic_SPI_24months.values);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        const [x, y] = clickedCoordinates;

        fetchData(x, y);
        // console.log(speiData)
    }, [
        clickedCoordinates,
        isComparisonMode,
        yearRight,
        yearLeft,
        precipTimeSeries,
        tempTimeSeries,
        spei3TimeSeries,
        spei6TimeSeries,
        spei9TimeSeries,
        spei12TimeSeries,
        spei24TimeSeries,
        spi3TimeSeries,
        spi6TimeSeries,
        spi9TimeSeries,
        spi12TimeSeries,
        spi24TimeSeries
    ]);

    useEffect(() => {
        if (
            !tempData ||
            !precipData ||
            !spei3Data ||
            !tempTimeSeries ||
            !precipTimeSeries ||
            !spei3TimeSeries ||
            !spei6TimeSeries ||
            !spei9TimeSeries ||
            !spei12TimeSeries ||
            !spei24TimeSeries ||
            !spi3TimeSeries ||
            !spi6TimeSeries ||
            !spi9TimeSeries ||
            !spi12TimeSeries ||
            !spi24TimeSeries
        )
            return;

        setTempTSDATA(tempTimeSeries.map((val, i) => [val, tempData[i]]));
        setPrecipTSDATA(precipTimeSeries.map((val, i) => [val, precipData[i]]));

        setSpei3TSDATA(spei3TimeSeries.map((val, i) => [val, spei3Data[i]]));
        setSpei6TSDATA(spei6TimeSeries.map((val, i) => [val, spei6Data[i]]));
        setSpei9TSDATA(spei9TimeSeries.map((val, i) => [val, spei9Data[i]]));
        setSpei12TSDATA(spei12TimeSeries.map((val, i) => [val, spei12Data[i]]));
        setSpei24TSDATA(spei24TimeSeries.map((val, i) => [val, spei24Data[i]]));

        setSpi3TSDATA(spi3TimeSeries.map((val, i) => [val, spi3Data[i]]));
        setSpi6TSDATA(spi6TimeSeries.map((val, i) => [val, spi6Data[i]]));
        setSpi9TSDATA(spi9TimeSeries.map((val, i) => [val, spi9Data[i]]));
        setSpi12TSDATA(spi12TimeSeries.map((val, i) => [val, spi12Data[i]]));
        setSpi24TSDATA(spi24TimeSeries.map((val, i) => [val, spi24Data[i]]));
    }, [
        tempData,
        precipData,
        spei3Data,
        tempTimeSeries,
        precipTimeSeries,
        spei3TimeSeries,
        spei6TimeSeries,
        spei9TimeSeries,
        spei12TimeSeries,
        spei24TimeSeries,
        spi3TimeSeries,
        spi6TimeSeries,
        spi9TimeSeries,
        spi12TimeSeries,
        spi24TimeSeries
    ]);

    useEffect(() => {
        if (!tempTSDATA || !precipTSDATA) return;
        const filterTimeSeriesByYear = (timeSeries, selectedYear) =>
            timeSeries
                .filter((entry) => new Date(entry[0]).getFullYear() === selectedYear)
                .map((e) => [new Date(e[0]).getMonth(), e[1]]);

        setTempData1(filterTimeSeriesByYear(tempTSDATA, yearLeft));
        setTempData2(filterTimeSeriesByYear(tempTSDATA, yearRight));
        setPrecipData1(filterTimeSeriesByYear(precipTSDATA, yearLeft));
        setPrecipData2(filterTimeSeriesByYear(precipTSDATA, yearRight));
    }, [tempTSDATA, precipTSDATA, yearLeft, yearRight, isComparisonMode]);

    // comparison mode: update chart options when data is updated
    useEffect(() => {
        if (isComparisonMode) {
            if (!precipData1 || !precipData2 || !tempData1 || !tempData2) return;

            setChartOptions(
                CS02_compareChartOptions(
                    intl,
                    months,
                    yearLeft,
                    yearRight,
                    tempData1,
                    tempData2,
                    precipData1,
                    precipData2
                )
            );
        } else {
            setChartOptions(CS02_TPfullTimeSeriesChartOptions(intl, precipTSDATA, tempTSDATA, oldestDateOfAllTS, newestDateOfAllTS));
        }
    }, [
        isComparisonMode,
        precipData1,
        precipData2,
        tempData1,
        tempData2,
        tempTSDATA,
        precipTSDATA,
        yearLeft,
        yearRight
    ]);

    useEffect(() => {
        let indicatorVarLeft;
        if (varLeft === "temp" || varLeft === "precip") {
            indicatorVarLeft = "spei9";
        } else {
            indicatorVarLeft = varLeft;
        }

        let indicatorVarRight;
        if (varRight === "temp" || varRight === "precip") {
            indicatorVarRight = "spei9";
        } else {
            indicatorVarRight = varRight;
        }

        switch (varLeft) {
            case "spei3":
                setIndicatorDataLeft(spei3TSDATA);
                break;
            case "spei6":
                setIndicatorDataLeft(spei6TSDATA);
                break;
            case "spei9":
                setIndicatorDataLeft(spei9TSDATA);
                break;
            case "spei12":
                setIndicatorDataLeft(spei12TSDATA);
                break;
            case "spei24":
                setIndicatorDataLeft(spei24TSDATA);
                break;
            case "spi3":
                setIndicatorDataLeft(spi3TSDATA);
                break;
            case "spi6":
                setIndicatorDataLeft(spi6TSDATA);
                break;
            case "spi9":
                setIndicatorDataLeft(spi9TSDATA);
                break;
            case "spi12":
                setIndicatorDataLeft(spi12TSDATA);
                break;
            case "spi24":
                setIndicatorDataLeft(spi24TSDATA);
                break;
            default:
                setIndicatorDataLeft(spei9TSDATA);
        }

        switch (varRight) {
            case "spei3":
                setIndicatorDataRight(spei3TSDATA);
                break;
            case "spei6":
                setIndicatorDataRight(spei6TSDATA);
                break;
            case "spei9":
                setIndicatorDataRight(spei9TSDATA);
                break;
            case "spei12":
                setIndicatorDataRight(spei12TSDATA);
                break;
            case "spei24":
                setIndicatorDataRight(spei24TSDATA);
                break;
            case "spi3":
                setIndicatorDataRight(spi3TSDATA);
                break;
            case "spi6":
                setIndicatorDataRight(spi6TSDATA);
                break;
            case "spi9":
                setIndicatorDataRight(spi9TSDATA);
                break;
            case "spi12":
                setIndicatorDataRight(spi12TSDATA);
                break;
            case "spi24":
                setIndicatorDataRight(spi24TSDATA);
                break;
            default:
                setIndicatorDataRight(spei9TSDATA);
        }
    }, [
        spei3TSDATA,
        spei6TSDATA,
        spei9TSDATA,
        spei12TSDATA,
        spei24TSDATA,
        spi3TSDATA,
        spi6TSDATA,
        spi9TSDATA,
        spi12TSDATA,
        spi24Data,
        varLeft,
        varRight,
        oldestDateOfAllTS,
        newestDateOfAllTS,
    ]);

    useEffect(() => {
        if (!indicatorDataLeft || !indicatorDataRight) return;
    
        const indicatorVarLeft = ["temp", "precip"].includes(varLeft) ? "spei9" : varLeft;
        const indicatorVarRight = ["temp", "precip"].includes(varRight) ? "spei9" : varRight;
    
        setSpeiChartOptions(
            CS02_SPEIfullTimeSeriesChartOptions(
                intl,
                indicatorDataLeft,
                indicatorDataRight,
                indicatorVarLeft,
                indicatorVarRight,
                oldestDateOfAllTS,
                newestDateOfAllTS
            )
        );
    }, [indicatorDataLeft, indicatorDataRight, varLeft, varRight, intl, oldestDateOfAllTS, newestDateOfAllTS]);
    

    useEffect(() => {
        if (mapModel.map) {
            const map = mapModel.map;
            const leftLayer1 = map.layers.getLayerById("left") as SimpleLayer;
            setLeftLayers([leftLayer1.olLayer as Layer]);
            const rightLayer1 = map.layers.getLayerById("right") as SimpleLayer;
            setRightLayers([rightLayer1.olLayer as Layer]);
        }
    }, [mapModel]);

    //click on map
    useEffect(() => {
        if (mapModel?.map?.olMap) {
            const olMap = mapModel.map.olMap;
            // add marker layer
            olMap.addLayer(markerLayer);
            // attach click event handler
            olMap.on("click", handleMapClick);
            // Cleanup function
            return () => {
                olMap.removeLayer(markerLayer);
                olMap.un("click", handleMapClick);
            };
        }
    }, [mapModel]);

    const handleMapClick = (event: MapBrowserEvent<MouseEvent>) => {
        const coordinatesEPSG3857 = event.coordinate;
        const coordinatesEPSG25830 = transform(coordinatesEPSG3857, "EPSG:3857", "EPSG:25830");
        setClickedCoordinates(coordinatesEPSG25830);

        //Clear previous markers and add a new one
        markerSource.clear();
        const marker = createMarker(coordinatesEPSG3857, markerStyle);
        markerSource.addFeature(marker);
    };

    type VariableValues = {
        [key: string]: string;
    };

    function onLeftPickerChange(field: keyof SelectionLeft, value: string | number) {
        if (field === "year") {
            histLayerHandler.setYearLeft(value as number);
            setYearLeft(value as number);
        } else if (field === "month") {
            histLayerHandler.setMonthLeft(value as number);
        } else if (field === "var") {
            histLayerHandler.setVarLeft(value as string);
        }
    }

    function onRightPickerChange(field: keyof SelectionRight, value: string | number) {
        if (field === "year") {
            histLayerHandler.setYearRight(value as number);
            setYearRight(value as number);
        } else if (field === "month") {
            histLayerHandler.setMonthRight(value as number);
        } else if (field === "var") {
            histLayerHandler.setVarRight(value as string);
        }
    }

    //HistoricClimateHook1(mapRef);
    HistoricClimateHook2(mapRef);

    //console.log(histLayerHandler.currentVarLeft)
    useEffect(() => {}, [histLayerHandler]);

    return (
        <Container minWidth={"container.xl"}>  
            <Box>
                <Header subpage={"historic_compare"} />
                <Box>
                    <HStack>
                        <HistoricPickerLeft onChange={onLeftPickerChange} />
                        <HistoricPickerRight onChange={onRightPickerChange} />
                    </HStack>
                    <Container flex={2} minWidth={"container.xl"}>
                        <Box width="100%" height="540px" position="relative">
                            {/*<MainMap MAP_ID={MAP_ID}/>*/}

                            <Box height={"500px"} pt={2} overflow="visible">
                                <MapContainer mapId={MAP_ID} role="main">
                                    <MapAnchor
                                        position="bottom-right"
                                        horizontalGap={10}
                                        verticalGap={30}
                                    >
                                        <Flex
                                            role="bottom-right"
                                            direction="column"
                                            gap={1}
                                            padding={1}
                                        >
                                            <ZoomIn mapId={MAP_ID} />
                                            <ZoomOut mapId={MAP_ID} />
                                        </Flex>
                                    </MapAnchor>
                                </MapContainer>
                            </Box>
                            <Box mb={4}>
                                <CoordsScaleBar MAP_ID={MAP_ID} />
                            </Box>

                            <DynamicLegend variable={varLeft} position={"left"} />
                            <DynamicLegend variable={varRight} position={"right"} />
                        </Box>

                        {leftLayers && rightLayers && mapModel.map && (
                            <LayerSwipe
                                map={mapModel.map}
                                sliderValue={sliderValue}
                                onSliderValueChanged={(newValue) => {
                                    setSliderValue(newValue);
                                }}
                                leftLayers={leftLayers}
                                rightLayers={rightLayers}
                            />
                        )}
                        <Box mb={4} gap={10}>
                            <RegionZoom MAP_ID={MAP_ID} />
                        </Box>
                        <Box mt={4}>
                            <RadioGroup
                                onChange={(value) => {
                                    setIsComparisonMode(value === "true");
                                }}
                                value={isComparisonMode ? "true" : "false"}
                            >
                                <Box>
                                    {intl.formatMessage({
                                        id: "historic_compare.radio_buttons.heading"
                                    })}
                                </Box>
                                <Stack direction="row">
                                    <Radio value="true">
                                        {intl.formatMessage({
                                            id: "historic_compare.radio_buttons.compare"
                                        })}
                                    </Radio>
                                    <Radio value="false">
                                        {intl.formatMessage({
                                            id: "historic_compare.radio_buttons.full_series"
                                        })}
                                    </Radio>
                                </Stack>
                            </RadioGroup>
                            <div>
                                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                            </div>
                            <div>
                                <HighchartsReact highcharts={Highcharts} options={speiChartOptions} />
                            </div>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </Container>
    );
};

export default HistoricClimateData1;
