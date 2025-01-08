import { useState } from 'react';

export const useLayerVisibility = (initialVisibility: boolean) => {
    const [isVisible, setIsVisible] = useState(initialVisibility);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return [isVisible, toggleVisibility] as const;
};