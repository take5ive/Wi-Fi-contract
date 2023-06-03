import { ContractFactory } from "ethers";
import { ethers, network } from "hardhat";
import { saveConfig } from "./use-config";
import { MockERC20__factory, TestERC20 } from "../../typechain-types";
import aruroa_test_addresses from "../../config/configs_aurora_test.json";
// import mumbai_addresses from "../../config/configs_mumbai.json";
// import mumbai_addresses from "../../config/configs_mumbai.json";
// import abi_TEST from "../abi/TEST.json";
export async function deployMockPair() {
  console.log(await ethers.provider.getGasPrice());

  //* Deploy Mock Token: WBTC, TEST, USDT
  const [deployer] = await ethers.getSigners();
  const erc20: MockERC20__factory = await ethers.getContractFactory(
    "MockERC20"
  );
  const USDT = await erc20
    .deploy(ethers.utils.parseUnits("4500", 6), "ETHSEOUL-USDT", "USDT", 6)
    .then((tx) => tx.deployed());
  // const USDT = await ethers.getContractAt(
  //   "MockERC20",
  //   aruroa_test_addresses.aurora_test.USDT_6
  // );

  console.log("USDT deployed");
  saveConfig(`${network.name}__USDT_6`, USDT.address);

  const PEPE = await erc20
    .deploy(ethers.utils.parseUnits("100000", 6), "ETHSEOUL-PEPE", "PEPE", 6)
    .then((tx) => tx.deployed());
  // const PEPE = await ethers.getContractAt(
  //   "MockERC20",
  //   aruroa_test_addresses.aurora_test.PEPE_18
  // );
  console.log("PEPE deployed");
  saveConfig(`${network.name}__PEPE_18`, PEPE.address);
  const USDC = await erc20
    .deploy(ethers.utils.parseUnits("4500", 6), "ETHSEOUL-USDC", "USDC", 6)
    .then((tx) => tx.deployed());
  // const USDC = await ethers.getContractAt(
  //   "MockERC20",
  //   aruroa_test_addresses.aurora_test.USDC_18
  // );
  saveConfig(`${network.name}__USDC_6`, USDC.address);

  //이미 배포완료
  // const USDT = await ethers.getContractAt(
  //   "MockERC20",
  //   mumbai_addresses.mumbai.USDT_6
  // );
  // const WBTC = await ethers.getContractAt(
  //   "MockERC20",
  //   mumbai_addresses.mumbai.PEPE_18
  // );
  console.log("1: Deployed Mock Token");
  // //* Mint TEST Token
  // const TEST: TestERC20 = await ethers.getContractAt(
  //   "TestERC20",
  //   mumbai_addresses.mumbai.USDC_18
  // );
  // TEST.mint(deployer.address, ethers.utils.parseEther("4500")).then((tx) =>
  //   tx.wait()
  // );

  console.log("2: Minted TEST Token");
  //* Deploy WETH & Deposit
  const WETH_factory = await ethers.getContractFactory("WETH9");
  const WETH = await WETH_factory.deploy().then((tx) => tx.deployed());
  // const WETH = await ethers.getContractAt(
  //   "WETH9",
  //   aruroa_test_addresses.aurora_test.WETH_18
  // );
  console.log("WETH deployed");
  await WETH.deposit({ value: ethers.utils.parseEther("1") });
  saveConfig(`${network.name}__WETH_18`, WETH.address);

  // const WETH = await ethers.getContractAt(
  //   "WETH9",
  //   mumbai_addresses.mumbai.WETH_18
  // );
  // await WETH.deposit({ value: ethers.utils.parseEther("0.009") });
  console.log("3: Deployed WETH");
  //* Deploy Uniswap
  const uniswapV2Factory_f = await ethers.getContractFactory(
    "UniswapV2Factory"
  );

  const uniswapV2Router02_f = await ethers.getContractFactory(
    "UniswapV2Router02"
  );
  // const provider = ethers.provider;
  // const gasPrice = await provider.getGasPrice();
  // console.log("Current gas price:", gasPrice.toString());

  const uniswapV2Factory = await uniswapV2Factory_f
    .deploy(deployer.address)
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
    .deploy(uniswapV2Factory.address, WETH.address)
    .then((tx) => tx.deployed());
  console.log("4-2: Deployed Uniswap Router");
  saveConfig(`${network.name}__uniswapV2Router02`, uniswapV2Router02.address);
  //* deployed already
  // const uniswapV2Router02 = await ethers.getContractAt(
  //   "UniswapV2Router02",
  //   mumbai_addresses.mumbai.uniswapV2Router02
  // );
  // const uniswapV2Factory = await ethers.getContractAt(
  //   "UniswapV2Factory",
  //   mumbai_addresses.mumbai.uniswapV2Factory
  // );
  console.log("4: Deployed Uniswap");
  //* Aprove WETH, TEST, USDT, WBTC
  await WETH.approve(
    uniswapV2Router02.address,
    ethers.constants.MaxUint256
  ).then((tx) => tx.wait());
  await USDC.approve(
    uniswapV2Router02.address,
    ethers.constants.MaxUint256
  ).then((tx: any) => tx.wait());
  await USDT.approve(
    uniswapV2Router02.address,
    ethers.constants.MaxUint256
  ).then((tx) => tx.wait());
  await PEPE.approve(
    uniswapV2Router02.address,
    ethers.constants.MaxUint256
  ).then((tx) => tx.wait());
  console.log("5: Approved");
  //* Add Liquidity
  await uniswapV2Factory
    .createPair(WETH.address, USDC.address)
    .then((tx) => tx.wait());
  console.log("6-1: Create Pair WETH-TEST");
  saveConfig(
    `${network.name}__TEST_WETH_Pair`,
    await uniswapV2Factory.getPair(WETH.address, USDC.address)
  );
  await uniswapV2Router02
    .addLiquidity(
      WETH.address,
      USDC.address,
      ethers.utils.parseEther("0.3"),
      ethers.utils.parseEther("1500"),
      1,
      1,
      deployer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());

  console.log("6-2: Add Liquidity WETH-TEST");
  await uniswapV2Factory
    .createPair(WETH.address, USDT.address)
    .then((tx) => tx.wait());
  console.log("6-1: Create Pair WETH-USDT");
  saveConfig(
    `${network.name}__USDT_WETH_Pair`,
    await uniswapV2Factory.getPair(WETH.address, USDT.address)
  );
  await uniswapV2Router02
    .addLiquidity(
      WETH.address,
      USDT.address,
      ethers.utils.parseEther("0.3"),
      ethers.utils.parseUnits("1500", 6),
      1,
      1,
      deployer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());

  console.log("6-2: Add Liquidity WETH-TEST");
  await uniswapV2Factory
    .createPair(USDT.address, USDC.address)
    .then((tx) => tx.wait());
  saveConfig(
    `${network.name}__TEST_USDT_Pair`,
    await uniswapV2Factory.getPair(USDC.address, USDT.address)
  );

  console.log("6-1: Create Pair USDT-TEST");
  await uniswapV2Router02
    .addLiquidity(
      USDT.address,
      USDC.address,
      ethers.utils.parseUnits("1500", 6),
      ethers.utils.parseUnits("1500", 6),
      1,
      1,
      deployer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());

  console.log("6-2: Add Liquidity USDT-TEST");
  await uniswapV2Factory
    .createPair(WETH.address, PEPE.address)
    .then((tx) => tx.wait());
  saveConfig(
    `${network.name}__TEST_PEPE_Pair`,
    await uniswapV2Factory.getPair(USDC.address, PEPE.address)
  );
  console.log("6-1: Create Pair WETH-PEPE");
  await uniswapV2Router02
    .addLiquidity(
      WETH.address,
      PEPE.address,
      ethers.utils.parseEther("0.3"),
      ethers.utils.parseUnits("3333", 6),
      1,
      1,
      deployer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());

  console.log("6-2: Add Liquidity WETH-PEPE");
  await uniswapV2Factory
    .createPair(USDC.address, PEPE.address)
    .then((tx) => tx.wait());
  saveConfig(
    `${network.name}__USDT_PEPE_Pair`,
    await uniswapV2Factory.getPair(USDT.address, PEPE.address)
  );
  console.log("6-1: Create Pair TEST-PEPE");
  await uniswapV2Router02
    .addLiquidity(
      USDC.address,
      PEPE.address,
      ethers.utils.parseUnits("1500", 6),
      ethers.utils.parseUnits("3333", 6),
      1,
      1,
      deployer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());

  console.log("6-2: Add Liquidity TEST-PEPE");
  await uniswapV2Factory
    .createPair(USDT.address, PEPE.address)
    .then((tx) => tx.wait());
  saveConfig(
    `${network.name}__WETH_PEPE_Pair`,
    await uniswapV2Factory.getPair(WETH.address, PEPE.address)
  );
  console.log("6-1: Create Pair USDT-PEPE");
  await uniswapV2Router02
    .addLiquidity(
      USDT.address,
      PEPE.address,
      ethers.utils.parseUnits("1500", 6),
      ethers.utils.parseUnits("3333", 6),
      1,
      1,
      deployer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());

  console.log("6-2: Add Liquidity USDT-PEPE");

  console.log("6: Successfully deployed Uniswap Pairs");
}
deployMockPair();
