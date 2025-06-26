import React, { useState } from 'react';
import { IconButton, Tooltip, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure } from "@open-pioneer/chakra-integration";
import { FaInfo } from "react-icons/fa";
import { useIntl } from "open-pioneer:react-hooks";

// Konfigurierbare Zeichenlänge, ab der Modal statt Tooltip verwendet wird
const TOOLTIP_MAX_LENGTH = 1000;

export function InfoTooltip({ i18n_path }: { i18n_path: string }) {
    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isTooltipOpen, setTooltipOpen] = useState(false);

    const text = intl.formatMessage({ id: i18n_path });

    const isLongText = text.length > TOOLTIP_MAX_LENGTH;

    return (
        <>
            {isLongText ? (
                <>
                    <IconButton
                        size={'s'}
                        aria-label="Más información"
                        icon={<FaInfo />}
                        variant="ghost"
                        onClick={onOpen}
                    />
                    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>{intl.formatMessage({ id: "historic_compare.info.indicators_title"})}</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody whiteSpace="pre-wrap" fontSize="sm">
                                {text}
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </>
            ) : (
                <Tooltip
                    label={text}
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
            )}
        </>
    );
}
