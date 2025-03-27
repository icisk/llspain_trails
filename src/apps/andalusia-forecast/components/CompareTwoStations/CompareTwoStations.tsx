import React, {useEffect, useState} from 'react';
import {Box, Radio, RadioGroup} from "@open-pioneer/chakra-integration";
import {HStack, Select} from "@chakra-ui/react";
import {useIntl, useService} from "open-pioneer:react-hooks";
import {useReactiveSnapshot} from "@open-pioneer/reactivity";
import {StationDataHandler} from "../../services/StationDataHandler";
import {mesesEnEspanol} from "../utils/globals";

export function CompareTwoStations() {
    const intl = useIntl();
    const stationDataService = useService<StationDataHandler>("app.StationDataHandler");
    const [loading, setLoading] = useState(true);
    const [selectedStationLeft, setSelectedStationLeft] = useState(stationDataService.selectedStationLeft);
    const [selectedStationId, setSelectedStationId] = useState(stationDataService.selectedStationId);

    
    const [selectedModus, setSelectedModus] = useState<string>("");
    
    const [year1, setYear1] = useState<number | null>(null);
    const [year2, setYear2] = useState<number | null>(null);

    const [fromYear, setFromYear] = useState<number | null>(null);
    
    const [toYear, setToYear] = useState<number | null>(null);

    useEffect(() => {
        async function loadData() {
            await stationDataService.fetchStationsData();
            setLoading(false);
        }
        loadData();
    }, []);
    
    const [selectedFromTimeRange, selectedToTimeRange, selectedStation, availableYears] = useReactiveSnapshot(()=> [
        stationDataService.selectedFromTimeRange,
        stationDataService.selectedToTimeRange,
        stationDataService.selectedStationLeft,
        stationDataService.availableYears
    ], [stationDataService])
    
    
    useEffect(() => {
        setFromYear(selectedFromTimeRange)
        setToYear(selectedToTimeRange)
        // console.log(toYear)
    }, [selectedFromTimeRange, selectedToTimeRange]);
    
    
    const handleFromYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFromYear = Number(e.target.value);
        stationDataService.setFromTimeRange(selectedFromYear)
        setFromYear(selectedFromYear);
    };
    
    const handleToYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedToYear = Number(e.target.value);
        stationDataService.setToTimeRange(selectedToYear)
        setToYear(selectedToYear);
    };
    
    const handleStationLeftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStation = e.target.value;
        stationDataService.setStationLeft(newStation);
        setSelectedStationLeft(newStation);
    };
    
    const handleOneYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = e.target.value
        stationDataService.setCompareOneYear(newYear);        
    }    

    const handleModusChange = (value: string) => {
        setSelectedModus(value)
        stationDataService.setModus(value);
    };

    const handleYear1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear1 = Number(e.target.value);
        setYear1(selectedYear1);
        stationDataService.setCompareTwoYears1(selectedYear1)
    };

    const handleYear2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear2 = Number(e.target.value);
        setYear2(selectedYear2);
        stationDataService.setCompareTwoYears2(selectedYear2)
    };
    
    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMonth = Number(e.target.value);
        // console.log(selectedMonth)
        stationDataService.setCompareOneMonth(selectedMonth)
    }
    
    if (loading) {
        return <div>Loading...</div>; 
    }

    const squareStyle1 = {
        display: 'inline-block',
        width: '100px',
        height: '10px',
        backgroundColor: "rgb(14,36,78)",
        marginRight: '5px',
    };

    const squareStyle2 = {
        display: 'inline-block',
        width: '100px',
        height: '10px',
        backgroundColor: "rgb(75,159,241)",
        marginRight: '5px',
    };
    // console.log(selectedStation, stationDataService.availableYears)
    return (
        <Box padding={50}>
            <p>{intl.formatMessage({ id: "historic_climate_stations.select_stations" })}</p>
            <HStack>
                <Select
                    value={selectedStationLeft}
                    onChange={handleStationLeftChange}
                >
                    {stationDataService.allStations.map((e: any) => (
                        <option key={e.ID} value={e.NAME_STATION}>
                            {` ${e.NAME_STATION ?? "no station name"} | ID:  ${e.ID}`}
                        </option>
                    ))}
                </Select>
                {/*<Select*/}
                {/*    value={selectedStationRight}*/}
                {/*    onChange={handleStationRightChange}*/}
                {/*>*/}
                {/*    {stationDataService.allStations.map((e: any) => (*/}
                {/*        <option key={e.ID} value={e.NAME_EST}>*/}
                {/*            {e.NAME_EST}*/}
                {/*        </option>*/}
                {/*    ))}*/}
                {/*</Select>*/}
            </HStack>
            <RadioGroup onChange={handleModusChange}>
                <HStack>
                    <Radio value={'no_filter'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.no_filter" })}</Radio>
                    <Radio value={'one_year'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.one_year" })}</Radio>
                    <Radio value={'two_years'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.two_years" })}</Radio>
                    <Radio value={'time_range'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.time_range" })}</Radio>
                    <Radio value={'month'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.month" })}</Radio>
                </HStack>
            </RadioGroup>

            {selectedModus === "one_year" && selectedStation !== '' && availableYears !== null && (
                <Select
                    onChange={handleOneYearChange}
                    placeholder={intl.formatMessage({id: "global.controls.sel_year"})}
                >
                    {stationDataService.availableYears.map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </Select>
            )}

            {selectedModus === "two_years" && selectedStation !== '' && availableYears !== null && (
                <HStack>
                    <div style={squareStyle1}></div>
                    <Select
                        onChange={handleYear1Change}
                        placeholder={intl.formatMessage({id: "global.controls.sel_year"})}
                    >
                        {stationDataService.availableYears.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </Select>
                    <div style={squareStyle2}></div>
                    <Select
                        onChange={handleYear2Change}
                        placeholder={intl.formatMessage({id: "global.controls.sel_year"})}
                    >
                        {stationDataService.availableYears.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </Select>
                </HStack>
            )}

            {selectedModus === "time_range" && selectedStation !== '' && availableYears !== null && (
                <HStack >
                    
                        <Select
                            onChange={handleFromYearChange}
                            value={fromYear || ""}
                            placeholder={intl.formatMessage({id: "global.controls.sel_year"})}
                        >
                            {stationDataService.availableYears.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>

                    
                        <Select
                            onChange={handleToYearChange}
                            value={toYear || ""}
                            placeholder={intl.formatMessage({id: "global.controls.sel_year"})}
                        >
                            {stationDataService.availableYears.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>

                </HStack>

            )}

            {selectedModus === "month" && selectedStation !== '' && availableYears !== null && (
                <Select
                    onChange={handleMonthChange}
                    placeholder={intl.formatMessage({id: "global.controls.sel_month"})}
                >
                    {mesesEnEspanol.map((month, index) => (
                        <option key={index} value={index}>
                            {month}
                        </option>
                    ))}
                </Select>

            )}
            
            
        </Box>
    )
}

