import { uniswap } from "../../typechain-types";
import goerli_addresses from "../../config/configs_goerli.json";
import mumbai_addresses from "../../config/configs_mumbai.json";
import { ethers, network } from "hardhat";
import { saveConfig } from "./use-config";
import { get } from "http";
export async function getPair() {
  const uniswapV2Factory = await ethers.getContractAt(
    "UniswapV2Factory",
    mumbai_addresses.mumbai.uniswapV2Factory
  );
  const TEST = await ethers.getContractAt(
    "TestERC20",
    mumbai_addresses.mumbai.TEST_18
  );
  const WBTC = await ethers.getContractAt(
    "MockERC20",
    mumbai_addresses.mumbai.WBTC_18
  );
  const USDT = await ethers.getContractAt(
    "MockERC20",
    mumbai_addresses.mumbai.USDT_6
  );

  saveConfig(
    `${network.name}__USDT_WBTC_Pair`,
    await uniswapV2Factory.getPair(USDT.address, WBTC.address)
  );
  saveConfig(
    `${network.name}__TEST_WBTC_Pair`,
    await uniswapV2Factory.getPair(TEST.address, WBTC.address)
  );
}

getPair();
