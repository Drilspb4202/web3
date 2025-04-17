import { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import tokenFactoryABI from '../abis/TokenFactoryABI';
import mspeTokenABI from '../abis/MSPETokenABI';

// Интерфейсы для данных о токене
export interface TokenBasicInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  circulationSupply: string;
  contractAddress: string;
  description?: string;
  logo?: string;
  createdAt: Date;
}

export interface TokenDistribution {
  name: string;
  value: number;
}

export interface TokenUnlockSchedule {
  date: string;
  amount: number;
}

export interface TokenHolder {
  address: string;
  amount: number;
  percentage: number;
}

export interface TokenPrice {
  date: string;
  price: number;
}

export interface TokenDetailedInfo extends TokenBasicInfo {
  price: number;
  marketCap: number;
  holders: number;
  priceHistory: TokenPrice[];
  tokenomics: {
    distribution: TokenDistribution[];
    unlockSchedule: TokenUnlockSchedule[];
  };
  topHolders: TokenHolder[];
  exchangeRates?: Record<string, number>;
}

// Конфигурация контрактов (в реальном проекте будет получена из конфигурации)
const CONTRACTS = {
  tokenFactory: {
    address: '0x1234567890123456789012345678901234567890', // Замените на реальный адрес
    abi: tokenFactoryABI
  },
  mspeToken: {
    abi: mspeTokenABI
  }
};

/**
 * Получение курсов валют из API
 */
async function fetchExchangeRates() {
  try {
    // Используем наш локальный API-маршрут вместо прямого запроса к внешнему API
    const response = await fetch('/api/exchange-rates');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // В случае ошибки возвращаем моковые данные
    return {
      "EUR": 0.92,
      "GBP": 0.78,
      "JPY": 150.42,
      "RUB": 89.75,
      "CNY": 7.23,
      "AVAX": 0.043,
      "BTC": 0.000016,
      "ETH": 0.00031
    };
  }
}

/**
 * Хук для получения детальной информации о токене
 * @param tokenAddress Адрес смарт-контракта токена
 * @param symbol Символ токена
 */
