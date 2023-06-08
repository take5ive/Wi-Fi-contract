import { ethers } from "hardhat";
import {
  TokenInfo,
  TokenInfoToSetcToken,
  deployToken,
  settingCToken,
} from "../utils/deploy-setting";
import address_hardhat from "../config/configs_hardhat.json";
const tokensInfo: TokenInfo = {
  DAI: [ethers.utils.parseEther("1000"), "DAI", 18],
  USDC: [ethers.utils.parseUnits("1000", 6), "USDC", 6],
  PEPE: [ethers.utils.parseEther("100"), "PEPE", 18],
};
const tokensInfoToSetcToken: TokenInfoToSetcToken = {
  cDAI: [
    "cDAI",
    18,
    address_hardhat.hardhat.DAI,
    ethers.utils.parseEther("20"),
  ],
  cUSDC: [
    "cUSDC",
    6,
    address_hardhat.hardhat.USDC,
    ethers.utils.parseUnits("20", 6),
  ],
  cPEPE: [
    "cPEPE",
    18,
    address_hardhat.hardhat.PEPE,
    ethers.utils.parseEther("20"),
  ],
};

describe("CompoundFunnel", () => {
  it("deploy Fixtures", async () => {
    await deployToken(tokensInfo, "ETH");
    await settingCToken(tokensInfoToSetcToken);
  });
});
