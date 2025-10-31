import { reactive, Reactive } from "@conterra/reactivity-core";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import WebGLTileLayer from "ol/layer/WebGLTile.js";
import GeoTIFF from "ol/source/GeoTIFF.js";
import { precipColorGradient, tempColorGradient } from "../components/utils/globals";
import { MAP_ID } from "./MidtermForecastMapProvider";
import { Variable } from "./HistoricLayerHandler";

interface References {
    mapRegistry: MapRegistry;
}

const ex = [-752185.7477688787, 4412572.1318028895, -244344.30302071414, 4679055.100963466];

export interface PrecipitationLayerHandler
    extends DeclaredService<"app.PrecipitationLayerHandler"> {
    currentMonth: string;  
    currentForecast: string;
    currentVariable: Variable;
    currentForecastMonths: string[];
    showUncert: boolean;
    setMonths(start: string, forecast: string): void;
    setVariable(variable: Variable): void;
    setShowUncert(showUncert: boolean): void;
}

export class PrecipitationLayerHandlerImpl implements PrecipitationLayerHandler {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    #currentMonth: Reactive<string> = reactive("2025-03");
    #currentForecast: Reactive<string> = reactive("2025-03");
    #currentVariable: Reactive<string> = reactive("temp");
    #currentForecastMonths: Reactive<string[]> = reactive(["2025-03"]);
    #showUncert: Reactive<boolean> = reactive(false);

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.createSource(),
                zIndex: 5,
                style: { color: this.getColorStyle() },
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

    get currentMonth() { return this.#currentMonth.value; }
    get currentForecast() { return this.#currentForecast.value; }
    get currentVariable() { return this.#currentVariable.value; }
    get currentForecastMonths() { return this.#currentForecastMonths.value; }
    get showUncert() { return this.#showUncert.value; }

    setMonths(start: string, forecast: string) {
        this.#currentMonth.value = start;
        this.#currentForecast.value = forecast;
        this.updateForecastMonths();
        this.layer?.setSource(this.createSource());
    }

    setVariable(variable: Variable) {
        this.#currentVariable.value = variable;
        this.layer?.setSource(this.createSource());
        this.layer?.setStyle({ color: this.getColorStyle() });
    }

    setShowUncert(show: boolean) {
        this.#showUncert.value = show;
        this.layer?.setSource(this.createSource());
        this.layer?.setStyle({ color: this.getColorStyle() });
    }

    private updateForecastMonths() {
        const startDate = new Date(this.#currentMonth.value);
        const months: string[] = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            months.push(m);
        }
        this.#currentForecastMonths.value = months;
    }

    private getColorStyle() {
        if (this.#showUncert.value) {
            return [
                "case",
                ["all", ["==", ["*", ["band", 1], 150], 0], ["==", ["*", ["band", 2], 150], 0]],
                [0, 0, 0, 0],
                ["<", ["band", 1], 1.5], "#FF0000BF",
                ["<", ["band", 1], 2.5], "#FFFF00BF",
                ["<", ["band", 1], 3.5], "#00FF00BF",
                "#00000000"
            ];
        } else {
            return this.#currentVariable.value === "precip" ? precipColorGradient : tempColorGradient;
        }
    }

    private createSource() {
        const startDate = new Date(this.#currentMonth.value);
        const forecastDate = new Date(this.#currentForecast.value);

        const startMonth = String(startDate.getMonth() + 1).padStart(2, "0");
        const start = `${startDate.getFullYear()}${startMonth}`;
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 5, 1);
        const end = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, "0")}`;

        const forecastMonth = String(forecastDate.getMonth() + 1).padStart(2, "0");
        const forecastYear = forecastDate.getFullYear();

        let layerURL: string;
        if (this.#currentVariable.value === "temp") {
            layerURL = this.#showUncert.value
                ? `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/FORECAST/temp/${startMonth}/COG_TEMPforecast_${start}_${end}_${forecastMonth}-${forecastYear}_memberUNCERTAINTY.tif`
                : `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/FORECAST/temp/${startMonth}/COG_TEMPforecast_${start}_${end}_${forecastMonth}-${forecastYear}_pc_50_corrected.tif`;
        } else {
            layerURL = this.#showUncert.value
                ? `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/FORECAST/precip/${startMonth}/COG_PLforecast_${start}_${end}_${forecastMonth}-${forecastYear}_memberUNCERTAINTY.tif`
                : `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/FORECAST/precip/${startMonth}/COG_PLforecast_${start}_${end}_${forecastMonth}-${forecastYear}_pc_50_corrected.tif`;
        }

        // console.log("🔗 Using layer URL:", layerURL);

        return new GeoTIFF({
            normalize: false,
            sources: [{ url: layerURL, nodata: -5.3e37 }]
        });
    }
}
