import React from 'react';
import {
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverBody,
} from "@open-pioneer/chakra-integration";
import { FaInfo } from "react-icons/fa";
import { useIntl } from "open-pioneer:react-hooks";

const TOOLTIP_MAX_LENGTH = 1000;

export function InfoTooltip({
    i18n_path,
    i18n_path_title,
    i18n_path_short_text
}: {
    i18n_path: string,
    i18n_path_title?: string,
    i18n_path_short_text?: string
}) {
    const intl = useIntl();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const text = intl.formatMessage({ id: i18n_path });
    const title = i18n_path_title ? intl.formatMessage({ id: i18n_path_title }) : null;
    const shortText = i18n_path_short_text ? intl.formatMessage({ id: i18n_path_short_text }) : null;

    const isLongText = text.length > TOOLTIP_MAX_LENGTH;

    const popoverContent = isLongText ? shortText || title || "Más información" : text;

    return (
        <>
            <Popover trigger="hover" placement="top">
                <PopoverTrigger>
                    <IconButton
                        size="s"
                        aria-label="Más información"
                        icon={<FaInfo />}
                        variant="ghost"
                        onClick={isLongText ? onOpen : undefined}
                    />
                </PopoverTrigger>
                <PopoverContent whiteSpace="pre-line" fontSize="sm" maxW="300px">
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                        {popoverContent}
                    </PopoverBody>
                </PopoverContent>
            </Popover>

            {isLongText && (
                <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{title}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody whiteSpace="pre-wrap" fontSize="sm">
                            {text}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
}
