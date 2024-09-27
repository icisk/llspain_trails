// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { reactive, Reactive } from "@conterra/reactivity-core";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";

import { MAP_ID } from "./MapProvider";

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

export enum Variable {
    pc05 = "pc05",
    pc10 = "pc10",
    pc25 = "pc25",
    pc50 = "pc50",
    pc75 = "pc75",
    pc90 = "pc90",
    pc95 = "pc95"
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
                style: {
                    color: [
                        "case",
                        ["<=", ["band", 1], 0.0],
                        [0, 0, 0, 0],
                        ["<=", ["band", 1], 0.15],
                        "red",
                        ["<=", ["band", 1], 0.3],
                        "orange",
                        ["<=", ["band", 1], 0.45],
                        "yellow",
                        ["<=", ["band", 1], 0.6],
                        "green",
                        ["<=", ["band", 1], 0.75],
                        "blue",
                        ["<=", ["band", 1], 0.9],
                        "indigo",
                        "violet"
                    ]
                    // color: [
                    //     "interpolate",
                    //     ["linear"],
                    //     ["band", 1],
                    //     0, // ndvi values <= -0.2 will get the color below
                    //     [0, 0, 0, 0],
                    //     0.01, // ndvi values between -0.2 and 0 will get an interpolated color between the one above and the one below
                    //     "red",
                    //     0.15,
                    //     "orange",
                    //     0.3,
                    //     "yellow",
                    //     0.45,
                    //     "green",
                    //     0.6,
                    //     "blue",
                    //     0.75,
                    //     "indigo",
                    //     0.9,
                    //     "violet"
                    // ]
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
        const url = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/precip_forecats/cog_PLforecast_${this.currentMonth}_${year}_${this.currentVariable}_NoNDVI_RegMult_E3_MAP_Corrected.tif`;
        return new GeoTIFF({
            sources: [
                {
                    url,
                    max: 50,
                    min: 0
                }
            ]
        });
    }
}
