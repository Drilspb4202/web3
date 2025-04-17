// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChihStakingPool
 * @dev Пул для стейкинга токенов ChihCapital с начислением наград
 * @notice Пользователи могут стейкать токены и получать награды, основанные на rewardRate
 */
contract ChihStakingPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @dev Адрес токена ChihCapital
    IERC20 public immutable stakingToken;

    /// @dev Скорость начисления наград (wei в секунду на 1 стейкнутый токен)
    uint256 public rewardRate;

    /// @dev Временная метка последнего обновления наград
    uint256 public lastUpdateTime;

    /// @dev Накопленные награды на единицу стейка
    uint256 public rewardPerTokenStored;

    /// @dev Общее количество стейкнутых токенов
    uint256 public totalStaked;

    /// @dev Маппинг для хранения наград пользователей
    mapping(address => uint256) public userRewardPerTokenPaid;
    
    /// @dev Маппинг для хранения заработанных, но не полученных наград пользователей
    mapping(address => uint256) public rewards;
    
    /// @dev Маппинг для хранения стейкнутых пользователями токенов
    mapping(address => uint256) public balanceOf;

    /**
     * @dev Событие генерируется при стейкинге токенов
     * @param user Адрес пользователя
     * @param amount Количество стейкнутых токенов
     */
    event Staked(address indexed user, uint256 amount);
    
    /**
     * @dev Событие генерируется при анстейкинге токенов
     * @param user Адрес пользователя
     * @param amount Количество анстейкнутых токенов
     */
    event Withdrawn(address indexed user, uint256 amount);
    
    /**
     * @dev Событие генерируется при получении наград
     * @param user Адрес пользователя
     * @param reward Количество полученных наград
     */
    event RewardPaid(address indexed user, uint256 reward);
    
    /**
     * @dev Событие генерируется при изменении скорости начисления наград
     * @param oldRate Предыдущая скорость
     * @param newRate Новая скорость
     */
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);

    /**
     * @dev Конструктор стейкинг-пула
     * @param _stakingToken Адрес токена ChihCapital
     * @param initialOwner Адрес начального владельца пула
     * @param initialRewardRate Начальная скорость начисления наград
     */
    constructor(
        address _stakingToken,
        address initialOwner,
        uint256 initialRewardRate
    ) Ownable(initialOwner) {
        stakingToken = IERC20(_stakingToken);
        rewardRate = initialRewardRate;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Модификатор для обновления наград пользователя
     * @param account Адрес пользователя
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @dev Расчет накопленных наград на единицу стейка
     * @return Накопленные награды на единицу стейка
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        
        return rewardPerTokenStored + (
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked
        );
    }

    /**
     * @dev Расчет заработанных пользователем наград
     * @param account Адрес пользователя
     * @return Заработанные награды
     */
    function earned(address account) public view returns (uint256) {
        return (
            (balanceOf[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18
        ) + rewards[account];
    }

    /**
     * @dev Стейкинг токенов
     * @param amount Количество токенов для стейкинга
     * @notice Требует предварительного одобрения перевода токенов контракту
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        totalStaked += amount;
        balanceOf[msg.sender] += amount;
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Анстейкинг токенов
     * @param amount Количество токенов для анстейкинга
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balanceOf[msg.sender] >= amount, "Not enough staked tokens");
        
        totalStaked -= amount;
        balanceOf[msg.sender] -= amount;
        
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Получение заработанных наград
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            stakingToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /**
     * @dev Анстейкинг всех токенов и получение наград
     */
    function exit() external {
        unstake(balanceOf[msg.sender]);
        claimRewards();
    }

    /**
     * @dev Изменение скорости начисления наград
     * @param _rewardRate Новая скорость
     * @notice Может вызвать только владелец контракта
     */
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        uint256 oldRate = rewardRate;
        rewardRate = _rewardRate;
        emit RewardRateUpdated(oldRate, _rewardRate);
    }

    /**
     * @dev Получение общего количества стейкнутых токенов
     * @return Общее количество стейкнутых токенов
     */
    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }

    /**
     * @dev Получение текущей награды пользователя
     * @param account Адрес пользователя
     * @return Текущая награда
     */
    function getReward(address account) external view returns (uint256) {
        return earned(account);
    }
} 