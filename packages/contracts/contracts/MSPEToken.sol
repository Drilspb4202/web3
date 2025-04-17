// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MSPEToken
 * @dev Токен малых и средних предприятий (МСП), реализованный как ERC20 с владельцем
 * @notice Используется как шаблон для создания токенов МСП через TokenFactory
 */
contract MSPEToken is ERC20, Ownable {
    /**
     * @dev Конструктор токена МСП
     * @param name_ Название токена
     * @param symbol_ Символ токена
     * @param initialSupply Начальное количество токенов, которое будет создано
     * @param owner_ Адрес владельца токена (обычно адрес МСП)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        address owner_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        _mint(owner_, initialSupply);
    }
} 