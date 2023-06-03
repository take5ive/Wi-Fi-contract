import { ethers, network } from "hardhat";
import { saveConfig } from "./use-config";

export async function deployMultiCall() {
  const [deployer] = await ethers.getSigners();
  const multiCall = await ethers.getContractFactory("Multicall2");
  const multicall = await multiCall.deploy().then((tx) => tx.deployed());
  console.log("Multicall deployed");
  saveConfig(`${network.name}__Multicall`, multicall.address);
}
deployMultiCall();
