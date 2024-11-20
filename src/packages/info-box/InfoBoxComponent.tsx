// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box } from "@open-pioneer/chakra-integration";
import { CommonComponentProps, useCommonComponentProps } from "@open-pioneer/react-utils";
import { FC } from "react";

export interface InfoBoxComponentProps extends CommonComponentProps {
    header: string;
    description?: string;
}

export const InfoBoxComponent: FC<InfoBoxComponentProps> = (props) => {
    const { header, description } = props;
    const { containerProps } = useCommonComponentProps("simple-ui", props);
    return (
        <Box {...containerProps} border="2px solid #3498DB" borderRadius="10px" padding={3}>
            <Box fontSize="xl">{header}</Box>
            <Box pt={1}>{description}</Box>
        </Box>
    );
};
