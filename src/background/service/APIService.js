import * as oasis from '@oasisprotocol/client';
import * as oasisRT from '@oasisprotocol/client-rt';
import { decode } from 'base64-arraybuffer';
import BigNumber from 'bignumber.js';
import * as bip39 from 'bip39';
import extension from 'extensionizer';
import { Buffer } from 'safe-buffer';
import nacl from 'tweetnacl';
import { cointypes, LOCK_TIME } from '../../../config';
import { RUNTIME_ACCOUNT_TYPE } from '../../constant/paratimeConfig';
import { FROM_BACK_TO_RECORD, SET_LOCK, TX_SUCCESS } from '../../constant/types';
import { ACCOUNT_TYPE, TRANSACTION_RUNTIME_TYPE, TRANSACTION_TYPE } from "../../constant/walletType";
import { getLanguage } from '../../i18n';
import { openTab, showErrorNotification } from "../../utils/commonMsg";
import { amountDecimals, getEvmBech32Address, getCurrentNetConfig, getRuntimeConfig, hex2uint, publicKeyToAddress, toNonExponential, trimSpace, uint2hex, getNetTypeByUrl } from '../../utils/utils';
import { getRuntimeTxDetail, getSubmitStatus } from '../api';
import { getNowUrl } from '../api/request';
import { buildParatimeTxBody, buildTxBody, getChainContext, removeLocalApproveAndDepositTransactionCacheByHash, setLocalApproveTransactionCache, setLocalDepositTransactionCache, submitTx } from '../api/txHelper';
import { get, removeValue, save } from '../storage/storageService';

const EthUtils = require('ethereumjs-util');
const ObservableStore = require('obs-store')
const encryptUtils = require('@metamask/browser-passworder')
const RETRY_TIME = 4


const default_account_name = "Account 1"
class APIService {
    constructor() {
        this.memStore = new ObservableStore(this.initLockedState())
        this.statusTimer = {}
        this.runtimeStatusTimer = {}
        this.encryptor = encryptUtils
    }
    getStore = () => {
        return this.memStore.getState()
    };
    getCreateMnemonic = (isNewMne) => {
        if (isNewMne) {
            let mnemonic = bip39.generateMnemonic(256)
            this.memStore.updateState({ mne: mnemonic })
            return mnemonic
        } else {
            let mne = this.getStore().mne
            if (mne) {
                return mne
            } else {
                let mnemonic = bip39.generateMnemonic(256)
                this.memStore.updateState({ mne: mnemonic })
                return mnemonic
            }
        }
    }
    filterCurrentAccount = (accountList, currentAddress) => {
        for (let index = 0; index < accountList.length; index++) {
            const account = accountList[index];
            if (account.address === currentAddress) {
                return account
            }
        }
    }
    async submitPassword(password) {
        let encryptedVault = await get("keyringData")
        try {
            const vault = await this.encryptor.decrypt(password, encryptedVault.keyringData)
            let currentAddress = vault[0].currentAddress
            let currentAccount = this.filterCurrentAccount(vault[0].accounts, currentAddress)
            this.memStore.updateState({
                data: vault,
                isUnlocked: true,
                password,
                currentAccount
            })
            return this.getAccountWithoutPrivate(currentAccount)
        } catch (error) {
            return { error: 'passwordError', type: "local" }
        }
    }
    checkPassword(password) {
        return this.getStore().password === password
    }
    setLastActiveTime() {
        let localData = this.getStore().data
        let isUnlocked = this.getStore().isUnlocked
        if (localData && isUnlocked) {
            if (this.activeTimer) {
                clearTimeout(this.activeTimer)
            }
            if (!LOCK_TIME) {
                return
            }

            this.activeTimer = setTimeout(() => {
                this.setUnlockedStatus(false)
            }, LOCK_TIME * 1000)
        }

    }
    initLockedState=()=>{
        return {
          isUnlocked: false,
          data: '',
          password: '',
          currentAccount: {},
          mne: ""
        };
      }

