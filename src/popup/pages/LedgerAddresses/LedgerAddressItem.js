import cx from "classnames";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getBalance } from "../../../background/api";
import { updateLedgerBalanceList } from "../../../reducers/cache";
import { addressSlice } from "../../../utils/utils";
import "./index.scss";

import select_no from "../../../assets/images/select_no.svg";
import select_on from "../../../assets/images/select_on.svg";
import select_false from "../../../assets/images/select_false.svg";


class LedgerAddressItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: "0"
        };
        this.isUnMounted = false;
    }
    componentDidMount() {
        const { item } = this.props
        this.fetchBalance(item.address)
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
            this.fetchBalance(nextProps.item.address)
        }
    }
    fetchBalance = (address) => {
        getBalance(address).then((account) => {
            if (account && account.address) {
                this.callSetState({
                    balance: account.total
                })
                this.props.updateLedgerBalanceList({
                    ...account
                })
            }
        })
    }

    render() {
        const { item, onClickAccount, cacheAccount, symbol } = this.props
        let imgUrl = item.isExist ? select_false : item.isSelect ? select_on : select_no
        let showBalance = cacheAccount && cacheAccount.total || item.balance || this.state.balance
        showBalance = showBalance + " " + symbol
        return (
            <div
                onClick={() => { onClickAccount && onClickAccount(item) }}
                className={cx("address-row-outer")}>
                <div className={cx("address-row-container", {
                    "click-cursor":!item.isExist,
                    "click-cursor-disable": item.isExist,
                })}>
                    <div className={"address-row-left"}>
                        <img src={imgUrl} className={"option-img "}></img>
                        <p className={"address-row-index"}>{item.ledgerHdIndex}</p>
                        <p className={"address-row-address"}>{addressSlice(item.address, 8)}</p>
                    </div>
                    <p className={"address-row-balance"}>{showBalance}</p>
                </div>
                <div className={"address-row-line"} />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
});

function mapDispatchToProps(dispatch) {
    return {
        updateLedgerBalanceList: (account) => {
            dispatch(updateLedgerBalanceList(account))
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LedgerAddressItem);
