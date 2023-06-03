import { ethers, network } from "hardhat";
import { saveConfig } from "./use-config";
import aurora_address from "../../config/configs_aurora_test.json";
async function main() {
  const [deployer] = await ethers.getSigners();
  //* Deploy Uniswap
  const uniswapV2Factory_f = await ethers.getContractFactory(
    "UniswapV2Factory"
  );

  const uniswapV2Router02_f = await ethers.getContractFactory(
    "UniswapV2Router02"
  );
  const WETH = await ethers.getContractAt(
    "IWETH9",
    aurora_address.aurora_test.WETH_18
  );
  // const provider = ethers.provider;
  // const gasPrice = await provider.getGasPrice();
  // console.log("Current gas price:", gasPrice.toString());

  const uniswapV2Factory = await uniswapV2Factory_f
    .deploy(deployer.address, {
      gasLimit: 100000000000,
      gasPrice: 100000000000,
    })
    .then((tx) => tx.deployed());
  // const estimatedGas = await uniswapV2Factory.deployTransaction
  //   .wait()
  //   .then((receipt) => receipt.gasUsed);
  // console.log("Estimated gas used:", estimatedGas.toString());

  console.log("4-1: Deployed Uniswap Factory");
  saveConfig(`${network.name}__uniswapV2Factory`, uniswapV2Factory.address);
  //* deployed already
  //const uniswapV2Factory = await ethers.getContractAt(
  //   "UniswapV2Factory",
  //   mumbai_addresses.mumbai.uniswapV2Factory
  // );
  const uniswapV2Router02 = await uniswapV2Router02_f
    .deploy(uniswapV2Factory.address, WETH.address, {
      gasLimit: 10000000000,
      gasPrice: 100000000000,
    })
    .then((tx) => tx.deployed());
  console.log("4-2: Deployed Uniswap Router");
  saveConfig(`${network.name}__uniswapV2Router02`, uniswapV2Router02.address);
}

main();
