import { ethers } from "hardhat";
import { UniswapV2Funnel } from "../../typechain-types";
import address_goerli from "../../config/configs_goerli.json";
export async function setFeeOf(
  funnelAddress: string,
  factoryAddress: string,
  fee: number
) {
  const funnel: UniswapV2Funnel = await ethers.getContractAt(
    "UniswapV2Funnel",
    funnelAddress
  );
  // console.log((await ethers.provider.getGasPrice()).toString());
  const tx = await funnel.setFeeOf(factoryAddress, fee);
  console.log("tx:", tx.hash);
  await tx.wait();
}

setFeeOf(
  address_goerli.goerli.UniswapV2Funnel,
  address_goerli.goerli.uniswapV2Factory,
  30
);
