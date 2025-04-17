import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ChihCapitalToken, ChihStakingPool } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ChihStakingPool", function () {
  let stakingToken: ChihCapitalToken;
  let stakingPool: ChihStakingPool;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  const totalSupply = ethers.utils.parseEther("1000000"); // 1,000,000 токенов
  const initialRewardRate = ethers.utils.parseEther("0.01"); // 0.01 токенов в секунду на 1 стейкнутый токен
  
  beforeEach(async function () {
    // Получение аккаунтов для тестирования
    [owner, user1, user2] = await ethers.getSigners();

    // Деплой ChihCapitalToken
    const ChihCapitalTokenFactory = await ethers.getContractFactory("ChihCapitalToken");
    stakingToken = await ChihCapitalTokenFactory.deploy(owner.address, totalSupply);
    await stakingToken.deployed();

    // Деплой ChihStakingPool
    const ChihStakingPoolFactory = await ethers.getContractFactory("ChihStakingPool");
    stakingPool = await ChihStakingPoolFactory.deploy(
      stakingToken.address,
      owner.address,
      initialRewardRate
    );
    await stakingPool.deployed();
    
    // Пополнение пула для выплаты наград
    await stakingToken.transfer(stakingPool.address, ethers.utils.parseEther("100000")); // 100,000 токенов
    
    // Отправка токенов пользователям для тестирования
    await stakingToken.transfer(user1.address, ethers.utils.parseEther("10000")); // 10,000 токенов
    await stakingToken.transfer(user2.address, ethers.utils.parseEther("10000")); // 10,000 токенов
  });

  describe("Deployment", function () {
    it("Should set the correct staking token", async function () {
      expect(await stakingPool.stakingToken()).to.equal(stakingToken.address);
    });

    it("Should set the correct owner", async function () {
      expect(await stakingPool.owner()).to.equal(owner.address);
    });

    it("Should set the correct reward rate", async function () {
      expect(await stakingPool.rewardRate()).to.equal(initialRewardRate);
    });
  });

  describe("Staking", function () {
    const stakeAmount = ethers.utils.parseEther("1000"); // 1,000 токенов

    beforeEach(async function () {
      // Approve staking
      await stakingToken.connect(user1).approve(stakingPool.address, stakeAmount);
    });

    it("Should allow users to stake tokens", async function () {
      // Стейкинг токенов
      await stakingPool.connect(user1).stake(stakeAmount);
      
      // Проверка стейка пользователя
      expect(await stakingPool.balanceOf(user1.address)).to.equal(stakeAmount);
      
      // Проверка общего количества застейканных токенов
      expect(await stakingPool.totalStaked()).to.equal(stakeAmount);
      expect(await stakingPool.getTotalStaked()).to.equal(stakeAmount);
    });

    it("Should emit Staked event when staking", async function () {
      // Проверка события при стейкинге
      await expect(stakingPool.connect(user1).stake(stakeAmount))
        .to.emit(stakingPool, "Staked")
        .withArgs(user1.address, stakeAmount);
    });

    it("Should revert when staking 0 tokens", async function () {
      await expect(stakingPool.connect(user1).stake(0))
        .to.be.revertedWith("Cannot stake 0");
    });
  });

  describe("Unstaking", function () {
    const stakeAmount = ethers.utils.parseEther("1000"); // 1,000 токенов

    beforeEach(async function () {
      // Approve and stake
      await stakingToken.connect(user1).approve(stakingPool.address, stakeAmount);
      await stakingPool.connect(user1).stake(stakeAmount);
    });

    it("Should allow users to unstake tokens", async function () {
      // Запоминаем начальный баланс пользователя
      const initialBalance = await stakingToken.balanceOf(user1.address);
      
      // Анстейкинг части токенов
      const unstakeAmount = ethers.utils.parseEther("500"); // 500 токенов
      await stakingPool.connect(user1).unstake(unstakeAmount);
      
      // Проверка стейка пользователя
      expect(await stakingPool.balanceOf(user1.address)).to.equal(stakeAmount.sub(unstakeAmount));
      
      // Проверка общего количества застейканных токенов
      expect(await stakingPool.totalStaked()).to.equal(stakeAmount.sub(unstakeAmount));
      
      // Проверка, что токены вернулись пользователю
      expect(await stakingToken.balanceOf(user1.address)).to.equal(initialBalance.add(unstakeAmount));
    });

    it("Should emit Withdrawn event when unstaking", async function () {
      const unstakeAmount = ethers.utils.parseEther("500"); // 500 токенов
      
      // Проверка события при анстейкинге
      await expect(stakingPool.connect(user1).unstake(unstakeAmount))
        .to.emit(stakingPool, "Withdrawn")
        .withArgs(user1.address, unstakeAmount);
    });

    it("Should revert when unstaking 0 tokens", async function () {
      await expect(stakingPool.connect(user1).unstake(0))
        .to.be.revertedWith("Cannot withdraw 0");
    });

    it("Should revert when unstaking more than staked", async function () {
      const tooMuch = stakeAmount.add(1);
      await expect(stakingPool.connect(user1).unstake(tooMuch))
        .to.be.revertedWith("Not enough staked tokens");
    });
  });

  describe("Rewards", function () {
    const stakeAmount = ethers.utils.parseEther("1000"); // 1,000 токенов
    const duration = 100; // 100 секунд

    beforeEach(async function () {
      // Approve and stake
      await stakingToken.connect(user1).approve(stakingPool.address, stakeAmount);
      await stakingPool.connect(user1).stake(stakeAmount);
    });

    it("Should accumulate rewards over time", async function () {
      // Перемотка времени
      await time.increase(duration);
      
      // Расчет ожидаемой награды
      // rewardRate * stakeAmount * duration
      const expectedReward = initialRewardRate.mul(stakeAmount).mul(duration).div(ethers.utils.parseEther("1"));
      
      // Проверка начисленной награды
      const earnedReward = await stakingPool.earned(user1.address);
      expect(earnedReward).to.be.closeTo(expectedReward, ethers.utils.parseEther("0.1")); // Допустимое отклонение 0.1 токена
    });

    it("Should allow users to claim rewards", async function () {
      // Перемотка времени
      await time.increase(duration);
      
      // Запоминаем заработанную награду
      const earnedReward = await stakingPool.earned(user1.address);
      
      // Запоминаем начальный баланс пользователя
      const initialBalance = await stakingToken.balanceOf(user1.address);
      
      // Получение наград
      await stakingPool.connect(user1).claimRewards();
      
      // Проверка, что награды получены
      const newBalance = await stakingToken.balanceOf(user1.address);
      expect(newBalance.sub(initialBalance)).to.be.closeTo(earnedReward, ethers.utils.parseEther("0.1"));
      
      // Проверка, что награды сброшены
      expect(await stakingPool.earned(user1.address)).to.be.closeTo(ethers.constants.Zero, ethers.utils.parseEther("0.01"));
    });

    it("Should emit RewardPaid event when claiming rewards", async function () {
      // Перемотка времени
      await time.increase(duration);
      
      // Запоминаем заработанную награду
      const earnedReward = await stakingPool.earned(user1.address);
      
      // Проверка события при получении наград
      await expect(stakingPool.connect(user1).claimRewards())
        .to.emit(stakingPool, "RewardPaid")
        .withArgs(user1.address, earnedReward);
    });

    it("Should not emit RewardPaid event when there are no rewards", async function () {
      // Сразу после стейкинга награды ещё не начислены
      await expect(stakingPool.connect(user1).claimRewards())
        .to.not.emit(stakingPool, "RewardPaid");
    });

    it("Should allow the owner to change the reward rate", async function () {
      const newRewardRate = ethers.utils.parseEther("0.02"); // 0.02 токенов в секунду
      
      // Изменение скорости начисления наград
      await stakingPool.connect(owner).setRewardRate(newRewardRate);
      
      // Проверка новой скорости
      expect(await stakingPool.rewardRate()).to.equal(newRewardRate);
    });

    it("Should not allow non-owners to change the reward rate", async function () {
      const newRewardRate = ethers.utils.parseEther("0.02"); // 0.02 токенов в секунду
      
      // Попытка изменения скорости не-владельцем
      await expect(stakingPool.connect(user1).setRewardRate(newRewardRate))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Multiple users", function () {
    const stakeAmount1 = ethers.utils.parseEther("1000"); // 1,000 токенов для user1
    const stakeAmount2 = ethers.utils.parseEther("2000"); // 2,000 токенов для user2
    const duration = 100; // 100 секунд

    beforeEach(async function () {
      // Approve и stake для user1
      await stakingToken.connect(user1).approve(stakingPool.address, stakeAmount1);
      await stakingPool.connect(user1).stake(stakeAmount1);
      
      // Approve и stake для user2
      await stakingToken.connect(user2).approve(stakingPool.address, stakeAmount2);
      await stakingPool.connect(user2).stake(stakeAmount2);
    });

    it("Should calculate rewards proportionally to stake", async function () {
      // Перемотка времени
      await time.increase(duration);
      
      // Расчет ожидаемых наград
      const expectedReward1 = initialRewardRate.mul(stakeAmount1).mul(duration).div(ethers.utils.parseEther("1"));
      const expectedReward2 = initialRewardRate.mul(stakeAmount2).mul(duration).div(ethers.utils.parseEther("1"));
      
      // Проверка начисленных наград
      const earnedReward1 = await stakingPool.earned(user1.address);
      const earnedReward2 = await stakingPool.earned(user2.address);
      
      expect(earnedReward1).to.be.closeTo(expectedReward1, ethers.utils.parseEther("0.1"));
      expect(earnedReward2).to.be.closeTo(expectedReward2, ethers.utils.parseEther("0.1"));
      
      // Награды user2 должны быть в 2 раза больше, так как стейк в 2 раза больше
      expect(earnedReward2.div(earnedReward1)).to.be.closeTo(
        ethers.BigNumber.from(2),
        ethers.BigNumber.from(1) // Допустимое отклонение из-за округления
      );
    });
  });
}); 