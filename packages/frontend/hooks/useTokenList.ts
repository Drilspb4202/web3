import { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import tokenFactoryABI from '../abis/TokenFactoryABI';
import { TokenBasicInfo } from './useTokenDetails';

// Конфигурация контрактов (в реальном проекте будет получена из конфигурации)
const TOKEN_FACTORY_ADDRESS = '0x1234567890123456789012345678901234567890'; // Замените на реальный адрес

/**
 * Хук для получения списка всех токенов МСП из фабрики токенов
 */
export function useTokenList() {
  const [tokens, setTokens] = useState<TokenBasicInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Получаем список адресов токенов из смарт-контракта фабрики
  const { data: tokenAddresses, isLoading: isLoadingAddresses, error: contractError } = useContractRead({
    address: TOKEN_FACTORY_ADDRESS as `0x${string}`,
    abi: tokenFactoryABI,
    functionName: 'getAllTokens',
  });
  
  useEffect(() => {
    const fetchTokensInfo = async () => {
      try {
        setLoading(true);
        
        if (contractError) {
          throw contractError;
        }
        
        if (tokenAddresses && Array.isArray(tokenAddresses)) {
          // В реальном проекте здесь выполнялись бы запросы к смарт-контрактам 
          // для получения информации о каждом токене из списка
          
          // Для демо используем моковые данные
          const mockedTokens = generateMockTokens();
          setTokens(mockedTokens);
        } else {
          // Если данные из контракта недоступны, используем моковые данные для демо
          const mockedTokens = generateMockTokens();
          setTokens(mockedTokens);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching token list:', err);
        setError(err as Error);
        
        // В случае ошибки все равно покажем моковые данные для демо
        const mockedTokens = generateMockTokens();
        setTokens(mockedTokens);
      } finally {
        setLoading(false);
      }
    };
    
    // Не запускаем запрос, если предыдущий еще не завершен
    if (!isLoadingAddresses) {
      fetchTokensInfo();
    }
  }, [tokenAddresses, isLoadingAddresses, contractError]);
  
  /**
   * Генерация моковых данных списка токенов
   */
  const generateMockTokens = (): TokenBasicInfo[] => {
    return [
      {
        name: 'Avamo Network',
        symbol: 'AVAMO',
        decimals: 18,
        totalSupply: '1400000',
        circulationSupply: '850000',
        contractAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
        logo: '/images/tokens/avamo.svg',
        description: 'Avamo Network - платформа для децентрализованного кредитования малого бизнеса с фокусом на сельскохозяйственный сектор.',
        createdAt: new Date(2023, 0, 1)
      },
      {
        name: 'Coffee Trading Alliance',
        symbol: 'COFTA',
        decimals: 18,
        totalSupply: '1800000',
        circulationSupply: '950000',
        contractAddress: '0x2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t',
        logo: '/images/tokens/cofta.svg',
        description: 'Coffee Trading Alliance - объединение производителей кофе, использующих блокчейн для прозрачности поставок и справедливой торговли.',
        createdAt: new Date(2023, 1, 15)
      },
      {
        name: 'Belgrade Capital',
        symbol: 'BELCAP',
        decimals: 18,
        totalSupply: '1500000',
        circulationSupply: '720000',
        contractAddress: '0x3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t',
        logo: '/images/tokens/belcap.svg',
        description: 'Belgrade Capital - фонд для инвестиций в стартапы региона Балкан, с фокусом на технологические и финтех компании.',
        createdAt: new Date(2023, 2, 10)
      },
      {
        name: 'Arido Organic Farms',
        symbol: 'ARIDO',
        decimals: 18,
        totalSupply: '1200000',
        circulationSupply: '680000',
        contractAddress: '0x4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t',
        logo: '/images/tokens/arido.svg',
        description: 'Arido Organic Farms - сеть органических ферм, использующая блокчейн для подтверждения экологичности продукции.',
        createdAt: new Date(2023, 3, 5)
      },
      {
        name: 'Plexo Technologies',
        symbol: 'PLEXO',
        decimals: 18,
        totalSupply: '1000000',
        circulationSupply: '600000',
        contractAddress: '0x5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t',
        logo: '/images/tokens/plexo.svg',
        description: 'Plexo Technologies - компания, разрабатывающая программное обеспечение для интеграции блокчейна в бизнес-процессы.',
        createdAt: new Date(2023, 4, 20)
      }
    ];
  };
  
  return { tokens, loading, error };
} 