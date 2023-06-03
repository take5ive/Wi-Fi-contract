import { ethers, network } from "hardhat";
import baobab_address from "../../config/configs_baobab.json";
import goerli_addresses from "../../config/configs_goerli.json";
import chiado_addresses from "../../config/configs_chiado.json";
import mumbai_addresses from "../../config/configs_mumbai.json";
import { saveConfig } from "./use-config";
export async function deployFunnel(WETHaddress: string) {
  //* Deploy UniswapFunnel
  const UniswapV2Funnel_f = await ethers.getContractFactory("UniswapV2Funnel");
  const UniswapV2Funnel = await UniswapV2Funnel_f.deploy(WETHaddress).then(
    (tx) => tx.deployed()
  );
  saveConfig(`${network.name}__UniswapV2Funnel`, UniswapV2Funnel.address);
  console.log("7: Successfully deployed UniswapFunnel");
}

deployFunnel(chiado_addresses.chiado.WETH_18);
