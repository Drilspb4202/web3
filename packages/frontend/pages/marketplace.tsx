import { useAccount } from 'wagmi';
import Layout from '@/components/Layout';
import WalletConnector from '@/components/WalletConnector';
import Marketplace from '@/components/Marketplace';

// Страница маркетплейса токенов МСП
export default function MarketplacePage() {
  const { isConnected } = useAccount();

  return (
    <Layout
      title="Маркетплейс токенов | Chihuahua Capital"
      description="Торговая площадка для покупки и продажи токенов малого и среднего бизнеса на Avalanche."
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Маркетплейс токенов МСП</h1>

      {!isConnected ? (
        <div className="mb-8">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">Требуется подключение кошелька</h2>
            <p className="text-yellow-700">
              Для работы с маркетплейсом необходимо подключить MetaMask кошелек. Подключите кошелек и убедитесь, что вы используете сеть Avalanche Fuji Testnet.
            </p>
          </div>
          
          <WalletConnector />
        </div>
      ) : (
        <Marketplace />
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">О маркетплейсе</h2>
          <p className="text-gray-600 mb-4">
            Маркетплейс Chihuahua Capital - это децентрализованная торговая площадка, где вы можете покупать и продавать токены МСП за нативную валюту AVAX.
          </p>
          <p className="text-gray-600">
            Все транзакции выполняются через смарт-контракты, что обеспечивает безопасность и прозрачность торговли. 
            Торговая комиссия составляет 1% и направляется на поддержку экосистемы Chihuahua Capital.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Как торговать</h2>
          <ol className="list-decimal pl-5 text-gray-600 space-y-2">
            <li><strong>Продажа токенов</strong> - Укажите адрес токена, количество и цену в AVAX. Затем подтвердите апрув и создание листинга.</li>
            <li><strong>Покупка токенов</strong> - Выберите интересующий токен из списка доступных, укажите количество для покупки и подтвердите транзакцию.</li>
            <li><strong>Отмена листинга</strong> - Если вы передумали продавать свои токены, вы можете отменить свой листинг в любое время.</li>
            <li><strong>Управление токенами</strong> - Для проверки баланса и управления купленными токенами используйте MetaMask или другие кошельки Ethereum.</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
} 