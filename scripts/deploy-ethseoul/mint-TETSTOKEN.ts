import { ethers } from "hardhat";
import goerli_addresses from "../../config/configs_goerli.json";
import abi_TEST from "../abi/TEST.json";
export async function mintTEST(
  to: string,
  amount: number,
  tokenAdress: string
) {
  const [signer] = await ethers.getSigners();
  const TOKEN = await ethers.getContractAt("MockERC20", tokenAdress);
  await TOKEN.mint(ethers.utils.parseEther(amount.toString()), to, {
    gasPrice: 1000000,
    gasLimit: 10000000,
  });
}
const SY: string = "0x49b68e394f715871b48130abaa64278532e54ef2";
const JK: string = "0x591D70115b76fc67001D268d09fDcc661f188fF6";
// mintTEST(SY, 1000);
// mintTEST(JK, 10000000, goerli_addresses.goerli.WBTC_18);
//mintTEST(JK, 100000, goerli_addresses.goerli.USDT_6);
//mintTEST(JK, 100000, goerli_addresses.goerli.TEST_18);
