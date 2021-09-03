import React from "react";
import { connect } from "react-redux";
import record_arrow from "../../../assets/images/record_arrow.png";
import setting_about from "../../../assets/images/setting_about.png";
import setting_address from "../../../assets/images/setting_address.png";
import setting_language from "../../../assets/images/setting_language.png";
import setting_node from "../../../assets/images/setting_node.png";
import setting_safe from "../../../assets/images/setting_safe.png";
import { getLanguage } from "../../../i18n";
import { updateAddressBookFrom } from "../../../reducers/cache";
import "./index.scss";


class Setting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.settingList = [{
            name: getLanguage("security"),
            route: "/security_page",
            icon: setting_safe,
        },
        {
            name: getLanguage("network"),
            route: "/network_page",
            icon: setting_node,
        },
        {
            name: getLanguage("language"),
            route: "/language_management_page",
            icon: setting_language,
        },
        {
            name: getLanguage('addressBook'),
            route: "/address_book",
            action: this.addressBookAction,
            icon: setting_address,
        },
        {
            name: getLanguage("about"),
            route: "/about_us",
            icon: setting_about,
        }
        ]
    }
    addressBookAction = () => {
        this.props.updateAddressBookFrom("")
    }
    onClickItem = (e) => {
        if (e.action) {
            e.action && e.action()
        }
        this.props.params.history.push({
            pathname: e.route,
            params: {
                ...e
            }
        })
    }

    renderCommonConfig = (item, index) => {
        return (
            <div key={item.route + ""}
                onClick={() => this.onClickItem(item)}
                className={'setting-item-container click-cursor'}>
                <div className={"setting-config-item-left"}>
                    <img className="config-icon" src={item.icon} />
                    <p className={"config-name"}>{item.name}</p>
                </div>
                <img className={"config-arrow"} src={record_arrow} />
            </div>
        )
    }
    renderSettingConfig = () => {
        return this.settingList.map((item, index) => {
            return this.renderCommonConfig(item, index)
        })
    }

    render() {
        return (<div className="setting-outer-container">
            <div className={"setting-title-container"}>
                <p className={"tab-common-title"}>{getLanguage('setting')}</p>
            </div>
            {this.renderSettingConfig()}
        </div>)
    }
}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
    return {
        updateAddressBookFrom: (from) => {
            dispatch(updateAddressBookFrom(from))
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setting);
