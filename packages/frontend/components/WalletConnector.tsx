import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork, useBalance } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { AVALANCHE_FUJI } from '@/config/wagmi';
import { formatEther } from 'ethers/lib/utils';

/**
 * Компонент для подключения/отключения кошелька, отображения адреса и баланса AVAX,
 * с обработкой смены сети/аккаунта
 */
const WalletConnector = () => {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { data: balanceData } = useBalance({
    address,
    watch: true,
  });

  // Решение проблемы гидратации Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // Проверка сети и переключение при необходимости
  useEffect(() => {
    if (isConnected && chain?.id !== AVALANCHE_FUJI.id && switchNetwork) {
      switchNetwork(AVALANCHE_FUJI.id);
    }
  }, [isConnected, chain, switchNetwork]);

  // Функция подключения MetaMask
  const handleConnect = async () => {
    try {
      // Проверяем, доступен ли MetaMask
      if (typeof window !== 'undefined' && window.ethereum) {
        const connector = new MetaMaskConnector();
        await connect({ connector });
      } else {
        alert('MetaMask не установлен. Пожалуйста, установите расширение MetaMask и обновите страницу.');
      }
    } catch (error) {
      console.error('Ошибка подключения:', error);
    }
  };

  // Обрезка адреса для отображения
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Если компонент не смонтирован, не рендерим ничего
  if (!mounted) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-white rounded-lg shadow-md">
      {isConnected ? (
        <>
          <div className="flex flex-col items-center sm:items-start">
            <div className="text-sm text-gray-500">Подключенный адрес</div>
            <div className="font-medium">{formatAddress(address!)}</div>
          </div>
          
          <div className="flex flex-col items-center sm:items-start mx-4">
            <div className="text-sm text-gray-500">Баланс AVAX</div>
            <div className="font-medium">
              {balanceData ? parseFloat(formatEther(balanceData.value)).toFixed(4) : '0'} AVAX
            </div>
          </div>
          
          <div className="flex flex-col items-center sm:items-start">
            <div className="text-sm text-gray-500">Сеть</div>
            <div className="font-medium">
              {chain?.id === AVALANCHE_FUJI.id ? (
                <span className="text-green-600">Avalanche Fuji</span>
              ) : (
                <span className="text-red-600">Неправильная сеть</span>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => disconnect()} 
            className="btn-outline mt-2 sm:mt-0 sm:ml-auto"
          >
            Отключить
          </button>
        </>
      ) : (
        <div className="w-full flex flex-col items-center">
          <button onClick={handleConnect} className="btn-primary w-full sm:w-auto">
            Подключить кошелек
          </button>
          
          {connectError && (
            <div className="text-red-500 text-sm mt-2">
              Ошибка подключения: {connectError.message}
            </div>
          )}
          
          <div className="text-sm mt-2 text-gray-500">
            Для использования приложения требуется MetaMask
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnector; 