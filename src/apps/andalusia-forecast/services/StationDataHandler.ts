import {DeclaredService} from "@open-pioneer/runtime";
import {reactive, Reactive} from "@conterra/reactivity-core";


export interface StationDataHandler extends DeclaredService<"app.StationDataHandler">{
    setData(data: any): void;
    setStations(stations: string[]): void;
    setStationLeft(station: string): void;
    setStationRight(station: string): void;
    setCompareOneYear(year: number): void;
    setCompareTwoYear(year1: number, year2: number): void;
    setCompareTimeRange(from: Date, to: Date): void;
    setCompareOneMonth(month: number): void;
    data: object;
    allStations: string[];
    selectedStationLeft: string;
    selectedStationRight: string;
    selectedYear: number;
    selectedYears: number[];
    selectedTimeRange: Date[];
    selectedMonth: number;    
}

export class StationDataHandlerImpl implements StationDataHandler {
    #data: object;
    #allStations: string[] = null;
    #selectedStationLeft: Reactive<string> = reactive('')
    #selectedStationRight: Reactive<string> = reactive('')    
    #selectedYear: Reactive<number> = reactive(null);
    #selectedYears: Reactive<number[]> = reactive([null, null]);
    #selectedTimeRange: Reactive<Date[]> = reactive([null, null]);
    #selectedMonth: Reactive<number> = reactive(null);
    
    async fetchStationsData(): Promise<any> {
        try {
            const response = await fetch("https://i-cisk.dev.52north.org/data/collections/ll_spain_creaf_in_boundary/items?f=json&limit=1000");
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
            .map(e => ({ NAME_EST: e.properties.NAME_EST, ID: e.properties.ID }))
            .sort((a, b) => {
                const nameA = a.NAME_EST || ''; 
                const nameB = b.NAME_EST || ''; 
                return nameA.localeCompare(nameB);
            })
    } 
    get allStations(){
        return this.#allStations;
    }
    setStationLeft(station: string) {
        console.log('bumm')        
        this.#selectedStationLeft = station;
        console.log(this.#selectedStationLeft)
    }  
    get selectedStationLeft(){
        return this.#selectedStationLeft;
    }
    setStationRight(station: string) {
        this.#selectedStationRight = station;
    }
    get selectedStationRight(){
        return this.#selectedStationRight;
    }
    setCompareOneYear(year: number) {
        this.#selectedYear = year
    }
    setCompareTwoYear(year1: number, year2: number) {
        this.#selectedYears = [year1, year2]
    }
    setCompareTimeRange(from: Date, to: Date) {
        this.#selectedTimeRange = [from, to]
    }
    setCompareOneMonth(month: number) {
        this.#selectedMonth = month
    }
    

}
