import { useState, useEffect } from "react";
import { transform } from "ol/proj";

export function useFetchData(clickedCoordinates: any, variable: string, startMonth: string) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    function formatDateString(input: string): string {
        return input.replace("-", "_");
    }

    useEffect(() => {
        if (!clickedCoordinates) return;

        function coords2TS(startISO, endISO, steps) {
            const startDate = new Date(startISO);
            const endDate = new Date(endISO);
            if (steps === 1) {
                return [startDate.getTime()];
            }
            const timeSeries = [];
            const monthsInterval = Math.floor(
                (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                    endDate.getMonth() -
                    startDate.getMonth()
            );

            for (let i = 0; i < steps; i++) {
                const currentDate = new Date(startDate);
                currentDate.setMonth(
                    startDate.getMonth() + Math.round((monthsInterval * i) / (steps - 1))
                );
                timeSeries.push(currentDate.getTime());
            }

            return timeSeries;
        }

        const fetchData = async (x: any, y: any, variable: string) => {
            startMonth = formatDateString(startMonth);
            const url = `https://i-cisk.dev.52north.org/data/collections/creaf_forecast_${variable}_${startMonth}/position?coords=POINT(${x} ${y})`;
            // console.log("Fetching data from URL:", url);
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                const jsonData = await response.json();
                // console.log("Fetched data:", jsonData);

                const metrics = jsonData?.domain.axes.time;
                const ts = coords2TS(metrics.start, metrics.stop, metrics.num);

                const highchartsData = [
                    {
                      name: "pc05",
                      data: ts.map((time, index) => [time, jsonData.ranges.pc_05.values[index]]),
                      type: "line"
                    },
                    {
                      name: "pc10",
                      data: ts.map((time, index) => [time, jsonData.ranges.pc_10.values[index]]),
                      type: "line"
                    },
                    {
                      name: "pc25",
                      data: ts.map((time, index) => [time, jsonData.ranges.pc_25.values[index]]),
                      type: "line"
                    },
                    {
                      name: "pc50",
                      data: ts.map((time, index) => [time, jsonData.ranges.pc_50.values[index]]),
                      type: "line"
                    },
                    {
                      name: "pc75",
                      data: ts.map((time, index) => [time, jsonData.ranges.pc_75.values[index]]),
                      type: "line"
                    },
                    {
                      name: "pc90",
                      data: ts.map((time, index) => [time, jsonData.ranges.pc_90.values[index]]),
                      type: "line"
                    },
                    {
                      name: "pc95",
                      data: ts.map((time, index) => [time, jsonData.ranges.pc_95.values[index]]),
                      type: "line"
                    }
                  ];
                  

                setData(highchartsData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const [x, y] = clickedCoordinates;
        fetchData(x, y, variable);
    }, [clickedCoordinates, variable, startMonth]);

    return { data, loading, error };
}
