import type { NextApiRequest, NextApiResponse } from 'next';

// Тип ответа API с курсами валют
type ExchangeRatesResponse = {
  rates: Record<string, number>;
  timestamp?: string;
  error?: string;
};

// Фиктивные курсы валют
const mockRates = {
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

/**
 * API-маршрут для получения курсов валют
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExchangeRatesResponse>
) {
  // Разрешаем только GET запросы
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      rates: {}, 
      error: 'Method Not Allowed' 
    });
  }

  try {
    // Получаем базовую валюту из запроса (по умолчанию USD)
    const { base = 'USD' } = req.query;
    const baseSymbol = String(base).toUpperCase();
    
    console.log(`Exchange rates API called with base: ${baseSymbol}`);
    
    // Проверяем, есть ли базовая валюта в наших данных
    if (!mockRates[baseSymbol as keyof typeof mockRates]) {
      // Если валюты нет, используем USD по умолчанию
      console.warn(`Unknown base currency: ${baseSymbol}, falling back to USD`);
    }
    
    // Преобразуем валюты из USD в запрошенную базовую валюту
    const baseRate = mockRates[baseSymbol as keyof typeof mockRates] || 1;
    const rates: Record<string, number> = {};
    
    for (const [currency, rateToUSD] of Object.entries(mockRates)) {
      if (currency === baseSymbol) {
        rates[currency] = 1; // 1 единица базовой валюты = 1 единица этой же валюты
      } else {
        // Конвертируем через USD
        const convertedRate = rateToUSD / baseRate;
        rates[currency] = convertedRate;
      }
    }
    
    // Добавляем метку времени
    const timestamp = new Date().toISOString();
    
    // Отправляем успешный ответ
    res.status(200).json({
      rates,
      timestamp
    });
  } catch (error) {
    console.error('Error in exchange rates API:', error);
    
    // В случае ошибки отправляем пустые данные и информацию об ошибке
    res.status(500).json({
      rates: {},
      error: 'Internal Server Error'
    });
  }
} 