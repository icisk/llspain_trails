import { reactive, Reactive } from "@conterra/reactivity-core";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import { useIntl, useService } from "open-pioneer:react-hooks";

import { MAP_ID } from "./MidtermForecastMapProvider";
import { precipColorGradient, tempColorGradient } from "../components/utils/globals";
import { Variable } from "./HistoricLayerHandler";

interface References {
    mapRegistry: MapRegistry;
}

export enum Month {
    Febrero = "2",
    Marzo = "3",
    Abril = "4",
    Mayo = "5",
    Junio = "6",
    Julio = "7",
    Agosto = "8"
}

const p_01 = "#C4DAF6BC";
const p_02 = "#588fe1BC"; //'rgba(216,88,225,0.74)' //'#588fe1BC'
const p_03 = "#1f569eBC"; //'rgba(67,158,31,0.74)' //'#1f569eBC'
const p_04 = "#103278BC";
const p_05 = "#AA4DD8BC";
const p_06 = "#912198BC";
const p_07 = "#591061BC";
const p_08 = "#290A47BC";
const p_09 = "#11011eBC";

const ex = [-752185.7477688787, 4412572.1318028895, -244344.30302071414, 4679055.100963466];

export interface PrecipitationLayerHandler
    extends DeclaredService<"app.PrecipitationLayerHandler"> {
    currentMonth: Date;
    currentVariable: Variable;
    currentForecast: string;
    currentForecastMonths: Date[];
    showUncert: Boolean;
    setMonth(month: Month): void;
    setVariable(variable: Variable): void;
    setForecast(forecast: string): void;
    setShowUncert(showUncer: boolean): void;
}

export class PrecipitationLayerHandlerImpl implements PrecipitationLayerHandler {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    #currentMonth: Reactive<Month> = reactive("2025-01");
    #currentVariable: Reactive<string> = reactive("temp");
    #currentForecast: Reactive<string> = reactive("2025-01");
    #currentForecastMonths: Reactive<Date> = reactive([new Date("2025-01")]);
    #showUncert: Reactive<Boolean> = reactive(false);

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.createSource(),
                zIndex: 5, // Order of the Layers
                style: {
                    color: this.getColorStyle()
                },
                extent: ex
            });

            model?.layers.addLayer(
                new SimpleLayer({
                    title: "Precipitation Forecast",
                    olLayer: this.layer,
                    isBaseLayer: false
                })
            );
        });
    }

    get currentMonth(): Date {
        return new Date(this.#currentMonth.value); // Ensure it's a Date object
    }

    setMonth(date: string): void {
        this.#currentMonth.value = date;
        this.layer?.setSource(this.createSource());
    }

    get currentVariable(): string {
        return this.#currentVariable.value;
    }

    setVariable(variable: string): void {
        this.#currentVariable.value = variable;
        const newSource = this.createSource();
        this.layer?.setSource(newSource);
        this.layer?.setStyle({ color: this.getColorStyle() });
    }

    get currentForecast(): string {
        return this.#currentForecast.value;
    }

    setForecast(date: string): void {
        this.#currentForecast.value = date;
        this.setCurrentForecastMonths();
    }

    get currentForecastMonths(): Date[] {
        return this.#currentForecastMonths.value;
    }

    setCurrentForecastMonths(): void {
        const initDate = new Date(this.#currentForecast.value);
        const dates = [];

        for (let i = 0; i < 6; i++) {
            const newDate = new Date(initDate.getFullYear(), initDate.getMonth() + i, 1);
            dates.push(newDate);
        }
        this.#currentForecastMonths.value = dates;
    }

    get showUncert(): Boolean {
        return this.#showUncert.value;
    }

    setShowUncert(showUncer: Boolean): void {
        this.#showUncert.value = showUncer;
        const newSource = this.createSource();
        this.layer?.setSource(newSource);
        this.layer?.setStyle({ color: this.getColorStyle() });
    }

    getColorStyle(): any {
        if (this.#showUncert.value) {
            return [
                "case",
                ["all", ["==", ["*", ["band", 1], 150], 0], ["==", ["*", ["band", 2], 150], 0]],
                [0, 0, 0, 0], // Fully transparent for 0 values outside the area of interest
                ["<", ["band", 1], 1.5],
                "#FF0000BF", // Red (75% opacity) for values close to 1
                ["<", ["band", 1], 2.5],
                "#FFFF00BF", // Yellow (75% opacity) for values close to 2
                ["<", ["band", 1], 3.5],
                "#00FF00BF", // Green (75% opacity) for values close to 3
                "#00000000" // Default Blue (75% opacity) for unclassified pixels
            ];
        } else {
            if (this.#currentVariable.value === "precip") {
                return precipColorGradient;
            } else if (this.#currentVariable.value === "temp") {
                return tempColorGradient;
            }
        }
    }

    private createSource() {
        const formattedDate = `${String(new Date(this.#currentMonth.value).getMonth() + 1).padStart(2, "0")}_${new Date(this.#currentMonth.value).getFullYear()}`;
        let layerURL: string;
        if (this.#currentVariable.value === "temp") {
            if (!this.#showUncert.value) {
                layerURL = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/2025_01_seasonal_forecast_temp_COG/COG_TEMPforecast_202501_202506_${formattedDate}_pc50_NoRS_RegMult_E175_MAP.tif`;
            } else {
                layerURL = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/2025_01_seasonal_forecast_temp_COG/COG_TEMPforecast_202501_202506_${formattedDate}_memberUNCERTAINTY.tif`;
            }
        } else if (this.#currentVariable.value === "precip") {
            if (!this.#showUncert.value) {
                layerURL = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/2025_01_seasonal_forecast_precip_COG/COG_PLforecast_202501_202506_${formattedDate}_pc50_NoRS_RegMult_E3_MAP.tif`;
            } else {
                layerURL = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/2025_01_seasonal_forecast_precip_COG/COG_PLforecast_202501_202506_${formattedDate}_memberUNCERTAINTY.tif`;
            }
        }
        return new GeoTIFF({
            normalize: false,
            sources: [
                {
                    url: layerURL,
                    max: 200,
                    min: 0,
                    nodata: -5.3e37
                }
            ]
        });
    }
}
