import { reactive, Reactive } from "@conterra/reactivity-core";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";

import { MAP_ID } from "./MidtermForecastMapProvider";

interface References {
    mapRegistry: MapRegistry;
}

export enum Month {
    february = "2",
    march = "3",
    april = "4",
    may = "5",
    june = "6",
    july = "7",
    august = "8"
}

const p_01 = '#C4DAF6BC'
const p_02 = '#588fe1BC'
const p_03 = '#1f569eBC'
const p_04 = '#103278BC'
const p_05 = '#AA4DD8BC'
const p_06 = '#912198BC'
const p_07 = '#591061BC'
const p_08 = '#290A47BC'
const p_09 = '#11011eBC'

export enum Variable {
    // pc05 = "pc05",
    // pc10 = "pc10",
    // pc25 = "pc25",
    pc50 = "pc50",
    // pc75 = "pc75",
    // pc90 = "pc90",
    // pc95 = "pc95",
    uncertainty = "UNCERTAINTY"
}

export interface PrecipitationLayerHandler
    extends DeclaredService<"app.PrecipitationLayerHandler"> {
    currentMonth: Month;
    currentVariable: Variable;
    setMonth(month: Month): void;
    setVariable(variable: Variable): void;
}

export class PrecipitationLayerHandlerImpl implements PrecipitationLayerHandler {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    #currentMonth: Reactive<Month> = reactive(Month.february);
    #currentVariable: Reactive<Variable> = reactive(Variable.pc05);

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.createSource(),
                zIndex: 0, // Order of the Layers
                style: {
                    // color: [
                    //     "case",
                    //     ["all", ["==", ["band", 1], 0], ["==", ["band", 2], 0]],
                    //     [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
                    //     ["==", ["band", 1], 0],
                    //     "red", // Red for actual 0 values within the area of interest
                    //     ["<=", ["band", 1], 0.15],
                    //     "red",
                    //     ["<=", ["band", 1], 0.3],
                    //     "orange",
                    //     ["<=", ["band", 1], 0.45],
                    //     "yellow",
                    //     ["<=", ["band", 1], 0.6],
                    //     "green",
                    //     ["<=", ["band", 1], 0.75],
                    //     "blue",
                    //     ["<=", ["band", 1], 0.9],
                    //     "indigo",
                    //     "violet"
                    // ]
                    // color: [
                    //     "case",
                    //     ["all", ["==", ["band", 1], 0], ["==", ["band", 2], 0]],
                    //     [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
                    //     ["==", ["band", 1], 0],
                    //     "red", // Red for actual 0 values within the area of interest
                    //     ["<=", ["band", 1], 0.33],
                    //     "orange",
                    //     ["<=", ["band", 1], 0.66],
                    //     "green",
                    //     ["<=", ["band", 1], 1],
                    // ]
                    // color: [
                    //     "case",
                    //     ["all", ["==", ["*", ["band", 1], 3], 0], ["==", ["*", ["band", 2], 3], 0]],
                    //     [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
                    //     ["==", ["*", ["band", 1], 3], 1],
                    //     "red", // Red for actual 0 values within the area of interest
                    //     ["<=", ["*", ["band", 1], 3], 2],
                    //     "orange",
                    //     ["<=", ["*", ["band", 1], 3], 3],
                    //     "green",
                    //
                    // ]
                    color: [
                        "case",
                        ["all", ["==", ["*", ["band", 1], 150], 0], ["==", ["*", ["band", 2], 150], 0]],
                        [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
                        ["==", ["*", ["band", 1], 150], 0],
                        p_01, // Red for actual 0 values within the area of interest
                        ["<=", ["*", ["band", 1], 150], 5],
                        p_02,
                        ["<=", ["*", ["band", 1], 150], 15],
                        p_03,
                        ["<=", ["*", ["band", 1], 150], 30],
                        p_04,
                        ["<=", ["*", ["band", 1], 150], 50],
                        p_05,
                        ["<=", ["*", ["band", 1], 150], 75],
                        p_06,
                        ["<=", ["*", ["band", 1], 150], 100],
                        p_07,
                        ["<=", ["*", ["band", 1], 150], 150],
                        p_08,
                        p_09
                    ]
                }
            });

            model?.layers.addLayer(
                new SimpleLayer({
                    title: "Precipitation Forecast",
                    olLayer: this.layer
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

    setVariable(variable: Variable): void {
        this.#currentVariable.value = variable;
        this.layer?.setSource(this.createSource());
    }

    private createSource() {
        const year = 2024;
        const precipitationUrl = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip_forecats/cog_PLforecast_${this.currentMonth}_${year}_${this.currentVariable}_NoNDVI_RegMult_E3_MAP_Corrected.tif`;
        const maskUrl = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip_forecats/cog_PLforecast_${Month.february}_${year}_${Variable.pc50}_NoNDVI_RegMult_E3_MAP_Corrected.tif`;
        
        return new GeoTIFF({
            sources: [
                {
                    url: precipitationUrl,
                    max: 50,
                    min: 0
                },
                {
                    url: maskUrl,
                    max: 50,
                    min: 0
                }
            ]
        });
    }
}
