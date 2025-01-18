import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Fireworks as FireworksJS } from 'fireworks-js';
import { Box } from '@mui/material';

export const Fireworks = ({ show }) => {
    const containerRef = useRef(null);
    const fireworksRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && show) {
            fireworksRef.current = new FireworksJS(containerRef.current, {
                explosion: 10,
                intensity: 30,
                traceLength: 3,
                traceSpeed: 10,
                rocketsPoint: {
                    min: 50,
                    max: 50,
                },
                opacity: 0.5,
                acceleration: 1.05,
                friction: 0.97,
                gravity: 1.5,
                particles: 90,
                trace: 3,
                delay: {
                    min: 30,
                    max: 60,
                },
                autoresize: true,
                brightness: {
                    min: 50,
                    max: 80,
                },
                decay: {
                    min: 0.015,
                    max: 0.03,
                },
                mouse: {
                    click: false,
                    move: false,
                    max: 1,
                },
            });

            fireworksRef.current.start();
        }

        return () => {
            if (fireworksRef.current) {
                fireworksRef.current.stop();
            }
        };
    }, [show]);

    if (!show) return null;

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
};

Fireworks.propTypes = {
    show: PropTypes.bool.isRequired,
};
