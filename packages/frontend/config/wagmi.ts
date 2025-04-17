import { configureChains, createConfig } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';

// Настройка цепей
const { chains, publicClient } = configureChains(
  [avalancheFuji],
  [publicProvider()]
);

// Создание конфигурации
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
});

// Информация о сети Avalanche Fuji
export const AVALANCHE_FUJI = {
  id: avalancheFuji.id,
  name: avalancheFuji.name,
  network: avalancheFuji.network,
  nativeCurrency: avalancheFuji.nativeCurrency,
  rpcUrls: avalancheFuji.rpcUrls,
  blockExplorers: avalancheFuji.blockExplorers,
};

// Адреса контрактов - будут заменены после деплоя
export const CONTRACT_ADDRESSES = {
  ChihCapitalToken: '',
  TokenFactory: '',
  ChihStakingPool: '',
  SimpleMarketplace: '',
};

// Функция для обновления адресов из деплоя
export const updateContractAddresses = (addresses: {
  ChihCapitalToken: string;
  TokenFactory: string;
  ChihStakingPool: string;
  SimpleMarketplace: string;
}) => {
  Object.assign(CONTRACT_ADDRESSES, addresses);
}; 