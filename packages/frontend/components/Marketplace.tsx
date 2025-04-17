import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { BigNumber, ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import SimpleMarketplaceABI from '@/abis/SimpleMarketplace.json';
import MSPETokenABI from '@/abis/MSPEToken.json';

interface TokenListing {
  tokenAddress: string;
  seller: string;
  price: BigNumber;
  amount: BigNumber;
  id: BigNumber;
  name?: string;
  symbol?: string;
}

const Marketplace = () => {
  const [listings, setListings] = useState<TokenListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellTokenAddress, setSellTokenAddress] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [selectedListing, setSelectedListing] = useState<TokenListing | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<{[key: string]: {name: string, symbol: string}}>({}); 
  const { address, isConnected } = useAccount();

  // Получаем общее количество листингов
  const { data: listingCount } = useContractRead({
    address: CONTRACT_ADDRESSES.SimpleMarketplace as `0x${string}`,
    abi: SimpleMarketplaceABI,
    functionName: 'getListingCount',
    watch: true,
  });

  // Используем Contract Write для создания листинга
  const { 
    write: createListing, 
    data: createListingData,
    isLoading: isCreateLoading,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
    error: createError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.SimpleMarketplace as `0x${string}`,
    abi: SimpleMarketplaceABI,
    functionName: 'createListing',
  });

  // Ожидание транзакции создания листинга
  const { isLoading: isCreateWaiting } = useWaitForTransaction({
    hash: createListingData?.hash,
    onSuccess: () => {
      setSellAmount('');
      setSellPrice('');
      setSellTokenAddress('');
      // Обновляем список листингов
      fetchListings();
    },
  });

  // Используем Contract Write для покупки токенов
  const { 
    write: buyTokens, 
    data: buyData,
    isLoading: isBuyLoading,
    isSuccess: isBuySuccess,
    isError: isBuyError,
    error: buyError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.SimpleMarketplace as `0x${string}`,
    abi: SimpleMarketplaceABI,
    functionName: 'buyTokens',
  });

  // Ожидание транзакции покупки
  const { isLoading: isBuyWaiting } = useWaitForTransaction({
    hash: buyData?.hash,
    onSuccess: () => {
      setBuyAmount('');
      setSelectedListing(null);
      // Обновляем список листингов
      fetchListings();
    },
  });

  // Используем Contract Write для апрува токенов перед продажей
  const { 
    write: approveTokens, 
    data: approveData,
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess,
    error: approveError
  } = useContractWrite({
    abi: MSPETokenABI,
    functionName: 'approve',
  });

  // Ожидание транзакции апрува
  const { isLoading: isApproveWaiting } = useWaitForTransaction({
    hash: approveData?.hash,
  });

  // Используем Contract Write для отмены листинга
  const { 
    write: cancelListing, 
    data: cancelData,
    isLoading: isCancelLoading,
    isSuccess: isCancelSuccess,
    error: cancelError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.SimpleMarketplace as `0x${string}`,
    abi: SimpleMarketplaceABI,
    functionName: 'cancelListing',
  });

  // Ожидание транзакции отмены
  const { isLoading: isCancelWaiting } = useWaitForTransaction({
    hash: cancelData?.hash,
    onSuccess: () => {
      // Обновляем список листингов
      fetchListings();
    },
  });

  // Функция для получения данных всех листингов
  const fetchListings = async () => {
    if (!listingCount) return;
    
    setLoading(true);
    const newListings: TokenListing[] = [];
    
    for (let i = 0; i < listingCount.toNumber(); i++) {
      try {
        const result = await getListingById(BigNumber.from(i));
        if (result) {
          newListings.push({
            ...result,
            id: BigNumber.from(i)
          });
          
          // Получаем метаданные токена, если их еще нет
          if (!tokenMetadata[result.tokenAddress]) {
            fetchTokenMetadata(result.tokenAddress);
          }
        }
      } catch (error) {
        console.error(`Ошибка при получении листинга ${i}:`, error);
      }
    }
    
    setListings(newListings);
    setLoading(false);
  };

  // Получаем данные о листинге по ID
  const getListingById = async (id: BigNumber) => {
    try {
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: CONTRACT_ADDRESSES.SimpleMarketplace,
          data: ethers.utils.defaultAbiCoder.encode(
            ['function getListing(uint256)'],
            [id.toHexString()]
          )
        }, 'latest']
      });
      
      const decoded = ethers.utils.defaultAbiCoder.decode(
        ['address', 'address', 'uint256', 'uint256'],
        result
      );
      
      return {
        tokenAddress: decoded[0],
        seller: decoded[1],
        price: BigNumber.from(decoded[2]),
        amount: BigNumber.from(decoded[3])
      };
    } catch (error) {
      console.error(`Ошибка при получении листинга ${id}:`, error);
      return null;
    }
  };

  // Получаем метаданные токена (имя, символ)
  const fetchTokenMetadata = async (tokenAddress: string) => {
    try {
      const nameResult = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: ethers.utils.id('name()').slice(0, 10)
        }, 'latest']
      });
      
      const symbolResult = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: ethers.utils.id('symbol()').slice(0, 10)
        }, 'latest']
      });
      
      const name = ethers.utils.parseBytes32String(nameResult);
      const symbol = ethers.utils.parseBytes32String(symbolResult);
      
      setTokenMetadata(prev => ({
        ...prev,
        [tokenAddress]: { name, symbol }
      }));
    } catch (error) {
      console.error(`Ошибка при получении метаданных токена ${tokenAddress}:`, error);
      
      // Попытка другого способа декодирования (если токены используют string вместо bytes32)
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const tokenContract = new ethers.Contract(tokenAddress, MSPETokenABI, provider);
        
        const name = await tokenContract.name();
        const symbol = await tokenContract.symbol();
        
        setTokenMetadata(prev => ({
          ...prev,
          [tokenAddress]: { name, symbol }
        }));
      } catch (innerError) {
        console.error(`Вторая попытка получения метаданных токена ${tokenAddress} также не удалась:`, innerError);
      }
    }
  };

  // Обработчик создания листинга
  const handleCreateListing = async () => {
    if (!sellTokenAddress || !sellAmount || !sellPrice || !isConnected) return;
    
    try {
      // Сначала делаем апрув токенов для маркетплейса
      const amountInWei = ethers.utils.parseEther(sellAmount);
      
      approveTokens({
        address: sellTokenAddress as `0x${string}`,
        args: [
          CONTRACT_ADDRESSES.SimpleMarketplace,
          amountInWei
        ],
        onSuccess: () => {
          // После успешного апрува создаем листинг
          const priceInWei = ethers.utils.parseEther(sellPrice);
          
          createListing({
            args: [
              sellTokenAddress,
              amountInWei,
              priceInWei
            ]
          });
        }
      });
    } catch (error) {
      console.error('Ошибка при создании листинга:', error);
    }
  };

  // Обработчик покупки токенов
  const handleBuyTokens = () => {
    if (!selectedListing || !buyAmount || !isConnected) return;
    
    const amountToBuy = ethers.utils.parseEther(buyAmount);
    const totalCost = amountToBuy.mul(selectedListing.price).div(ethers.utils.parseEther('1'));
    
    buyTokens({
      args: [selectedListing.id, amountToBuy],
      overrides: {
        value: totalCost
      }
    });
  };

  // Обработчик отмены листинга
  const handleCancelListing = (listingId: BigNumber) => {
    if (!isConnected) return;
    
    cancelListing({
      args: [listingId]
    });
  };

  // Форматирование BigNumber для отображения
  const formatBigNumber = (value: BigNumber, decimals = 18) => {
    if (!value) return '0';
    return parseFloat(ethers.utils.formatUnits(value, decimals)).toFixed(6);
  };

  // Загружаем листинги при изменении счетчика
  useEffect(() => {
    if (listingCount) {
      fetchListings();
    }
  }, [listingCount]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Маркетплейс токенов МСП</h2>
      
      {/* Форма для создания листинга */}
      <div className="mb-8 bg-gray-50 p-5 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Продать токены</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Адрес токена
            </label>
            <input 
              type="text" 
              value={sellTokenAddress}
              onChange={(e) => setSellTokenAddress(e.target.value)}
              className="input"
              placeholder="0x..."
              disabled={isApproveLoading || isApproveWaiting || isCreateLoading || isCreateWaiting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Количество
            </label>
            <input 
              type="number" 
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="input"
              placeholder="0.0"
              min="0"
              step="0.01"
              disabled={isApproveLoading || isApproveWaiting || isCreateLoading || isCreateWaiting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цена за токен (AVAX)
            </label>
            <input 
              type="number" 
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="input"
              placeholder="0.0"
              min="0"
              step="0.001"
              disabled={isApproveLoading || isApproveWaiting || isCreateLoading || isCreateWaiting}
            />
          </div>
        </div>
        
        <button 
          onClick={handleCreateListing}
          disabled={!isConnected || !sellTokenAddress || !sellAmount || !sellPrice || isApproveLoading || isApproveWaiting || isCreateLoading || isCreateWaiting}
          className="btn-primary"
        >
          {isApproveLoading || isApproveWaiting ? 'Подтвердите апрув в MetaMask...' : 
           isCreateLoading || isCreateWaiting ? 'Подтвердите листинг в MetaMask...' : 'Создать листинг'}
        </button>
      </div>
      
      {/* Спискок листингов */}
      <div>
        <h3 className="text-lg font-medium mb-4">Доступные токены</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Загрузка листингов...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Пока нет доступных листингов.</p>
            <p className="text-gray-500 text-sm mt-2">Создайте первый листинг, чтобы начать торговлю.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Токен</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Количество</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена за токен</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Продавец</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tokenMetadata[listing.tokenAddress] ? 
                          `${tokenMetadata[listing.tokenAddress].name} (${tokenMetadata[listing.tokenAddress].symbol})` : 
                          `${listing.tokenAddress.slice(0, 6)}...${listing.tokenAddress.slice(-4)}`}
                      </div>
                      <div className="text-xs text-gray-500">{listing.tokenAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatBigNumber(listing.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatBigNumber(listing.price)} AVAX</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {listing.seller === address ? 'Вы' : `${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {listing.seller === address ? (
                        <button 
                          onClick={() => handleCancelListing(listing.id)}
                          disabled={isCancelLoading || isCancelWaiting}
                          className="text-red-600 hover:text-red-800 mr-2 text-sm"
                        >
                          {isCancelLoading || isCancelWaiting ? 'Отмена...' : 'Отменить'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedListing(listing)}
                          className="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          Купить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Модальное окно для покупки */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Купить токены</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Токен: {tokenMetadata[selectedListing.tokenAddress] ? 
                  `${tokenMetadata[selectedListing.tokenAddress].name} (${tokenMetadata[selectedListing.tokenAddress].symbol})` : 
                  selectedListing.tokenAddress}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Доступно: {formatBigNumber(selectedListing.amount)}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Цена за токен: {formatBigNumber(selectedListing.price)} AVAX
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество для покупки
              </label>
              <input 
                type="number" 
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="input mb-2"
                placeholder="0.0"
                min="0"
                max={formatBigNumber(selectedListing.amount)}
                step="0.01"
                disabled={isBuyLoading || isBuyWaiting}
              />
              
              {buyAmount && (
                <p className="text-sm text-gray-500">
                  Итого к оплате: {(parseFloat(buyAmount) * parseFloat(formatBigNumber(selectedListing.price))).toFixed(6)} AVAX
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedListing(null)}
                className="btn-outline"
                disabled={isBuyLoading || isBuyWaiting}
              >
                Отмена
              </button>
              <button 
                onClick={handleBuyTokens}
                disabled={!buyAmount || isBuyLoading || isBuyWaiting || parseFloat(buyAmount) <= 0}
                className="btn-primary"
              >
                {isBuyLoading || isBuyWaiting ? 'Подтвердите в MetaMask...' : 'Купить'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Отображение ошибок и успешных операций */}
      {(isCreateError || isBuyError) && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Произошла ошибка:</p>
          <p>{createError?.message || buyError?.message}</p>
        </div>
      )}
      
      {(isCreateSuccess || isBuySuccess || isCancelSuccess) && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          <p className="font-medium">Успешно!</p>
          {isCreateSuccess && <p>Листинг успешно создан.</p>}
          {isBuySuccess && <p>Токены успешно куплены.</p>}
          {isCancelSuccess && <p>Листинг успешно отменен.</p>}
        </div>
      )}
    </div>
  );
};

export default Marketplace; 