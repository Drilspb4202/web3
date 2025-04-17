// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MSPEToken.sol";

/**
 * @title TokenFactory
 * @dev Фабрика для создания токенов МСП с комиссией за создание.
 * @notice Позволяет МСП создавать свои токены за комиссию в AVAX
 */
contract TokenFactory is Ownable {
    /// @dev Комиссия в AVAX за создание токена
    uint256 public creationFee;
    
    /// @dev Массив адресов всех созданных токенов МСП
    address[] public mspeTokens;
    
    /// @dev Маппинг для проверки, является ли адрес токеном, созданным этой фабрикой
    mapping(address => bool) public isTokenCreatedByFactory;

    /**
     * @dev Событие генерируется при создании нового токена МСП
     * @param creator Адрес создателя токена
     * @param tokenAddress Адрес созданного токена
     * @param name Название токена
     * @param symbol Символ токена
     * @param initialSupply Начальное количество токенов
     */
    event MSPETokenCreated(
        address indexed creator, 
        address indexed tokenAddress, 
        string name, 
        string symbol, 
        uint256 initialSupply
    );

    /**
     * @dev Событие генерируется при изменении комиссии за создание токена
     * @param oldFee Предыдущее значение комиссии
     * @param newFee Новое значение комиссии
     */
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @dev Конструктор фабрики токенов
     * @param initialOwner Адрес начального владельца фабрики
     * @param initialFee Начальная комиссия за создание токена (в wei)
     */
    constructor(address initialOwner, uint256 initialFee) Ownable(initialOwner) {
        creationFee = initialFee;
    }

    /**
     * @dev Изменение комиссии за создание токена
     * @param newFee Новая комиссия в wei
     * @notice Может вызвать только владелец контракта
     */
    function setCreationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = newFee;
        emit CreationFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Создание нового токена МСП
     * @param name Название токена
     * @param symbol Символ токена
     * @param initialSupply Начальное количество токенов
     * @return tokenAddress Адрес созданного токена
     * @notice Требует отправки AVAX в соответствии с текущей комиссией
     */
    function createMSPEToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external payable returns (address tokenAddress) {
        require(msg.value >= creationFee, "Insufficient fee");

        // Создание нового токена МСП
        MSPEToken newToken = new MSPEToken(
            name,
            symbol,
            initialSupply,
            msg.sender
        );

        tokenAddress = address(newToken);
        
        // Добавление адреса токена в массив и маппинг
        mspeTokens.push(tokenAddress);
        isTokenCreatedByFactory[tokenAddress] = true;
        
        // Перевод комиссии владельцу контракта
        if (creationFee > 0) {
            (bool success, ) = owner().call{value: creationFee}("");
            require(success, "Fee transfer failed");
            
            // Возврат излишка, если был отправлен
            if (msg.value > creationFee) {
                (success, ) = msg.sender.call{value: msg.value - creationFee}("");
                require(success, "Refund transfer failed");
            }
        }
        
        emit MSPETokenCreated(msg.sender, tokenAddress, name, symbol, initialSupply);
        
        return tokenAddress;
    }

    /**
     * @dev Получение списка всех созданных токенов МСП
     * @return Массив адресов токенов
     */
    function getAllMSPETokens() external view returns (address[] memory) {
        return mspeTokens;
    }

    /**
     * @dev Получение количества созданных токенов МСП
     * @return Количество токенов
     */
    function getMSPETokenCount() external view returns (uint256) {
        return mspeTokens.length;
    }
} 