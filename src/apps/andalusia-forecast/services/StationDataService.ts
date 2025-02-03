import { useState, useEffect } from "react";

export function useFetchStationData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const url = "https://i-cisk.dev.52north.org/data/collections/ll_spain_creaf_in_boundary/items?f=json&limit=1000";
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { data, loading, error };
}
