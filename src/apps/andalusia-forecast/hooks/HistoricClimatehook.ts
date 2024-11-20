import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import { getRenderPixel } from 'ol/render';

const HistoricClimatehook = (mapRef: React.RefObject<HTMLDivElement>, swipeValue: number) => {
    const key = '2sau1xauZfmyliK5rhUv';

    useEffect(() => {
        if (!mapRef.current) return;

        const tile1 = new TileLayer({
            source: new XYZ({
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            }),
        });

        const tile2 = new TileLayer({
            source: new XYZ({
                url: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${key}`,
                maxZoom: 20,
                attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
                    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            }),
        });

        const mapForMapSlider = new Map({
            layers: [tile1, tile2],
            target: mapRef.current,
            view: new View({
                center: [-460000, 4540000],
                zoom: 8,
            }),
        });

        tile2.on('prerender', (event: any) => {
            const ctx = event.context;
            const mapSize = mapForMapSlider.getSize();
            if (!mapSize) return;

            const width = mapSize[0] * (swipeValue / 100);
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
            mapForMapSlider.setTarget(null);
        };
    }, [mapRef, swipeValue]);
};

export default HistoricClimatehook;