import { useState } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { BigNumber, ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import ChihStakingPoolABI from '@/abis/ChihStakingPool.json';
import ChihCapitalTokenABI from '@/abis/ChihCapitalToken.json';

const StakingForm = () => {
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const { address, isConnected } = useAccount();

  // Чтение данных из контракта стейкинга
  const { data: stakedBalance } = useContractRead({
    address: CONTRACT_ADDRESSES.ChihStakingPool as `0x${string}`,
    abi: ChihStakingPoolABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected && !!address,
    watch: true,
  });

  const { data: rewards } = useContractRead({
    address: CONTRACT_ADDRESSES.ChihStakingPool as `0x${string}`,
    abi: ChihStakingPoolABI,
    functionName: 'earned',
    args: [address],
    enabled: isConnected && !!address,
    watch: true,
  });

  const { data: totalStaked } = useContractRead({
    address: CONTRACT_ADDRESSES.ChihStakingPool as `0x${string}`,
    abi: ChihStakingPoolABI,
    functionName: 'totalSupply',
    watch: true,
  });

  const { data: rewardRate } = useContractRead({
    address: CONTRACT_ADDRESSES.ChihStakingPool as `0x${string}`,
    abi: ChihStakingPoolABI,
    functionName: 'rewardRate',
    watch: true,
  });

  // Чтение баланса токенов CHIH
  const { data: tokenBalance } = useContractRead({
    address: CONTRACT_ADDRESSES.ChihCapitalToken as `0x${string}`,
    abi: ChihCapitalTokenABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected && !!address,
    watch: true,
  });

  // Чтение одобрения (allowance) для стейкинг-контракта
  const { data: allowance } = useContractRead({
    address: CONTRACT_ADDRESSES.ChihCapitalToken as `0x${string}`,
    abi: ChihCapitalTokenABI,
    functionName: 'allowance',
    args: [address, CONTRACT_ADDRESSES.ChihStakingPool],
    enabled: isConnected && !!address,
    watch: true,
  });

  // Апрув токенов
  const { 
    write: approveTokens, 
    data: approveData,
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
    error: approveError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.ChihCapitalToken as `0x${string}`,
    abi: ChihCapitalTokenABI,
    functionName: 'approve',
  });

  // Ожидание транзакции апрува
  const { isLoading: isApproveWaiting } = useWaitForTransaction({
    hash: approveData?.hash,
    onSuccess: () => {
      setIsApproving(false);
    },
  });

  // Стейкинг токенов
  const { 
    write: stakeTokens, 
    data: stakeData,
    isLoading: isStakeLoading,
    isSuccess: isStakeSuccess,
    isError: isStakeError,
    error: stakeError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.ChihStakingPool as `0x${string}`,
    abi: ChihStakingPoolABI,
    functionName: 'stake',
  });

  // Ожидание транзакции стейкинга
  const { isLoading: isStakeWaiting } = useWaitForTransaction({
    hash: stakeData?.hash,
    onSuccess: () => {
      setAmount('');
    },
  });

  // Сбор наград
  const { 
    write: claimRewards, 
    data: claimData,
    isLoading: isClaimLoading,
    isSuccess: isClaimSuccess,
    isError: isClaimError,
    error: claimError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.ChihStakingPool as `0x${string}`,
    abi: ChihStakingPoolABI,
    functionName: 'getReward',
  });

  // Ожидание транзакции сбора наград
  const { isLoading: isClaimWaiting } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  // Unstake токенов
  const { 
    write: unstakeTokens, 
    data: unstakeData,
    isLoading: isUnstakeLoading,
    isSuccess: isUnstakeSuccess,
    isError: isUnstakeError,
    error: unstakeError
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.ChihStakingPool as `0x${string}`,
    abi: ChihStakingPoolABI,
    functionName: 'withdraw',
  });

  // Ожидание транзакции unstake
  const { isLoading: isUnstakeWaiting } = useWaitForTransaction({
    hash: unstakeData?.hash,
  });

  // Обработчики действий
  const handleApprove = () => {
    if (!amount || !address) return;
    
    setIsApproving(true);
    const amountInWei = ethers.utils.parseEther(amount);
    
    approveTokens({
      args: [CONTRACT_ADDRESSES.ChihStakingPool, amountInWei],
    });
  };

  const handleStake = () => {
    if (!amount) return;
    
    const amountInWei = ethers.utils.parseEther(amount);
    
    stakeTokens({
      args: [amountInWei],
    });
  };

  const handleUnstake = () => {
    if (!stakedBalance || (stakedBalance as BigNumber).eq(0)) return;
    
    unstakeTokens({
      args: [stakedBalance],
    });
  };

  const handleClaim = () => {
    if (!rewards || (rewards as BigNumber).eq(0)) return;
    
    claimRewards();
  };

  // Форматирование BigNumber для отображения
  const formatBigNumber = (value: any, decimals = 18) => {
    if (!value) return '0';
    return parseFloat(ethers.utils.formatUnits(value, decimals)).toFixed(2);
  };

  // Расчет годовой процентной ставки (APR)
  const calculateApr = () => {
    if (!rewardRate || !totalStaked || (totalStaked as BigNumber).eq(0)) return '0';
    
    // RewardRate - это количество токенов, выдаваемых в секунду
    const annualRewards = (rewardRate as BigNumber).mul(60 * 60 * 24 * 365);
    const apr = annualRewards.mul(100).div(totalStaked as BigNumber);
    
    return formatBigNumber(apr, 0);
  };

  // Проверка, нужно ли сделать апрув перед стейкингом
  const needsApproval = () => {
    if (!amount || !allowance) return false;
    
    const amountInWei = ethers.utils.parseEther(amount);
    return (allowance as BigNumber).lt(amountInWei);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Стейкинг CHIH токенов</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Статистика</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Всего застейкано:</span>
              <span className="font-medium">{formatBigNumber(totalStaked)} CHIH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Годовая доходность (APR):</span>
              <span className="font-medium text-green-600">{calculateApr()}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ваш баланс:</span>
              <span className="font-medium">{formatBigNumber(tokenBalance)} CHIH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Застейкано вами:</span>
              <span className="font-medium">{formatBigNumber(stakedBalance)} CHIH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Доступно к получению:</span>
              <span className="font-medium text-green-600">{formatBigNumber(rewards)} CHIH</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Стейкинг</h3>
          
          <div className="mb-4">
            <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Количество CHIH для стейкинга
            </label>
            <input
              type="number"
              id="stakeAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="0.0"
              min="0"
              step="0.01"
              disabled={!isConnected || isApproving || isApproveWaiting || isStakeWaiting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Доступно: {formatBigNumber(tokenBalance)} CHIH
            </p>
          </div>
          
          <div className="space-y-3">
            {needsApproval() && (
              <button
                onClick={handleApprove}
                disabled={!isConnected || !amount || isApproveLoading || isApproveWaiting}
                className="btn-secondary w-full"
              >
                {isApproveLoading || isApproveWaiting ? 'Подтвердите в MetaMask...' : 'Апрувнуть токены'}
              </button>
            )}
            
            <button
              onClick={handleStake}
              disabled={!isConnected || !amount || needsApproval() || isStakeLoading || isStakeWaiting}
              className="btn-primary w-full"
            >
              {isStakeLoading || isStakeWaiting ? 'Подтвердите в MetaMask...' : 'Стейкнуть токены'}
            </button>
            
            <button
              onClick={handleClaim}
              disabled={!isConnected || !rewards || (rewards as BigNumber)?.eq(0) || isClaimLoading || isClaimWaiting}
              className="btn-secondary w-full"
            >
              {isClaimLoading || isClaimWaiting ? 'Подтвердите в MetaMask...' : 'Получить награды'}
            </button>
            
            <button
              onClick={handleUnstake}
              disabled={!isConnected || !stakedBalance || (stakedBalance as BigNumber)?.eq(0) || isUnstakeLoading || isUnstakeWaiting}
              className="btn-outline w-full"
            >
              {isUnstakeLoading || isUnstakeWaiting ? 'Подтвердите в MetaMask...' : 'Анстейкнуть все токены'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Как это работает</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>Стейкинг токенов CHIH позволяет получать пассивный доход</li>
          <li>Награды начисляются каждую секунду и зависят от количества застейканных токенов</li>
          <li>Для стейкинга необходимо сначала одобрить использование токенов ("апрувнуть")</li>
          <li>После апрува можно застейкать токены и начать получать награды</li>
          <li>Собирать награды можно в любое время без необходимости анстейкать токены</li>
        </ul>
      </div>

      {/* Отображение ошибок */}
      {(isApproveError || isStakeError || isClaimError || isUnstakeError) && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          <p className="font-medium">Произошла ошибка:</p>
          <p>{approveError?.message || stakeError?.message || claimError?.message || unstakeError?.message}</p>
        </div>
      )}
      
      {/* Отображение успешных операций */}
      {(isApproveSuccess || isStakeSuccess || isClaimSuccess || isUnstakeSuccess) && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
          <p className="font-medium">Успешно!</p>
          {isApproveSuccess && <p>Токены успешно апрувнуты для стейкинга.</p>}
          {isStakeSuccess && <p>Токены успешно застейканы.</p>}
          {isClaimSuccess && <p>Награды успешно получены.</p>}
          {isUnstakeSuccess && <p>Токены успешно выведены из стейкинга.</p>}
        </div>
      )}
    </div>
  );
};

export default StakingForm; 