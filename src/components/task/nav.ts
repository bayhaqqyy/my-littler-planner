import { router } from 'expo-router';

export const goBack = (fallback = '/tasks') => (router.canGoBack() ? router.back() : router.replace(fallback as never));
