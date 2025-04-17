import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Деплой ChihCapitalToken
  const totalSupply = ethers.utils.parseEther("100000000"); // 100 миллионов токенов
  const ChihCapitalToken = await ethers.getContractFactory("ChihCapitalToken");
  const chihToken = await ChihCapitalToken.deploy(deployer.address, totalSupply);
  await chihToken.deployed();
  console.log("ChihCapitalToken deployed to:", chihToken.address);

  // Деплой TokenFactory
  const creationFee = ethers.utils.parseEther("0.1"); // 0.1 AVAX
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy(deployer.address, creationFee);
  await tokenFactory.deployed();
  console.log("TokenFactory deployed to:", tokenFactory.address);

  // Деплой ChihStakingPool
  const initialRewardRate = ethers.utils.parseEther("0.000001"); // 0.000001 токенов в секунду на 1 стейкнутый токен
  const ChihStakingPool = await ethers.getContractFactory("ChihStakingPool");
  const stakingPool = await ChihStakingPool.deploy(
    chihToken.address,
    deployer.address,
    initialRewardRate
  );
  await stakingPool.deployed();
  console.log("ChihStakingPool deployed to:", stakingPool.address);

  // Отправка токенов в стейкинг-пул для наград
  const rewardAmount = ethers.utils.parseEther("10000000"); // 10 миллионов токенов
  await chihToken.transfer(stakingPool.address, rewardAmount);
  console.log("Transferred", ethers.utils.formatEther(rewardAmount), "CHIH to staking pool for rewards");

  // Деплой SimpleMarketplace
  const platformFee = 250; // 2.5% комиссия
  const SimpleMarketplace = await ethers.getContractFactory("SimpleMarketplace");
  const marketplace = await SimpleMarketplace.deploy(deployer.address, platformFee);
  await marketplace.deployed();
  console.log("SimpleMarketplace deployed to:", marketplace.address);

  // Сохраняем адреса контрактов для использования фронтендом
  const contractAddresses = {
    ChihCapitalToken: chihToken.address,
    TokenFactory: tokenFactory.address,
    ChihStakingPool: stakingPool.address,
    SimpleMarketplace: marketplace.address,
    network: network.name
  };

  // Создаем директорию, если она не существует
  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  // Записываем адреса в файл
  const deploymentFilePath = path.join(deploymentPath, `${network.name}.json`);
  fs.writeFileSync(
    deploymentFilePath,
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log(`Contract addresses saved to ${deploymentFilePath}`);

  console.log("\nDeployment summary:");
  console.log("===================");
  console.log(`Network: ${network.name}`);
  console.log(`ChihCapitalToken: ${chihToken.address}`);
  console.log(`TokenFactory: ${tokenFactory.address}`);
  console.log(`ChihStakingPool: ${stakingPool.address}`);
  console.log(`SimpleMarketplace: ${marketplace.address}`);
  console.log("\nVerification command examples:");
  console.log(`npx hardhat verify --network ${network.name} ${chihToken.address} ${deployer.address} ${totalSupply}`);
  console.log(`npx hardhat verify --network ${network.name} ${tokenFactory.address} ${deployer.address} ${creationFee}`);
  console.log(`npx hardhat verify --network ${network.name} ${stakingPool.address} ${chihToken.address} ${deployer.address} ${initialRewardRate}`);
  console.log(`npx hardhat verify --network ${network.name} ${marketplace.address} ${deployer.address} ${platformFee}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 