    resetWallet=()=>{
      this.memStore.putState(this.initLockedState())
      return
    }
    setUnlockedStatus(status) {
        if (!status) {
            this.memStore.putState(this.initLockedState())
            extension.runtime.sendMessage({
                type: FROM_BACK_TO_RECORD,
                action: SET_LOCK,
            });
        }else{
            this.memStore.updateState({ isUnlocked: status })
        }
    }
    getCurrentAccount = async () => {
        let localAccount = await get("keyringData")
        let currentAccount = this.getStore().currentAccount
        let isUnlocked = this.getStore().isUnlocked
        if (localAccount && localAccount.keyringData) {
            currentAccount.localAccount = {
                keyringData: "keyringData"
            }
        }
        currentAccount.isUnlocked = isUnlocked
        return currentAccount
    };
    createPwd = (password) => {
        this.memStore.updateState({ password })
    }
    createAccount = async (mnemonic) => {
        this.memStore.updateState({ mne: "" })
        let wallet = await this.importWalletByMnemonicHDkey(mnemonic)

        let keyringData = [{
            mnemonic: await this.encryptor.encrypt(this.getStore().password, mnemonic),
            accounts: [{
                address: wallet.address,
                privateKey: await this.encryptor.encrypt(this.getStore().password, wallet.privKey_hex),
                publicKey: wallet.publicKey,
                type: ACCOUNT_TYPE.WALLET_INSIDE,
                hdPath: wallet.hdIndex,
                accountName: default_account_name,
                typeIndex: 1
            }],
            currentAddress: wallet.address
        }];
        let account = keyringData[0].accounts[0];

        let encryptData = await this.encryptor.encrypt(this.getStore().password, keyringData)
        this.memStore.updateState({ data: keyringData })
        save({ keyringData: encryptData })
        this.memStore.updateState({ currentAccount: account })
        this.setUnlockedStatus(true)

        return this.getAccountWithoutPrivate(account)
    }
    getAllAccount = (isDapp = false) => {
        let data = this.getStore().data
        let accountList = data[0].accounts
        accountList = accountList.map((item, index) => {
            let newItem = this.getAccountWithoutPrivate(item)
            return newItem
        })
        let newAccountList = this.accountSort(accountList, isDapp)
        let currentAccount = this.getStore().currentAccount
        return {
            accounts: newAccountList,
            currentAddress: currentAccount.address
        }
    }
    accountSort = (accountList, isDapp = false) => {
        let newList = accountList
        let commonList = []
        let createList = newList.filter((item) => {
            return item.type === ACCOUNT_TYPE.WALLET_INSIDE
        })
        let importList = newList.filter((item) => {
            return item.type === ACCOUNT_TYPE.WALLET_OUTSIDE
        })
        let ledgerList = newList.filter((item) => {
            return item.type === ACCOUNT_TYPE.WALLET_LEDGER
        })
        commonList = [...createList, ...importList, ...ledgerList]
        if (isDapp) {
            return {commonList}
        }
        let observeList = newList.filter((item) => {
            return item.type === ACCOUNT_TYPE.WALLET_OBSERVE
        })
        let evmAccountList = newList.filter((item) => {
            return item.type === ACCOUNT_TYPE.WALLET_OUTSIDE_SECP256K1
        })
        commonList = [...commonList, ...observeList]
        let evmList = evmAccountList
        return {commonList,evmList}
    }
    importWalletByMnemonicHDkey = async (mnemonic, index = 0) => {
        const keyPair = await oasis.hdkey.HDKey.getAccountSigner(
            mnemonic,
            index,
        );
        let privateHex = uint2hex(keyPair.secretKey)
        let publicKey = uint2hex(keyPair.publicKey)
        let address = await publicKeyToAddress(keyPair.publicKey)
        let wallet = {
            privKey_hex: privateHex,
            publicKey,
            address: address,
            hdIndex: index
        }
        return wallet
    }

