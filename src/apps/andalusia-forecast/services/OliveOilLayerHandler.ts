import { reactive, Reactive } from "@conterra/reactivity-core";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import WebGLTileLayer from "ol/layer/WebGLTile.js";
import GeoTIFF from "ol/source/GeoTIFF.js";
import { oliveOilColorGradient } from "../components/utils/globals";
import { MAP_ID } from "./OliveOilMapProvider";

interface References {
    mapRegistry: MapRegistry;
}

export interface OliveOilLayerHandler extends DeclaredService<"app.OliveOilLayerHandler"> {
    currentDate: Date;
    setcurrentDate(date: Date): void;
}


export class OliveOilLayerHandlerImpl implements OliveOilLayerHandler {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    #currentVariable: Reactive<string> = reactive("temp");
    #currentDate: Reactive<Date> = reactive(new Date("2002-01-01T00:00:00Z"));

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.layer = new WebGLTileLayer({
                source: this.createSource(),
                zIndex: 5,
                style: { color: this.getColorStyle() }
            });

            model?.layers.addLayer(
                new SimpleLayer({
                    title: "Olive Oil Layer",
                    olLayer: this.layer,
                    isBaseLayer: false
                })
            );
        });
    }

    get currentDate() {
        return this.#currentDate.value;
    }

    setcurrentDate(date: Date) {
        this.#currentDate.value = date;
        this.layer?.setSource(this.createSource());
    }

    private getColorStyle() {
        return oliveOilColorGradient;
    }

    private createSource() {
        const year = this.#currentDate.value.getFullYear();

        const layerURL = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/OLIVEOIL/historical/COG_230m_Mediana_prediccion_produccion_aceitunas_${year}_def.tif`;
        //https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/OLIVEOIL/historical/COG_250m_Mediana_prediccion_produccion_aceitunas_2002_def.tif
        // console.log("🔗 Using layer URL:", layerURL);
        return new GeoTIFF({
            normalize: false,
            sources: [{ url: layerURL, nodata: -5.3e37 }]
        });
    }
}
