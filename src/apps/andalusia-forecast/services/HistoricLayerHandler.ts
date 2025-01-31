import {DeclaredService, ServiceOptions} from "@open-pioneer/runtime";
import {useIntl} from "open-pioneer:react-hooks";
import {MapRegistry, SimpleLayer} from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import {reactive, Reactive} from "@conterra/reactivity-core";
import {MAP_ID} from "./HistoricClimateMapProvider";
import {precipColorGradient, tempColorGradient} from "../components/utils/globals";
import {GeoTIFF} from "ol/source";


export enum Month {
    January = "01",
    February = "02",
    March = "03",
    April = "04",
    May = "05",
    June = "06",
    July = "07",
    August = "08",
    September = "09",
    October = "10",
    November = "11",
    December = "12",
}

export enum Year  { "dummy" = 2000, 
                    "dummy2" = 2005
};

export enum Variable {
    Precipitation = "precip",
    Temperature = "temp",
}
// console.log(tempColorGradient)
// console.log(precipColorGradient)
// Localized months mapping function
export const getLocalizedMonthName = (month: Month): string => {
    const intl = useIntl();
    const monthNames: Record<Month, string> = {
        [Month.January]: intl.formatMessage({ id: "global.months.jan" }),
        [Month.February]: intl.formatMessage({ id: "global.months.feb" }),
        [Month.March]: intl.formatMessage({ id: "global.months.mar" }),
        [Month.April]: intl.formatMessage({ id: "global.months.apr" }),
        [Month.May]: intl.formatMessage({ id: "global.months.may" }),
        [Month.June]: intl.formatMessage({ id: "global.months.jun" }),
        [Month.July]: intl.formatMessage({ id: "global.months.jul" }),
        [Month.August]: intl.formatMessage({ id: "global.months.aug" }),
        [Month.September]: intl.formatMessage({ id: "global.months.sep" }),
        [Month.October]: intl.formatMessage({ id: "global.months.oct" }),
        [Month.November]: intl.formatMessage({ id: "global.months.nov" }),
        [Month.December]: intl.formatMessage({ id: "global.months.dec" }),
    };
    return monthNames[month];
};

// PrecipitationLayerHandler interface
export interface HistoricLayerHandler extends DeclaredService<"app.HistoricLayerHandler"> {
    setMonthLeft(month: Month): void;
    setYearLeft(year: number): void;
    setVarLeft(variable: Variable): void;
    setMonthRight(month: Month): void;
    setYearRight(year: number): void;
    setVarRight(variable: Variable): void;
    currentMonthLeft: Month;
    currentYearLeft: Year;
    currentVarLeft: Variable;
    currentMonthRight: Month;
    currentYearRight: Year;
    currentVarRight: Variable;
    
}

interface References {
    mapRegistry: MapRegistry;
}

// Example handler class
export class HistoricLayerHandlerImpl implements HistoricLayerHandler {
    private mapRegistry: MapRegistry;
    private layerLeft: WebGLTileLayer | undefined;
    private layerRight: WebGLTileLayer | undefined;
    #currentMonthLeft: Reactive<Month> = reactive(Month.January);
    #currentYearLeft: Reactive<Year> = reactive(Year.dummy);
    #currentVarLeft: Reactive<Variable> = reactive("temp");
    #currentMonthRight: Reactive<Month> = reactive(Month.August);
    #currentYearRight: Reactive<Year> = reactive(Year.dummy2);
    #currentVarRight: Reactive<Variable> = reactive("temp");
   


    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layerLeft = (model?.layers.getLayerById('left') as SimpleLayer).olLayer as WebGLTileLayer
            this.layerRight = (model?.layers.getLayerById('right') as SimpleLayer).olLayer as WebGLTileLayer

        });
    }

    get currentVarLeft(): Variable {
        return this.#currentVarLeft.value;
    }
    get currentVarRight(): Variable {
        return this.#currentVarRight.value;
    }
    setVarLeft(variable: Variable): void {
        this.#currentVarLeft.value = variable;
        const newSource = this.createSourceLeft();
        this.layerLeft?.setSource(newSource);
        this.layerLeft?.setStyle({ color: this.getColorStyleLeft() }); // Ensure style is updated
    }
    async setVarRight(variable: Variable): Promise<void> {
        this.#currentVarRight.value = variable;
        const newSource = await this.createSourceRight();
        if (newSource) {
            this.layerRight?.setSource(newSource);
            this.layerRight?.setStyle({ color: this.getColorStyleRight() });
        }
    }
    
    get currentMonthLeft(): Month {
        return this.#currentMonthLeft.value;
    }
    get currentMonthRight(): Month {
        return this.#currentMonthRight.value;
    }
    setMonthLeft(month: Month): void {
        this.#currentMonthLeft.value = month;        
        this.layerLeft?.setSource(this.createSourceLeft());
        console.log(this.layerLeft);
    }
    async setMonthRight(month: Month): void {
        this.#currentMonthRight.value = month;
        const source = await this.createSourceRight()
        if (source) {
            this.layerRight?.setSource(source);
        }        
    }

    
    get currentYearLeft(): Year {
        return this.#currentYearLeft.value;
    }
    get currentYearRight(): Year {
        return this.#currentYearRight.value;
    }
    setYearLeft(year: number): void {
        this.#currentYearLeft.value = year;
        this.layerLeft?.setSource(this.createSourceLeft());
    }
    async setYearRight(year: number): void {
        this.#currentYearRight.value = year;
        const source = await this.createSourceRight();
        if (source) {
            this.layerRight?.setSource(source);
        }
        
    }


    getColorStyleLeft() {
        if (this.#currentVarLeft.value === "temp") {
            return tempColorGradient;
        }  if (this.#currentVarLeft.value === "precip") {
            return precipColorGradient;
        }        
    }
    getColorStyleRight() {
        if (this.#currentVarRight.value === "temp") {
            return tempColorGradient;
        }  if (this.#currentVarRight.value === "precip") {
            return precipColorGradient;
        }
    }


    private createSourceLeft() {
        let historicLayer: string;
        if (this.#currentVarLeft.value === "temp") {
             historicLayer = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_${this.currentYearLeft}_${this.currentMonthLeft.toString().padStart(2,'0')}_MeanTemperature_v0.tif`;
        }  if (this.#currentVarLeft.value === "precip") {
             historicLayer = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip/COG_${this.currentYearLeft}_${this.currentMonthLeft.toString().padStart(2,'0')}_precipitation_v1.tif`;
        }
        return new GeoTIFF({
            normalize: false,
            sources: [{url: historicLayer,
                nodata: -5.3e+37
            }]
        });
    }
    private async createSourceRight() {
        let historicLayer: string;
        if (this.#currentVarRight.value === "temp") {
            historicLayer = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_${this.currentYearRight}_${this.currentMonthRight.toString().padStart(2,'0')}_MeanTemperature_v0.tif`;
        }  if (this.#currentVarRight.value === "precip") {
            historicLayer = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip/COG_${this.currentYearRight}_${this.currentMonthRight.toString().padStart(2,'0')}_precipitation_v1.tif`;
        }

        try {
            const response = await fetch(historicLayer, {
                method: "HEAD",
                mode: "cors",
                headers: {
                    "Access-Control-Allow-Origin": "*"
                }
            });
            if (!response.ok) return undefined;
        } catch {
            return undefined;
        }
        
        return new GeoTIFF({
            normalize: false,
            sources: [{url: historicLayer,
                       nodata: -5.3e+37
            }]
        });
    }
    
}
