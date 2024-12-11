// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, HStack, Select } from "@chakra-ui/react";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { useService } from "open-pioneer:react-hooks";
import { ChangeEvent } from "react";
import {useEffect} from "react";
import { enumKeys } from "../components/utils/helper";
import { PrecipitationLayerHandler, Variable } from "../services/PrecipitationLayerHandler";

export function ChangeVariable() {
    const prepSrvc = useService<PrecipitationLayerHandler>("app.PrecipitationLayerHandler");
    const def = 'pc50';

    useEffect(() => {
        if (!prepSrvc.currentVariable) {
            prepSrvc.setVariable(def); 
        }
    }, [prepSrvc]);
    
    const { currentVariable = def} = useReactiveSnapshot(
        () => ({
            currentVariable: prepSrvc.currentVariable ?? def
        }),
        [prepSrvc]
    );

    function updateVariable(event: ChangeEvent<HTMLSelectElement>): void {
        prepSrvc.setVariable(event.target.value as Variable);
    }
    
    return (
        <HStack>
            <Box whiteSpace={"nowrap"}>Select Variable: </Box>
            <Select placeholder="Select option" value={currentVariable || def} onChange={updateVariable}>
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
