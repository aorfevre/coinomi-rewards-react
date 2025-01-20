import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PropTypes from 'prop-types';

export const ChallengeCard = ({
    icon: Icon,
    title,
    description,
    isCompleted,
    buttonText,
    onAction,
    color,
    buttonStartIcon,
}) => {
    return (
        <Card
            sx={{
                bgcolor: theme =>
                    theme.palette.mode === 'light'
                        ? `${color}.light`
                        : `rgba(${color === '#0088cc' ? '91, 180, 255' : '76, 175, 80'}, 0.04)`,
                border: theme =>
                    `1px solid ${
                        theme.palette.mode === 'light'
                            ? `${color}.border`
                            : `rgba(${color === '#0088cc' ? '91, 180, 255' : '76, 175, 80'}, 0.12)`
                    }`,
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon sx={{ color: color, fontSize: 32 }} />
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                        {title}
                    </Typography>
                </Box>

                {isCompleted ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: 'success.main' }} />
                        <Typography sx={{ color: 'text.primary' }}>{description}</Typography>
                    </Box>
                ) : (
                    <>
                        <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                            {description}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={onAction}
                            startIcon={buttonStartIcon}
                            fullWidth
                            sx={{
                                bgcolor: color,
                                '&:hover': { bgcolor: theme => theme.palette.action.hover },
                                py: 1.5,
                                fontSize: '1.1rem',
                            }}
                        >
                            {buttonText}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

ChallengeCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    isCompleted: PropTypes.bool.isRequired,
    buttonText: PropTypes.string,
    onAction: PropTypes.func,
    color: PropTypes.string.isRequired,
    buttonStartIcon: PropTypes.element,
};
