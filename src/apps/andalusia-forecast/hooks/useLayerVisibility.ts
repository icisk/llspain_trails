import { useState, useEffect } from 'react';
import { HistoricClimateMapProvider } from '../services/HistoricClimateMapProvider';

export const useLayerVisibility = (initialVisibility: boolean) => {
    const [isVisible, setIsVisible] = useState(initialVisibility);
    const [mapProvider, setMapProvider] = useState(new HistoricClimateMapProvider(isVisible));

    useEffect(() => {
        setMapProvider(new HistoricClimateMapProvider(isVisible));
    }, [isVisible]);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return { isVisible, toggleVisibility, mapProvider };
};