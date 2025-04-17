import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TokenFactory, MSPEToken } from "../typechain-types";

describe("TokenFactory", function () {
  let tokenFactory: TokenFactory;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let creationFee: bigint = ethers.utils.parseEther("0.1"); // 0.1 AVAX

  beforeEach(async function () {
    // Получение аккаунтов для тестирования
    [owner, user] = await ethers.getSigners();

    // Деплой TokenFactory
    const TokenFactoryFactory = await ethers.getContractFactory("TokenFactory");
    tokenFactory = await TokenFactoryFactory.deploy(owner.address, creationFee);
    await tokenFactory.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await tokenFactory.owner()).to.equal(owner.address);
    });

    it("Should set the correct creation fee", async function () {
      expect(await tokenFactory.creationFee()).to.equal(creationFee);
    });
  });

  describe("Create Token", function () {
    const tokenName = "Test MSP Token";
    const tokenSymbol = "TMSP";
    const initialSupply = ethers.utils.parseEther("1000000"); // 1,000,000 токенов

    it("Should revert if fee is not sent", async function () {
      await expect(
        tokenFactory.connect(user).createMSPEToken(tokenName, tokenSymbol, initialSupply)
      ).to.be.revertedWith("Insufficient fee");
    });

    it("Should create a new token with the correct parameters", async function () {
      // Создание токена с отправкой комиссии
      const tx = await tokenFactory.connect(user).createMSPEToken(
        tokenName,
        tokenSymbol,
        initialSupply,
        { value: creationFee }
      );
      
      // Ожидание транзакции
      const receipt = await tx.wait();
      
      // Проверка события
      const event = receipt.events?.find(e => e.event === "MSPETokenCreated");
      expect(event).to.not.be.undefined;
      
      // Проверка аргументов события
      if (event && event.args) {
        expect(event.args.creator).to.equal(user.address);
        expect(event.args.name).to.equal(tokenName);
        expect(event.args.symbol).to.equal(tokenSymbol);
        expect(event.args.initialSupply).to.equal(initialSupply);
        
        // Проверка токена
        const tokenAddress = event.args.tokenAddress;
        const token = await ethers.getContractAt("MSPEToken", tokenAddress) as MSPEToken;
        
        expect(await token.name()).to.equal(tokenName);
        expect(await token.symbol()).to.equal(tokenSymbol);
        expect(await token.totalSupply()).to.equal(initialSupply);
        expect(await token.balanceOf(user.address)).to.equal(initialSupply);
        expect(await token.owner()).to.equal(user.address);
      }
    });

    it("Should add the token to the list of created tokens", async function () {
      // Проверка начального состояния
      expect(await tokenFactory.getMSPETokenCount()).to.equal(0);
      
      // Создание токена
      await tokenFactory.connect(user).createMSPEToken(
        tokenName,
        tokenSymbol,
        initialSupply,
        { value: creationFee }
      );
      
      // Проверка количества токенов
      expect(await tokenFactory.getMSPETokenCount()).to.equal(1);
      
      // Проверка списка токенов
      const tokens = await tokenFactory.getAllMSPETokens();
      expect(tokens.length).to.equal(1);
      
      // Проверка, что токен отмечен как созданный фабрикой
      expect(await tokenFactory.isTokenCreatedByFactory(tokens[0])).to.be.true;
    });

    it("Should transfer the fee to the owner", async function () {
      // Запоминаем начальный баланс владельца
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      // Создание токена с отправкой комиссии
      await tokenFactory.connect(user).createMSPEToken(
        tokenName,
        tokenSymbol,
        initialSupply,
        { value: creationFee }
      );
      
      // Проверка, что комиссия была переведена владельцу
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance.sub(initialOwnerBalance)).to.equal(creationFee);
    });
  });

  describe("Fee Management", function () {
    it("Should allow the owner to change the creation fee", async function () {
      const newFee = ethers.utils.parseEther("0.2"); // 0.2 AVAX
      
      // Изменение комиссии
      await tokenFactory.connect(owner).setCreationFee(newFee);
      
      // Проверка новой комиссии
      expect(await tokenFactory.creationFee()).to.equal(newFee);
    });

    it("Should not allow non-owners to change the creation fee", async function () {
      const newFee = ethers.utils.parseEther("0.2"); // 0.2 AVAX
      
      // Попытка изменения комиссии не-владельцем
      await expect(
        tokenFactory.connect(user).setCreationFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 