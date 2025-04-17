import { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import { BigNumber } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import TokenFactoryABI from '@/abis/TokenFactory.json';

/**
 * Хук для чтения данных из контракта TokenFactory
 * @returns объект с количеством токенов и их адресами
 */
export function useTokenFactoryRead() {
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Получаем общее количество созданных токенов
  const { data: tokenCount, isLoading, isError, refetch } = useContractRead({
    address: CONTRACT_ADDRESSES.TokenFactory as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: 'getTokenCount',
    watch: true,
  });

  // При изменении количества токенов получаем их адреса
  useEffect(() => {
    const fetchTokenAddresses = async () => {
      if (!tokenCount || tokenCount.eq(BigNumber.from(0))) {
        setTokenAddresses([]);
        return;
      }

      try {
        const addresses: string[] = [];
        
        // Запрашиваем адрес каждого токена
        for (let i = 0; i < tokenCount.toNumber(); i++) {
          const { data: tokenAddress } = await useContractRead({
            address: CONTRACT_ADDRESSES.TokenFactory as `0x${string}`,
            abi: TokenFactoryABI,
            functionName: 'getTokenAtIndex',
            args: [i],
          });

          if (tokenAddress) {
            addresses.push(tokenAddress as string);
          }
        }

        setTokenAddresses(addresses);
        setError(null);
      } catch (err) {
        console.error('Ошибка при чтении адресов токенов:', err);
        setError(err as Error);
      }
    };

    fetchTokenAddresses();
  }, [tokenCount]);

  return {
    tokenCount: tokenCount as BigNumber,
    tokenAddresses,
    isLoading,
    isError,
    error,
    refetch,
  };
} 