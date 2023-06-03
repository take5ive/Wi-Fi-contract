import { ethers } from "hardhat";
import address_mumbai from "../../config/configs_mumbai.json";
import { UniswapV2Funnel } from "../../typechain-types";
export async function getFee() {
  const funnel: UniswapV2Funnel = await ethers.getContractAt(
    "UniswapV2Funnel",
    address_mumbai.mumbai.UniswapV2Funnel
  );
  const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  const factoryAddress = await pair.factory();
  await funnel.setFeeOf(factoryAddress, fee);
}
