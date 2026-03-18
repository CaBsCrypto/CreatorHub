import { useToast as useToastContext } from '../context/ToastContext';

export const useToast = () => {
  return useToastContext();
};
