import { ethers, network } from "hardhat";
import { saveConfig } from "./use-config";
import aurora_address from "../../config/configs_aurora_test.json";
async function main() {
  const [deployer] = await ethers.getSigners();
  const WETH = await ethers.getContractAt(
    "IWETH",
    aurora_address.aurora_test.WETH_18
  );
  const pair = await ethers.getContractAt(
    "UniswapV2Pair",
    "0x3c1b73769d1881ecb9ba4aa901713f3f9af59ba4"
  );
  const factoryAddress = await pair.factory();
  const factory = await ethers.getContractAt(
    "UniswapV2Factory",
    factoryAddress
  );
  saveConfig(`${network.name}__UniswapV2Factory`, factory.address);

  //* Deploy UniswapFunnel
  const UniswapV2Funnel_f = await ethers.getContractFactory("UniswapV2Funnel");
  const UniswapV2Funnel = await UniswapV2Funnel_f.deploy(WETH.address).then(
    (tx) => tx.deployed()
  );
  saveConfig(`${network.name}__UniswapV2Funnel`, UniswapV2Funnel.address);
  console.log("7: Successfully deployed UniswapFunnel");
  await UniswapV2Funnel.setFeeOf(factory.address, 30).then((tx) => tx.wait());
  console.log("8: Set Fee of UniswapFunnel");
}
main();
