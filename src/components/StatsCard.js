import { Box, Typography, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';

export const StatsCard = ({
    icon: Icon,
    coloredTitle,
    title,
    subtitle,
    color,
    bgColor,
    tooltip,
    sx = {},
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const card = (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                borderRadius: 4,
                bgcolor: bgColor || 'background.paper',
                boxShadow: isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                    : '0 2px 12px rgba(0, 0, 0, 0.08)',
                cursor: tooltip ? 'help' : 'default',
                transition: 'all 0.2s ease-in-out',
                backdropFilter: !isDark ? 'blur(8px)' : 'none',
                border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.05)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                        ? '0 6px 20px rgba(0, 0, 0, 0.6)'
                        : '0 4px 16px rgba(0, 0, 0, 0.12)',
                    border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.08)',
                },
                ...sx,
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
                    bgcolor: isDark ? `${color}20` : `${color}15`,
                    transition: 'all 0.2s ease-in-out',
                    border: `1px solid ${isDark ? `${color}30` : `${color}20`}`,
                    '&:hover': {
                        transform: 'scale(1.05)',
                        bgcolor: isDark ? `${color}25` : `${color}20`,
                    },
                }}
            >
                <Icon
                    sx={{
                        fontSize: 24,
                        color,
                        filter: isDark ? 'brightness(1.2)' : 'none',
                    }}
                />
            </Box>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography
                        variant="h5"
                        component="span"
                        sx={{
                            fontWeight: 'bold',
                            color,
                            filter: isDark ? 'brightness(1.2)' : 'none',
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        {coloredTitle}
                    </Typography>
                    <Typography
                        variant="h5"
                        component="span"
                        sx={{
                            color: isDark ? theme.palette.grey[300] : theme.palette.text.primary,
                            transition: 'color 0.2s ease-in-out',
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: isDark ? theme.palette.grey[400] : theme.palette.text.secondary,
                        transition: 'color 0.2s ease-in-out',
                        opacity: 0.9,
                    }}
                >
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    );

    return tooltip ? (
        <Tooltip
            title={
                <Typography
                    style={{
                        whiteSpace: 'pre-line',
                        color: isDark ? theme.palette.grey[100] : theme.palette.grey[900],
                    }}
                >
                    {tooltip}
                </Typography>
            }
            arrow
            placement="top"
            enterDelay={200}
            sx={{
                bgcolor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
                '& .MuiTooltip-arrow': {
                    color: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
                },
            }}
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
    sx: PropTypes.object,
};
