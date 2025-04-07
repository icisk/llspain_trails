import { useState, useEffect } from "react";
import { transform } from "ol/proj";

export function useFetchData(clickedCoordinates :any, variable: string) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!clickedCoordinates) return;

        function coords2TS(startISO, endISO, steps) {
            const startDate = new Date(startISO);
            const endDate = new Date(endISO);
            if (steps === 1) {
                return [startDate.getTime()];
            }
            const timeSeries = [];
            const monthsInterval = Math.floor((endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth());

            for (let i = 0; i < steps; i++) {
                const currentDate = new Date(startDate);
                currentDate.setMonth(startDate.getMonth() + Math.round((monthsInterval * i) / (steps - 1)));
                timeSeries.push(currentDate.getTime());
            }

            return timeSeries;
        }

        const fetchData = async (x :any, y :any, variable :string) => {
            const url = `https://i-cisk.dev.52north.org/data/collections/creaf_forecast_${variable}/position?coords=POINT(${x}%20${y})&parameter-name=pc05,pc10,pc25,pc50,pc75,pc90,pc95`;
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                const jsonData = await response.json();

                const metrics = jsonData?.domain.axes.time;
                const ts = coords2TS(metrics.start, metrics.stop, metrics.num)

                const highchartsData = [
                    {
                        name: 'pc05',
                        data: ts.map((time, index) => [time, jsonData.ranges.pc05.values[index]]),
                        type: 'line'
                    },
                    {
                        name: 'pc10',
                        data: ts.map((time, index) => [time, jsonData.ranges.pc10.values[index]]),
                        type: 'line'
                    },
                    {
                        name: 'pc25',
                        data: ts.map((time, index) => [time, jsonData.ranges.pc25.values[index]]),
                        type: 'line'
                    },
                    {
                        name: 'pc50',
                        data: ts.map((time, index) => [time, jsonData.ranges.pc50.values[index]]),
                        type: 'line'
                    },
                    {
                        name: 'pc75',
                        data: ts.map((time, index) => [time, jsonData.ranges.pc75.values[index]]),
                        type: 'line'
                    },
                    {
                        name: 'pc90',
                        data: ts.map((time, index) => [time, jsonData.ranges.pc90.values[index]]),
                        type: 'line'
                    },
                    {
                        name: 'pc95',
                        data: ts.map((time, index) => [time, jsonData.ranges.pc95.values[index]]),
                        type: 'line'
                    }
                ];

                setData(highchartsData);
            } catch (err :any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const [x, y] = clickedCoordinates
        fetchData(x, y, variable);
    }, [clickedCoordinates, variable]);

    return { data, loading, error };
}
