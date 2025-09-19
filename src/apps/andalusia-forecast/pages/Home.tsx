import React from "react";
import { Box, Container, Image } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { Link } from "react-router-dom";

const Home = () => {
    const intl = useIntl();
    // const baseUrl = import.meta.env["BASE_URL"];
    const baseUrl = "";

    const tilesData = [
        { id: 'tab1', title: 'forecast', url: "/forecast", png: baseUrl + "/images/cs1.PNG" },
        { id: 'tab2', title: 'historic_compare', url: "/historicclimatedata1", png: baseUrl + "/images/cs2.PNG" },
        { id: 'tab3', title: 'historic_climate_stations', url: "/historicclimatestations", png: baseUrl + "/images/cs3.PNG" },
        { id: 'tab5', title: 'projections', url: "/projections", png: baseUrl + "/images/cs4.PNG" },
        { id: 'tab6', title: 'phenology', url: "/phenology", png: baseUrl + "/images/cs5.PNG" },
        { id: 'tab7', title: 'hydro_service', url: "/hydrologicalservice", png: baseUrl + "/images/cs6.PNG" },
    ];

    console.log("Base URL:", baseUrl);

    return (
        <Container minWidth="container.xl" py={6}>
            <Box border="2px solid #3498DB" borderRadius="10px" padding={3} mb={6}>
                <Box fontSize="xl" fontWeight="bold">{intl.formatMessage({ id: "home.heading" })}</Box>
                <Box pt={1}>
                    <p>
                        {intl.formatMessage({ id: "home.heading_descr" })}{" "}
                        <a
                            href={intl.formatMessage({ id: "home.icisk_link" })}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#1a0dab", textDecoration: "underline" }}
                        >
                            {intl.formatMessage({ id: "home.icisk_link" })}
                        </a>
                        .
                    </p>
                </Box>
            </Box>

            <Box width="100%" minH="60vh">
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fit, minmax(320px, 1fr))"
                    gap={6}
                >
                    {tilesData.map((tile) => (
                        <Box
                            key={tile.id}
                            as={Link}
                            to={tile.url}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="md"
                            overflow="hidden"
                            _hover={{ boxShadow: "xl" }}
                            display="flex"
                            flexDirection="column"
                            bg="white"
                        >
                            {tile.png && (
                                <Image
                                    src={tile.png}
                                    alt={tile.title}
                                    objectFit="cover"
                                    width="100%"
                                    height="200px"
                                    transition="transform 0.3s ease"
                                    _hover={{ transform: "scale(1.05)" }}
                                />
                            )}
                            <Box
                                bg="gray.100"
                                color="black"
                                // fontWeight="bold"
                                fontSize="lg"
                                textAlign="center"
                                py={3}
                            >
                                {intl.formatMessage({ id: `${tile.title}.nav` })}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Container>
    );
};

export default Home;
