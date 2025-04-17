import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, formatEther } from 'ethers/lib/utils';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import TokenFactoryABI from '@/abis/TokenFactory.json';
import { useTokenFactoryRead } from '@/hooks/useTokenFactoryRead';

/**
 * Компонент формы для создания токена МСП
 */
const CreateMSPETokenForm = () => {
  // Состояние формы
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  
  // Получение комиссии за создание токена
  const { creationFee } = useTokenFactoryRead();
  
  // Подготовка транзакции
  const { config, error: prepareError } = usePrepareContractWrite({
    address: CONTRACT_ADDRESSES.TokenFactory as `0x${string}`,
    abi: TokenFactoryABI,
    functionName: 'createMSPEToken',
    args: [name, symbol, parseEther(initialSupply || '0')],
    enabled: Boolean(name && symbol && initialSupply && parseFloat(initialSupply) > 0),
    value: creationFee,
  });
  
  // Хук для отправки транзакции
  const { data, error, write } = useContractWrite(config);
  
  // Хук для отслеживания статуса транзакции
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (write) {
      write();
    }
  };

  // Проверка валидности формы
  const isFormValid = Boolean(
    name && 
    symbol && 
    initialSupply && 
    parseFloat(initialSupply) > 0 && 
    !prepareError && 
    write
  );

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Создать токен МСП</h2>
      
      {creationFee && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md text-blue-700">
          <p className="text-sm">
            Комиссия за создание: <span className="font-semibold">{formatEther(creationFee)} AVAX</span>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Название токена
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: My Small Business Token"
            className="input"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
            Символ токена
          </label>
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Например: MSBT"
            className="input"
            maxLength={8}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Символ токена - это короткий идентификатор (обычно 3-5 букв)
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="initialSupply" className="block text-sm font-medium text-gray-700 mb-1">
            Начальное количество токенов
          </label>
          <input
            id="initialSupply"
            type="number"
            value={initialSupply}
            onChange={(e) => setInitialSupply(e.target.value)}
            placeholder="Например: 1000000"
            className="input"
            step="any"
            min="0"
            required
          />
        </div>
        
        {prepareError && (
          <div className="mb-4 p-3 bg-red-50 rounded-md text-red-700">
            <p className="text-sm">Ошибка: {prepareError.message}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-md text-red-700">
            <p className="text-sm">Ошибка транзакции: {error.message}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full btn-primary ${(!isFormValid || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Создание токена...' : 'Создать токен'}
        </button>
        
        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 rounded-md text-green-700">
            <p className="font-medium">Токен успешно создан!</p>
            <p className="text-sm mt-1">
              Хэш транзакции:{' '}
              <a
                href={`https://testnet.snowtrace.io/tx/${data?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {data?.hash}
              </a>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateMSPETokenForm; 