    addHDNewAccount = async (accountName) => {
        let data = this.getStore().data
        let accounts = data[0].accounts

        let createList = accounts.filter((item, index) => {
            return item.type === ACCOUNT_TYPE.WALLET_INSIDE
        })
        if (createList.length > 0) {
            let maxHdIndex = createList[createList.length - 1].hdPath
            let lastHdIndex = maxHdIndex + 1
            let typeIndex = createList[createList.length - 1].typeIndex + 1

            let mnemonicEn = data[0].mnemonic
            let mnemonic = await this.encryptor.decrypt(this.getStore().password, mnemonicEn)
            let wallet = await this.importWalletByMnemonicHDkey(mnemonic, lastHdIndex)
            let privKeyEncrypt = await this.encryptor.encrypt(this.getStore().password, wallet.privKey_hex)
            const account = {
                address: wallet.address,
                privateKey: privKeyEncrypt,
                publicKey: wallet.publicKey,
                type: ACCOUNT_TYPE.WALLET_INSIDE,
                hdPath: lastHdIndex,
                accountName,
                typeIndex: typeIndex
            }
            data[0].currentAddress = account.address
            data[0].accounts.push(account)
            let encryptData = await this.encryptor.encrypt(this.getStore().password, data)

            this.memStore.updateState({ data: data })
            save({ keyringData: encryptData })
            this.memStore.updateState({ currentAccount: account })
            return this.getAccountWithoutPrivate(account)
        }
    };
    fromPrivateKey = (key) => {
        try {
            if (key.length === 32) {
                return nacl.sign.keyPair.fromSeed(key).secretKey
            } else if (key.length === 64) {
                let res = nacl.sign.keyPair.fromSecretKey(key).secretKey
                return res
            } else {
                throw new Error('Invalid private key shape')
            }
        } catch (e) {
            throw e
        }
    }
    parseKey = (key) => {
        try {
            const keyWithoutEnvelope = trimSpace(key)
            const key_bytes = decode(keyWithoutEnvelope)
            return this.fromPrivateKey(new Uint8Array(key_bytes))
        } catch (e) {
            throw e
        }
    }
    /**
     * import wallet by ed25519 private key
     * @param {*} key
     * @returns
     */
    importWalletByPrivateKey = async (privateBase64) => {
        let secretKey = this.parseKey(privateBase64)
        const publicKeyBytes = nacl.sign.keyPair.fromSecretKey(secretKey).publicKey
        let walletAddress = await publicKeyToAddress(publicKeyBytes)
        const publicKey = uint2hex(publicKeyBytes)
        let privateHex = Buffer.from(privateBase64, 'base64').toString('hex')
        return {
            privKey_base64: privateBase64,
            privKey_hex: privateHex,
            publicKey,
            address: walletAddress,
        }
    }
    /**
     * import wallet by secp256k1 private key
     * @param {*} privKey
     * @returns
     */
    importSecWalletByPrivateKey = async (priKey) => {
        let priBuffer = Buffer.from(priKey.replace('0x', ''), 'hex');

        let isValid =  EthUtils.isValidPrivate(priBuffer)
        if(!isValid){
            throw new Error('privateError')
        }
        let publicKeyBuffer =  EthUtils.privateToPublic(priBuffer)
        let publicKeyHex =  publicKeyBuffer.toString('hex');
        let publicKey = EthUtils.addHexPrefix(publicKeyHex);

        let addressBuffer =  EthUtils.privateToAddress(priBuffer)
        let addressHex = addressBuffer.toString('hex');
        let address = EthUtils.addHexPrefix(addressHex);
        let walletAddress = EthUtils.toChecksumAddress(address);

        let oasisAddress = await getEvmBech32Address(walletAddress)
        return {
            privKey_hex: priKey,
            publicKey,
            address: oasisAddress,
            evmAddress:walletAddress
        }
    }
    /**
     *  import wallet by private key
     */
    addImportAccount = async (privateKey, accountName,accountType) => {
        try {
            let wallet
            let currentAccountType = accountType || ACCOUNT_TYPE.WALLET_OUTSIDE
            if(currentAccountType === ACCOUNT_TYPE.WALLET_OUTSIDE_SECP256K1){
                wallet = await this.importSecWalletByPrivateKey(privateKey)
            }else{
                wallet = await this.importWalletByPrivateKey(privateKey)
            }
            let data = this.getStore().data
            let accounts = data[0].accounts
            let error = {}

            for (let index = 0; index < accounts.length; index++) {
                const account = accounts[index];
                if (account.address === wallet.address) {
                    error = { "error": 'importRepeat', type: "local" }
                    break
                }
            }
            if (error.error) {
                return error
            }
            let importList = accounts.filter((item, index) => {
                return item.type === currentAccountType
            })
            let typeIndex = ""
            if (importList.length == 0) {
                typeIndex = 1
            } else {
                typeIndex = importList[importList.length - 1].typeIndex + 1
            }

            let privKeyEncrypt = await this.encryptor.encrypt(this.getStore().password, wallet.privKey_hex)
            let account = {
                address: wallet.address,
                privateKey: privKeyEncrypt,
                publicKey: wallet.publicKey,
                type: currentAccountType,
                accountName,
                typeIndex
            }
            if(wallet.evmAddress){
                account.evmAddress = wallet.evmAddress
            }
            data[0].currentAddress = account.address
            data[0].accounts.push(account)
            let encryptData = await this.encryptor.encrypt(this.getStore().password, data)

            this.memStore.updateState({ data: data })
            save({ keyringData: encryptData })
            this.memStore.updateState({ currentAccount: account })
            return this.getAccountWithoutPrivate(account)
        } catch (error) {
            return { "error": "privateError", type: "local" }
        }

    }
    /**
     * import ledger wallet
     */
    addLedgerAccount = async (addressList, accountName) => {
        try {

            let data = this.getStore().data
            let accounts = data[0].accounts

            let ledgerList = accounts.filter((item, index) => {
                return item.type === ACCOUNT_TYPE.WALLET_LEDGER
            })
            let typeIndex = ""
            if (ledgerList.length === 0) {
                typeIndex = 1
            } else {
                typeIndex = ledgerList[ledgerList.length - 1].typeIndex + 1
            }
            let ledgerAccountList = []

            for (let index = 0; index < addressList.length; index++) {
                const ledgerAccount = addressList[index];

                ledgerAccountList.push({
                    address: ledgerAccount.address,

                    path: ledgerAccount.path,
                    publicKey: ledgerAccount.publicKey,
                    ledgerHdIndex: ledgerAccount.ledgerHdIndex,
                    type: ACCOUNT_TYPE.WALLET_LEDGER,
                    accountName: !index ? accountName : accountName + "-" + index,
                    typeIndex: parseInt(typeIndex) + index
                })

            }

            const account = ledgerAccountList[0]

            data[0].currentAddress = account.address

            data[0].accounts = data[0].accounts.concat(ledgerAccountList)

            let encryptData = await this.encryptor.encrypt(this.getStore().password, data)

            this.memStore.updateState({ data: data })
            save({ keyringData: encryptData })
            this.memStore.updateState({ currentAccount: account })
            return this.getAccountWithoutPrivate(account)
        } catch (error) {
            return { "error": JSON.stringify(error) }
        }
    }
    /**
     * import watch account
     */
    addObserveAccount = async (address, accountName) => {
        try {
            let data = this.getStore().data
            let accounts = data[0].accounts
            let error = {}

            for (let index = 0; index < accounts.length; index++) {
                const account = accounts[index];
                if (account.address === address) {
                    error = { "error": 'importRepeat', type: "local" }
                    break
                }
            }
            if (error.error) {
                return error
            }
            let ledgerList = accounts.filter((item, index) => {
                return item.type === ACCOUNT_TYPE.WALLET_OBSERVE
            })
            let typeIndex = ""
            if (ledgerList.length === 0) {
                typeIndex = 1
            } else {
                typeIndex = ledgerList[ledgerList.length - 1].typeIndex + 1
            }

            const account = {
                address: address,
                type: ACCOUNT_TYPE.WALLET_OBSERVE,
                accountName,
                typeIndex
            }
            data[0].currentAddress = account.address
            data[0].accounts.push(account)
            let encryptData = await this.encryptor.encrypt(this.getStore().password, data)

            this.memStore.updateState({ data: data })
            save({ keyringData: encryptData })
            this.memStore.updateState({ currentAccount: account })
            return this.getAccountWithoutPrivate(account)
        } catch (error) {
            return { "error": JSON.stringify(error) }
        }
    }
    setCurrentAccount = async (address) => {
        let data = this.getStore().data
        let accounts = data[0].accounts
        let currentAccount = {}
        for (let index = 0; index < accounts.length; index++) {
            let account = accounts[index];
            if (account.address === address) {
                currentAccount = account
                data[0].currentAddress = address

                let encryptData = await this.encryptor.encrypt(this.getStore().password, data)
                this.memStore.updateState({ data: data })
                save({ keyringData: encryptData })
                this.memStore.updateState({ currentAccount: account })
            }
        }
        let accountList = data[0].accounts
        accountList = accountList.map((item, index) => {
            return this.getAccountWithoutPrivate(item)
        })
        let newAccountList = this.accountSort(accountList)
        return {
            accountList: newAccountList,
            currentAccount: this.getAccountWithoutPrivate(currentAccount),
            currentAddress: address
        }
    }
    changeAccountName = async (address, accountName) => {
        let data = this.getStore().data
        let accounts = data[0].accounts
        let account
        for (let index = 0; index < accounts.length; index++) {
            account = accounts[index];
            if (account.address === address) {
                data[0].accounts[index].accountName = accountName
                account = accounts[index]
                let encryptData = await this.encryptor.encrypt(this.getStore().password, data)
                this.memStore.updateState({ data: data })
                save({ keyringData: encryptData })
                break
            }
        }
        let newAccount = this.getAccountWithoutPrivate(account)
        return { account: newAccount }
    }
    deleteAccount = async (address, password) => {
        let isCorrect = this.checkPassword(password)
        if (isCorrect) {
            let data = this.getStore().data
            let accounts = data[0].accounts
            accounts = accounts.filter((item, index) => {
                return item.address !== address
            })
            let currentAccount = this.getStore().currentAccount
            if (address === currentAccount.address) {
                currentAccount = accounts[0]
                data[0].currentAddress = currentAccount.address
            }
            data[0].accounts = accounts
            let encryptData = await this.encryptor.encrypt(password, data)
            this.memStore.updateState({ data: data, currentAccount })
            save({ keyringData: encryptData })
            return this.getAccountWithoutPrivate(currentAccount)
        } else {
            return { error: 'passwordError', type: "local" }
        }
    }
    getMnemonic = async (pwd) => {
        let isCorrect = this.checkPassword(pwd)
        if (isCorrect) {
            let data = this.getStore().data
            let mnemonicEn = data[0].mnemonic
            let mnemonic = await this.encryptor.decrypt(pwd, mnemonicEn)
            return mnemonic
        } else {
            return { error: 'passwordError', type: "local" }
        }
    }
    updateSecPassword = async (oldPwd, pwd) => {
        try {
            let isCorrect = this.checkPassword(oldPwd)
            if (isCorrect) {
                let data = this.getStore().data

                let accounts = data[0].accounts

                let mnemonicEn = data[0].mnemonic
                let mnemonic = await this.encryptor.decrypt(oldPwd, mnemonicEn)
                mnemonic = await this.encryptor.encrypt(pwd, mnemonic)
                let newAccounts = []
                for (let index = 0; index < accounts.length; index++) {
                    const account = accounts[index];
                    let privateKeyEn = account.privateKey
                    if (privateKeyEn) {
                        let privateKey = await this.encryptor.decrypt(oldPwd, privateKeyEn)
                        privateKey = await this.encryptor.encrypt(pwd, privateKey)
                        newAccounts.push({
                            ...account,
                            privateKey,
                        })
                    } else {
                        newAccounts.push({
                            ...account,
                        })
                    }
                }
                data[0].accounts = newAccounts
                data[0].mnemonic = mnemonic
                let encryptData = await this.encryptor.encrypt(pwd, data)
                this.memStore.updateState({ password: pwd })
                await removeValue("keyringData")
                await save({ keyringData: encryptData })
                return { code: 0 }
            } else {
                return { error: 'passwordError', type: "local" }
            }
        } catch (error) {
            return { error: 'passwordError', type: "local" }
        }

    }
    hexToBase64 = (privateHex) => {
        return Buffer.from(privateHex, 'hex').toString("base64")
    }
    getPrivateKey = async (address, pwd) => {
        let isCorrect = this.checkPassword(pwd)
        if (isCorrect) {
            let data = this.getStore().data
            let accounts = data[0].accounts
            accounts = accounts.filter((item, index) => {
                return item.address === address
            })
            let nowAccount = accounts[0]
            const privateKey = await this.encryptor.decrypt(pwd, nowAccount.privateKey)
            if(nowAccount.type === ACCOUNT_TYPE.WALLET_OUTSIDE_SECP256K1){
                return privateKey
            }
            let base64PrivKey = this.hexToBase64(privateKey)
            return base64PrivKey
        } else {
            return { error: 'passwordError', type: "local" }
        }
    }
    getCurrentPrivateKey = async () => {
        let currentAccount = this.getStore().currentAccount
        let password = this.getStore().password
        const privateKey = await this.encryptor.decrypt(password, currentAccount.privateKey)
        return privateKey
    }
    getCurrentSigner = async (address) => {
        return new Promise(async (resolve, reject) => {
            let currentAccount = this.getStore().currentAccount
            if (address === currentAccount.address) {
                const privateKey = await this.getCurrentPrivateKey()
                const bytes = hex2uint(privateKey)
                let signAccount = this.signerFromPrivateKey(bytes)
                let signer = new oasis.signature.BlindContextSigner(signAccount)
                resolve(signer)
            } else {
                reject({ error: "Please change connect to current account", })
            }
        })
    }
    getAccountWithoutPrivate = (account) => {
        let newAccount = { ...account }
        delete newAccount.privateKey;
        return newAccount
    }
    signerFromPrivateKey = (privateKey) => {
        return oasis.signature.NaclSigner.fromSecret(privateKey, 'this key is not important')
    }
    /**
     * transfer
     * @param {*} params
     * @returns
     */
    sendTransaction = async (params) => {
        const tw = oasis.staking.transferWrapper()
        params.method = TRANSACTION_TYPE.Transfer
        return this.submitTxBody(params, tw)
    }
    /**
     * delegate stake
     * @param {*} params
     * @returns
     */
    delegateTransaction = async (params) => {
        const tw = oasis.staking.addEscrowWrapper()
        params.method = TRANSACTION_TYPE.AddEscrow
        return this.submitTxBody(params, tw)
    }
    /**
    * undelegate stake
    * @param {*} params
    * @returns
    */
    undelegateTransaction = async (params) => {
        const tw = oasis.staking.reclaimEscrowWrapper()
        params.method = TRANSACTION_TYPE.ReclaimEscrow
        return this.submitTxBody(params, tw)
    }
    /**
     * withdraw amount when set allowance
     * @param {*} params
     * @returns
     */
    setWithdrawToConsensusAccount = async (params) => {
        const CONSENSUS_RT_ID = oasis.misc.fromHex(params.runtimeId)
        const consensusWrapper = new oasisRT.consensusAccounts.Wrapper(CONSENSUS_RT_ID);
        const withdrawWrapper = consensusWrapper.callWithdraw()
        return this.submitParatimeAccountTx(params, withdrawWrapper)
    }
    /**
     * set deposit
     * @param {*} params
     */
    setAllowanceAndDepositToParatimeAccount= (params)=>{
        return new Promise( async (resolve,reject)=>{
            params.allowance = new BigNumber(params.amount).toString()
            const tw = oasis.staking.allowWrapper()
            params.method = TRANSACTION_TYPE.StakingAllow
            params.toAddress = oasis.staking.addressToBech32(await oasis.staking.addressFromRuntimeID(oasis.misc.fromHex(params.runtimeId)))
            let result = await this.submitTxBody(params, tw,true,(data,approveTxHash,currentNetConfig)=>this.depositToParatimeAccount(params,resolve,reject,data,approveTxHash,currentNetConfig)).catch(err=>err)
            if(result&&result.error){
                let sendResult = {error:result.error}
                showErrorNotification(params.fromAddress,sendResult)
                reject(sendResult)
            }else if(result && result.code === 0){
                resolve(result)
            }
        })
    }  
    depositToParatimeAccount= async(params,resolve,reject,data,approveTxHash,currentNetConfig)=>{
        if(data && data.code !== 0){
            showErrorNotification(params.fromAddress,data)
            reject(data)
            approveTxHash && removeLocalApproveAndDepositTransactionCacheByHash([approveTxHash],currentNetConfig.netType)
            return 
        }
        const consensusWrapper = new oasisRT.consensusAccounts.Wrapper(oasis.misc.fromHex(params.runtimeId));
        const depositWrapper = consensusWrapper.callDeposit()
        let config =  getRuntimeConfig(params.runtimeId)
        if (config && config.accountType === RUNTIME_ACCOUNT_TYPE.EVM) {
            params.approveTxHash = approveTxHash
        }
        let submitRuntime = await this.submitParatimeAccountTx(params, depositWrapper,currentNetConfig).catch(err=>err)
        resolve(submitRuntime)
    }
    setEvmWithdrawToConsensusAccount=(params)=>{
        const CONSENSUS_RT_ID = oasis.misc.fromHex(params.runtimeId)
        const consensusWrapper = new oasisRT.consensusAccounts.Wrapper(CONSENSUS_RT_ID);
        const withdrawWrapper = consensusWrapper.callWithdraw()
        return this.submitEvmWithdrawToConsensusAccountTx(params,withdrawWrapper)
    }
    submitEvmWithdrawToConsensusAccountTx=async (params,withdrawWrapper)=>{
        try {
            let buildResult = await buildParatimeTxBody(params,withdrawWrapper)
            let nonce = buildResult.nonce
            let txWrapper = buildResult.txWrapper
            let consensusChainContext = buildResult.consensusChainContext

            const privHex = await this.getCurrentPrivateKey()
            const privU8Array = oasis.misc.fromHex(privHex);
            const ellipticSigner = oasisRT.signatureSecp256k1.EllipticSigner.fromPrivate(
                privU8Array,
                'this key is not important',
            );
            const signer = new oasisRT.signatureSecp256k1.BlindContextSigner(ellipticSigner);

            const signerInfo =({
                address_spec: {signature: {secp256k1eth: signer.public()}},
                nonce: nonce,
            });

            txWrapper.setSignerInfo([signerInfo])
            await txWrapper.sign([signer], consensusChainContext);

            await submitTx(txWrapper, RETRY_TIME)

            let u8Hash = await oasis.hash.hash(txWrapper.unverifiedTransaction[0])
            let hash = oasis.misc.toHex(u8Hash)
            let config =  getRuntimeConfig(params.runtimeId)
            if (hash && config.accountType === RUNTIME_ACCOUNT_TYPE.EVM) {
                this.createNotificationAfterRuntimeTxSucceeds(hash,params.runtimeId)
                
                return {
                    code:0,
                    txHash:hash,
                    runtimeId:params.runtimeId,
                    runtimeName:config.runtimeName,
                    type:"regular",
                    ctx:{
                        to:params.toAddress,
                        from:params.fromAddress,
                        amount:params.amount,
                        method:TRANSACTION_RUNTIME_TYPE.Withdraw,
                    }
                }
            }
            return {code:0}
        } catch (error) {
            throw {error}
        }
    }
    submitParatimeAccountTx= async(params, wrapper,currentNetConfig)=>{
        let config =  getRuntimeConfig(params.runtimeId)
        try {
            let buildResult = await buildParatimeTxBody(params,wrapper,currentNetConfig)
            let nonce = buildResult.nonce
            let txWrapper = buildResult.txWrapper
            let consensusChainContext = buildResult.consensusChainContext


            const privateKey = await this.getCurrentPrivateKey()
            const bytes = hex2uint(privateKey)
            let signAccount = this.signerFromPrivateKey(bytes)
            const signer = new oasis.signature.BlindContextSigner(signAccount)

            const signerInfo = ({
                address_spec: {signature: {ed25519: signer.public()}},
                nonce: nonce,
            });
            txWrapper.setSignerInfo([signerInfo]);
            await txWrapper.sign([signer], consensusChainContext);
            await submitTx(txWrapper, RETRY_TIME,currentNetConfig)
            let u8Hash = await oasis.hash.hash(txWrapper.unverifiedTransaction[0])
            let hash = oasis.misc.toHex(u8Hash)
            if (hash && config.accountType === RUNTIME_ACCOUNT_TYPE.EVM) {
                params.approveTxHash && currentNetConfig && setLocalDepositTransactionCache(params.fromAddress, params.approveTxHash,params.runtimeId,hash, currentNetConfig.netType)
                this.createNotificationAfterRuntimeTxSucceeds(hash,params.runtimeId,params.approveTxHash,currentNetConfig)
                return {
                    code:0,
                    txHash:hash,
                    runtimeId:params.runtimeId,
                    runtimeName:config.runtimeName,
                    type:"regular",
                    ctx:{
                        to: await getEvmBech32Address(params.toAddress),
                        from:params.fromAddress,
                        amount:params.amount,
                        method:TRANSACTION_RUNTIME_TYPE.Deposit,
                    }
                }
            }
            return {code:0}
        } catch (error) {
            if(config.accountType === RUNTIME_ACCOUNT_TYPE.EVM) {
                params.approveTxHash && removeLocalApproveAndDepositTransactionCacheByHash([params.approveTxHash],currentNetConfig.netType)
            }
            throw {error}
        }
    }
    /**
     * submit tx
     * @param {*} params
     * @param {*} tw
     * @returns
     */
    submitTxBody = async (params, tw,hideNotify,callback) => {
        try {
            let newTw = await buildTxBody(params, tw)

            let chainContext = await getChainContext(RETRY_TIME)

            const privateKey = await this.getCurrentPrivateKey()
            const bytes = hex2uint(privateKey)
            let signAccount = this.signerFromPrivateKey(bytes)
            let signer = new oasis.signature.BlindContextSigner(signAccount)

            await newTw.sign(signer, chainContext)
            await submitTx(newTw, RETRY_TIME)

            let hash = await newTw.hash()
            let feeAmount = params.feeAmount || 0

            let showAmount = params.amount

            let sendResult = {
                hash: hash,
                from: params.fromAddress,
                to: params.toAddress,
                fee: toNonExponential(amountDecimals(feeAmount, cointypes.decimals)),
                method: params.method,
                amount: showAmount,
                nonce: params.nonce
            }
            if (sendResult.hash) {
                this.checkTxStatus(sendResult.hash,hideNotify,callback)
            }
            if(!callback){
                return sendResult
            }else{
                let config =  getRuntimeConfig(params.runtimeId)
                if (config && config.accountType === RUNTIME_ACCOUNT_TYPE.EVM) {
                    let netType = getCurrentNetConfig().netType
                    setLocalApproveTransactionCache(sendResult.from,sendResult.hash,netType)
                    return {code:0}
                }
            }
        } catch (error) {
            throw {error}
        }
    }
    notification = (hash,runtimeId) => {
        let notifyId = runtimeId ?  hash +"?runtime="+runtimeId : hash
        let myNotificationID
        extension.notifications &&
        extension.notifications.onClicked.addListener(function (clickId) {
            if(myNotificationID === clickId){
                let url
                let explorerUrl = getCurrentNetConfig().explorer
                if(runtimeId){
                    url = explorerUrl + "paratimes/transactions/" + clickId
                }else{
                    url = explorerUrl + "transactions/" + clickId
                }
                openTab(url)
            }
        });
        let title = getLanguage('notificationTitle')
        let message = getLanguage('notificationContent')
        extension.notifications.create(notifyId, {
            title: title,
            message: message,
            iconUrl: '/img/oasis.png',
            type: 'basic'
        },(notificationItem)=>{
            myNotificationID = notificationItem
        });
        return
    }
    checkTxStatus = (hash,hideNotify,callback) => {
        let real = getNowUrl()
        let fetchUrl = real.url
        this.fetchTransactionStatus(hash,hideNotify,fetchUrl,callback)
    }
    onSuccess=(currentNetConfig,data,hash,hideNotify,callback)=>{
        if(!hideNotify){
            this.notification(hash)
        }
        if(callback){
            try {
                let rawData = JSON.parse(data.raw)
                callback(rawData.error,hash,currentNetConfig)
            } catch (error) {
                callback({error})
            }
        }
    } 
    fetchTransactionStatus = (hash,hideNotify,baseFetchUrl,callback) => {
        getSubmitStatus(hash,baseFetchUrl).then((data) => {
            if (data && data.txHash) {
                if(!callback){
                    extension.runtime.sendMessage({
                        type: FROM_BACK_TO_RECORD,
                        action: TX_SUCCESS,
                        data
                    });
                }
                
                let currentNetConfig =  getNetTypeByUrl(baseFetchUrl)
                this.onSuccess(currentNetConfig,data,hash,hideNotify,callback)
                if (this.statusTimer[hash]) {
                    clearTimeout(this.statusTimer[hash]);
                    this.statusTimer[hash] = null;
                }
            } else {
                this.statusTimer[hash] = setTimeout(() => {
                    this.fetchTransactionStatus(hash,hideNotify,baseFetchUrl,callback);
                }, 5000);
            }
        }).catch((error) => {
            this.statusTimer[hash] = setTimeout(() => {
                this.fetchTransactionStatus(hash,hideNotify,baseFetchUrl,callback);
            }, 5000);
        })
    }
    createNotificationAfterRuntimeTxSucceeds = (hash,runtimeId,approveTxHash,currentNetConfig) => {
        this.fetchRuntimeTxStatus(hash,runtimeId,currentNetConfig,approveTxHash)
    }
    fetchRuntimeTxStatus = (hash,runtimeId,currentNetConfig,approveTxHash) => {
        let baseFetchUrl = currentNetConfig?.url || ""
        getRuntimeTxDetail(hash,runtimeId,baseFetchUrl).then((data) => {
            if (data && data.txHash) {
                this.notification(hash,runtimeId)
                let removeCacheData = approveTxHash+"+"+runtimeId+"+"+ data.txHash
                
                let config =  getRuntimeConfig(runtimeId)
                if (config && config.accountType === RUNTIME_ACCOUNT_TYPE.EVM) {
                    approveTxHash && removeLocalApproveAndDepositTransactionCacheByHash([removeCacheData],currentNetConfig.netType)
                }

                extension.runtime.sendMessage({
                    type: FROM_BACK_TO_RECORD,
                    action: TX_SUCCESS,
                    data
                });
                if (this.runtimeStatusTimer[hash]) {
                    clearTimeout(this.runtimeStatusTimer[hash]);
                    this.runtimeStatusTimer[hash] = null;
                }
            } else {
                this.runtimeStatusTimer[hash] = setTimeout(() => {
                    this.fetchRuntimeTxStatus(hash,runtimeId,currentNetConfig,approveTxHash);
                }, 5000);
            }
        }).catch((error) => {
            this.runtimeStatusTimer[hash] = setTimeout(() => {
                this.fetchRuntimeTxStatus(hash,runtimeId,baseFetchUrl,approveTxHash);
            }, 5000);
        })
    }
    getLockStatus = () => {
        return this.getStore().isUnlocked
    }
}

const apiService = new APIService();
export default apiService;
