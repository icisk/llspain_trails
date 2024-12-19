import {DeclaredService, ServiceOptions} from "@open-pioneer/runtime";
import { useIntl } from "open-pioneer:react-hooks";
import React from "react";
import {MapRegistry, SimpleLayer} from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import {reactive, Reactive} from "@conterra/reactivity-core";
import {MAP_ID} from "./HistoricClimateMapProvider";
import {precipColorCase, tempColorCase} from "../components/utils/globals";
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

export type Year = string;

export enum Variable {
    Precipitation = "precip",
    Temperature = "temp",
}

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
    setMonth(month: Month): void;
    setYear(year: number): void;
    setVariable(variable: Variable): void;
    currentMonth: Month;
    currentYear: Year;
    currentVariable: Variable;
    
}

interface References {
    mapRegistry: MapRegistry;
}

// Example handler class
export class HistoricLayerHandlerImpl implements HistoricLayerHandler {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    #currentMonth: Reactive<Month> = reactive(Month.January);
    #currentYear: Reactive<Year> = reactive('2015');
    #currentVariable: Reactive<Variable> = reactive("temp");


    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.createSource(),
                zIndex: 5, // Order of the Layers
                style: {
                    color: this.getColorStyle()
                }
            });

            model?.layers.addLayer(
                new SimpleLayer({
                    title: "Precipitation Forecast",
                    olLayer: this.layer,
                })
            );
        });
    }

    get currentMonth(): Month {
        return this.#currentMonth.value;
    }

    setMonth(month: Month): void {
        this.#currentMonth.value = month;
        this.layer?.setSource(this.createSource());
    }

    get currentVariable(): Variable {
        return this.#currentVariable.value;
    }

    get currentYear(): Month {
        return this.#currentYear.value;
    }

    setYear(month: Month): void {
        this.#currentYear.value = month;
        this.layer?.setSource(this.createSource());
    }

    setVariable(variable: Variable): void {
        this.#currentVariable.value = variable;
        const newSource = this.createSource();
        this.layer?.setSource(newSource);
        this.layer?.setStyle({ color: this.getColorStyle() }); // Ensure style is updated
    }

    getColorStyle() {
        if (this.#currentVariable.value === "temp") {
            return tempColorCase;
        }  if (this.#currentVariable.value === "precip") {
            return precipColorCase;
        }
        
    }


    private createSource() {
        let historicLayer: string;
        if (this.#currentVariable.value === "temp") {
             historicLayer = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_${this.currentYear}_${this.currentMonth}_MeanTemperature_v0.tif`;
        }  if (this.#currentVariable.value === "precip") {
             historicLayer = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip/COG_${this.currentYear}_${this.currentMonth}_precipitation_v1.tif`;
        }


        return new GeoTIFF({
            normalize: false,
            sources: [
                {
                    url: historicLayer,
                },
            ],
        });
    }
    
}
