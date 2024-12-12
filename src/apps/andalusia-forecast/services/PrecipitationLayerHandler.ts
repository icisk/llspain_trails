import { reactive, Reactive } from "@conterra/reactivity-core";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import {useService} from "open-pioneer:react-hooks";

import { MAP_ID } from "./MidtermForecastMapProvider";
import {types} from "sass";
import List = types.List;

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
const p_02 = '#588fe1BC'//'rgba(216,88,225,0.74)' //'#588fe1BC'
const p_03 = '#1f569eBC'//'rgba(67,158,31,0.74)' //'#1f569eBC'
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
    #currentVariable: Reactive<Variable> = reactive(Variable.pc50);

    
    

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.createSource(),
                zIndex: 0, // Order of the Layers
                style: {
                        color: this.getColorStyle()       
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
        const newSource = this.createSource();
        this.layer?.setSource(newSource);
        this.layer?.setStyle({ color: this.getColorStyle() }); // Ensure style is updated
    }
    
    getColorStyle(): any {
        if (this.#currentVariable.value === Variable.pc50) {
            return [
                "case",
                ["all", ["==", ["*", ["band", 1], 150], 0], ["==", ["*", ["band", 2], 150], 0]],
                [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
                ["<=", ["band", 1], 5],
                p_01, // Red for actual 0 values within the area of interest
                ["<=", ["band", 1], 15],
                p_02,
                ["<=", ["band", 1], 30],
                p_03,
                ["<=", ["band", 1], 50],
                p_04,
                ["<=", ["band", 1], 75],
                p_05,
                ["<=", ["band", 1], 100],
                p_06,
                ["<=", ["band", 1], 150],
                p_07,
                ["<=", ["band", 1], 200],
                p_08,
                p_09
            ];
        } if (this.#currentVariable.value === Variable.uncertainty){
            return[
                "case",
                ["all", ["==", ["*", ["band", 1], 150], 0], ["==", ["*", ["band", 2], 150], 0]],
                [0, 0, 0, 0], // Transparent for 0 values outside the area of interest
                ["==", ["band", 1], 1],
                'red', // Red for actual 0 values within the area of interest
                ["==", ["band", 1], 2],
                'yellow',
                ["<=", ["band", 1], 3],
                'green',
                'blue'
            ];
        }
    }
    
    private createSource() {
        const year = 2024;
        const precipitationUrl = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip_forecats/cog_PLforecast_${this.currentMonth}_${year}_${this.currentVariable}_NoNDVI_RegMult_E3_MAP_Corrected.tif`;
        const maskUrl = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip_forecats/cog_PLforecast_${Month.february}_${year}_${Variable.pc50}_NoNDVI_RegMult_E3_MAP_Corrected.tif`;

        return new GeoTIFF({            
            normalize: false,
            sources: [
                {
                    url: precipitationUrl,
                    max: 200,
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
