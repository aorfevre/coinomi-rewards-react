import { Box, Typography, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

export const StatsCard = ({
    icon: Icon,
    coloredTitle,
    title,
    subtitle,
    color,
    bgColor,
    tooltip,
}) => {
    const card = (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: 4,
                bgcolor: bgColor || 'background.paper',
                boxShadow: theme =>
                    theme.palette.mode === 'dark'
                        ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                        : '0 4px 6px rgba(0, 0, 0, 0.1)',
                cursor: tooltip ? 'help' : 'default',
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${color}20`, // 20% opacity of the color
                }}
            >
                <Icon sx={{ fontSize: 24, color: color }} />
            </Box>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography
                        variant="h5"
                        component="span"
                        sx={{ fontWeight: 'bold', color: color }}
                    >
                        {coloredTitle}
                    </Typography>
                    <Typography variant="h5" component="span">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    );

    return tooltip ? (
        <Tooltip
            title={<Typography style={{ whiteSpace: 'pre-line' }}>{tooltip}</Typography>}
            arrow
        >
            {card}
        </Tooltip>
    ) : (
        card
    );
};

StatsCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    coloredTitle: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    bgColor: PropTypes.string,
    tooltip: PropTypes.string,
};
