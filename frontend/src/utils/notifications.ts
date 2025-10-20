import { useSnackbar, VariantType } from 'notistack';

/**
 * Custom hook for displaying notifications using Notistack
 * Replaces alert() calls with proper Material-UI snackbar notifications
 */
export const useNotifications = () => {
  const { enqueueSnackbar } = useSnackbar();

  return {
    success: (message: string) =>
      enqueueSnackbar(message, {
        variant: 'success' as VariantType,
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }),

    error: (message: string) =>
      enqueueSnackbar(message, {
        variant: 'error' as VariantType,
        autoHideDuration: 5000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }),

    warning: (message: string) =>
      enqueueSnackbar(message, {
        variant: 'warning' as VariantType,
        autoHideDuration: 4000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }),

    info: (message: string) =>
      enqueueSnackbar(message, {
        variant: 'info' as VariantType,
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }),
  };
};
