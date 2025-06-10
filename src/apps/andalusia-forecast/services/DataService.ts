interface DataResponse {
    ranges: {
        [key: string]: {
            values: number[];
        };
    };
}

export async function fetchData(x: number, y: number): Promise<DataResponse | null> {
    const url = `https://i-cisk.dev.52north.org/data/collections/creaf_forecast/position?coords=POINT(${x}%20${y})&parameter-name=pc05,pc10,pc25,pc50,pc75,pc90,pc95`;

    try {
        const response = await fetch(url);
        const data: DataResponse = await response.json();
        const hasValidData = Object.values(data.ranges).some((range) =>
            range.values.some((value) => value > -1e37 && value < 1e37)
        );
        return hasValidData ? data : null;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}
