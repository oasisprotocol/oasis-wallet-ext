import React from "react";
import { connect } from "react-redux";
import { NET_CONFIG_TYPE_MAIN, NET_CONFIG_TYPE_TEST } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import CustomList from "../../component/CustomList";
import CustomView from "../../component/CustomView";
import "./index.scss";

class NetworkPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.netList = [{
            name: getLanguage('mainNet'),
            route: "/net_info_page",
            netType: NET_CONFIG_TYPE_MAIN,
        },
        {
            name: getLanguage('testNet'),
            route: "/net_info_page",
            netType: NET_CONFIG_TYPE_TEST
        }]
        this.modal = React.createRef();
        this.isUnMounted = false;
    }
    componentDidMount() {
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


    onClickItem = (e) => {
        this.props.history.push({
            pathname: e.route,
            params: {
                ...e
            }
        })
    }
    renderMainItem = () => {
        return (<CustomList list={this.netList} history={this.props.history} />)
    }
    render() {
        return (
            <CustomView
                title={getLanguage('networkConfig')}
                history={this.props.history}>
                <div className={"security-page-container"}>
                    {this.renderMainItem()}
                </div>
            </CustomView>)
    }
}

const mapStateToProps = (state) => ({});
function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(NetworkPage);