export function useTokenDetails(tokenAddress?: string, symbol?: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokenDetails, setTokenDetails] = useState<TokenDetailedInfo | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);

  // Получаем курсы валют
  useEffect(() => {
    const getExchangeRates = async () => {
      const rates = await fetchExchangeRates();
      if (rates) {
        setExchangeRates(rates);
      }
    };
    
    getExchangeRates();
    
    // Обновляем курсы каждые 5 минут
    const intervalId = setInterval(getExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Получаем базовую информацию о токене из смарт-контракта
  const { data: tokenName } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACTS.mspeToken.abi,
    functionName: 'name',
    enabled: !!tokenAddress
  });

  const { data: tokenSymbol } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACTS.mspeToken.abi,
    functionName: 'symbol',
    enabled: !!tokenAddress
  });

  const { data: tokenDecimals } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACTS.mspeToken.abi,
    functionName: 'decimals',
    enabled: !!tokenAddress
  });

  const { data: tokenSupply } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACTS.mspeToken.abi,
    functionName: 'totalSupply',
    enabled: !!tokenAddress
  });

  const { data: tokenCirculationSupply } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACTS.mspeToken.abi,
    functionName: 'circulationSupply',
    enabled: !!tokenAddress
  });

  // Получаем детальную информацию о токене из фабрики токенов
  const { data: tokenInfo } = useContractRead({
    address: CONTRACTS.tokenFactory.address as `0x${string}`,
    abi: CONTRACTS.tokenFactory.abi,
    functionName: 'getTokenInfo',
    args: [tokenAddress],
    enabled: !!tokenAddress
  });

  // Получаем информацию о держателях токена
  const { data: holdersCount } = useContractRead({
    address: CONTRACTS.tokenFactory.address as `0x${string}`,
    abi: CONTRACTS.tokenFactory.abi,
    functionName: 'getTokenHoldersCount',
    args: [tokenAddress],
    enabled: !!tokenAddress
  });

  const { data: tokenHolders } = useContractRead({
    address: CONTRACTS.tokenFactory.address as `0x${string}`,
    abi: CONTRACTS.tokenFactory.abi,
    functionName: 'getTopTokenHolders',
    args: [tokenAddress, 5], // Получаем топ-5 держателей
    enabled: !!tokenAddress
  });

  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        setLoading(true);
        
        // В реальном проекте здесь бы был API запрос к оракулу цен или биржевому API
        // Также данные о токеномике будут получены из смарт-контракта или IPFS
        
        // Для демо используем моковые данные
        const mockedPriceHistory = generateMockPriceHistory();
        const mockedTokenomics = generateMockTokenomics();
        const mockedHolders = generateMockHolders();
        
        // Если данные из контракта получены, формируем объект с информацией о токене
        if (tokenName && tokenSymbol && tokenDecimals && tokenSupply) {
          const totalSupply = formatEther(tokenSupply as bigint);
          const circulationSupply = tokenCirculationSupply 
            ? formatEther(tokenCirculationSupply as bigint)
            : totalSupply;
            
          const price = mockedPriceHistory[mockedPriceHistory.length - 1].price;
          const marketCap = parseFloat(circulationSupply) * price;
          
          setTokenDetails({
            name: tokenName as string,
            symbol: tokenSymbol as string,
            decimals: Number(tokenDecimals),
            totalSupply,
            circulationSupply,
            contractAddress: tokenAddress || '',
            createdAt: new Date(),
            price,
            marketCap,
            holders: holdersCount ? Number(holdersCount) : mockedHolders.length,
            priceHistory: mockedPriceHistory,
            tokenomics: mockedTokenomics,
            topHolders: mockedHolders,
            exchangeRates: exchangeRates || undefined
          });
        } else if (symbol) {
          // Если смарт-контракт не найден, но известен символ токена,
          // можно попробовать получить информацию из API
          await fetchTokenDetailsBySymbol(symbol);
        }
        
      } catch (err) {
        console.error('Error fetching token details:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    // Начинаем загрузку данных если есть адрес токена или символ
    if (tokenAddress || symbol) {
      fetchTokenDetails();
    }
  }, [
    tokenAddress, 
    symbol, 
    tokenName, 
    tokenSymbol, 
    tokenDecimals, 
    tokenSupply,
    tokenCirculationSupply,
    holdersCount,
    tokenHolders,
    exchangeRates
  ]);
  
  /**
   * Получение данных о токене по его символу через API
   */
  const fetchTokenDetailsBySymbol = async (tokenSymbol: string) => {
    try {
      // В реальном проекте здесь был бы запрос к API
      // Для демо используем моковые данные
      
      // Имитируем задержку сетевого запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Подготавливаем моковые данные
      const mockedPriceHistory = generateMockPriceHistory();
      const mockedTokenomics = generateMockTokenomics();
      const mockedHolders = generateMockHolders();
      
      const price = mockedPriceHistory[mockedPriceHistory.length - 1].price;
      const circulationSupply = '1000000';
      const marketCap = parseFloat(circulationSupply) * price;
      
      setTokenDetails({
        name: `${tokenSymbol} Token`,
        symbol: tokenSymbol,
        decimals: 18,
        totalSupply: '2000000',
        circulationSupply,
        contractAddress: '0x0000000000000000000000000000000000000000',
        createdAt: new Date(),
        price,
        marketCap,
        holders: mockedHolders.length,
        priceHistory: mockedPriceHistory,
        tokenomics: mockedTokenomics,
        topHolders: mockedHolders,
        exchangeRates: exchangeRates || undefined
      });
      
    } catch (err) {
      console.error('Error fetching token details by symbol:', err);
      setError(err as Error);
    }
  };
  
  /**
   * Генерация моковых данных истории цен
   */
  const generateMockPriceHistory = (): TokenPrice[] => {
    const history: TokenPrice[] = [];
    const startDate = new Date('2023-01-01');
    const startPrice = 5 + Math.random() * 10; // От 5 до 15
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      // Генерируем случайное изменение цены в пределах ±20%
      const priceChange = (Math.random() * 0.4) - 0.2; // От -0.2 до +0.2
      const prevPrice = i === 0 ? startPrice : history[i - 1].price;
      const price = prevPrice * (1 + priceChange);
      
      history.push({
        date: date.toLocaleDateString('ru-RU'),
        price: parseFloat(price.toFixed(2))
      });
    }
    
    return history;
  };
  
  /**
   * Генерация моковых данных о токеномике
   */
  const generateMockTokenomics = () => {
    return {
      distribution: [
        { name: 'Команда', value: 15 + Math.floor(Math.random() * 10) },
        { name: 'Инвесторы', value: 20 + Math.floor(Math.random() * 10) },
        { name: 'Резерв', value: 10 + Math.floor(Math.random() * 5) },
        { name: 'Стейкинг', value: 15 + Math.floor(Math.random() * 10) },
        { name: 'Экосистема', value: 25 + Math.floor(Math.random() * 10) }
      ],
      unlockSchedule: [
        { date: 'Янв 2023', amount: 200000 + Math.floor(Math.random() * 100000) },
        { date: 'Апр 2023', amount: 150000 + Math.floor(Math.random() * 100000) },
        { date: 'Июл 2023', amount: 150000 + Math.floor(Math.random() * 100000) },
        { date: 'Окт 2023', amount: 125000 + Math.floor(Math.random() * 75000) },
        { date: 'Янв 2024', amount: 125000 + Math.floor(Math.random() * 75000) },
        { date: 'Апр 2024', amount: 100000 + Math.floor(Math.random() * 50000) },
        { date: 'Июл 2024', amount: 100000 + Math.floor(Math.random() * 50000) },
        { date: 'Окт 2024', amount: 75000 + Math.floor(Math.random() * 25000) },
      ]
    };
  };
  
  /**
   * Генерация моковых данных о держателях токена
   */
  const generateMockHolders = (): TokenHolder[] => {
    const holders: TokenHolder[] = [];
    const addresses = [
      '0x1a2b...3c4d',
      '0x5e6f...7g8h',
      '0x9i10...11j12',
      '0x13k14...15l16',
      '0x17m18...19n20'
    ];
    
    let remainingPercentage = 100;
    
    // Генерируем данные о топ-держателях
    for (let i = 0; i < 5; i++) {
      // Последний держатель получает оставшийся процент
      const percentage = i === 4 
        ? remainingPercentage 
        : Math.min(
            5 + Math.floor(Math.random() * 10), // От 5% до 15%
            remainingPercentage - (4 - i) // Оставляем минимум по 1% для оставшихся держателей
          );
      
      remainingPercentage -= percentage;
      
      const amount = Math.floor(2000000 * (percentage / 100));
      
      holders.push({
        address: addresses[i],
        amount,
        percentage
      });
    }
    
    return holders;
  };
  
  return { tokenDetails, loading, error };
} 