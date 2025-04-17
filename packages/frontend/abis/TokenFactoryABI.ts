// ABI для фабрики токенов (Token Factory)
const tokenFactoryABI = [
  // Функции создания токенов
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "uint256", "name": "initialSupply", "type": "uint256" },
      { "internalType": "string", "name": "businessDescription", "type": "string" },
      { "internalType": "string", "name": "logoURI", "type": "string" },
      { "internalType": "string", "name": "website", "type": "string" },
      {
        "components": [
          { "internalType": "uint256", "name": "teamAllocation", "type": "uint256" },
          { "internalType": "uint256", "name": "investorsAllocation", "type": "uint256" },
          { "internalType": "uint256", "name": "reserveAllocation", "type": "uint256" },
          { "internalType": "uint256", "name": "stakingAllocation", "type": "uint256" },
          { "internalType": "uint256", "name": "ecosystemAllocation", "type": "uint256" }
        ],
        "internalType": "struct TokenFactory.TokenomicsData",
        "name": "tokenomicsData",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "uint256", "name": "unlockDate", "type": "uint256" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "internalType": "struct TokenFactory.UnlockScheduleItem[]",
        "name": "unlockSchedule",
        "type": "tuple[]"
      }
    ],
    "name": "createMSPEToken",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Функции получения информации о токенах
  {
    "inputs": [],
    "name": "getAllTokens",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "tokenAddress", "type": "address" }],
    "name": "getTokenInfo",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "uint256", "name": "totalSupply", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "logoURI", "type": "string" },
      { "internalType": "string", "name": "website", "type": "string" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "tokenAddress", "type": "address" }],
    "name": "getTokenHoldersCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "internalType": "uint256", "name": "limit", "type": "uint256" }
    ],
    "name": "getTopTokenHolders",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "holderAddress", "type": "address" },
          { "internalType": "uint256", "name": "balance", "type": "uint256" },
          { "internalType": "uint256", "name": "percentage", "type": "uint256" }
        ],
        "internalType": "struct TokenFactory.HolderInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Функции маркетплейса
  {
    "inputs": [
      { "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "pricePerToken", "type": "uint256" }
    ],
    "name": "listTokenForSale",
    "outputs": [{ "internalType": "uint256", "name": "listingId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "listingId", "type": "uint256" }],
    "name": "buyToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllListings",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "tokenAddress", "type": "address" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "pricePerToken", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct TokenFactory.TokenListing[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default tokenFactoryABI; 