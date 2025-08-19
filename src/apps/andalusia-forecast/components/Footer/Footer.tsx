import React from "react";
import { useIntl } from "open-pioneer:react-hooks";
import {
    Box,
    Flex,
    Image,
    Text,
    HStack,
    IconButton,
    useDisclosure,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverBody
} from "@chakra-ui/react";
import { FaInfo } from "react-icons/fa";

const Footer: React.FC = () => {
    const intl = useIntl();
    const baseUrl = import.meta.env["BASE_URL"];
    const { isOpen, onOpen, onClose } = useDisclosure();

    const infoLabel = intl.formatMessage({ id: "footer.info" });
    const text = intl.formatMessage({ id: "footer.fullDisclaimerText" });

    return (
        <Box
            as="footer"
            bg="white"
            py={3}
            px={6}
            position="fixed"
            bottom={0}
            left={0}
            w="100%"
            boxShadow="md"
            zIndex={1000}
        >
            <Flex justify="space-between" align="center">
                <Image src={baseUrl + "images/logo.png"} alt="I-CISK Logo" h="40px" />

                <HStack spacing={2} fontSize="sm" color="gray.600">
                    <Text>{infoLabel}</Text>
                    <Popover trigger="hover" placement="top">
                        <PopoverTrigger>
                            <IconButton
                                size="sm"
                                aria-label="Más información"
                                icon={<FaInfo />}
                                variant="ghost"
                            />
                        </PopoverTrigger>
                        <PopoverContent whiteSpace="pre-line" fontSize="sm" maxW="400px">
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody textAlign="left" fontSize="small" pt={5}>                                
                                {text}
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </HStack>
            </Flex>
        </Box>
    );
};

export default Footer;
