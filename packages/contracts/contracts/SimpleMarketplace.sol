// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleMarketplace
 * @dev Простой маркетплейс для продажи токенов МСП за AVAX
 * @notice Пользователи могут листить свои токены МСП на продажу за AVAX
 */
contract SimpleMarketplace is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @dev Структура для хранения информации о лоте
    struct Listing {
        address seller;
        address tokenContract;
        uint256 amount;
        uint256 price; // Цена в AVAX (wei)
        bool active;
    }

    /// @dev Комиссия платформы (в базисных пунктах, 100 = 1%)
    uint256 public platformFee = 250; // 2.5% по умолчанию

    /// @dev Максимальная комиссия (в базисных пунктах)
    uint256 public constant MAX_FEE = 1000; // Максимум 10%

    /// @dev Массив всех лотов
    Listing[] public listings;

    /**
     * @dev Событие генерируется при выставлении токена на продажу
     * @param listingId ID выставленного лота
     * @param seller Адрес продавца
     * @param tokenContract Адрес контракта токена
     * @param amount Количество токенов
     * @param price Цена в AVAX (wei)
     */
    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        address tokenContract,
        uint256 amount,
        uint256 price
    );

    /**
     * @dev Событие генерируется при продаже токена
     * @param listingId ID проданного лота
     * @param buyer Адрес покупателя
     * @param seller Адрес продавца
     * @param tokenContract Адрес контракта токена
     * @param amount Количество токенов
     * @param price Цена в AVAX (wei)
     */
    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        address tokenContract,
        uint256 amount,
        uint256 price
    );

    /**
     * @dev Событие генерируется при отмене лота
     * @param listingId ID отмененного лота
     * @param seller Адрес продавца
     */
    event ListingCancelled(uint256 indexed listingId, address indexed seller);

    /**
     * @dev Событие генерируется при изменении комиссии платформы
     * @param oldFee Предыдущая комиссия
     * @param newFee Новая комиссия
     */
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @dev Конструктор маркетплейса
     * @param initialOwner Адрес начального владельца маркетплейса
     * @param initialPlatformFee Начальная комиссия платформы (в базисных пунктах)
     */
    constructor(address initialOwner, uint256 initialPlatformFee) Ownable(initialOwner) {
        require(initialPlatformFee <= MAX_FEE, "Fee too high");
        platformFee = initialPlatformFee;
    }

    /**
     * @dev Выставление токена на продажу
     * @param tokenContract Адрес контракта токена
     * @param amount Количество токенов
     * @param price Цена в AVAX (wei)
     * @return listingId ID выставленного лота
     * @notice Требует предварительного одобрения перевода токенов контракту
     */
    function listItem(
        address tokenContract,
        uint256 amount,
        uint256 price
    ) external nonReentrant returns (uint256 listingId) {
        require(tokenContract != address(0), "Invalid token address");
        require(amount > 0, "Amount must be > 0");
        require(price > 0, "Price must be > 0");

        // Проверка, что это действительно ERC20 токен
        IERC20 token = IERC20(tokenContract);
        
        // Проверка доступного баланса и разрешения
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        
        // Перевод токенов на контракт
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        // Создание нового лота
        listingId = listings.length;
        listings.push(Listing({
            seller: msg.sender,
            tokenContract: tokenContract,
            amount: amount,
            price: price,
            active: true
        }));
        
        emit ItemListed(listingId, msg.sender, tokenContract, amount, price);
        
        return listingId;
    }

    /**
     * @dev Покупка токена
     * @param listingId ID лота
     * @notice Требует отправки AVAX в соответствии с ценой лота
     */
    function buyItem(uint256 listingId) external payable nonReentrant {
        require(listingId < listings.length, "Invalid listing ID");
        
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own listing");
        
        // Маркировка лота как неактивного
        listing.active = false;
        
        // Расчет комиссии
        uint256 fee = (listing.price * platformFee) / 10000;
        uint256 sellerAmount = listing.price - fee;
        
        // Перевод токенов покупателю
        IERC20(listing.tokenContract).safeTransfer(msg.sender, listing.amount);
        
        // Перевод AVAX продавцу
        (bool successSeller, ) = listing.seller.call{value: sellerAmount}("");
        require(successSeller, "Failed to send AVAX to seller");
        
        // Перевод комиссии владельцу контракта
        if (fee > 0) {
            (bool successOwner, ) = owner().call{value: fee}("");
            require(successOwner, "Failed to send fee to owner");
        }
        
        // Возврат излишка, если был отправлен
        if (msg.value > listing.price) {
            (bool successRefund, ) = msg.sender.call{value: msg.value - listing.price}("");
            require(successRefund, "Failed to refund excess payment");
        }
        
        emit ItemSold(
            listingId,
            msg.sender,
            listing.seller,
            listing.tokenContract,
            listing.amount,
            listing.price
        );
    }

    /**
     * @dev Отмена лота
     * @param listingId ID лота
     * @notice Может вызвать только продавец или владелец контракта
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        require(listingId < listings.length, "Invalid listing ID");
        
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(
            msg.sender == listing.seller || msg.sender == owner(),
            "Not authorized"
        );
        
        // Маркировка лота как неактивного
        listing.active = false;
        
        // Возврат токенов продавцу
        IERC20(listing.tokenContract).safeTransfer(listing.seller, listing.amount);
        
        emit ListingCancelled(listingId, listing.seller);
    }

    /**
     * @dev Изменение комиссии платформы
     * @param newFee Новая комиссия (в базисных пунктах)
     * @notice Может вызвать только владелец контракта
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        
        uint256 oldFee = platformFee;
        platformFee = newFee;
        
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Получение количества лотов
     * @return Количество лотов
     */
    function getListingsCount() external view returns (uint256) {
        return listings.length;
    }

    /**
     * @dev Получение активных лотов
     * @return Массив ID активных лотов
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Подсчет активных лотов
        for (uint256 i = 0; i < listings.length; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }
        
        // Создание массива с ID активных лотов
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < listings.length; i++) {
            if (listings[i].active) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }
} 