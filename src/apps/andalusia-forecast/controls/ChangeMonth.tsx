// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, HStack, Select } from "@chakra-ui/react";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import {useIntl, useService} from "open-pioneer:react-hooks";
import { ChangeEvent } from "react";

import { enumKeys } from "../components/utils/helper";
import { Month, PrecipitationLayerHandler } from "../services/PrecipitationLayerHandler";

import {getMonthArray} from "../components/utils/globals";

export function ChangeMonth() {
    const prepSrvc = useService<PrecipitationLayerHandler>("app.PrecipitationLayerHandler");
    const intl = useIntl();

    const { currentMonth } = useReactiveSnapshot(
        () => ({
            currentMonth: prepSrvc.currentMonth
        }),
        [prepSrvc]
    );

    function updateMonth(event: ChangeEvent<HTMLSelectElement>): void {
        prepSrvc.setMonth(event.target.value as Month);
    }

    return (
        <HStack>
            <Box whiteSpace={"nowrap"}>{intl.formatMessage({id: "global.controls.sel_month"})} </Box>
            <Select placeholder="Select option" value={currentMonth} onChange={updateMonth}>
                {createOptions()}
            </Select>
        </HStack>
    );

    function createOptions() {
        return enumKeys(Month).map((key) => {
            return (
                <option key={key} value={Month[key]}>
                    {key}
                </option>
            );
        });
    }
}
