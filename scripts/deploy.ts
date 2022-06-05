import { ethers } from "hardhat";

async function main() {
  const bridgeFactory = await ethers.getContractFactory("Bridge");
  const bridge = await bridgeFactory.deploy(process.env.TEST_TOKEN_ADDRESS as string);

  await bridge.deployed();

  console.log("Bridge deployed to:", bridge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
