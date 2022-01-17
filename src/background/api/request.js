import * as oasis from '@oasisprotocol/client';
import axios from "axios";
import { NETWORK_CONFIG } from "../../constant/storageKey";
import "./axios";
import { getLocal } from "../storage/localStorage";
import { isContainBaseUrl } from "../../utils/utils"

export function getNowUrl() {
  let localNetConfigStr = getLocal(NETWORK_CONFIG)
  let url = {}
  if (localNetConfigStr) {
    let localNetConfig = JSON.parse(localNetConfigStr)
    let currentList = localNetConfig.currentNetList
    currentList = currentList.filter((item, index) => {
      return item.isSelect
    })
    url = currentList && currentList.length > 0 ? currentList[0] : ""
  }
  return url
}

export async function commonFetch(url) {
  let fetchUrl
  if(isContainBaseUrl(url)){
    fetchUrl = url
  }else{
    let real = getNowUrl()
    fetchUrl = real.url + url
  }
  return new Promise((resolve, reject) => {
    axios.get(fetchUrl).then((response) => {
      resolve(response.data)
    }).catch(error => {
      reject({ error: error })
    })
  })
}

export function getOasisClient(config){
  let fetchUrl 
  if(config && config.grpc){
    fetchUrl = config.grpc
  }else{
    let real = getNowUrl()
    fetchUrl = real.grpc
  }
  const oasisClient = new oasis.client.NodeInternal(fetchUrl)
  return oasisClient
}
