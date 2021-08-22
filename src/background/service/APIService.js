import * as oasis from '@oasisprotocol/client';
import { decode } from 'base64-arraybuffer';
import * as bip39 from 'bip39';
import extension from 'extensionizer';
import { Buffer } from 'safe-buffer';
import nacl from 'tweetnacl';
import { cointypes, LOCK_TIME } from '../../../config';
import { FROM_BACK_TO_RECORD, SET_LOCK, TX_SUCCESS } from '../../constant/types';
import { ACCOUNT_TYPE, TRANSACTION_TYPE } from "../../constant/walletType";
import { getLanguage } from '../../i18n';
import { openTab } from "../../utils/commonMsg";
import { amountDecimals, getExplorerUrl, hex2uint, publicKeyToAddress, toNonExponential, trimSpace, uint2hex } from '../../utils/utils';
import { getSubmitStatus } from '../api';
import { buildTxBody, getChainContext, submitTx } from '../api/txHelper';
import { get, removeValue, save } from '../storage/storageService';

const ObservableStore = require('obs-store')
const encryptUtils = require('browser-passworder')
const RETRY_TIME = 4


const default_account_name = "Account 1"
class APIService {
    constructor() {
        this.memStore = new ObservableStore(this.initLockedState())
        this.statusTimer = {}
        this.encryptor = encryptUtils
    }
    getStore = () => {
        return this.memStore.getState()
    };
    getCreateMnemonic = (isNewMne) => {
        if (isNewMne) {
            let mnemonic = bip39.generateMnemonic()
            this.memStore.updateState({ mne: mnemonic })
            return mnemonic
        } else {
            let mne = this.getStore().mne
            if (mne) {
                return mne
            } else {
                let mnemonic = bip39.generateMnemonic()
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
    };
    checkPassword(password) {
        return this.getStore().password === password
    }
    setLastActiveTime() {
        const timeoutMinutes = LOCK_TIME
        let localData = this.getStore().data
        let isUnlocked = this.getStore().isUnlocked
        if (localData && isUnlocked) {
            if (this.activeTimer) {
                clearTimeout(this.activeTimer)
            }
            if (!timeoutMinutes) {
                return
            }

            this.activeTimer = setTimeout(() => {
                this.setUnlockedStatus(false)
            }, timeoutMinutes * 60 * 1000)
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
    };
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
        let priKeyEncrypt = await this.encryptor.encrypt(this.getStore().password, wallet.priKey_hex)
        const account = {
            address: wallet.address,
            privateKey: priKeyEncrypt,
            publicKey: wallet.publicKey,
            type: ACCOUNT_TYPE.WALLET_INSIDE,
            hdPath: wallet.hdIndex,
            accountName: default_account_name,
            typeIndex: 1
        }

        let mnemonicEn = await this.encryptor.encrypt(this.getStore().password, mnemonic)

        let keyringData = []
        let data = {
            mnemonic: mnemonicEn,
            accounts: [],
            currentAddress: account.address
        }
        data.accounts.push(account)
        keyringData.push(data)
        let encryptData

        encryptData = await this.encryptor.encrypt(this.getStore().password, keyringData)
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
        let createList = newList.filter((item, index) => {
            return item.type === ACCOUNT_TYPE.WALLET_INSIDE
        })
        let importList = newList.filter((item, index) => {
            return item.type === ACCOUNT_TYPE.WALLET_OUTSIDE
        })
        let ledgerList = newList.filter((item, index) => {
            return item.type === ACCOUNT_TYPE.WALLET_LEDGER
        })
        if (isDapp) {
            return [...createList, ...importList, ...ledgerList]
        }
        let observeList = newList.filter((item, index) => {
            return item.type === ACCOUNT_TYPE.WALLET_OBSERVE
        })
        return [...createList, ...importList, ...ledgerList, ...observeList]
    }
    getHDpath = (index = 0) => {
        let purpse = 44
        let account = 0
        let charge = 0
        let hdpath = purpse + "'/" + cointypes.coinType + "'/" + account + "'/" + charge + "'/" + index + "'"
        return hdpath
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
            priKey_hex: privateHex,
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
            let priKeyEncrypt = await this.encryptor.encrypt(this.getStore().password, wallet.priKey_hex)
            const account = {
                address: wallet.address,
                privateKey: priKeyEncrypt,
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
     * import wallet by private key
     * @param {*} key
     * @returns
     */
    importWalletByPrivateKey = async (privateBase64) => {
        let privateKey = this.parseKey(privateBase64)
        const publicKeyBytes = nacl.sign.keyPair.fromSecretKey(hex2uint(privateKey)).publicKey
        let walletAddress = await publicKeyToAddress(publicKeyBytes)
        const publicKey = uint2hex(publicKeyBytes)
        let privateHex = Buffer.from(privateBase64, 'base64').toString('hex')
        return {
            priKey_base64: privateBase64,
            priKey_hex: privateHex,
            publicKey,
            address: walletAddress,
        }
    }
    /**
     *  import wallet by private key
     */
    addImportAccount = async (privateKey, accountName) => {
        try {
            let wallet = await this.importWalletByPrivateKey(privateKey)
            let data = this.getStore().data
            let accounts = data[0].accounts
            let error = {}

            for (let index = 0; index < accounts.length; index++) {
                const account = accounts[index];
                if (account.address === wallet.address) {
                    error = { "error": 'improtRepeat', type: "local" }
                    break
                }
            }
            if (error.error) {
                return error
            }
            let importList = accounts.filter((item, index) => {
                return item.type === ACCOUNT_TYPE.WALLET_OUTSIDE
            })
            let typeIndex = ""
            if (importList.length == 0) {
                typeIndex = 1
            } else {
                typeIndex = importList[importList.length - 1].typeIndex + 1
            }

            let priKeyEncrypt = await this.encryptor.encrypt(this.getStore().password, wallet.priKey_hex)
            const account = {
                address: wallet.address,
                privateKey: priKeyEncrypt,
                publicKey: wallet.publicKey,
                type: ACCOUNT_TYPE.WALLET_OUTSIDE,
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
                    error = { "error": 'improtRepeat', type: "local" }
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
            let encryptData = await this.encryptor.encrypt(this.getStore().password, data)
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
            let mnemonic = await this.encryptor.decrypt(this.getStore().password, mnemonicEn)
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
            let base64PriKey = this.hexToBase64(privateKey)
            return base64PriKey
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
    getCurrentSinger = async (address) => {
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
     * commont stake  at least 100
     * @param {*} params
     * @returns
     */
    sendStakeTransaction = async (params) => {
        const tw = oasis.staking.addEscrowWrapper()
        params.method = TRANSACTION_TYPE.AddEscrow
        return this.submitTxBody(params, tw)
    }
    /**
    * reclaim  ledger lib ledger must user the api in the front page
    * @param {*} params
    * @returns
    */
    sendReclaimTransaction = async (params) => {
        const tw = oasis.staking.reclaimEscrowWrapper()
        params.method = TRANSACTION_TYPE.ReclaimEscrow
        return this.submitTxBody(params, tw)
    }
    /**
     * submit tx
     * @param {*} params
     * @param {*} tw
     * @returns
     */
    submitTxBody = async (params, tw) => {
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
                this.checkTxStatus(sendResult.hash)
            }
            return sendResult
        } catch (e) {
            throw e
        }
    }
    notification = (hash) => {
        let id = hash
        extension.notifications &&
            extension.notifications.onClicked.addListener(function (id) {
                let url = getExplorerUrl() + "transactions/" + id
                openTab(url)
            });
        let title = getLanguage('notificationTitle')
        let message = getLanguage('notificationContent')
        extension.notifications.create(id, {
            title: title,
            message: message,
            iconUrl: '/img/oasis.png',
            type: 'basic'
        });
        return
    }
    checkTxStatus = (hash) => {
        this.fetchTransactionStatus(hash)
    }
    fetchTransactionStatus = (hash) => {
        getSubmitStatus(hash).then((data) => {
            if (data && data.txHash) {
                extension.runtime.sendMessage({
                    type: FROM_BACK_TO_RECORD,
                    action: TX_SUCCESS,
                    data
                });
                this.notification(hash)
                if (this.statusTimer[hash]) {
                    clearTimeout(this.statusTimer[hash]);
                    this.statusTimer[hash] = null;
                }
            } else {
                this.statusTimer[hash] = setTimeout(() => {
                    this.fetchTransactionStatus(hash);
                }, 5000);
            }
        }).catch((error) => {
            this.statusTimer[hash] = setTimeout(() => {
                this.fetchTransactionStatus(hash);
            }, 5000);
        })
    }
    getLockStatus = () => {
        return this.getStore().isUnlocked
    }
}

const apiService = new APIService();
export default apiService;
