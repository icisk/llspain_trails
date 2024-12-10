import React from 'react';
import {IconButton, Tooltip} from "@open-pioneer/chakra-integration";
import { FaInfo } from "react-icons/fa";
import {useIntl} from "open-pioneer:react-hooks";

export function InfoTooltip({ i18n_path }: { i18n_path: string }) {
    const intl = useIntl()
    
    return (
        <Tooltip
            label={intl.formatMessage({id: i18n_path})}
            openDelay={250}
            closeDelay={100}
            placement="top"
        >
            <IconButton
                size={'s'}
                aria-label="Info"
                icon={<FaInfo />}
                variant="ghost"
            />
        </Tooltip>
    )
}
