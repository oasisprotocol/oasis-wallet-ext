import React, { Component } from "react";
import { connect } from "react-redux";
import select_no from "../../../assets/images/select_no.svg";
import select_on from "../../../assets/images/select_on.svg";
import { getBalance } from "../../../background/api";
import { updateLedgerBalanceList } from "../../../reducers/cache";
import { addressSlice } from "../../../utils/utils";
import AccountIcon from "../../component/AccountIcon";
import "./index.scss";

class ApproveAccountItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: "0"
        };
        this.isUnMounted = false;
    }
    componentDidMount() {
        const { account } = this.props
        this.fetchBalance(account.address)
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
        if (nextProps.account.address !== this.props.account.address) {
            this.fetchBalance(nextProps.account.address)
        }
    }
    fetchBalance = (address) => {
        getBalance(address).then((account) => {
            if (account && account.address) {
                this.callSetState({
                    balance: account.total
                })
                this.props.updateLedgerBalanceList({
                    address: account.address,
                    ...account
                })
            }
        })
    }

    renderMyIcon = (account) => {
        let address = account.evmAddress ||account.address
        if (!address) {
            return (<div />)
        }
        return <AccountIcon address={address} diameter={"30"} />;
    };
    render() {
        const { account, onClickAccount, symbol, listLength, index } = this.props
        let imgUrl = account.isConnected ? select_on : select_no
        let showDivided = listLength - 1 !== index
        return (
            <div >
                <div
                    onClick={() => {
                        onClickAccount && onClickAccount(account)
                    }}
                    className={"approve-item-container click-cursor"}>
                    <div className={"approve-item-left"}>
                        {this.renderMyIcon(account)}
                        <div className={"approve-item-left-con"}>
                            <div className={"approve-item-left-top-con"}>
                                <p className={"approve-item-account-name"}>{account.accountName}</p>
                                <p className={'approve-item-account-address'}>{" ( " + addressSlice(account.address, 5) + " )"}</p>
                            </div>
                            <p className={'approve-item-account-balance'}>{this.state.balance} {symbol}</p>
                        </div>
                    </div>
                    <img src={imgUrl} className={"option-img"}></img>
                </div>
                {showDivided && <div className={"address-row-line"} />}
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

export default connect(mapStateToProps, mapDispatchToProps)(ApproveAccountItem);
