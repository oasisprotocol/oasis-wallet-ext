import cx from "classnames";
import React from "react";
import back_arrow from "../../../assets/images/back_arrow.png";
import back_arrow_white from "../../../assets/images/back_arrow_white.png";
import WalletBar from "../WalletBar";
import "./index.scss";
class CustomView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    goBack = () => {
        const { backRoute, onGoBack } = this.props
        if (onGoBack) {
            onGoBack()
            return;
        }
        if (backRoute) {
            this.props.history.push({
                pathname: backRoute,
            })
        } else {
            this.props.history.goBack()
        }

    }
    render() {
        const { title, noBack, isReceive, propsClassName,isShowWalletBar,
            disableAccountSelect,middleComponent,withoutBack } = this.props
        let realTitle = title
        let backImage = isReceive ? back_arrow_white : back_arrow
        return (
            <div className={cx({
                "custom-container": true,
            }, propsClassName)}>
                {isShowWalletBar && <WalletBar history={this.props.history} disableAccountSelect={disableAccountSelect}/>}
                <div className="top-bar-container">
                <div className={"custom-header-center"}>
                        {middleComponent}
                    </div>
                {!withoutBack && <div onClick={this.goBack} className={"back-img-container click-cursor"}>
                        <img
                            className={cx({
                                "back-img": true,
                                "back-img-hide": noBack
                            })}
                            src={backImage} />
                    </div>}
                    <p className={cx({
                        "custom-header-title": true,
                        "custom-header-title-bg": isReceive
                    })
                    }>{realTitle}</p>

                    <div className={
                        cx({
                            "custom-right-container": this.props.rightComponent,
                            "custom-right-container-none": !this.props.rightComponent,
                        })
                    }>
                        {this.props.rightComponent}
                    </div>
                </div>
                {this.props.children}
            </div>
        );
    }
}
export default CustomView
