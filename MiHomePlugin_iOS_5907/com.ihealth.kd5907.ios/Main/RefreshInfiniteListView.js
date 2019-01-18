/**
 * Created by zhangmingli on 2016/11/8.
 */
'use strict';

var strings = require('../CommonModules/ihealthLocalizedString');
var LocalizedStrings = require('../CommonModules/LocalizedStrings');

var MHPluginSDK = require('NativeModules').MHPluginSDK;
var React = require('react-native');
var ihealth = require('../CommonModules/ihealth');
var {
    Image,
    View,
    Text,
    StyleSheet,
    ListView,
    Dimensions,
    ActivityIndicatorIOS,
    PropTypes,
    } = React;

let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}

/*list status change graph
 *
 *STATUS_NONE->[STATUS_REFRESH_IDLE, STATUS_INFINITE_IDLE, STATUS_INFINITE_LOADED_ALL]
 *STATUS_REFRESH_IDLE->[STATUS_NONE, STATUS_WILL_REFRESH]
 *STATUS_WILL_REFRESH->[STATUS_REFRESH_IDLE, STATUS_REFRESHING]
 *STATUS_REFRESHING->[STATUS_NONE]
 *STATUS_INFINITE_IDLE->[STATUS_NONE, STATUS_WILL_INFINITE]
 *STATUS_WILL_INFINITE->[STATUS_INFINITE_IDLE, STATUS_INFINITING]
 *STATUS_INFINITING->[STATUS_NONE]
 *STATUS_INFINITE_LOADED_ALL->[STATUS_NONE]
 *
 */
var
    STATUS_NONE = 0,
    STATUS_REFRESH_IDLE = 1,
    STATUS_WILL_REFRESH = 2,
    STATUS_REFRESHING = 3,
    STATUS_INFINITE_IDLE = 4,
    STATUS_WILL_INFINITE = 5,
    STATUS_INFINITING = 6,
    STATUS_INFINITE_LOADED_ALL = 7;

var DEFAULT_PULL_DISTANCE = 60;
var DEFAULT_HF_HEIGHT = 50;
var pageStatus = STATUS_NONE;

