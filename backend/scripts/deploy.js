const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy EcoToken
  const EcoToken = await hre.ethers.getContractFactory("EcoToken");
  const ecoToken = await EcoToken.deploy();
  await ecoToken.waitForDeployment();
  const ecoTokenAddress = await ecoToken.getAddress();
  console.log("EcoToken deployed to:", ecoTokenAddress);

  // Deploy NFTTree
  const NFTTree = await hre.ethers.getContractFactory("NFTTree");
  const nftTree = await NFTTree.deploy();
  await nftTree.waitForDeployment();
  const nftTreeAddress = await nftTree.getAddress();
  console.log("NFTTree deployed to:", nftTreeAddress);

  console.log("\nDeployment completed successfully!");
  console.log("-----------------------------------");
  console.log(`ECO_TOKEN_ADDRESS=${ecoTokenAddress}`);
  console.log(`NFT_TREE_ADDRESS=${nftTreeAddress}`);
  console.log("-----------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
