import {Container, Radio, RadioGroup} from "@open-pioneer/chakra-integration";
import {HStack, Select, VStack} from "@chakra-ui/react";
import {InfoTooltip} from "../InfoTooltip/InfoTooltip";
import React, {useEffect, useState} from "react";
import {useIntl, useService} from "open-pioneer:react-hooks";
import {useReactiveSnapshot} from "@open-pioneer/reactivity";
import {mesesEnEspanol} from "../utils/globals";
import {HistoricLayerHandler} from "../../services/HistoricLayerHandler";


interface HistoricPickerProps {
    onChange: (field: string, value: number|string) => void
}

export interface SelectionLeft{
    year: number,
    month: number,
    var: string
}

export function HistoricPickerLeft(props: HistoricPickerProps) {
    const intl = useIntl();
    const histLayerHandler = useService<HistoricLayerHandler>("app.HistoricLayerHandler");

    const [currentYear, currentMonth, currentVar] = useReactiveSnapshot(()=> [
        histLayerHandler.currentYearLeft,
        histLayerHandler.currentMonthLeft,
        histLayerHandler.currentVarLeft
    ], [histLayerHandler]);

    const [error, setError] = useState(null);
    const [years, setYears] = useState<number[]>([]);
    const [months, setMonths] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [yearMonthMap, setYearMonthMap] = useState<Record<number, Set<number>>>({});
    const meta_precip: string = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_precip_metrics.zarr/.zmetadata'
    const meta_temp: string = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_temperature_metrics.zarr/.zmetadata'

    useEffect(() => {
        if (currentVar != "spei3" || currentVar != "spei24" || currentVar != "spei9" || currentVar != "spei12" || currentVar != "spei6") {
            const link = currentVar === 'temp' ? meta_temp : meta_precip;
            fetch(link)
                .then((response) => response.json())
                .then((data) => {
                    const metrics = data.metadata[".zattrs"].metrics;
                    const yearMonthMap: Record<number, Set<number>> = {};


                    Object.keys(metrics).forEach((dateString) => {
                        const date = new Date(dateString);
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;


                        if (!yearMonthMap[year]) {
                            yearMonthMap[year] = new Set<number>();
                        }
                        yearMonthMap[year].add(month);
                    });
                    const availableYears = Object.keys(yearMonthMap).map(Number);
                    setYears(availableYears);

                    if (availableYears.length > 0) {
                        //setSelectedYear(availableYears[0]);  // Set default selected year
                        setMonths(Array.from(yearMonthMap[currentYear]));  // Set months for the selected year
                    }
                    // console.log(yearMonthMap)
                    setYearMonthMap(yearMonthMap); // Store yearMonthMap in state
                })
                .catch((error) => console.error("Error fetching data:", error));
        }
    }, [currentYear, currentVar]);

    useEffect(() => {
        function coords2TS(startISO, endISO, steps) {
            const startDate = new Date(startISO);
            const endDate = new Date(endISO);
            if (steps === 1) {
                return [startDate.getTime()];
            }
            const timeSeries = [];
            const monthsInterval = Math.floor((endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth());

            for (let i = 0; i < steps; i++) {
                const currentDate = new Date(startDate);
                currentDate.setMonth(startDate.getMonth() + Math.round((monthsInterval * i) / (steps - 1)));
                timeSeries.push(currentDate.getTime());
            }

            return timeSeries;
        }

        if (currentVar === 'spei3' || currentVar === 'spei24') {
            let link
            if (currentVar === 'spei3'){
                link = 'https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_3months/position?coords=POINT(0 0)&f=json'
            } if (currentVar === 'spei24'){
                link = 'https://i-cisk.dev.52north.org/data/collections/creaf_historic_SPEI_24months/position?coords=POINT(0 0)&f=json'
            }
            fetch(link)
                .then((res) => res.json())
                .then((speiMetadata) => {
                    const speiMetrics = speiMetadata?.domain?.axes?.time;
                    if (!speiMetrics) throw new Error('Missing SPEI time axis data.');

                    // Use coords2TS to generate Unix timestamps from start, stop, and number of steps
                    const speiTimeSeries = coords2TS(speiMetrics.start, speiMetrics.stop, speiMetrics.num);

                    const yearMonthMap: Record<number, Set<number>> = {};

                    speiTimeSeries.forEach((timestamp) => {
                        const date = new Date(timestamp);
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;

                        if (!yearMonthMap[year]) {
                            yearMonthMap[year] = new Set<number>();
                        }
                        yearMonthMap[year].add(month);
                    });
                    //console.log(yearMonthMap)

                    const availableYears = Object.keys(yearMonthMap).map(Number);
                    setYears(availableYears);

                    if (availableYears.length > 0) {
                        //setSelectedYear(availableYears[0]);
                        setMonths(Array.from(yearMonthMap[currentYear]));
                    }

                    setYearMonthMap(yearMonthMap);
                })
                .catch((error) => {
                    setError(error.message);
                });
        }
    }, [currentVar, currentYear]);

    
    return (
        <Container flex={2} minWidth={"container.s"}>
            <div style={{ flex: 1 }}>
                <div style={{ margin: 20 }}>
                    <HStack>
                        <>
                            {intl.formatMessage({ id: "global.controls.sel_year" })}
                        </>                        
                        <Select
                            // placeholder={intl.formatMessage({ id: "global.vars.year" })}
                            value={currentYear}
                            onChange={(e) => props.onChange('year', parseInt(e.target.value))}
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>
                    </HStack>
                </div>

                <div style={{ margin: 20 }}>
                    <HStack>
                        <>
                            {intl.formatMessage({ id: "global.controls.sel_month" })}

                        </>
                        <Select 
                        // placeholder={intl.formatMessage({ id: "global.vars.month" })}
                        value={currentMonth}
                        onChange={(e) => props.onChange('month', parseInt(e.target.value))}>
                            {months.map((month) => (
                                <option key={month} value={month}>
                                    {mesesEnEspanol[month-1]}
                                </option>
                            ))}
                        </Select>
                    </HStack>
                </div>
            

            <RadioGroup defaultValue={currentVar} onChange={(e)=> props.onChange('var', e)}>
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
                        <Radio value="spei3">{intl.formatMessage({ id: "global.vars.SPEI3" })}</Radio>
                        <InfoTooltip i18n_path="historic_compare.info.SPEI" />
                    </HStack>
                    <HStack>
                        <Radio value="spei6">{intl.formatMessage({ id: "global.vars.SPEI6" })}</Radio>
                        <InfoTooltip i18n_path="historic_compare.info.SPEI" />
                    </HStack>
                    <HStack>
                        <Radio value="spei9">{intl.formatMessage({ id: "global.vars.SPEI9"})}</Radio>
                        <InfoTooltip i18n_path="historic_compare.info.SPEI" />
                    </HStack>
                    <HStack>
                        <Radio value="spei12">{intl.formatMessage({ id: "global.vars.SPEI12" })}</Radio>
                        <InfoTooltip i18n_path="historic_compare.info.SPEI" />
                    </HStack>    
                    <HStack>
                        <Radio value="spei24">{intl.formatMessage({ id: "global.vars.SPEI24" })}</Radio>
                        <InfoTooltip i18n_path="historic_compare.info.SPEI" />
                    </HStack>
                </VStack>
            </RadioGroup>
        </div>
</Container>
);
}
