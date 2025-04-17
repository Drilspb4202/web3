/**
 * Основные типы данных для приложения
 */

/**
 * Интерфейс представляющий токен
 */
export interface Token {
  /** Уникальный идентификатор токена */
  id: string;
  /** Название токена */
  name: string;
  /** Символ токена (тикер) */
  symbol: string;
  /** URI для логотипа токена */
  logoURI: string;
  /** Текущая цена в USD */
  price: number;
  /** Рыночная капитализация в USD */
  marketCap: number;
  /** Объем торгов за 24 часа в USD */
  volume24h: number;
  /** Изменение цены за 24 часа в процентах */
  priceChange24h: number;
  /** Общее предложение токенов */
  totalSupply: number;
  /** Токены в обращении */
  circulationSupply: number;
  /** Количество держателей токена */
  holders: number;
  /** Ранг токена по капитализации */
  rank?: number;
  /** Блокчейн, на котором выпущен токен */
  chain?: string;
  /** Описание токена */
  description?: string;
  /** Смарт-контракт токена */
  address?: string;
  /** Официальный сайт */
  website?: string;
  /** Ссылка на Twitter */
  twitter?: string;
  /** Ссылка на Telegram */
  telegram?: string;
  /** Дата создания токена */
  createdAt?: Date;
}

/**
 * Интерфейс для курсов валют
 */
export interface ExchangeRates {
  /** Курсы валют в формате код валюты - значение */
  [currency: string]: number;
}

/**
 * Интерфейс для транзакции
 */
export interface Transaction {
  /** Хеш транзакции */
  hash: string;
  /** Адрес отправителя */
  from: string;
  /** Адрес получателя */
  to: string;
  /** Сумма транзакции */
  amount: number;
  /** Символ токена */
  symbol: string;
  /** Дата транзакции */
  timestamp: Date;
  /** Статус транзакции */
  status: 'pending' | 'confirmed' | 'failed';
  /** Комиссия в нативной валюте (AVAX) */
  fee?: number;
}

/**
 * Интерфейс для данных пользователя
 */
export interface User {
  /** Адрес кошелька пользователя */
  address: string;
  /** Имя пользователя (если указано) */
  username?: string;
  /** Аватар (URI изображения) */
  avatar?: string;
  /** Дата регистрации */
  joinedAt: Date;
  /** Баланс в нативной валюте (AVAX) */
  balance?: number;
  /** Верификация */
  verified?: boolean;
} 