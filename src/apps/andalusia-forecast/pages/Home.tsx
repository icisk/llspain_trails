import React from "react";
import { Box } from "@open-pioneer/chakra-integration";
import { InfoBoxComponent } from "info-box";
import { useIntl } from "open-pioneer:react-hooks";
import Navbar from "../components/Navbar/Navbar";
import { Link } from "react-router-dom";

const Home = () => {
    const intl = useIntl();
    const baseUrl = import.meta.env["BASE_URL"];

    const tilesData = [
        { id: 'tab1', title: 'forecast', url: "/forecast" },
        { id: 'tab2', title: 'historic_compare', url: "/historicclimatedata1" },
        { id: 'tab3', title: 'historic_climate_stations', url: "/historicclimatestations" },
        { id: 'tab5', title: 'projections', url: "/projections" },
        { id: 'tab6', title: 'phenology', url: "/phenology" },
        { id: 'tab7', title: 'hydro_service', url: "/hydrologicalservice" }
    ];

    return (
        <Box minH="100vh" p={6}>
            <Box mb={6}>
                <img
                    src={baseUrl + "images/logo.png"}
                    alt="I-CISK logo"
                    style={{ width: "40%", height: "auto" }}
                />
                <InfoBoxComponent
                    header={intl.formatMessage({ id: "home.heading" })}
                    description={intl.formatMessage({ id: "home.heading_descr" })}
                />
            </Box>

            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minH="60vh"
            >
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(3, 1fr)"
                    gap={6}
                >
                    {tilesData.map((tile) => (
                        <Box
                            key={tile.id}
                            as={Link}
                            to={tile.url}
                            width="300px"
                            height="150px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="gray.200"
                            borderRadius="md"
                            boxShadow="md"
                            _hover={{ bg: "gray.300" }}
                            textAlign="center"
                        >
                            {intl.formatMessage({ id: `${tile.title}.nav` })}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default Home;
