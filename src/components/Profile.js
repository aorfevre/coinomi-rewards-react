import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const Profile = () => {
    const { t } = useTranslation();

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>
                {t('profile')}
            </Typography>
            <Typography color="text.secondary">{t('comingSoon')}</Typography>
        </Box>
    );
};
