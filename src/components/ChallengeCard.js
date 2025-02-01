import { Box, Card, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export const ChallengeCard = ({
    icon: Icon,
    title,
    description,
    isCompleted,
    isReferralChallenge,
    onAction,
}) => {
    const { t } = useTranslation();

    const handleClick = () => {
        if (!isCompleted && !isReferralChallenge) {
            onAction?.();
        }
    };

    return (
        <Card
            onClick={handleClick}
            sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: theme =>
                    theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'background.paper',
                boxShadow: 'none',
                cursor: !isCompleted && !isReferralChallenge ? 'pointer' : 'default',
                '&:hover': {
                    bgcolor:
                        !isCompleted && !isReferralChallenge
                            ? theme =>
                                  theme.palette.mode === 'dark'
                                      ? 'rgba(255, 255, 255, 0.05)'
                                      : 'rgba(0, 0, 0, 0.02)'
                            : 'inherit',
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                        <Icon
                            sx={{
                                fontSize: 24,
                                color: theme => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
                            }}
                        />
                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 500,
                                    mb: 0.5,
                                }}
                            >
                                {title}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                }}
                            >
                                {description}
                            </Typography>
                        </Box>
                    </Box>

                    {isCompleted ? (
                        <CheckCircleIcon
                            sx={{
                                color: 'success.main',
                                fontSize: 24,
                            }}
                        />
                    ) : (
                        !isReferralChallenge && (
                            <KeyboardArrowRightIcon
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: 24,
                                    opacity: 0.8,
                                }}
                            />
                        )
                    )}
                </Box>

                {/* Referral Challenge Button */}
                {isReferralChallenge && !isCompleted && (
                    <Button
                        variant="contained"
                        onClick={onAction}
                        fullWidth
                        sx={{
                            mt: 2,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                        }}
                    >
                        {t('startReferring')}
                    </Button>
                )}
            </Box>
        </Card>
    );
};

ChallengeCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    isCompleted: PropTypes.bool.isRequired,
    isReferralChallenge: PropTypes.bool,
    onAction: PropTypes.func,
};

ChallengeCard.defaultProps = {
    isReferralChallenge: false,
};
