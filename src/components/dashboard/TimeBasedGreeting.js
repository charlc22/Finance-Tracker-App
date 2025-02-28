import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const TimeBasedGreeting = () => {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        // Get the current hour in EST
        const getESTHour = () => {
            const date = new Date();
            // Convert to EST (UTC-5), adjust for daylight savings if needed
            const estOffset = -5;
            const utcOffset = date.getTimezoneOffset() / 60;
            return (date.getHours() + utcOffset + estOffset) % 24;
        };

        const hour = getESTHour();
        let timeGreeting = '';

        if (hour >= 5 && hour < 12) {
            timeGreeting = 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            timeGreeting = 'Good afternoon';
        } else if (hour >= 17 && hour < 22) {
            timeGreeting = 'Good evening';
        } else {
            timeGreeting = 'Good night';
        }

        setGreeting(timeGreeting);
    }, []);

    const name = user?.name || 'there';
    const displayName = name.split(' ')[0]; // Get first name

    return (
        <div className="greeting-container">
            <h1 className="greeting-text">{greeting}, {displayName}</h1>
        </div>
    );
};

export default TimeBasedGreeting;