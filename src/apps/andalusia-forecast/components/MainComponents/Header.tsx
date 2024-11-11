import React from 'react';
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";


interface HeaderProps {
    subpage: string;
}

export function Header({subpage} :HeaderProps ) {
    const intl = useIntl();
    
    return (
        <InfoBoxComponent
            header={intl.formatMessage({id: `${subpage}.heading`})}
            description={intl.formatMessage({id: `${subpage}.heading_descr`})}
        />
    )
}
