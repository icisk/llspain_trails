// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    i18n: [ "en", 
            "es"
    ],
    ui: {
        references: [
            "app.PrecipitationLayerHandler", 
            "app.HistoricLayerHandler"
                    ]
    },
    services: {
        MidtermForecastMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        StoryMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        HydrologicalMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        ProjectionMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        BioindicatorMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        PrecipitationLayerHandlerImpl: {
            provides: ["app.PrecipitationLayerHandler"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        HistoricLayerHandlerImpl: {
            provides: ["app.HistoricLayerHandler"],
            references: {
                mapRegistry: "map.MapRegistry"
            }
        },
        HistoricClimateMapProvider: {
            provides: ["map.MapConfigProvider"]
        },
        HistoricClimateMapProvider2: {
            provides: ["map.MapConfigProvider"]
        }
    }
});