var RefreshInfiniteListView = React.createClass({
    propTypes: {
        footerHeight : PropTypes.number,
        pullDistance : PropTypes.number,
        renderHeaderRefreshIdle : PropTypes.func,
        renderHeaderWillRefresh : PropTypes.func,
        renderHeaderRefreshing : PropTypes.func,
        renderFooterInifiteIdle : PropTypes.func,
        renderFooterWillInifite : PropTypes.func,
        renderFooterInifiting : PropTypes.func,
        renderFooterInifiteLoadedAll : PropTypes.func,
    },
    getDefaultProps () {
        return {
            footerHeight: DEFAULT_HF_HEIGHT,
            pullDistance: DEFAULT_PULL_DISTANCE,
            renderHeaderRefreshIdle: () => {return (
                <View style={{flex:1, height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        {strings.LoadLatestMeasurementRecord}
                    </Text>
                </View>
            )},
            renderHeaderWillRefresh: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        准备刷新...
                    </Text>
                </View>
            )},
            renderHeaderRefreshing: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        加载中...
                    </Text>

                    <ActivityIndicatorIOS
                        size='small'
                        animating={true}/>
                </View>
            )},
            renderFooterInifiteIdle: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        {strings.LoadingHistoryRecord}
                    </Text>
                </View>
            )},
            renderFooterWillInifite: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        准备加载...
                    </Text>
                </View>
            )},
            renderFooterInifiting: () => {return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <ActivityIndicatorIOS
                        size='small'
                        animating={true}/>
                    <Text style={styles.text}>
                        {strings.Loadding}
                    </Text>
                </View>
            )},
            renderFooterInifiteLoadedAll: () => { return (
                <View style={{height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                    <Text style={styles.text}>
                        没有更多数据了
                    </Text>
                </View>
            )},
            loadedAllData: () => {
                return false;
            },
            onRefresh: () => {
                ihealth.log("getDefaultProps", "onRefresh1");
            },
            onInfinite: () => {
                ihealth.log("getDefaultProps", "onInfinite1");
            },
        };
    },
    getInitialState() {
        return {
            devMode: MHPluginSDK.devMode,
            basePath: MHPluginSDK.basePath,
            status: STATUS_NONE,
            isLoadedAllData: false,
        }
    },
    renderRow(text) {
        return this.props.renderRow(text);
    },
    renderHeader() {
        ihealth.log("renderHeader", "renderHeader----pageStatus---" + pageStatus);
        if (pageStatus === STATUS_REFRESH_IDLE) {
            return this.props.renderHeaderRefreshIdle();
        }
        if (pageStatus === STATUS_WILL_REFRESH) {
            return this.props.renderHeaderWillRefresh();
        }
        if (pageStatus === STATUS_REFRESHING) {
            return this.props.renderHeaderRefreshing();
        }
        ihealth.log("renderHeader", "renderHeader" + "null");
        MHPluginSDK.addRecord("列表下拉刷新次数", {"下拉列表": 1}, {});

        return null;
    },
    renderFooter() {
        ihealth.log("renderFooter", "renderFooter----pageStatus---" + pageStatus);
        this.footerIsRender = true;
        if (pageStatus === STATUS_INFINITE_IDLE) {
            return this.props.renderFooterInifiteIdle();
        }
        if (pageStatus === STATUS_WILL_INFINITE) {
            return this.props.renderFooterWillInifite();
        }
        if (pageStatus === STATUS_INFINITING) {
            return this.props.renderFooterInifiting();
        }
        if (pageStatus === STATUS_INFINITE_LOADED_ALL) {
            ihealth.log("renderFooter", "renderFooter-----2" + "null");
            return this.props.renderFooterInifiteLoadedAll();
        }
        this.footerIsRender = false;
        ihealth.log("renderFooter", "renderFooter-----1" + "null");
        MHPluginSDK.addRecord("列表上拉加载次数", {"上拉列表": 1}, {});

        return null;
    },
    handleResponderGrant(event) {
        var nativeEvent = event.nativeEvent;
        if (!nativeEvent.contentInset || pageStatus!==STATUS_NONE) {
            return;
        }
        var y0 = nativeEvent.contentInset.top + nativeEvent.contentOffset.y;
        if (y0 < 0) {
            pageStatus = STATUS_REFRESH_IDLE;
            this.setState({status:STATUS_REFRESH_IDLE});
            return;
        }
        y0 = nativeEvent.contentInset.top + nativeEvent.contentOffset.y +
            nativeEvent.layoutMeasurement.height-nativeEvent.contentSize.height;
        if (y0 > 0 ) {
            if (!this.props.loadedAllData()) {
                this.initialInfiniteOffset = (y0>0?y0:0);
                pageStatus = STATUS_INFINITE_IDLE;
                this.setState({status:STATUS_INFINITE_IDLE});
            } else {
                pageStatus = STATUS_INFINITE_LOADED_ALL;
                this.setState({status:STATUS_INFINITE_LOADED_ALL});
            }
        }
    },
    hideHeader() {
        ihealth.log("hideHeader", "hideHeader");
        pageStatus = STATUS_NONE;
        this.setState({status:STATUS_NONE});
    },
    hideFooter() {
        pageStatus = STATUS_NONE;
        this.setState({status:STATUS_NONE});
    },
    handleResponderRelease(event) {
        var status = this.state.status;
        ihealth.log("handleResponderRelease", "handleResponderRelease----" + status);
        if (status === STATUS_REFRESH_IDLE) {
            pageStatus = STATUS_NONE;
            this.setState({status:STATUS_NONE});
        } else if (status === STATUS_WILL_REFRESH) {
            pageStatus = STATUS_REFRESHING;
            this.setState({status:STATUS_REFRESHING});
            this.props.onRefresh();
        } else if (status === STATUS_INFINITE_IDLE) {
            pageStatus = STATUS_NONE;
            this.setState({status:STATUS_NONE});
        } else if (status === STATUS_WILL_INFINITE) {
            pageStatus = STATUS_INFINITING;
            this.setState({status:STATUS_INFINITING});
            this.props.onInfinite();
        } else if (status === STATUS_INFINITE_LOADED_ALL) {
            pageStatus = STATUS_NONE;
            this.setState({status:STATUS_NONE});
        }
    },
    handleScroll(event) {
        var nativeEvent = event.nativeEvent;
        var status = this.state.status;
        if (status===STATUS_REFRESH_IDLE || status===STATUS_WILL_REFRESH) {
            var y = nativeEvent.contentInset.top + nativeEvent.contentOffset.y;
            if (status!==STATUS_WILL_REFRESH && y<-this.props.pullDistance) {
                this.setState({status:STATUS_WILL_REFRESH});
            } else if (status===STATUS_WILL_REFRESH && y>=-this.props.pullDistance) {
                this.setState({status:STATUS_REFRESH_IDLE});
            }
            return;
        }

        if (status===STATUS_INFINITE_IDLE || status===STATUS_WILL_INFINITE) {
            var y = nativeEvent.contentInset.top + nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height;
                -nativeEvent.contentSize.height-this.initialInfiniteOffset;
            if (this.footerIsRender) {
                y += this.props.footerHeight;
            }
            if (status!==STATUS_WILL_INFINITE && y>this.props.pullDistance) {
                this.setState({status:STATUS_WILL_INFINITE});
            } else if (status===STATUS_WILL_INFINITE && y<=this.props.pullDistance) {
                this.setState({status:STATUS_INFINITE_IDLE});
            }
        }
    },
    render() {
        return (
            <ListView
                {...this.props}
                automaticallyAdjustContentInsets={false}
                dataSource={this.props.dataSource}
                renderRow={this.renderRow}
                renderHeader={this.renderHeader}
                renderFooter={this.renderFooter}
                onResponderGrant={this.handleResponderGrant}
                onResponderRelease={this.handleResponderRelease}
                onScroll={this.handleScroll}
            />
        )
    }
});

var styles = StyleSheet.create({
    text: {
        fontSize:16,
    },
    image: {
        width:40,
        height:32,
    },
    imageRotate: {
        transform:[{rotateX: '180deg'},],
    }
});

module.exports = RefreshInfiniteListView;
