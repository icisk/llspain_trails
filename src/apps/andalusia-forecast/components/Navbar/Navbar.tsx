import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    return (
        <nav>
            <ul>
                <li>
                    <p>Andalusia Living Lab</p>
                </li>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/forecast">Forecast</Link>
                </li>
                <li>
                    <Link to="/historicclimatedata1">Historic Climate Data 1</Link>
                </li>
                <li>
                    <Link to="/historicclimatedata2">Historic Climate Data 2</Link>
                </li>
                <li>
                    <Link to="/biologicaleffectivedegreedays">Biological Effective Degree Days</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;