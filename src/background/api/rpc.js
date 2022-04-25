import * as oasis from "@oasisprotocol/client";
import { getOasisClient } from "./request";

export async function getRpcAccount(address) {
  const oasisClient = getOasisClient();
  let shortKey = await oasis.staking.addressFromBech32(address);
  let height = oasis.consensus.HEIGHT_LATEST;
  let account = await oasisClient
    .stakingAccount({ height: height, owner: shortKey })
    .catch((err) => err);
  return account;
}
