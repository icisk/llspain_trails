// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { MapConfig, MapConfigProvider, SimpleLayer } from "@open-pioneer/map";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import View from "ol/View";
import { register } from "ol/proj/proj4";
import OSM from "ol/source/OSM";
import proj4 from "proj4";
import { createCazorlaLayer, createLosPedrochesLayer } from "../components/utils/regionLayers";
import { getGeologicalPolygonColor, getGeologicalLineColor } from "../components/utils/geologicalLayersColorHandler";
import { pedrochesPoint } from "../components/utils/globals";
import { TileWMS } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import { transformExtent } from "ol/proj";
import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";
import WebGLTileLayer from "ol/layer/WebGLTile";
import XYZ from "ol/source/XYZ";
import { get } from "http";
import { Tile } from "ol";

proj4.defs(
    "EPSG:25830",
    "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
register(proj4);
const ext = [
        -5.392816586767803,
        38.088551680000016,
        -4.193883430000028,
        38.72908738000001
    ];

const extent3857 = transformExtent(ext, 'EPSG:4326', 'EPSG:3857');



export const MAP_ID = "hydrological-forecast";

export class HydrologicalMapProvider implements MapConfigProvider {
    mapId = MAP_ID;

    async getMapConfig(): Promise<MapConfig> {
        
        //landuse layer
        // const landUseLayer = new ImageLayer({
        //     source: new Static({
        //         url: 'https://i-cisk.dev.52north.org/data/collections/maps_api_ll_spain_landuse_dissolved/map?f=png',
        //         imageExtent: ext,
        //         projection: 'EPSG:4326',
        //     })
        // });
        //
        // landUseLayer.set("id", "thematic-1");
        // landUseLayer.set("thematic", true);
        
        // groundwater layer
        const groundwaterLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_groundwater/items?f=json",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                fill: new Fill({
                    color: "rgba(128, 0, 128, 0.4)",
                }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
        });

        groundwaterLayer.set("id", "thematic-3");
        groundwaterLayer.set("thematic", true);

        // groundwater layer (VECTOR)
        const groundwaterLayerVector = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_groundwater/items?f=json",
                format: new GeoJSON(),
            }),
            visible: false,
        });

        groundwaterLayerVector.set("id", "groundwater");
        groundwaterLayerVector.set("vector", true);

        // springs layer (VECTOR)
        // funktioniert noch nicht
        // const springsLayer = new TileLayer({
        //     source: new TileWMS({
        //         url: 'http://mapas.igme.es/gis/services/BasesDatos/IGME_PuntosAgua/MapServer/WMSServer?Version=1.3.0',
        //         params: {'LAYERS': 'default'},
        //         serverType: 'mapserver',
        //         transition: 0,
        //     }),
        //     opacity: 1,
        // });
        const springsLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_springs/items?f=json",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                image: new CircleStyle({
                    radius: 6,
                    fill: new Fill({ color: 'blue' }),
                    stroke: new Stroke({ color: 'white', width: 1 }),
                }),
            }),
        });

        springsLayer.set("id", "springs");
        springsLayer.set("vector", true);
        

        // municipalities layer (VECTOR)
        const municipalityLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_municipalities/items?f=json",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                // fill: new Fill({
                //     color: "rgba(128, 0, 128, 0.4)",
                // }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
            zIndex: 15
        });
        

        municipalityLayer.set("id", "municipalities");
        municipalityLayer.set("vector", true);

        // geologicalLayer (VECTOR)
        const geologicalPolygonsLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_geological_polygons/items?f=json&limit=7000",
                format: new GeoJSON(),
            }),
            visible: false,
            style: function (feature) {
                const type = feature.getProperties().CODE_COTR;
                
                return new Style({
                    fill: new Fill({
                        color: getGeologicalPolygonColor(type),
                    }),
                });
            }

        });


        geologicalPolygonsLayer.set("id", "thematic-2");
        geologicalPolygonsLayer.set("thematic", true);

        // geologicalLayer (VECTOR)
        const geologicalLinesLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_geological_lines/items?f=json&limit=15000",
                format: new GeoJSON(),
            }),
            visible: false,
            style: function (feature) {
                const lineType = feature.getProperties().CODE_LINE1;

                return new Style({
                    stroke: new Stroke({
                        color: getGeologicalLineColor(lineType),
                        width: 1,
                    }),
                });
            }
        });


        geologicalLinesLayer.set("id", "thematic-2");
        geologicalLinesLayer.set("thematic", true);



        // geologicalLayer (VECTOR)
        const authoritiesLayer = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_authorities/items?f=json&limit=3",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                fill: new Fill({
                    color: "rgba(128, 0, 128, 0.4)",
                }),
                stroke: new Stroke({
                    color: "#800080",
                    width: 1.5,
                }),
            }),
        });


        authoritiesLayer.set("id", "thematic-4");
        authoritiesLayer.set("thematic", true);

        // authorities layer (VECTOR)
        const authoritiesLayerVector = new VectorLayer({
            source: new VectorSource({
                url: "https://i-cisk.dev.52north.org/data/collections/ll_spain_authorities/items?f=json",
                format: new GeoJSON(),
            }),
            visible: false,
            style: new Style({
                stroke: new Stroke({
                    color: "#008000", 
                    width: 2,         
                }),
            }),
        });

        authoritiesLayerVector.set("id", "authorities_boundaries");
        authoritiesLayerVector.set("vector", true);
        
        
        const geoWMS = new TileLayer({
            source: new TileWMS({
                url: 'https://mapas.igme.es/gis/services/Cartografia_Geologica/IGME_Geode_50/MapServer/WMSServer',
                params: {'LAYERS': '1'},
                serverType: "mapserver",
                transition: 0
            }),
            minResolution: 0.01,
            extent: extent3857,
            visible: false,
            // extent: ext3857
        })

        geoWMS.set("id", "thematic-5");
        geoWMS.set("thematic", true);
        
        // hydro network layer (WMS)
        const networkLayer = new TileLayer({
            source: new TileWMS({
                url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_masas_agua_andalucia_phc_2022_27',
                params: {'layers': 'red_hidrografica'},
                serverType: 'mapserver',
                transition: 0,
            }),
            extent: extent3857,
            opacity: 1,
            zIndex: 10,
        });

        networkLayer.set("id", "network");
        networkLayer.set("vector", true);

        const aforos = new TileLayer({
            source: new TileWMS({
                url: 'https://wms.mapama.gob.es/sig/agua/aforos/wms.aspx',
                params: {'layers': 'EF.EnvironmentalMonitoringFacilities'},
                serverType: 'mapserver',
                transition: 0,
            }),
            extent: extent3857,
            opacity: 1,
            zIndex: 10,
        });

        aforos.set("id", "aforos");
        aforos.set("vector", true);

        const aguas_subter = new TileLayer({
            source: new TileWMS({
                url: 'https://wms.mapama.gob.es/sig/agua/Piezometria/wms.aspx',
                params: {'layers': 'EF.EnvironmentalMonitoringFacilities'},
                serverType: 'mapserver',
                transition: 0,
            }),
            extent: extent3857,
            opacity: 1,
            zIndex: 10,
        });

        aguas_subter.set("id", "aguas_subter");
        aguas_subter.set("vector", true);

        const puntos_acui = new TileLayer({
            source: new TileWMS({
                url: 'http://mapas.igme.es/gis/services/BasesDatos/IGME_PuntosAgua/MapServer/WMSServer',
                params: {'layers': '1'},
                serverType: 'mapserver',
                transition: 0,
            }),
            extent: extent3857,
            opacity: 1,
            zIndex: 10,
        });

        puntos_acui.set("id", "puntos_acui");
        puntos_acui.set("vector", true);

        const catchmentGuadiana = new TileLayer({
            source: new TileWMS({
                url: 'https://geoguadiana.chguadiana.es/geoserver/usos/wms',
                params: {'layers': 'captaciones'},
                serverType: 'mapserver',
                transition: 0,
            }),
            extent: extent3857,
            opacity: 1,
            zIndex: 10,
        });

        catchmentGuadiana.set("id", "catchmentGuadiana");
        catchmentGuadiana.set("vector", true);

        const catchmentGuadalquivir = new TileLayer({
            source: new TileWMS({
                url: 'https://idechg.chguadalquivir.es/inspire/wms',
                params: {'layers': 'captaciones'},
                serverType: 'mapserver',
                transition: 0,
            }),
            extent: extent3857,
            opacity: 1,
            zIndex: 10,
        });

        catchmentGuadalquivir.set("id", "catchmentGuadalquivir");
        catchmentGuadalquivir.set("vector", true);

        const landUseLayer = new TileLayer({
            source: new TileWMS({
                url: 'https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_siose_2020',
                params: {'layers': 'raster_recon_siose20'},
                serverType: 'mapserver',
                transition: 0,
            }),
            extent: extent3857,
            opacity: 1,
            zIndex: 10,
        });

        landUseLayer.set("id", "thematic-1");
        landUseLayer.set("thematic", true);

        return {
            initialView: {
                kind: "position",
                center: { x: pedrochesPoint.geom.getCoordinates()[0] ?? 0, y: pedrochesPoint.geom.getCoordinates()[1] ?? 0 },
                zoom: pedrochesPoint.zoom,
            },
            projection: "EPSG:3857",
            layers: [
                // Base Layer
                new SimpleLayer({
                    title: "ESRI Gray", olLayer: new WebGLTileLayer({
                        source: new XYZ({
                            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                            attributions: '&copy; Esri, HERE, Garmin, OpenStreetMap contributors'
                        }),
                        properties: { title: "ESRI Gray" }
                    }),
                    isBaseLayer: true
                }),

                // Thematic Layers
                new SimpleLayer({
                    title: "Land Use",
                    olLayer: landUseLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Groundwater",
                    olLayer: groundwaterLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "GeologicalPolygons",
                    olLayer: geologicalPolygonsLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "GeologicalLines",
                    olLayer: geologicalLinesLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "authorities",
                    olLayer: authoritiesLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "xxx",
                    olLayer: geoWMS,
                    isBaseLayer: false
                }),

                // Additional Layers
                new SimpleLayer({
                    title: "Groundwater (VECTOR)",
                    olLayer: groundwaterLayerVector,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "authorities (VECTOR)",
                    olLayer: authoritiesLayerVector,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Municipalities",
                    olLayer: municipalityLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Hydro Network",
                    olLayer: networkLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "catchmentGuadalquivir",
                    olLayer: catchmentGuadalquivir,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Hsprings",
                    olLayer: springsLayer,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "aforos",
                    olLayer: aforos,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "aguas_subter",
                    olLayer: aguas_subter,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "puntos_acui",
                    olLayer: puntos_acui,
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "catchmentGuadiana",
                    olLayer: catchmentGuadiana,
                    isBaseLayer: false
                }),

                //Region Layers
                new SimpleLayer({
                    title: "Cazorla",
                    olLayer: createCazorlaLayer(),
                    isBaseLayer: false
                }),
                new SimpleLayer({
                    title: "Los Pedroches",
                    olLayer: createLosPedrochesLayer(),
                    isBaseLayer: false
                }),
            ]
        };
    }
}

