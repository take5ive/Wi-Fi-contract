import { ethers } from "hardhat";
import * as factoryArtifacts from "./json/UniswapV2Factory.json";
import * as routerArtifacts from "./json/UniswapV2Router.json";
import * as tokenArtifacts from "./json/MockERC20.json";
import * as wethArtifacts from "./json/WETH.json";
import {
  IUniswapV2ERC20,
  IUniswapV2Factory,
  IUniswapV2Router02,
  MockERC20,
} from "../typechain-types";

export async function deployFixture() {
  const [signer] = await ethers.getSigners();

  const wethFactory = new ethers.ContractFactory(
    wethArtifacts.abi,
    wethArtifacts.bytecode,
    signer
  );
  const tokenFactory = new ethers.ContractFactory(
    tokenArtifacts.abi,
    tokenArtifacts.bytecode,
    signer
  );
  const factoryFactory = new ethers.ContractFactory(
    factoryArtifacts.abi,
    factoryArtifacts.bytecode,
    signer
  );
  const routerFactory = new ethers.ContractFactory(
    routerArtifacts.abi,
    routerArtifacts.bytecode,
    signer
  );

  const WETH = await wethFactory.deploy().then((token) => token.deployed());
  const token0 = (await tokenFactory
    .deploy(signer.address, "Token0", "T0", 18)
    .then((token) => token.deployed())) as MockERC20;
  const token1 = (await tokenFactory
    .deploy(signer.address, "Token1", "T1", 18)
    .then((token) => token.deployed())) as MockERC20;
  const token2 = (await tokenFactory
    .deploy(signer.address, "Token2", "T2", 18)
    .then((token) => token.deployed())) as MockERC20;

  const factory = (await factoryFactory
    .deploy(signer.address)
    .then((f) => f.deployed())) as IUniswapV2Factory;
  const router = (await routerFactory.deploy(
    factory.address,
    WETH.address
  )) as IUniswapV2Router02;

  await factory
    .createPair(WETH.address, token1.address)
    .then((tx) => tx.wait());
  await factory
    .createPair(WETH.address, token2.address)
    .then((tx) => tx.wait());
  await factory
    .createPair(token1.address, token2.address)
    .then((tx) => tx.wait());

  // const pair01 = await factory.getPair(token0.address, token1.address);
  // const pair02 = await factory.getPair(token0.address, token2.address);
  // const pair12 = await factory.getPair(token1.address, token2.address);

  await token0
    .mint(signer.address, ethers.utils.parseEther("100000"))
    .then((tx) => tx.wait());
  await token0
    .approve(router.address, ethers.constants.MaxUint256)
    .then((tx) => tx.wait());

  await token1
    .mint(signer.address, ethers.utils.parseEther("100000"))
    .then((tx) => tx.wait());
  await token1
    .approve(router.address, ethers.constants.MaxUint256)
    .then((tx) => tx.wait());

  await token2
    .mint(signer.address, ethers.utils.parseEther("100000"))
    .then((tx) => tx.wait());
  await token2
    .approve(router.address, ethers.constants.MaxUint256)
    .then((tx) => tx.wait());

  // mint to
  // const to = "";
  // await token0
  //   .mint(to, ethers.utils.parseEther("10000"))
  //   .then((tx) => tx.wait());
  // await token1
  //   .mint(to, ethers.utils.parseEther("10000"))
  //   .then((tx) => tx.wait());
  // await token2
  //   .mint(to, ethers.utils.parseEther("10000"))
  //   .then((tx) => tx.wait());

  // await WETH.deposit({ value: ethers.utils.parseEther("100") }).then((tx) =>
  //   tx.wait()
  // );

  // WETH

  await router
    .addLiquidityETH(
      token0.address,
      ethers.utils.parseEther("200"),
      ethers.utils.parseEther("200"),
      ethers.utils.parseEther("200"),
      signer.address,
      ethers.constants.MaxUint256,
      { value: ethers.utils.parseEther("200") }
    )
    .then((tx) => tx.wait());
  await router
    .addLiquidityETH(
      token1.address,
      ethers.utils.parseEther("200"),
      ethers.utils.parseEther("200"),
      ethers.utils.parseEther("200"),
      signer.address,
      ethers.constants.MaxUint256,
      { value: ethers.utils.parseEther("200") }
    )
    .then((tx) => tx.wait());
  await router
    .addLiquidityETH(
      token2.address,
      ethers.utils.parseEther("200"),
      ethers.utils.parseEther("200"),
      ethers.utils.parseEther("200"),
      signer.address,
      ethers.constants.MaxUint256,
      { value: ethers.utils.parseEther("200") }
    )
    .then((tx) => tx.wait());

  /// ERC20s
  await router
    .addLiquidity(
      token0.address,
      token1.address,
      ethers.utils.parseEther("301"),
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("301"),
      ethers.utils.parseEther("100"),
      signer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());
  await router
    .addLiquidity(
      token0.address,
      token2.address,
      ethers.utils.parseEther("5123"),
      ethers.utils.parseEther("20110"),
      ethers.utils.parseEther("5123"),
      ethers.utils.parseEther("20110"),
      signer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());
  await router
    .addLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("1019"),
      ethers.utils.parseEther("1920"),
      ethers.utils.parseEther("1019"),
      ethers.utils.parseEther("1920"),
      signer.address,
      ethers.constants.MaxUint256
    )
    .then((tx) => tx.wait());
  const pair01 = await factory.getPair(token0.address, token1.address);
  const pair02 = await factory.getPair(token0.address, token2.address);
  const pair12 = await factory.getPair(token1.address, token2.address);
  console.log("WETH address: ", WETH.address);
  console.log("Token0 address: ", token0.address);
  console.log("Token1 address: ", token1.address);
  console.log("Token2 address: ", token2.address);
  console.log("Factory address: ", factory.address);
  console.log("Router address: ", router.address);
  console.log("Pair01 address: ", pair01);
  console.log("Pair02 address: ", pair02);
  console.log("Pair12 address: ", pair12);

  return {
    WETH: WETH.address,
    token0: token0.address,
    token1: token1.address,
    token2: token2.address,
    factory: factory.address,
    router: router.address,
    pair01,
    pair02,
    pair12,
  };
}
