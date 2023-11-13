// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  console.log("Deploying Token contract...");
  const token = await Token.deploy("myToken", "myT1", 1000000);
  await token.deployed();
  console.log("Token contract deployed @:" + token.address);

  const SimpleDex = await hre.ethers.getContractFactory("SimpleDex");
  console.log("Deploying SimpleDex contract...");
  const simpleDex = await SimpleDex.deploy(
    token.address,
    "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419"
  );
  await simpleDex.deployed();
  console.log("SimpleDex contract deployed @:" + simpleDex.address);

  const Treasury = await hre.ethers.getContractFactory("Treasury");
  console.log("Deploying Tresury contract...");
  const treasury = await Treasury.deploy(simpleDex.address);
  await treasury.deployed();
  console.log("Tresury contract deployed @:" + treasury.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
