import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import { useIntl } from "open-pioneer:react-hooks";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { reactive, Reactive } from "@conterra/reactivity-core";
import { MAP_ID } from "./HistoricClimateMapProvider";
import {
    precipColorGradient,
    tempColorGradient,
    speiColorGradient
} from "../components/utils/globals";
import { GeoTIFF } from "ol/source";

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
    December = "12"
}

export enum Year {
    "dummy" = 2000,
    "dummy2" = 2005
}

export enum Variable {
    Precipitation = "precip",
    Temperature = "temp",
    SPEI = "spei"
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
        [Month.December]: intl.formatMessage({ id: "global.months.dec" })
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
    setUrlLeft(url: string): void;
    setUrlRight(url: string): void;
    currentMonthLeft: Month;
    currentYearLeft: Year;
    currentVarLeft: Variable;
    currentMonthRight: Month;
    currentYearRight: Year;
    currentVarRight: Variable;
    currentUrlLeft: string;
    currentUrlRight: string;
}

interface References {
    mapRegistry: MapRegistry;
}

// Example handler class
export class HistoricLayerHandlerImpl implements HistoricLayerHandler {
    private mapRegistry: MapRegistry;
    private layerLeft: WebGLTileLayer | undefined;
    private layerRight: WebGLTileLayer | undefined;
    #currentMonthLeft: Reactive<Month> = reactive(8); //Month.March
    #currentYearLeft: Reactive<Year> = reactive(Year.dummy);
    #currentVarLeft: Reactive<Variable> = reactive("temp");
    #currentMonthRight: Reactive<Month> = reactive(1);
    #currentYearRight: Reactive<Year> = reactive(Year.dummy2);
    #currentVarRight: Reactive<Variable> = reactive("temp");
    #currentUrlLeft: Reactive<string> = reactive(
        "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/Historical_TEMPERATURE_models/COG_TEMP_2000_08.tif"
    );
    #currentUrlRight: Reactive<string> = reactive(
        "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/Historical_TEMPERATURE_models/COG_TEMP_2005_01.tif"
    );

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layerLeft = (model?.layers.getLayerById("left") as SimpleLayer)
                .olLayer as WebGLTileLayer;
            this.layerRight = (model?.layers.getLayerById("right") as SimpleLayer)
                .olLayer as WebGLTileLayer;
        });
    }

    get currentVarLeft(): Variable {
        return this.#currentVarLeft.value;
    }
    get currentVarRight(): Variable {
        return this.#currentVarRight.value;
    }
    async setVarLeft(variable: Variable): Promise<void> {
        this.#currentVarLeft.value = variable;
        const newSource = await this.createSourceLeft();
        if (newSource) {
            this.layerLeft?.setSource(newSource);
            this.layerLeft?.setStyle({ color: this.getColorStyleLeft() });
        }
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
    async setMonthLeft(month: Month): Promise<void> {
        this.#currentMonthLeft.value = month;
        const source = await this.createSourceLeft();
        if (source) {
            this.layerLeft?.setSource(source);
            this.layerLeft?.setStyle({ color: this.getColorStyleLeft() });
        }
    }
    async setMonthRight(month: Month): Promise<void> {
        this.#currentMonthRight.value = month;
        const source = await this.createSourceRight();
        if (source) {
            this.layerRight?.setSource(source);
            this.layerRight?.setStyle({ color: this.getColorStyleRight() });
        }
    }

    get currentYearLeft(): Year {
        return this.#currentYearLeft.value;
    }
    get currentYearRight(): Year {
        return this.#currentYearRight.value;
    }
    async setYearLeft(year: number): Promise<void> {
        this.#currentYearLeft.value = year;
        const source = await this.createSourceLeft();
        if (source) {
            this.layerLeft?.setSource(source);
            this.layerLeft?.setStyle({ color: this.getColorStyleLeft() });
        }
    }
    async setYearRight(year: number): Promise<void> {
        this.#currentYearRight.value = year;
        const source = await this.createSourceRight();
        if (source) {
            this.layerRight?.setSource(source);
            this.layerRight?.setStyle({ color: this.getColorStyleRight() });
        }
    }

    get currentUrlLeft(): string {
        return this.#currentUrlLeft.value;
    }
    get currentUrlRight(): string {
        return this.#currentUrlRight.value;
    }
    set currentUrlLeft(url: string) {
        this.#currentUrlLeft.value = url;
    }
    set currentUrlRight(url: string) {
        this.#currentUrlRight.value = url;
    }

    getColorStyleLeft() {
        return this.getColorStyle(this.#currentVarLeft.value);
    }
    getColorStyleRight() {
        return this.getColorStyle(this.#currentVarRight.value);
    }
    getColorStyle(value: string) {
        switch (value) {
            case "temp":
                return tempColorGradient;
            case "precip":
                return precipColorGradient;
            default:
                return speiColorGradient;
        }
    }

    private createSource(value: string, year: Year, month: Month) {
        let historicLayer: string = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/`;
        let year_month: string = `${year}_${month.toString().padStart(2, "0")}`;
        switch (value) {
            case "temp":
                //historicLayer += `temp/COG_${year_month}_MeanTemperature_v0.tif`;
                historicLayer += `data/Historical_TEMPERATURE_models/COG_TEMP_${year_month}.tif`;
                break;
            case "precip":
                //historicLayer += `precip/COG_${year_month}_precipitation_v1.tif`;
                historicLayer += `data/Historical_PRECIPITATION_models/COG_PL_${year_month}.tif`;
                break;
            //
            // SPEI
            //
            case "spei3":
                historicLayer += `data/SPEI/SPEI_3months/COG_SPEI3_${year_month}.tif`;
                break;
            case "spei6":
                historicLayer += `data/SPEI/SPEI_6months/COG_SPEI6_${year_month}.tif`;
                break;
            case "spei9":
                historicLayer += `data/SPEI/SPEI_9months/COG_SPEI9_${year_month}.tif`;
                break;
            case "spei12":
                historicLayer += `data/SPEI/SPEI_12months/COG_SPEI12_${year_month}.tif`;
                break;
            case "spei24":
                historicLayer += `data/SPEI/SPEI_24months/COG_SPEI24_${year_month}.tif`;
                break;
            //
            // SPI
            //
            case "spi3":
                historicLayer += `data/SPI/SPI_G_3months/COG_SPI_G3_${year_month}.tif`;
                break;
            case "spi6":
                historicLayer += `data/SPI/SPI_G_6months/COG_SPI_G6_${year_month}.tif`;
                break;
            case "spi9":
                historicLayer += `data/SPI/SPI_G_9months/COG_SPI_G9_${year_month}.tif`;
                break;
            case "spi12":
                historicLayer += `data/SPI/SPI_G_12months/COG_SPI_G12_${year_month}.tif`;
                break;
            case "spi24":
                historicLayer += `data/SPI/SPI_G_24months/COG_SPI_G24_${year_month}.tif`;
                break;
            default:
                break;
        }
        return historicLayer;
    }

    private async createSourceLeft() {
        let historicLayer: string = this.createSource(
            this.#currentVarLeft.value,
            this.currentYearLeft,
            this.currentMonthLeft
        );
        try {
            this.#currentUrlLeft.value = historicLayer;
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
            sources: [{ url: historicLayer, nodata: -5.3e37 }]
        });
    }

    private async createSourceRight() {
        let historicLayer: string = this.createSource(
            this.#currentVarRight.value,
            this.currentYearRight,
            this.currentMonthRight
        );

        try {
            this.#currentUrlRight.value = historicLayer;
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
            sources: [{ url: historicLayer, nodata: -5.3e37 }]
        });
    }
}
