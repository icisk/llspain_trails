import React, {useEffect, useState} from 'react';
import {Box, Radio, RadioGroup} from "@open-pioneer/chakra-integration";
import {HStack, Select, VStack} from "@chakra-ui/react";
import {useIntl, useService} from "open-pioneer:react-hooks";
// import {useReactiveSnapshot} from "@open-pioneer/reactivity";
import {StationDataHandler} from "../../services/StationDataHandler";

export function CompareTwoStations() {
    const intl = useIntl();
    const stationDataService = useService<StationDataHandler>("app.StationDataHandler");
    const [loading, setLoading] = useState(true);
    const [selectedStationLeft, setSelectedStationLeft] = useState(stationDataService.selectedStationLeft);
    const [selectedStationRight, setSelectedStationRight] = useState(stationDataService.selectedStationRight);
    
    const [selectedModus, setSelectedModus] = useState<string>("");
    
    const [year1, setYear1] = useState<number | null>(null);
    const [year2, setYear2] = useState<number | null>(null);

    const [fromYear, setFromYear] = useState<number | null>(null);
    const [fromMonth, setFromMonth] = useState<number | null>(null);
    const [toYear, setToYear] = useState<number | null>(null);
    const [toMonth, setToMonth] = useState<number | null>(null);

    const handleFromYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear = Number(e.target.value);
        setFromYear(selectedYear);
        if (fromMonth) {
            updateTimeRange(selectedYear, fromMonth, toYear, toMonth);
        }
    };

    const handleFromMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMonth = Number(e.target.value);
        setFromMonth(selectedMonth);
        if (fromYear) {
            updateTimeRange(fromYear, selectedMonth, toYear, toMonth);
        }
    };

    const handleToYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear = Number(e.target.value);
        setToYear(selectedYear);
        if (toMonth) {
            updateTimeRange(fromYear, fromMonth, selectedYear, toMonth);
        }
    };

    const handleToMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMonth = Number(e.target.value);
        setToMonth(selectedMonth);
        if (toYear) {
            updateTimeRange(fromYear, fromMonth, toYear, selectedMonth);
        }
    };

    const updateTimeRange = (fromYear: number | null, fromMonth: number | null, toYear: number | null, toMonth: number | null) => {
        if (fromYear && fromMonth && toYear && toMonth) {
            const fromDate = new Date(fromYear, fromMonth - 1, 1); // Month is zero-based
            const toDate = new Date(toYear, toMonth, 0); // Last day of the month
            stationDataService.setCompareTimeRange(fromDate, toDate);
        }
    };



    useEffect(() => {
        async function loadData() {
            await stationDataService.fetchStationsData();
            console.log(stationDataService.allStations);
            setLoading(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        setSelectedStationLeft(stationDataService.selectedStationLeft);
        setSelectedStationRight(stationDataService.selectedStationRight);
    }, [stationDataService.selectedStationLeft, stationDataService.selectedStationRight]);

    // const [selectedStationLeft, selectedStationRight] = useReactiveSnapshot(()=> [
    //     stationDataService.selectedStationLeft,
    //     stationDataService.selectedStationRight,
    // ], [stationDataService])

    const handleStationLeftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStation = e.target.value;
        stationDataService.setStationLeft(newStation);
        setSelectedStationLeft(newStation);
    };

    const handleStationRightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStation = e.target.value;
        stationDataService.setStationRight(newStation);
        setSelectedStationRight(newStation);
    };

    const handleModusChange = (value: string) => {
        setSelectedModus(value);
    };

    const handleYear1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear1 = Number(e.target.value);
        setYear1(selectedYear1);
        if (selectedYear1 && year2) {
            stationDataService.setCompareTwoYear(selectedYear1, year2);
        }
    };

    const handleYear2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear2 = Number(e.target.value);
        setYear2(selectedYear2);
        if (year1 && selectedYear2) {
            stationDataService.setCompareTwoYear(year1, selectedYear2);
        }
    };

    if (loading) {
        return <div>Loading...</div>; 
    }
    console.log("selectedStationLeft", selectedStationLeft);
    return (
        <Box padding={50}>
            <p>{intl.formatMessage({ id: "historic_climate_stations.select_stations" })}</p>
            <HStack>
                <Select
                    value={selectedStationLeft}
                    // onChange={e => stationDataService.setStationLeft(e.target.value)}
                    onChange={handleStationLeftChange}
                >
                    {stationDataService.allStations.map((e: any) => (
                        <option key={e.ID} value={e.NAME_EST}>
                            {e.NAME_EST}
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
                    <Radio value={'one_year'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.one_year" })}</Radio>
                    <Radio value={'two_years'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.two_years" })}</Radio>
                    <Radio value={'time_range'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.time_range" })}</Radio>
                    <Radio value={'month'}>{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.month" })}</Radio>
                </HStack>
            </RadioGroup>

            {selectedModus === "one_year" && (
                <Select
                    onChange={e => stationDataService.setCompareOneYear(Number(e.target.value))}
                    placeholder="Select Year"
                >
                    {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </Select>
            )}

            {selectedModus === "two_years" && (
                <HStack>
                    <Select
                        onChange={handleYear1Change}
                        placeholder="Select Year"
                    >
                        {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </Select>
                    <Select
                        onChange={handleYear2Change}
                        placeholder="Select Year"
                    >
                        {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </Select>
                </HStack>
            )}

            {selectedModus === "time_range" && (
                <HStack spacing={400}>
                    <VStack>
                        <Select
                            onChange={handleFromYearChange}
                            value={fromYear || ""}
                            placeholder="Select From Year"
                        >
                            {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>
                        <Select
                            onChange={handleFromMonthChange}
                            value={fromMonth || ""}
                            placeholder="Select From Month"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={month}>
                                    {month < 10 ? `0${month}` : month}
                                </option>
                            ))}
                        </Select>
                    </VStack>
                    <VStack>
                        <Select
                            onChange={handleToYearChange}
                            value={toYear || ""}
                            placeholder="Select To Year"
                        >
                            {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>
                        <Select
                            onChange={handleToMonthChange}
                            value={toMonth || ""}
                            placeholder="Select To Month"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={month}>
                                    {month < 10 ? `0${month}` : month}
                                </option>
                            ))}
                        </Select>
                    </VStack>
                </HStack>
                
            )}

            {selectedModus === "month" && (
                <Select
                    onChange={e => stationDataService.setCompareOneMonth(Number(e.target.value))}
                    placeholder="Select Month"
                >
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map(month => (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    ))}
                </Select>
            )}
            
            
        </Box>
    )
}

