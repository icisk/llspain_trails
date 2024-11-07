import { useState, useEffect } from "react";
import { transform } from "ol/proj";

export function useFetchData(clickedCoordinates) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!clickedCoordinates) return;

        const fetchData = async (x, y) => {
            const url = `https://i-cisk.dev.52north.org/data/collections/creaf_forecast/position?coords=POINT(${x}%20${y})&parameter-name=pc05,pc10,pc25,pc50,pc75,pc90,pc95`;
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        const [x, y] = clickedCoordinates
        fetchData(x, y);
    }, [clickedCoordinates]);

    return { data, loading, error };
}
