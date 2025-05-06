import {DeclaredService} from "@open-pioneer/runtime";
import {reactive, Reactive} from "@conterra/reactivity-core";


export interface StationDataHandler extends DeclaredService<"app.StationDataHandler">{
    setData(data: any): void;
    setStations(stations: string[]): void;
    setStationLeft(station: string): void;
    setStationId(id: string): void;
    setCompareOneYear(year: number): void;
    setCompareTwoYears1(year1: number): void;
    setCompareTwoYears2(year2: number): void;
    setFromTimeRange(from: number): void;
    setToTimeRange(to: number): void;
    setCompareOneMonth(month: number): void;
    setAvailableYears(years: number): void;
    setModus(modus: string): void;
    data: object;
    allStations: string[];
    selectedStationLeft: string;
    selectedStationId: string;
    selectedYear: number;
    availableYears: number[];
    selectedYear1: number;
    selectedYear2: number;
    selectedFromTimeRange: number;
    selectedToTimeRange: number;
    selectedMonth: number; 
    modus: string;
}
function getStationId(stationName, data) {
    const entry = data.find(item => item.NAME_STATION === stationName);
    return entry ? entry.CODE_INM : null;
}
export class StationDataHandlerImpl implements StationDataHandler {
    #data: object;
    #allStations: string[] = null;
    #selectedStationLeft: Reactive<string> = reactive('')
    #selectedStationId: Reactive<string> = reactive('')
    #selectedYear: Reactive<number> = reactive(null);
    #availableYears: Reactive<number> = reactive(null);
    #selectedYear1: Reactive<number> = reactive(null);
    #selectedYear2: Reactive<number> = reactive(null);
    #selectedFromTimeRange: Reactive<number> = reactive(null);
    #selectedToTimeRange: Reactive<number> = reactive(null);
    #selectedMonth: Reactive<number> = reactive(null);
    #modus: Reactive<string> = reactive('')
    
    async fetchStationsData(): Promise<any> {
        try {
            const response = await fetch("https://i-cisk.dev.52north.org/data/collections/ll_spain_aemet_stations/items?f=json&limit=1000");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            this.setData(data);
            this.setStations();
            
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    setData(data: object) {
        this.#data = data
    }
    get data(): object {
        return this.#data;
    }
    setStations() {
        this.#allStations = this.#data.features
            .map(e => ({ NAME_STATION: e.properties.NAME_STATION, ID: e.properties.CODE_INM }))
            .sort((a, b) => {
                const nameA = a.NAME_STATION || ''; 
                const nameB = b.NAME_STATION || ''; 
                return nameA.localeCompare(nameB);
            })
    } 
    get allStations(){
        return this.#allStations;
    }
    setStationLeft(station: string) {
        this.#selectedStationLeft.value = station;
        this.setStationId(getStationId(station, this.#allStations));
    }  
    get selectedStationLeft(){
        return this.#selectedStationLeft.value;
    }
    setStationId(id: string): void{
        this.#selectedStationId.value = id;
    }
    get selectedStationId(){
        return this.#selectedStationId.value;
    }
    
    setCompareOneYear(year: number) {
        this.#selectedYear.value = year
    }
    get selectedYear(){
        return this.#selectedYear.value
    }
    
    setAvailableYears(years: number[]): void {
        this.#availableYears.value = years
    }    
    get availableYears(){
        return this.#availableYears.value
    }
    
    setCompareTwoYears1(year1: number) {
        this.#selectedYear1.value = year1
    }
    get selectedYear1(){
        return this.#selectedYear1.value
    }

    setCompareTwoYears2(year2: number) {
        this.#selectedYear2.value = year2
    }
    get selectedYear2(){
        return this.#selectedYear2.value
    }
    
    setFromTimeRange(from: number) {
        this.#selectedFromTimeRange.value = from
    }
    get selectedFromTimeRange(){
        return this.#selectedFromTimeRange.value    
    }

    setToTimeRange(to: number) {
        this.#selectedToTimeRange.value = to
    }
    get selectedToTimeRange(){
        return this.#selectedToTimeRange.value
    }
    
    setCompareOneMonth(month: number) {
        this.#selectedMonth.value = month
    }
    get selectedMonth(){
        return this.#selectedMonth.value
    }
    
    setModus(modus: string) {
        this.#modus.value = modus
    }
    get modus(){
        return this.#modus.value
    }
    

}
