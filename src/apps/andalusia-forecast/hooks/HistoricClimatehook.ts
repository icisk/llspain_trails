import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import GeoTIFF from 'ol/source/GeoTIFF';
import XYZ from 'ol/source/XYZ';
import { getRenderPixel } from 'ol/render';

const HistoricClimateHook = (
    mapRef: React.RefObject<HTMLDivElement>,
    swipeValue: number
) => {
    const mapInstanceRef = useRef<Map | null>(null); // Ref to store the map instance
    const swipeValueRef = useRef(swipeValue); // Ref to store the current swipe value

    // Update swipeValueRef whenever swipeValue changes
    useEffect(() => {
        swipeValueRef.current = swipeValue;
        if (mapInstanceRef.current) {
            // Redraw the map tiles when the slider value changes
            mapInstanceRef.current.render();
        }
    }, [swipeValue]);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const key = '2sau1xauZfmyliK5rhUv';

        const tile1 = new TileLayer({
            source: new XYZ({
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            }),
        });

        // const tile2 = new TileLayer({
        //     source: new GeoTIFF({
        //         sources: [
        //             {
        //                 url: 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/temp/COG_2000_01_MeanTemperature_v0.tif',
        //             },
        //         ],
        //     }),
        // });

        const tile2 = new TileLayer({
            source: new XYZ({
                url: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${key}`,
                maxZoom: 20,
                attributions:
                    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
                    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            }),
        });
        

        const map = new Map({
            layers: [tile1, tile2],
            target: mapRef.current,
            view: new View({
                center: [-460000, 4540000],
                zoom: 8,
            }),
        });

        mapInstanceRef.current = map; // Store the map instance in the ref

        tile2.on('prerender', (event: any) => {
            const ctx = event.context;
            const mapSize = map.getSize();
            if (!mapSize) return;

            const width = mapSize[0] * (swipeValueRef.current / 100);
            const tl = getRenderPixel(event, [width, 0]);
            const tr = getRenderPixel(event, [mapSize[0], 0]);
            const bl = getRenderPixel(event, [width, mapSize[1]]);
            const br = getRenderPixel(event, mapSize);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(tl[0], tl[1]);
            ctx.lineTo(bl[0], bl[1]);
            ctx.lineTo(br[0], br[1]);
            ctx.lineTo(tr[0], tr[1]);
            ctx.closePath();
            ctx.clip();
        });

        tile2.on('postrender', (event: any) => {
            const ctx = event.context;
            ctx.restore();
        });

        return () => {
            map.setTarget(null);
            mapInstanceRef.current = null;
        };
    }, [mapRef]);

    return null;
};

export default HistoricClimateHook;
