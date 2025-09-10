import { reactive, Reactive } from "@conterra/reactivity-core";
import { MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { DeclaredService, ServiceOptions } from "@open-pioneer/runtime";
import WebGLTileLayer from "ol/layer/WebGLTile.js";
import GeoTIFF from "ol/source/GeoTIFF.js";
import { precipColorGradient, tempColorGradient } from "../components/utils/globals";
import { MAP_ID } from "./ProjectionMapProvider";
import { Variable } from "./HistoricLayerHandler";

interface References {
    mapRegistry: MapRegistry;
}

export interface ProjectionLayerHandler extends DeclaredService<"app.ProjectionLayerHandler"> {
    currentVariable: string;
    currentDate: Date;
    setcurrentDate(date: Date): void;
    setcurrentVariable(variable: string): void;
}


export class ProjectionLayerHandlerImpl implements ProjectionLayerHandler {
    private mapRegistry: MapRegistry;
    private layer: WebGLTileLayer | undefined;

    #currentVariable: Reactive<string> = reactive("temp");
    #currentDate: Reactive<Date> = reactive(new Date("2026-01-01T00:00:00Z"));

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
                    title: "Projection Layer",
                    olLayer: this.layer,
                    isBaseLayer: false
                })
            );
        });
    }

    get currentVariable() {
        return this.#currentVariable.value;
    }

    get currentDate() {
        return this.#currentDate.value;
    }

    setcurrentVariable(variable: string) {
        this.#currentVariable.value = variable;
        this.layer?.setSource(this.createSource());
        this.layer?.setStyle({ color: this.getColorStyle() });
    }

    setcurrentDate(date: Date) {
        this.#currentDate.value = date;
        this.layer?.setSource(this.createSource());
    }

    private getColorStyle() {
        return this.#currentVariable.value === "precip" ? precipColorGradient : tempColorGradient;
    }

    private createSource() {
        const year = this.#currentDate.value.getFullYear();
        const month = String(this.#currentDate.value.getMonth() + 1).padStart(2, "0");
        let file_prefix: string = '';
        if (this.#currentVariable.value === "precip") {
            file_prefix = 'pr';
        } else {
            file_prefix = 'tas';
        }
        

        const layerURL = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/PROJECTION/COG_${file_prefix}_EUR-11_MPI-M-MPI-ESM-LR_rcp45_mean_MPI-CSC-REMO2009_v1_mon_${year}-${month}_roi.tiff`;
        // console.log("🔗 Using layer URL:", layerURL);
        return new GeoTIFF({
            normalize: false,
            sources: [{ url: layerURL, nodata: -5.3e37 }]
        });
    }        
}
