import cx from "classnames";
import React, { Component } from "react";
import { connect } from "react-redux";
import record_arrow from "../../../assets/images/record_arrow.png";
import select_account_no from "../../../assets/images/select_account_no.svg";
import select_account_ok from "../../../assets/images/select_account_ok.svg";
import { getBalance } from "../../../background/api";
import { ACCOUNT_TYPE } from "../../../constant/walletType";
import { updateAccountBalanceList } from "../../../reducers/cache";
import { addressSlice } from "../../../utils/utils";
import "./index.scss";
class AccountItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: "0",
            descAddress:""
        };
        this.isUnMounted = false;
    }
    componentDidMount() {
        const { item } = this.props
        this.fetchBalance(item)
    }
    componentWillUnmount() {
        this.isUnMounted = true;
    }
    callSetState = (data, callback) => {
        if (!this.isUnMounted) {
            this.setState({
                ...data
            }, () => {
                callback && callback()
            })
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.item.address !== this.props.item.address) {
            this.fetchBalance(nextProps.item)
        }
    }
    fetchBalance = (item) => {
        if(item.evmAddress){
            return
        }
        let address = item.address
        getBalance(address).then((account) => {
            if (account && account.address) {
                this.callSetState({
                    balance: account.total
                })
                this.props.updateAccountBalanceList({
                    address: account.address,
                    ...account
                })
            }
        })
    }

    render() {
        const { item, showSelect, showImport, onClickAccount, goToAccountInfo, symbol, cacheAccount } = this.props
        let imgSource = showSelect ? select_account_ok : select_account_no
        let showBalance = cacheAccount && cacheAccount.total || item.balance || this.state.balance
        showBalance = showBalance + " " + symbol
        return (
            <div onClick={() => onClickAccount && onClickAccount(item)}
                className={"account-item-container click-cursor"}>
                <div >
                    <div className={"account-item-top"}>
                        <p className={"account-item-name"}>{item.accountName}</p>
                        <p className={cx({
                            "account-item-type-none": !showImport,
                            "account-item-type-base": showImport,
                            "account-item-type-import": item.type === ACCOUNT_TYPE.WALLET_OUTSIDE||item.type === ACCOUNT_TYPE.WALLET_OUTSIDE_SECP256K1,
                            "account-item-type-ledger": item.type === ACCOUNT_TYPE.WALLET_LEDGER,
                            "account-item-type-observe": item.type === ACCOUNT_TYPE.WALLET_OBSERVE,
                        })}>{showImport}</p>
                    </div>
                    {!item.evmAddress && <p className={"account-item-address"}>{addressSlice(item.address)}</p>}
                    {item.evmAddress ?<p className={'account-item-address descAddress'}>{addressSlice(item.evmAddress)}</p>: <p className={"account-item-address account-item-balance"}>{showBalance}</p>}
                </div>
                <div className={"account-item-right"}>
                    <img
                        src={imgSource} className={"account-item-select click-cursor"} />
                    <div onClick={(e) => {
                        goToAccountInfo && goToAccountInfo(item)
                        e.stopPropagation();
                    }} className={"account-item-option-container click-cursor"}>
                        <img
                            src={record_arrow} className={"account-item-option"} />
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
});

function mapDispatchToProps(dispatch) {
    return {
        updateAccountBalanceList: (account) => {
            dispatch(updateAccountBalanceList(account))
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountItem);
