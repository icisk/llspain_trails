// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, HStack, Select } from "@chakra-ui/react";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { useService } from "open-pioneer:react-hooks";
import { ChangeEvent } from "react";

import { enumKeys } from "../helper";
import { PrecipitationLayerHandler, Variable } from "../services/PrecipitationLayerHandler";

export function ChangeVariable() {
    const prepSrvc = useService<PrecipitationLayerHandler>("app.PrecipitationLayerHandler");

    const { currentVariable } = useReactiveSnapshot(
        () => ({
            currentVariable: prepSrvc.currentVariable
        }),
        [prepSrvc]
    );

    function updateVariable(event: ChangeEvent<HTMLSelectElement>): void {
        prepSrvc.setVariable(event.target.value as Variable);
    }

    return (
        <HStack>
            <Box whiteSpace={"nowrap"}>Select Variable: </Box>
            <Select placeholder="Select option" value={currentVariable} onChange={updateVariable}>
                {createOptions()}
            </Select>
        </HStack>
    );

    function createOptions() {
        return enumKeys(Variable).map((key) => {
            return (
                <option key={key} value={Variable[key]}>
                    {key}
                </option>
            );
        });
    }
}
