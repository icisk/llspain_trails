import {DeclaredService, ServiceOptions} from "@open-pioneer/runtime";
import {useIntl} from "open-pioneer:react-hooks";
import {MapRegistry, SimpleLayer} from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import {reactive, Reactive} from "@conterra/reactivity-core";
import {MAP_ID} from "./BioindicatorMapProvider";
import {
    phenoColorGradient,

} from "../components/utils/globals";
import {GeoTIFF} from "ol/source";
import appUI from "../AppUI";
import {HistoricLayerHandler} from "./HistoricLayerHandler";


export interface BioindicatorLayerHandler extends DeclaredService<"app.BioindicatorLayerHandler">{
    setDate(date: string): void;
    setIndicator(indicator: string): void;
    currentDate: string;
    currentIndicator: string;
}

interface References {
    mapRegistry: MapRegistry;
}


export class BioindicatorLayerHandlerImpl implements BioindicatorLayerHandler {
    private mapRegistry: MapRegistry;
    private tiflayer: WebGLTileLayer | undefined;
    #currentDate: Reactive<string> = reactive('2011-04-16')
    #currentIndicator: Reactive<string> = reactive('CDD');

    constructor(options: ServiceOptions<References>) {
        const { mapRegistry } = options.references;
        this.mapRegistry = mapRegistry;

        this.mapRegistry.getMapModel(MAP_ID).then((model) => {
            this.tiflayer = (model?.layers.getLayerById('tif') as SimpleLayer).olLayer as WebGLTileLayer

        });
    }
    
    get currentDate(){
        return this.#currentDate.value;
    }

    get currentIndicator(){
        return this.#currentIndicator.value;
    }
    
    async setDate(date: string){
        this.#currentDate.value = date;
        const newSource = await this.createSource();
        if (newSource) {
            this.tiflayer?.setSource(newSource);
            this.tiflayer?.setStyle({ color: phenoColorGradient});
        }
    }

    async setIndicator(indicator: string) {
        this.#currentIndicator.value = indicator;
        this.setDate(this.currentDate);
    }


    private async createSource() {
        let tifUrl: string;
        if (this.#currentIndicator.value === 'SU') {
            const originalDateStr = this.#currentDate.value;
            const originalDate = new Date(originalDateStr);
            originalDate.setDate(originalDate.getDate() - 1);

            const adjustedDateStr = originalDate.toISOString().split('T')[0];

            tifUrl = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/agro_indicator/SU/SU_${adjustedDateStr}.tif`;
        } else if (this.#currentIndicator.value === 'CSU') {
            tifUrl = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/agro_indicator/CSU/CSU_${this.currentDate}.tif`;
        } else {
            tifUrl = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/agro_indicator/CDD/CDD_${this.currentDate}.tif`;
        }
        try {
            const response = await fetch(tifUrl,
                {
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
            projection: "EPSG:4326",
            sources: [{url: tifUrl,
                nodata: -5.3e+37
            }]
        });
    }   
}

