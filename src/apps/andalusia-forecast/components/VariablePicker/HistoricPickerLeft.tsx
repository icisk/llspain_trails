import {Container, Radio, RadioGroup} from "@open-pioneer/chakra-integration";
import {HStack, Select, VStack} from "@chakra-ui/react";
import {InfoTooltip} from "../InfoTooltip/InfoTooltip";
import React, {useState, useEffect} from "react";
import {useIntl, useService} from "open-pioneer:react-hooks";
import {HistoricClimateMapProvider} from "../../services/HistoricClimateMapProvider";
import {useReactiveSnapshot} from "@open-pioneer/reactivity";


interface HistoricPickerProps {
    onChange: (field: string, value: number|string) => void
}

export interface Selection{
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
    
    const [years, setYears] = useState<number[]>([]);
    const [months, setMonths] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [yearMonthMap, setYearMonthMap] = useState<Record<number, Set<number>>>({});
    const meta_precip: string = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_precip_metrics.zarr/.zmetadata'
    const meta_temp: string = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_temperature_metrics.zarr/.zmetadata'

    useEffect(() => {
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
                console.log(yearMonthMap)
                const availableYears = Object.keys(yearMonthMap).map(Number);
                setYears(availableYears);

                if (availableYears.length > 0) {
                    //setSelectedYear(availableYears[0]);  // Set default selected year
                    setMonths(Array.from(yearMonthMap[availableYears[0]]));  // Set months for the selected year
                }

                setYearMonthMap(yearMonthMap); // Store yearMonthMap in state
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);


    
    return (
        <Container flex={2} minWidth={"container.s"}>
            <div style={{ flex: 1 }}>
                <div style={{ margin: 20 }}>
                    <HStack>
                        <>
                            {intl.formatMessage({ id: "global.controls.sel_year" })}
                        </>                        
                        <Select
                            placeholder={intl.formatMessage({ id: "global.vars.year" })}
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
                        <Select placeholder={intl.formatMessage({ id: "global.vars.month" })}
                        value={currentMonth}
                        onChange={(e) => props.onChange('month', parseInt(e.target.value))}>
                            {months.map((month) => (
                                <option key={month} value={month}>
                                    {month}
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
                </VStack>
            </RadioGroup>
        </div>
</Container>
);
}
