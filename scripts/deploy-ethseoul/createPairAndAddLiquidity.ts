import address_goerli from "../../config/configs_goerli.json";

import address_aurora_test from "../../config/configs_aurora_test.json";
import address_chiado from "../../config/configs_chiado.json";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { mintTEST } from "./mint-TETSTOKEN";

async function mintWifi(WifiToken: string) {
  const [deployer] = await ethers.getSigners();
  const wifiToken = await ethers.getContractAt("IMintableERC20", WifiToken);
  await wifiToken
    .mint(deployer.address, ethers.utils.parseEther("40000"), {
      gasPrice: 200500000015,
    })
    .then((tx) => tx.wait());
  console.log("minted");
}
async function createPair(
  token0: string,
  token1: string,
  factoryAddress: string
) {
  const factory = await ethers.getContractAt(
    "IUniswapV2Factory",
    factoryAddress
  );
  await factory
    .createPair(token0, token1, { gasLimit: 1000000 })
    .then((tx) => tx.wait());
  console.log("pair created");
}
async function approve(token: string, spender: string, amount: BigNumber) {
  const erc20 = await ethers.getContractAt("MockERC20", token);
  await erc20.approve(spender, amount).then((tx) => tx.wait());
  console.log("approved");
}
async function addLiquidity(
  token0: string,
  token1: string,
  token0Amount: BigNumber,
  token1Amount: BigNumber,
  routerAddress: string
) {
  const [deployer] = await ethers.getSigners();
  const router = await ethers.getContractAt("UniswapV2Router02", routerAddress);
  await router
    .addLiquidity(
      token0,
      token1,
      token0Amount,
      token1Amount,
      1,
      1,
      deployer.address,
      ethers.constants.MaxUint256,
      { gasLimit: 10000000 }
    )
    .then((tx) => tx.wait());
  console.log("liquidity added");
}

async function main() {
  //* mint wifi 40000
  await mintWifi(address_chiado.chiado.WIFI);
  await mintTEST(
    "0xdead7184E891B6d8bD532795E5807fC1727A7966",
    10000,
    address_chiado.chiado.WBTC_18
  );
  //* approve wifi to router
  await approve(
    address_chiado.chiado.WIFI,
    address_chiado.chiado.uniswapV2Router02,
    ethers.constants.MaxUint256
  );
  await approve(
    address_chiado.chiado.WBTC_18,
    address_chiado.chiado.uniswapV2Router02,
    ethers.constants.MaxUint256
  );
  await approve(
    address_chiado.chiado.WETH_18,
    address_chiado.chiado.uniswapV2Router02,
    ethers.constants.MaxUint256
  );
  await approve(
    address_chiado.chiado.USDT_6,
    address_chiado.chiado.uniswapV2Router02,
    ethers.constants.MaxUint256
  );
  await approve(
    address_chiado.chiado.USDC_6,
    address_chiado.chiado.uniswapV2Router02,
    ethers.constants.MaxUint256
  );

  //* add Liquidity
  await addLiquidity(
    address_chiado.chiado.WIFI,
    address_chiado.chiado.WETH_18,
    ethers.utils.parseEther("10000"),
    ethers.utils.parseEther("0.2"),
    address_chiado.chiado.uniswapV2Router02
  );
  await addLiquidity(
    address_chiado.chiado.WIFI,
    address_chiado.chiado.WBTC_18,
    ethers.utils.parseEther("10000"),
    ethers.utils.parseEther("10002"),
    address_chiado.chiado.uniswapV2Router02
  );
  await addLiquidity(
    address_chiado.chiado.WIFI,
    address_chiado.chiado.USDT_6,
    ethers.utils.parseEther("10000"),
    ethers.utils.parseUnits("94000", 6),
    address_chiado.chiado.uniswapV2Router02
  );
  await addLiquidity(
    address_chiado.chiado.WIFI,
    address_chiado.chiado.USDC_6,
    ethers.utils.parseEther("10000"),
    ethers.utils.parseUnits("94000", 6),
    address_chiado.chiado.uniswapV2Router02
  );
}
main();
