import "./test_help";
import assert from 'assert'
import apiService from "../src/background/service/APIService"
import { TRANSACTION_TYPE } from "../src/constant/walletType";

import { ObservableStore } from '@metamask/obs-store'

const mockEncryptor = require('./lib/mock-encryptor');

describe('APIService Util Test', function () {

    const password = 'Aa111111';
    const newPwd = "Aa111111A"
    const sinon = require('sinon');

    let mne = "clerk net gallery shift insect before use tenant huge keep noodle pill"//"strike robot soon rug census all intact oil turtle burst into habit"

    let wallet_1 = {
        privateKey_base64: "voLO/Q0B4dFEf+ARvgFGnecvQ1+GgtPkO9xfsQ0/FbcE+e61SoOoK3bn38U++ox+ism6+9nvuKxggTSBnytpTA==",
        publicKey_Hex: "04f9eeb54a83a82b76e7dfc53efa8c7e8ac9bafbd9efb8ac608134819f2b694c",
        address: "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam"
    }

    let wallet_2 = {
        privateKey_base64: "nGH85sr5VUDFnwMls6kj4P3IznjmEmx3w4Rn9x/0/MTPEGK6qcpYXqL8QXYq34md3eoTlJhBqQYMnPZu9M8snQ==",
        publicKey_Hex: "cf1062baa9ca585ea2fc41762adf899dddea13949841a9060c9cf66ef4cf2c9d",
        address: "oasis1qzy9nj86mls5d35d23vyetrc5f2u7e2nwcrhmhp2"
    }
    let wallet_3 = {
        privateKey_base64: "LOnYTcvHdIzKik51cuj8Y9D5hqF3C3BRbj5H3LZjqhE9ZKRfvLVz2i9K3ped+3X9t17zum97cxGaB6zQhNwbfg==",
        publicKey_Hex: "3d64a45fbcb573da2f4ade979dfb75fdb75ef3ba6f7b73119a07acd084dc1b7e",
        address: "oasis1qr2auy3wh7fd8eq8j6dujyc90wqvfqgz6cvxd5q6"
    }


    apiService.createPwd(password)

    beforeEach(async function () {
        this.memStore = new ObservableStore({
            isUnlocked: false,
            data: '',
            password: "",
            currentAccount: {},
            mne: ""
        })
        apiService.encryptor = mockEncryptor
        apiService.checkTxStatus = () => { }

    });
    afterEach(function () {
        sinon.restore();
    });


    describe('Create Wallet', function () {
        it('Create wallet by Mne', async function () {
            let wallet = await apiService.createAccount(mne)
            assert.strictEqual(wallet.address, wallet_1.address)
            assert.strictEqual(wallet.publicKey, wallet_1.publicKey_Hex)
        })

        it('Create wallet by create wallet', async function () {
            let wallet = await apiService.addHDNewAccount("test")
            assert.strictEqual(wallet.address, wallet_2.address)
            assert.strictEqual(wallet.publicKey, wallet_2.publicKey_Hex)
        })



        describe('Get Mnemonic', function () {
            it('get Create Mnemonic new', async function () {
                let mne = apiService.getCreateMnemonic(true)
                assert.ok(mne)
            })

            it('get Create Mnemonic not new', async function () {
                let mneNew = apiService.getCreateMnemonic(true)
                let mneGet = apiService.getCreateMnemonic()
                assert.strictEqual(mneGet, mneNew)
            })
        })

        describe('Get PrivateKey', function () {
            it('Get target account private key by address', async function () {
                let targetPrivateKey = await apiService.getPrivateKey(wallet_1.address, password)
                assert.strictEqual(targetPrivateKey, wallet_1.privateKey_base64)
            })
        })

        describe('Transaction Action', function () {
            it('Send Transfer', async function () {


                let inputParams = {
                    feeAmount: "2",
                    feeGas: "3000",
                    fromAddress: "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam",
                    method: "staking.Transfer",
                    nonce: 46,
                    shares: "NaN",
                    toAddress: "oasis1qzlnk9463c26m48xvd6505da0x0yzem0dqlqm55w",
                    amount: "1",
                    currentAccount: {
                        accountName: "Account 1",
                        address: "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam",
                        hdPath: 0,
                        isUnlocked: true,
                        localAccount: { keyringData: "keyringData" },
                        publicKey: "04f9eeb54a83a82b76e7dfc53efa8c7e8ac9bafbd9efb8ac608134819f2b694c",
                        type: "WALLET_INSIDE",
                        typeIndex: 1,
                    }
                }
                let res = await apiService.sendTransaction(inputParams)
                assert.strictEqual(res.hash, "eed0ddca8987f8a1522561e2c2038f07074d37488eb2fa965274a9462a4ef447")
            })


            it('Add Escrow', async function () {
                let inputParams = {
                    amount: "100",
                    currentAccount: {
                        accountName: "Account 1",
                        address: "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam",
                        hdPath: 0,
                        isUnlocked: true,
                        localAccount: { keyringData: "keyringData" },
                        publicKey: "04f9eeb54a83a82b76e7dfc53efa8c7e8ac9bafbd9efb8ac608134819f2b694c",
                        type: "WALLET_INSIDE",
                        typeIndex: 1,
                        method: "staking.ReclaimEscrow"
                    },
                    feeAmount: "2",
                    feeGas: "3000",
                    fromAddress: "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam",
                    nonce: 48,
                    shares: "100.0000",
                    toAddress: "oasis1qqv25adrld8jjquzxzg769689lgf9jxvwgjs8tha",
                    method: TRANSACTION_TYPE.AddEscrow
                }
                let res = await apiService.delegateTransaction(inputParams)
                assert.strictEqual(res.hash, "e03e739ff0537e56e4b573b1311c68219e4a956204523de31fc844146c79f492")
            })


            it('reclaim Escrow', async function () {
                let inputParams = {
                    amount: "10",
                    currentAccount: {
                        accountName: "Account 1",
                        address: "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam",
                        hdPath: 0,
                        isUnlocked: true,
                        localAccount: { keyringData: "keyringData" },
                        publicKey: "04f9eeb54a83a82b76e7dfc53efa8c7e8ac9bafbd9efb8ac608134819f2b694c",
                        type: "WALLET_INSIDE",
                        typeIndex: 1,
                        method: "staking.ReclaimEscrow"
                    },
                    feeAmount: "2",
                    feeGas: "3000",
                    fromAddress: "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam",
                    nonce: "50",
                    shares: "10.0000",
                    toAddress: "oasis1qqv25adrld8jjquzxzg769689lgf9jxvwgjs8tha",
                    method: TRANSACTION_TYPE.ReclaimEscrow
                }

                let res = await apiService.undelegateTransaction(inputParams)
                assert.strictEqual(res.hash, "0501d35b63c3812ecee6bc7f849216e780a92e28ae37ed007ea9fcb7ab3f9c75")
            })
        })


        describe('Password Secrity', function () {
            it('Update password when password error', async function () {
                let updateRes = await apiService.updateSecPassword(password + "123", newPwd)
                assert.strictEqual(updateRes.error, "passwordError")
            })
            it('Update password success', async function () {
                let updateRes = await apiService.updateSecPassword(password, newPwd)
                assert.strictEqual(updateRes.code, 0)
            })
        })
    })

    describe('Import Wallet', function () {
        it('Import Wallet by PivateKey when repeat', async function () {
            let importWallet = await apiService.addImportAccount(wallet_2.privateKey_base64)
            assert.strictEqual(importWallet.error, "importRepeat")
        })

        it('Import Wallet by wrong PivateKey', async function () {
            let importWallet = await apiService.addImportAccount(wallet_3.privateKey_base64 + "123123")
            assert.strictEqual(importWallet.error, "privateError")
        })

        it('Import Wallet by PivateKey success', async function () {
            let importWallet = await apiService.addImportAccount(wallet_3.privateKey_base64)
            assert.strictEqual(importWallet.address, wallet_3.address)
            assert.strictEqual(importWallet.publicKey, wallet_3.publicKey_Hex)
        })


        it('Import Watch Wallet by address', async function () {
            let watchAccountAddress = "oasis1qzlnk9463c26m48xvd6505da0x0yzem0dqlqm55w"
            let importWallet = await apiService.addObserveAccount(watchAccountAddress, "watch Account")
            assert.strictEqual(importWallet.address, watchAccountAddress)
            assert.strictEqual(importWallet.type, 'WALLET_OBSERVE')
        })


        describe('Delete Wallet', function () {
            let watchAccountAddress = "oasis1qzaa7s3df8ztgdryn8u8zdsc8zx0drqsa5eynmam"

            it('Delete wallet by address when password error', async function () {
                let deleteAccount = await apiService.deleteAccount(watchAccountAddress, password + "123")
                assert.strictEqual(deleteAccount.error, "passwordError")
            })

            it('Delete wallet by address success', async function () {
                let deleteAccount = await apiService.deleteAccount(watchAccountAddress, password)
                assert.ok(deleteAccount)
            })
        })
    })
})
