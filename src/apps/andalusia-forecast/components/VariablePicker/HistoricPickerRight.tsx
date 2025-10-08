import {Container, Radio, RadioGroup, Button} from "@open-pioneer/chakra-integration";
import {HStack, Select, VStack} from "@chakra-ui/react";
import {InfoTooltip} from "../InfoTooltip/InfoTooltip";
import React, {useEffect, useState} from "react";
import {useIntl, useService} from "open-pioneer:react-hooks";
import {useReactiveSnapshot} from "@open-pioneer/reactivity";
import {mesesEnEspanol} from "../utils/globals";
import { HistoricLayerHandler } from "../../services/HistoricLayerHandler";

interface HistoricPickerProps {
    onChange: (field: string, value: number|string) => void
}

export function HistoricPickerRight(props: HistoricPickerProps) {
    const intl = useIntl();
    const histLayerHandler = useService<HistoricLayerHandler>("app.HistoricLayerHandler");

    const [currentYear, currentMonth, currentVar, urlright] = useReactiveSnapshot(()=> [
        histLayerHandler.currentYearRight,
        histLayerHandler.currentMonthRight,
        histLayerHandler.currentVarRight,
        histLayerHandler.currentUrlRight
    ], [histLayerHandler]);

    const [error, setError] = useState(null);
    const [years, setYears] = useState<number[]>([]);
    const [months, setMonths] = useState<number[]>([]);
    const [yearMonthMap, setYearMonthMap] = useState<Record<number, Set<number>>>({});

    // const meta_precip = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_precip_metrics.zarr/.zmetadata';
    const meta_precip = 'https://i-cisk.dev.52north.org/data/collections/creaf_historic_precip/position?coords=POINT(0 0)&f=json'

    // const meta_temp = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_temperature_metrics.zarr/.zmetadata';
    const meta_temp = 'https://i-cisk.dev.52north.org/data/collections/creaf_historic_temperature/position?coords=POINT(0 0)&f=json'

    const [mainVar, setMainVar] = useState(
            currentVar.startsWith("spei") || currentVar.startsWith("spi") ? "indicators" : currentVar
        );
        
    useEffect(() => {
        setMainVar(currentVar.startsWith("spei") || currentVar.startsWith("spi") ? "indicators" : currentVar);
    }, [currentVar]);

    useEffect(() => {
        const isStandard = currentVar === "temp" || currentVar === "precip";
        if (isStandard) {
            const link = currentVar === 'temp' ? meta_temp : meta_precip;
            fetch(link)
                .then((response) => response.json())
                .then((data) => {
                    // console.log(data);
                    const startDate = new Date(data.domain.axes.time.start);
                    const endDate = new Date(data.domain.axes.time.stop);
                    const yearMonthMap: Record<number, Set<number>> = {};

                    const startYear = startDate.getFullYear();
                    const endYear = endDate.getFullYear();
                    
                    for (let y = startYear; y <= endYear; y++) {
                        yearMonthMap[y] = new Set();
                    
                        if (y === startYear && y === endYear) {
                            // Start- und Endjahr gleich
                            for (let m = startDate.getMonth() + 1; m <= endDate.getMonth() + 1; m++) {
                                yearMonthMap[y].add(m);
                            }
                        } else if (y === startYear) {
                            // Erstes Jahr
                            for (let m = startDate.getMonth() + 1; m <= 12; m++) {
                                yearMonthMap[y].add(m);
                            }
                        } else if (y === endYear) {
                            // Letztes Jahr
                            for (let m = 1; m <= endDate.getMonth() + 1; m++) {
                                yearMonthMap[y].add(m);
                            }
                        } else {
                            // Alle Zwischenjahre
                            for (let m = 1; m <= 12; m++) {
                                yearMonthMap[y].add(m);
                            }
                        }
                    }

                    const availableYears = Object.keys(yearMonthMap).map(Number);
                    setYears(availableYears);
                    if (availableYears.length > 0) {
                        setMonths(Array.from(yearMonthMap[currentYear] ?? []));
                    }
                    setYearMonthMap(yearMonthMap);
                })
                .catch((error) => console.error("Error fetching data:", error));
        }
    }, [currentYear, currentVar]);

    useEffect(() => {
        function coords2TS(startISO, endISO, steps) {
            const startDate = new Date(startISO);
            const endDate = new Date(endISO);
            const timeSeries = [];
            const monthsInterval = Math.floor((endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth());

            for (let i = 0; i < steps; i++) {
                const currentDate = new Date(startDate);
                currentDate.setMonth(startDate.getMonth() + Math.round((monthsInterval * i) / (steps - 1)));
                timeSeries.push(currentDate.getTime());
            }
            return timeSeries;
        }
        
        if (currentVar.startsWith("spei") || currentVar.startsWith("spi")) {

            let indicatorType = currentVar.startsWith("spei") ? "SPEI" : "SPI";
                
            const map = {
                spei3: "3months",
                spei6: "6months",
                spei9: "9months",
                spei12: "12months",
                spei24: "24months",
                spi3: "3months",
                spi6: "6months",
                spi9: "9months",
                spi12: "12months",
                spi24: "24months"
            };
            

            const link = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_${indicatorType}_${map[currentVar]}/position?coords=POINT(0 0)&f=json`;

            fetch(link)
                .then((res) => res.json())
                .then((speiMetadata) => {
                    const speiMetrics = speiMetadata?.domain?.axes?.time;
                    if (!speiMetrics) throw new Error('Missing SPEI time axis data.');
                    const timeSeries = coords2TS(speiMetrics.start, speiMetrics.stop, speiMetrics.num);

                    const yearMonthMap: Record<number, Set<number>> = {};
                    timeSeries.forEach((timestamp) => {
                        const date = new Date(timestamp);
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;
                        if (!yearMonthMap[year]) yearMonthMap[year] = new Set<number>();
                        yearMonthMap[year].add(month);
                    });

                    const availableYears = Object.keys(yearMonthMap).map(Number);
                    setYears(availableYears);
                    if (availableYears.length > 0) {
                        setMonths(Array.from(yearMonthMap[currentYear]));
                    }
                    setYearMonthMap(yearMonthMap);
                })
                .catch((error) => {setError(error.message);});
        }
    }, [currentVar, currentYear]);

    return (
        <Container flex={2} minWidth={"container.s"}>
            <div style={{ flex: 1 }}>
                <div style={{ margin: 20 }}>
                    <HStack>
                        {intl.formatMessage({ id: "global.controls.sel_year" })}
                        <Select
                            value={currentYear}
                            onChange={(e) => props.onChange('year', parseInt(e.target.value))}
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </Select>
                    </HStack>
                </div>

                <div style={{ margin: 20 }}>
                    <HStack>
                        {intl.formatMessage({ id: "global.controls.sel_month" })}
                        <Select 
                            value={currentMonth}
                            onChange={(e) => props.onChange('month', parseInt(e.target.value))}
                        >
                            {months.map((month) => (
                                <option key={month} value={month}>{mesesEnEspanol[month-1]}</option>
                            ))}
                        </Select>
                    </HStack>
                </div>

                <RadioGroup
                    value={mainVar}
                    onChange={(e) => {
                        setMainVar(e);
                        if (e === "temp" || e === "precip") {
                            props.onChange("var", e);
                        }
                    }}
                >
                    <p>{intl.formatMessage({ id: "global.controls.sel_var" })}:</p>
                    <VStack gap="1">
                        <HStack>
                            <Radio value="temp">{intl.formatMessage({ id: "global.vars.temp" })}</Radio>
                            <InfoTooltip i18n_path="historic_compare.info.temp" />
                        </HStack>
                        <HStack>
                            <Radio value="precip">{intl.formatMessage({ id: "global.vars.precip" })}</Radio>
                            <InfoTooltip i18n_path="historic_compare.info.precip" />
                        </HStack>
                        <HStack>
                            <Radio value="indicators">{intl.formatMessage({ id: "global.vars.indicators" })}</Radio>
                            <InfoTooltip i18n_path="historic_compare.info.indicators" i18n_path_title="historic_compare.info.indicators_title" i18n_path_short_text="historic_compare.info.indicators_short"/>
                        </HStack>

                        {mainVar === "indicators" && (
                            <Select
                                value={currentVar}
                                onChange={(e) => props.onChange("var", e.target.value)}
                                width="100%"
                            >
                                <option value="spei3">{intl.formatMessage({ id: "global.vars.spei3" })}</option>
                                <option value="spei6">{intl.formatMessage({ id: "global.vars.spei6" })}</option>
                                <option value="spei9">{intl.formatMessage({ id: "global.vars.spei9" })}</option>
                                <option value="spei12">{intl.formatMessage({ id: "global.vars.spei12" })}</option>
                                <option value="spei24">{intl.formatMessage({ id: "global.vars.spei24" })}</option>
                                <option value="spi3">{intl.formatMessage({ id: "global.vars.spi3" })}</option>
                                <option value="spi6">{intl.formatMessage({ id: "global.vars.spi6" })}</option>
                                <option value="spi9">{intl.formatMessage({ id: "global.vars.spi9" })}</option>
                                <option value="spi12">{intl.formatMessage({ id: "global.vars.spi12" })}</option>
                                <option value="spi24">{intl.formatMessage({ id: "global.vars.spi24" })}</option>
                            </Select>
                        )}
                        <a href = {urlright} target="_blank" rel="noopener noreferrer">
                            <Button>
                                {intl.formatMessage({id: "historic_compare.download_button"})}
                            </Button>
                        </a>
                    </VStack>
                </RadioGroup>
            </div>
        </Container>
    );
}
