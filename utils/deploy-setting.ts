import { ethers, network } from "hardhat";
import { MockERC20 } from "../typechain-types";
import { saveConfig } from "../scripts/deploy-ethseoul/use-config";
import { BigNumber } from "ethers";

export interface TokenInfo {
  [name: string]: [amount: BigNumber, symbol: string, decimals: number];
}
export async function deployToken(tokens: TokenInfo, currency?: string) {
  // deploy MockERC20 with TokenInfo
  for (const [name, [amount, symbol, decimals]] of Object.entries(tokens)) {
    const tokenFactory = await ethers.getContractFactory("MockERC20");
    const token: MockERC20 = await tokenFactory
      .deploy(amount, name, symbol, decimals)
      .then((tx) => tx.deployed());
    saveConfig(`${network.name}__${name}`, token.address);
  }
  // deploy Wrapped Native Token
  const wethFactory = await ethers.getContractFactory("WETH9");
  const weth = await wethFactory.deploy().then((weth) => weth.deployed());
  saveConfig(`${network.name}__W${currency ?? network.name}`, weth.address);
}
export interface TokenInfoToSetcToken {
  [name: string]: [
    symbol: string,
    decimals: number,
    address: string,
    initialExchangeRateMantissa: BigNumber
  ];
}
export async function settingCToken(tokens: TokenInfoToSetcToken) {
  //deploy Comptroller
  const comptrollerFactory = await ethers.getContractFactory("Comptroller");
  const comptroller = await comptrollerFactory
    .deploy()
    .then((tx) => tx.deployed());
  saveConfig(`${network.name}__Comptroller`, comptroller.address);
  // deploy InterestModel
  const interestmodelFactory = await ethers.getContractFactory("InterestModel");
  const interestmodel = await interestmodelFactory
    .deploy()
    .then((tx) => tx.deployed());
  saveConfig(`${network.name}__InterestModel`, interestmodel.address);
  // deploy cErc20
  for (const [
    name,
    [symbol, decimals, address, intialExchangeRateMantissa],
  ] of Object.entries(tokens)) {
    const cErc20Factory = await ethers.getContractFactory("CErc20");
    const cErc20 = await cErc20Factory.deploy().then((tx) => tx.deployed());
    await cErc20[
      "initialize(address,address,address,uint256,string,string,uint8)"
    ](
      address,
      comptroller.address,
      interestmodel.address,
      intialExchangeRateMantissa,
      name,
      symbol,
      decimals
    );
    saveConfig(`${network.name}__c${name}`, cErc20.address);
    // supplyMarket cToken
    comptroller._supportMarket(cErc20.address);
  }
}
