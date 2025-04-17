/**
 * Утилиты для форматирования различных значений
 */

/**
 * Форматирует число в формат USD с символом $ и двумя десятичными знаками
 * @param value Числовое значение для форматирования
 * @param options Дополнительные параметры форматирования
 * @returns Отформатированная строка
 */
export const formatUsd = (value: number, options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }): string => {
  const defaultOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };

  // Разное форматирование в зависимости от размера числа
  if (value >= 1000000000) {
    // Миллиарды
    return `$${(value / 1000000000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}B`;
  } else if (value >= 1000000) {
    // Миллионы
    return `$${(value / 1000000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    })}M`;
  } else if (value >= 1000) {
    // Тысячи
    return `$${(value / 1000).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}K`;
  } else if (value < 0.01) {
    // Очень маленькие значения
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6
    })}`;
  } else {
    // Стандартное форматирование для остальных значений
    return `$${value.toLocaleString(undefined, defaultOptions)}`;
  }
};

/**
 * Форматирует процентное изменение с символом %
 * @param value Числовое значение для форматирования (в процентах)
 * @returns Отформатированная строка
 */
export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Форматирует большое число с разделителями
 * @param value Числовое значение для форматирования
 * @returns Отформатированная строка
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Форматирует дату в локальный формат
 * @param date Дата для форматирования
 * @returns Отформатированная строка с датой
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU');
};

/**
 * Сокращает адрес кошелька для отображения
 * @param address Полный адрес кошелька
 * @param startLength Количество символов в начале (по умолчанию 6)
 * @param endLength Количество символов в конце (по умолчанию 4)
 * @returns Сокращенный адрес
 */
export const shortenAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}; 