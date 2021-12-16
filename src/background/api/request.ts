import * as oasis from '@oasisprotocol/client';
import axios from "axios";
import { NETWORK_CONFIG } from "../../constant/storageKey";
import "./axios";
import { getLocal } from "../storage/localStorage";

export function getNowUrl() {
  let localNetConfig = getLocal(NETWORK_CONFIG)
  let url = {}
  if (localNetConfig) {
    localNetConfig = JSON.parse(localNetConfig)
    let currentList = localNetConfig.currentNetList
    currentList = currentList.filter((item, index) => {
      return item.isSelect
    })
    url = currentList && currentList.length > 0 ? currentList[0] : ""
  }
  return url
}

export async function commonFetch(url) {
  let real = getNowUrl()
  let fetchUrl = real.url + url
  return new Promise((resolve, reject) => {
    axios.get(fetchUrl).then((response) => {
      resolve(response.data)
    }).catch(error => {
      reject({ error: error })
    })
  })
}

export function getOasisClient(){
  let real = getNowUrl()
  let fetchUrl = real.grpc
  const oasisClient = new oasis.client.NodeInternal(fetchUrl)
  return oasisClient
}
