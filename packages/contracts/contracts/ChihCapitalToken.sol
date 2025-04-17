// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChihCapitalToken
 * @dev Токен проекта Chihuahua Capital, реализованный как ERC20 с владельцем
 * @notice Весь первоначальный supply минтится владельцу при деплое
 */
contract ChihCapitalToken is ERC20, Ownable {
    /**
     * @dev Конструктор токена ChihCapital
     * @param initialOwner Адрес начального владельца токена
     * @param totalSupply Общее количество токенов, которое будет создано
     */
    constructor(
        address initialOwner,
        uint256 totalSupply
    ) ERC20("Chihuahua Capital Token", "CHIH") Ownable(initialOwner) {
        _mint(initialOwner, totalSupply);
    }
} 