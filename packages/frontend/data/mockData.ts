/**
 * Мок данные для токенов в приложении
 */

import { Token } from '../types';

/**
 * Массив с демонстрационными токенами для разработки интерфейса
 */
export const tokens: Token[] = [
  {
    id: 'avamo',
    name: 'Avamo Network',
    symbol: 'AVAMO',
    logoURI: '/images/tokens/avamo.svg',
    price: 12.85,
    marketCap: 18000000,
    volume24h: 1240000,
    priceChange24h: 3.5,
    totalSupply: 1400000,
    circulationSupply: 850000,
    holders: 347,
    rank: 1,
    chain: 'Avalanche',
    description: 'Платформа для децентрализованного кредитования малого бизнеса с фокусом на сельскохозяйственный сектор.',
  },
  {
    id: 'cofta',
    name: 'Coffee Trading Alliance',
    symbol: 'COFTA',
    logoURI: '/images/tokens/cofta.svg',
    price: 8.45,
    marketCap: 12500000,
    volume24h: 950000,
    priceChange24h: -1.2,
    totalSupply: 1800000,
    circulationSupply: 950000,
    holders: 283,
    rank: 2,
    chain: 'Avalanche',
    description: 'Объединение производителей кофе, использующих блокчейн для прозрачности поставок и справедливой торговли.',
  },
  {
    id: 'belcap',
    name: 'Belgrade Capital',
    symbol: 'BELCAP',
    logoURI: '/images/tokens/belcap.svg',
    price: 6.75,
    marketCap: 9800000,
    volume24h: 640000,
    priceChange24h: 0.8,
    totalSupply: 1500000,
    circulationSupply: 720000,
    holders: 156,
    rank: 3,
    chain: 'Avalanche',
    description: 'Фонд для инвестиций в стартапы региона Балкан, с фокусом на технологические и финтех компании.',
  },
  {
    id: 'farmco',
    name: 'FarmConnect',
    symbol: 'FARM',
    logoURI: '/images/tokens/farmco.svg',
    price: 4.20,
    marketCap: 6300000,
    volume24h: 520000,
    priceChange24h: 5.6,
    totalSupply: 2000000,
    circulationSupply: 1500000,
    holders: 412,
    rank: 4,
    chain: 'Avalanche',
    description: 'Платформа для связи фермеров и потребителей, обеспечивающая прозрачность происхождения продуктов и справедливые цены.',
  },
  {
    id: 'artgal',
    name: 'Art Gallery DAO',
    symbol: 'ARTG',
    logoURI: '/images/tokens/artgal.svg',
    price: 3.15,
    marketCap: 4700000,
    volume24h: 380000,
    priceChange24h: -2.7,
    totalSupply: 1200000,
    circulationSupply: 650000,
    holders: 210,
    rank: 5,
    chain: 'Avalanche',
    description: 'DAO для совместного владения и управления цифровой художественной галереей, специализирующейся на работах художников из стран Восточной Европы.',
  },
  {
    id: 'bakery',
    name: 'Bakery Chain',
    symbol: 'BAKE',
    logoURI: '/images/tokens/bakery.svg',
    price: 2.65,
    marketCap: 3900000,
    volume24h: 290000,
    priceChange24h: 1.2,
    totalSupply: 2500000,
    circulationSupply: 1450000,
    holders: 184,
    rank: 6,
    chain: 'Avalanche',
    description: 'Сеть независимых пекарен, использующих токен для программы лояльности и управления поставками.',
  }
];

/**
 * Получение токена по его ID или символу
 * @param idOrSymbol ID или символ токена
 * @returns Токен, если найден, иначе undefined
 */
export const getTokenByIdOrSymbol = (idOrSymbol: string): Token | undefined => {
  if (!idOrSymbol) return undefined;
  const lowercaseId = idOrSymbol.toLowerCase();
  
  return tokens.find(
    token => 
      token.id.toLowerCase() === lowercaseId || 
      token.symbol.toLowerCase() === lowercaseId
  );
};

/**
 * Данные для биржевых курсов валют (демонстрационные)
 */
export const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.2,
  CNY: 7.1,
  RUB: 90.5,
  AVAX: 0.043,
}; 