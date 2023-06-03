// use-config.ts

import { network } from "hardhat";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const getFilePath = (networkAlias?: string) => {
  networkAlias = networkAlias ?? network.name ?? "localhost";
  const filePath = join(__dirname, `../../config/configs_${networkAlias}.json`);
  if (!existsSync(filePath)) {
    writeFileSync(filePath, "{}");
  }
  return filePath;
};

export const getConfigs = (networkAlias?: string): any => {
  const filePath = getFilePath(networkAlias);
  const config = JSON.parse(readFileSync(filePath, "utf-8") || "{}");
  return config || {};
};
export const resetConfigs = (networkAlias?: string) => {
  const filePath = getFilePath(networkAlias);
  writeFileSync(filePath, JSON.stringify({}, null, 2));
};

// key: "A__B__C"
export const saveConfig = <T = string>(
  key: string,
  value: T,
  networkAlias?: string
) => {
  const filePath = getFilePath(networkAlias);
  const config = JSON.parse(readFileSync(filePath, "utf-8") || "{}");

  const keys = key.split("__");
  let leaf = config;
  for (const _key of keys.slice(0, -1)) {
    leaf[_key] = leaf[_key] || {};
    leaf = leaf[_key];
  }
  leaf[keys[keys.length - 1]] = value;

  writeFileSync(filePath, JSON.stringify(config, null, 2));
};
