/**
 * Модуль для работы с курсами валют
 */

// Фиктивные курсы валют на случай, если API недоступен
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  RUB: 90.5,
  JPY: 150.2,
  CNY: 7.1,
  GBP: 0.79,
  BTC: 0.000016,
  ETH: 0.00031,
  AVAX: 0.043,
  CHU: 0.5
};

// API ключ для UniRateAPI
const API_KEY = 'h8vZc43tmgPsHz85Bw4AAuv6Woc6IeJf1vFgqTYVN9PL3paPZDN0bG7qNhOIVv6U';

/**
 * Интерфейс для ответа API курсов валют
 */
interface ExchangeRatesResponse {
  rates: Record<string, number>;
  base?: string;
  timestamp?: number;
  date?: string;
}

/**
 * Получает актуальные курсы валют из UniRateAPI или возвращает резервные данные в случае ошибки
 * @param baseCurrency Базовая валюта (по умолчанию USD)
 * @returns Объект с курсами валют относительно базовой валюты
 */
export const fetchExchangeRates = async (baseCurrency: string = 'USD'): Promise<Record<string, number>> => {
  try {
    const response = await fetch(
      `https://api.unirateapi.com/api/rates?api_key=${API_KEY}&from=${baseCurrency}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json() as ExchangeRatesResponse;
    
    // Проверяем, что получены валидные данные
    if (!data.rates || Object.keys(data.rates).length === 0) {
      console.warn('API returned empty rates data, using fallback');
      return FALLBACK_RATES;
    }
    
    // Логируем успешное получение данных
    console.log('Successfully fetched exchange rates from UniRateAPI');
    return data.rates;
  } catch (error) {
    // Логируем ошибку и используем резервные данные
    console.error('Error fetching exchange rates:', error);
    console.warn('Using fallback exchange rates');
    return FALLBACK_RATES;
  }
};

/**
 * Конвертирует сумму из одной валюты в другую
 * @param amount Сумма для конвертации
 * @param fromCurrency Исходная валюта
 * @param toCurrency Целевая валюта
 * @param rates Объект с курсами валют
 * @returns Сконвертированная сумма
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number => {
  // Если валюты одинаковые, просто возвращаем сумму
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Если нет данных о курсах, возвращаем исходную сумму
  if (!rates || Object.keys(rates).length === 0) {
    console.warn('No exchange rates data available for conversion');
    return amount;
  }
  
  // Если валюта - USD, просто умножаем на курс целевой валюты
  if (fromCurrency === 'USD') {
    return amount * (rates[toCurrency] || 1);
  }
  
  // Если целевая валюта - USD, делим на курс исходной валюты
  if (toCurrency === 'USD') {
    return amount / (rates[fromCurrency] || 1);
  }
  
  // В остальных случаях конвертируем через USD
  const amountInUsd = amount / (rates[fromCurrency] || 1);
  return amountInUsd * (rates[toCurrency] || 1);
}; 