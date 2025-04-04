import React from "react";
import { Box, Text } from "@open-pioneer/chakra-integration";
import {useIntl} from "open-pioneer:react-hooks";
import {uncertaintyColors} from "../utils/globals";



export const UncertaintyLegend = () => {
    const intl = useIntl();
    const colorMapping = [
        { value: 1, color: uncertaintyColors.red, label: intl.formatMessage({id: "global.legend.uncertainty.red"})},
        { value: 2, color: uncertaintyColors.yellow, label: intl.formatMessage({id: "global.legend.uncertainty.yellow"})},
        { value: 3, color: uncertaintyColors.green, label: intl.formatMessage({id: "global.legend.uncertainty.green"})},
    ]

    return (
        <Box position="absolute" top="10px" left="10px" bg="white" p={2} borderRadius="md" boxShadow="md">
            <Text fontWeight="bold" mb={2}>{intl.formatMessage({id: "global.vars.uncertainty"})}</Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
};
