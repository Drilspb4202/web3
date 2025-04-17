import { useAccount } from 'wagmi';
import Layout from '@/components/Layout';
import WalletConnector from '@/components/WalletConnector';
import CreateMSPETokenForm from '@/components/CreateMSPETokenForm';

// Страница создания токена МСП
export default function CreateToken() {
  const { isConnected } = useAccount();

  return (
    <Layout title="Создать токен МСП | Chihuahua Capital" description="Создайте свой собственный токен для малого и среднего бизнеса на блокчейне Avalanche.">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Создание токена МСП</h1>
      
      {!isConnected ? (
        <div className="mb-8">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">Требуется подключение кошелька</h2>
            <p className="text-yellow-700">
              Для создания токена необходимо подключить MetaMask кошелек. Подключите кошелек и убедитесь, что вы используете сеть Avalanche Fuji Testnet.
            </p>
          </div>
          
          <WalletConnector />
        </div>
      ) : (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Заполните форму</h2>
            <p className="text-gray-600 mb-6">
              Укажите параметры вашего токена. После создания токен будет доступен для использования и торговли на маркетплейсе.
            </p>
            
            <CreateMSPETokenForm />
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 mb-3">Важная информация</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-2">
              <li>
                Для создания токена требуется оплата комиссии в AVAX. Убедитесь, что у вас достаточно AVAX на балансе.
              </li>
              <li>
                Созданный токен будет соответствовать стандарту ERC-20 и будет полностью контролироваться вами.
              </li>
              <li>
                Вы можете использовать токен для представления акций компании, баллов лояльности, товарных единиц и других активов.
              </li>
              <li>
                Помните, что все транзакции в блокчейне необратимы. Тщательно проверяйте параметры перед созданием токена.
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
} 