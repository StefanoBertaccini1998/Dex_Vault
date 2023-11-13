const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const { expect } = require("chai");
require("dotenv").config();
const { BigNumber, constants } = require("ethers");
const { ethers } = require("hardhat");
const { ZERO_ADDRESS, EtherSymbol } = constants;

require("@nomicfoundation/hardhat-chai-matchers");

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());
const fromWei6Dec = (x) => Number(x) / Math.pow(10, 6);
const toWei6Dec = (x) => Number(x) * Math.pow(10, 6);
const fromWei8Dec = (x) => Number(x) / Math.pow(10, 8);
const toWei8Dec = (x) => Number(x) * Math.pow(10, 8);
const fromWei2Dec = (x) => Number(x) / Math.pow(10, 2);
const toWei2Dec = (x) => Number(x) * Math.pow(10, 2);

const ethUsdContract = "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419";

describe("SimpleDex", function (accounts) {
  it("retrieve deployed contracts", async function () {
    [testOwner, other1, other2, other3] = await ethers.getSigners();
    const Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy("myToken", "myT1", 1_000_000);
    expect(token.address).to.be.not.equal(ZERO_ADDRESS);
    expect(token.address).to.match(/0x[0-9a-fA-F]{40}/);

    const SimpleDex = await hre.ethers.getContractFactory("SimpleDex");
    console.log("ethUsdContract @: " + ethUsdContract);
    simpleDex = await SimpleDex.deploy(token.address, ethUsdContract);
    expect(simpleDex.address).to.be.not.equal(ZERO_ADDRESS);
    expect(simpleDex.address).to.match(/0x[0-9a-fA-F]{40}/);

    const Oracle = await hre.ethers.getContractFactory("PriceConsumerV3");
    priceConsumerAddress = await simpleDex.ethUsdContract();
    pcContract = await Oracle.attach(priceConsumerAddress);
    console.log("priceConsumer @: " + priceConsumerAddress);

    const Treasury = await hre.ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(simpleDex.address);
    expect(treasury.address).to.be.not.equal(ZERO_ADDRESS);
    expect(treasury.address).to.match(/0x[0-9a-fA-F]{40}/);
  });

  it("DEX receives Tokens and ETH from owner", async function () {
    lastPrice = await pcContract.getLatestPrice();
    console.log(fromWei8Dec(lastPrice));

    /**tx = await token
      .connect(testOwner)
      .transfer(simpleDex.address, toWei(10_000));
    tx = await testOwner.sendTransaction({
      to: simpleDex.address,
      value: toWei(10),
    });*/

    console.log("ETH/USD decimals: " + (await simpleDex.ethPriceDecimals()));
    await simpleDex.connect(testOwner).setTreasury(treasury.address);
    await token.connect(testOwner).setMinter(simpleDex.address);
  });

  it("users withdraw tokens for ethers in simple DEX", async function () {
    tx = await simpleDex.connect(other1).buyToken({ value: toWei(1) });
    console.log("ETH/USD price: " + fromWei8Dec(await simpleDex.ethPrice()));
    tx = await simpleDex.connect(other2).buyToken({ value: toWei(2) });
    tx = await simpleDex.connect(other3).buyToken({ value: toWei(3) });
  });

  it("simple DEX parameters", async function () {
    console.log(
      "Token balance in dex contract: " +
        fromWei(await token.balanceOf(simpleDex.address))
    );
    console.log(
      "Ether balance in dex contract: " +
        fromWei(await simpleDex.provider.getBalance(simpleDex.address))
    );

    console.log(
      "Other1 balance in dex contract: " +
        fromWei(await token.balanceOf(other1.address))
    );
    console.log(
      "Other2 balance in dex contract: " +
        fromWei(await token.balanceOf(other2.address))
    );
    console.log(
      "Other3 balance in dex contract: " +
        fromWei(await token.balanceOf(other3.address))
    );
    console.log(
      "ETH balance in Treasury contract: " +
        fromWei(await treasury.provider.getBalance(treasury.address))
    );

    console.log(
      "Other1 balance in dex contract: " +
        fromWei(await other1.provider.getBalance(other1.address))
    );
    console.log(
      "Other2 balance: " +
        fromWei(await other2.provider.getBalance(other2.address))
    );
    console.log(
      "Other3 balance: " +
        fromWei(await other3.provider.getBalance(other3.address))
    );
  });

  it("users change ethers for token in simple DEX", async function () {
    tx = await token.connect(other1).approve(simpleDex.address, toWei(1000));
    tx = await simpleDex.connect(other1).sellToken(toWei(1000));
    tx = await token.connect(other2).approve(simpleDex.address, toWei(800));
    tx = await simpleDex.connect(other2).sellToken(toWei(800));
    tx = await token.connect(other3).approve(simpleDex.address, toWei(1200));
    tx = await simpleDex.connect(other3).sellToken(toWei(1200));
  });

  it("simple DEX parameters", async function () {
    console.log(
      "Token balance in dex contract: " +
        fromWei(await token.balanceOf(simpleDex.address))
    );
    console.log(
      "Ether balance in dex contract: " +
        fromWei(await simpleDex.provider.getBalance(simpleDex.address))
    );

    console.log(
      "Other1 balance in dex contract: " +
        fromWei(await token.balanceOf(other1.address))
    );
    console.log(
      "Other2 balance in dex contract: " +
        fromWei(await token.balanceOf(other2.address))
    );
    console.log(
      "Other3 balance in dex contract: " +
        fromWei(await token.balanceOf(other3.address))
    );

    console.log(
      "ETH balance in Treasury contract: " +
        fromWei(await treasury.provider.getBalance(treasury.address))
    );

    console.log(
      "Other1 balance in dex contract: " +
        fromWei(await other1.provider.getBalance(other1.address))
    );
    console.log(
      "Other2 balance: " +
        fromWei(await other2.provider.getBalance(other2.address))
    );
    console.log(
      "Other3 balance: " +
        fromWei(await other3.provider.getBalance(other3.address))
    );
  });
});
