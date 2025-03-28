import {DeclaredService, ServiceOptions} from "@open-pioneer/runtime";
import {useIntl} from "open-pioneer:react-hooks";
import {MapRegistry, SimpleLayer} from "@open-pioneer/map";
import WebGLTileLayer from "ol/layer/WebGLTile";
import {reactive, Reactive} from "@conterra/reactivity-core";
import {MAP_ID} from "./BioindicatorMapProvider";
import {precipColorGradient, tempColorGradient} from "../components/utils/globals";
import {GeoTIFF} from "ol/source";
import appUI from "../AppUI";
import {HistoricLayerHandler} from "./HistoricLayerHandler";


export interface BioindicatorLayerHandler extends DeclaredService<"app.BioindicatorLayerHandler">{
    setDate(date: string): void;
    currentDate: string;
}

interface References {
    mapRegistry: MapRegistry;
}

const getColorStyle = () => {
    return [
        "case",
        ["<=", ["band", 1], 10], [255, 0, 0, 0.75],    // Red
        ["<=", ["band", 1], 20], [255, 127, 0, 0.75],  // Orange
        ["<=", ["band", 1], 30], [255, 255, 0, 0.75],  // Yellow
        ["<=", ["band", 1], 40], [0, 255, 0, 0.75],    // Green
        ["<=", ["band", 1], 50], [0, 255, 255, 0.75],  // Turquoise
        ["<=", ["band", 1], 60], [0, 0, 255, 0.75],    // Blue
        ["<=", ["band", 1], 70], [75, 0, 130, 0.75],   // Indigo
        ["<=", ["band", 1], 80], [139, 0, 255, 0.75],  // Violet
        ["<=", ["band", 1], 90], [255, 105, 180, 0.75],// Pink
        ["<=", ["band", 1], 100], [128, 0, 128, 0.75], // Purple
        [0, 0, 0, 0] // Default (transparent)
    ];
};

export class BioindicatorLayerHandlerImpl implements BioindicatorLayerHandler {
    private mapRegistry: MapRegistry;
    private tiflayer: WebGLTileLayer | undefined;
    #currentDate: Reactive<string> = reactive('2011-04-16')

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
    
    async setDate(date: string){
        this.#currentDate.value = date;
        const newSource = await this.createSource();
        if (newSource) {
            this.tiflayer?.setSource(newSource);
            this.tiflayer?.setStyle({ color: getColorStyle()});
        }
    }


    private async createSource() {
        const tifUrl = `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/agro_indicator/CDD/CDD_${this.currentDate}.tif`;
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

