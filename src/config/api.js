// Динамическое определение API URL в зависимости от среды
const getApiUrl = () => {
  // Если есть переменная окружения (для build-time конфигурации)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // В разработке используем Vite proxy через /api
  if (import.meta.env.DEV) {
    return '/api';
  }

  // Определяем API URL на основе текущего хоста (для production)
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${protocol}//${hostname}${port}`;
};

export const API_URL = getApiUrl();

// Yandex Geocoding API ключ (вставьте свой ключ сюда или установите как переменную окружения)
// Получить ключ: https://developer.tech.yandex.ru/
export const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_API_KEY || '';
