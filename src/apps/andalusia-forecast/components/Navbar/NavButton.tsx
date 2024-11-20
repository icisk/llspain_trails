import React from 'react';
import { Button } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useIntl } from 'open-pioneer:react-hooks';

interface NavButtonProps {
    to: string;
    id: string; // The internationalized message ID
}

const NavButton: React.FC<NavButtonProps> = ({ to, id }) => {
    const location = useLocation();
    const intl = useIntl();

    // Determine if the current route matches the button's 'to' prop
    const isActive = location.pathname === to;

    return (
        <Button
            as={Link}
            to={to}
            variant={isActive ? 'solid' : 'outline'}
            colorScheme={isActive ? 'blue' : 'gray'}
            size={'md'}
        >
            {intl.formatMessage({ id })}
        </Button>
    );
};

export default NavButton;
