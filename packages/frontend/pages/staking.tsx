import { useAccount } from 'wagmi';
import Layout from '@/components/Layout';
import WalletConnector from '@/components/WalletConnector';
import StakingForm from '@/components/StakingForm';

// Страница стейкинга токенов
export default function Staking() {
  const { isConnected } = useAccount();

  return (
    <Layout 
      title="Стейкинг CHIH | Chihuahua Capital" 
      description="Стейкинг токенов CHIH для получения пассивного дохода на платформе Chihuahua Capital."
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Стейкинг CHIH токенов</h1>
      
      {!isConnected ? (
        <div className="mb-8">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">Требуется подключение кошелька</h2>
            <p className="text-yellow-700">
              Для стейкинга необходимо подключить MetaMask кошелек. Подключите кошелек и убедитесь, что вы используете сеть Avalanche Fuji Testnet.
            </p>
          </div>
          
          <WalletConnector />
        </div>
      ) : (
        <StakingForm />
      )}
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Что такое стейкинг?</h2>
          <p className="text-gray-600 mb-4">
            Стейкинг - это процесс блокировки ваших криптовалютных активов для получения пассивного дохода. 
            Застейканные токены CHIH приносят регулярные вознаграждения.
          </p>
          <p className="text-gray-600">
            В отличие от майнинга, стейкинг не требует специального оборудования или значительных энергозатрат, 
            что делает его экологически чистым способом получения дохода.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Преимущества стейкинга CHIH</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Получение пассивного дохода в виде вознаграждений CHIH</li>
            <li>Низкий порог входа - можно начать со стейкинга небольшой суммы</li>
            <li>Поддержка ликвидности и стабильности экосистемы Chihuahua Capital</li>
            <li>Возможность участия в управлении платформой (в будущих обновлениях)</li>
            <li>Гибкость - вы можете снять свои токены в любой момент</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 