import React from "react";
import { Box, Container, Image } from "@open-pioneer/chakra-integration";
import { InfoBoxComponent } from "info-box";
import { useIntl } from "open-pioneer:react-hooks";
import Navbar from "../components/Navbar/Navbar";
import { Link } from "react-router-dom";

const Home = () => {
    const intl = useIntl();
    const baseUrl = import.meta.env["BASE_URL"];

    const tilesData = [
        { id: 'tab1', title: 'forecast', url: "/forecast", png: baseUrl + "/images/cs1.PNG" },
        { id: 'tab2', title: 'historic_compare', url: "/historicclimatedata1", png: baseUrl + "/images/cs2.PNG" },
        { id: 'tab3', title: 'historic_climate_stations', url: "/historicclimatestations", png: baseUrl + "/images/cs3.PNG" },
        { id: 'tab5', title: 'projections', url: "/projections" },
        { id: 'tab6', title: 'phenology', url: "/phenology", png: baseUrl + "/images/cs5.PNG" },
        { id: 'tab7', title: 'hydro_service', url: "/hydrologicalservice", png: baseUrl + "/images/cs6.PNG" },
    ];

    return (
        <Container minWidth="container.xl">
            <Box border="2px solid #3498DB" borderRadius="10px" padding={3}>
                <Box fontSize="xl">{intl.formatMessage({ id: "home.heading" })}</Box>
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
                    borderRadius="md"
                    border={"1px solid"}
                    borderColor="gray.200"
                    boxShadow="md"
                    overflow="hidden"
                    position="relative"
                    _hover={{ boxShadow: "xl" }}
                    >
                    {tile.png && (
                        <Image
                            src={tile.png}
                            alt={tile.title}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                            transition="transform 0.3s ease"
                            _hover={{ transform: "scale(1.05)" }}
                        />
                    )}
                    <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="rgb(255, 255, 255)"
                        fontWeight="bold"
                        fontSize="lg"
                        textShadow={"0px 2px 6px rgba(0, 0, 0, 0.5)"}
                        bg="rgba(0,0,0,0.1)"
                        transition="background 0.3s ease"
                        _hover={{ bg: "rgba(22, 17, 17, 0.5)" }}
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
