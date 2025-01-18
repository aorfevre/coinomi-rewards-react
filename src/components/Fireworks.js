import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const explode = keyframes`
    0% {
        transform: translate(-50%, -50%);
        width: 0;
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%);
        width: 400px;
        opacity: 0;
    }
`;

const shoot = keyframes`
    0% {
        transform: translateY(100vh);
    }
    70% {
        transform: translateY(calc(var(--y) * 1vh));
        opacity: 1;
    }
    100% {
        transform: translateY(calc(var(--y) * 1vh));
        opacity: 0;
    }
`;

const Particle = styled(Box)(({ color }) => ({
    position: 'absolute',
    left: 'var(--x)',
    top: 'var(--y)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: color,
    transform: 'translate(-50%, -50%)',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: '2px',
        backgroundColor: color,
        animation: `${explode} 0.5s ease-out forwards`,
    },
}));

const Rocket = styled(Box)(({ color }) => ({
    position: 'absolute',
    left: 'var(--x)',
    width: '4px',
    height: '20px',
    backgroundColor: color,
    animation: `${shoot} 1s ease-out forwards`,
}));

const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];

export const Fireworks = ({ show }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!show) {
            setParticles([]);
            return;
        }

        const createFirework = () => {
            const x = Math.random() * 100;
            const y = 20 + Math.random() * 40; // Keep fireworks in upper half
            const color = colors[Math.floor(Math.random() * colors.length)];
            const id = Date.now() + Math.random();

            return { id, x, y, color };
        };

        const interval = setInterval(() => {
            setParticles(prev => [...prev, createFirework()]);
        }, 300);

        // Clean up particles after animation
        const cleanup = setInterval(() => {
            setParticles(prev => prev.slice(1));
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(cleanup);
        };
    }, [show]);

    if (!show) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        >
            {particles.map(({ id, x, y, color }) => (
                <React.Fragment key={id}>
                    <Rocket
                        style={{
                            '--x': `${x}%`,
                            '--y': y,
                        }}
                        color={color}
                    />
                    <Particle
                        style={{
                            '--x': `${x}%`,
                            '--y': `${y}vh`,
                        }}
                        color={color}
                    />
                </React.Fragment>
            ))}
        </Box>
    );
};

Fireworks.propTypes = {
    show: PropTypes.bool.isRequired,
};
