/**
 * Created by guobo on 2018/05/28.
 */


'use strict';
var strings = require('../CommonModules/ihealthLocalizedString');
var ihealth = require('../CommonModules/ihealth');
var Dimensions = require('Dimensions');
const { width } = Dimensions.get('window');

var React = require('react-native');

var {
    WebView,
    View,
} = React;

var MHPluginSDK = require('NativeModules').MHPluginSDK;

let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}

var AgreementPage = React.createClass({

    getInitialState: function() {

        return {
            did: MHPluginSDK.deviceId,
            model: MHPluginSDK.deviceModel,
            apiLevel: MHPluginSDK.apiLevel,
            basePath: MHPluginSDK.basePath,
            devMode: MHPluginSDK.devMode,
            // bpHelpImage: MHPluginSDK.basePath + 'ihealthBPHelp.png',
            bpHelpImage: MHPluginSDK.basePath + 'WechatIMG4.png',
            screenHeight: Dimensions.get('window').height,
            screenWidth: Dimensions.get('window').width,
            status: false
        };
    },
    render() {
        ihealth.log("render", "进入帮助页面了");
        return (
            <View style={{flex:1}}>
                <View style={{marginTop:64 + APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                </View>
                <WebView
                    source={{uri:'https://cnbj2.fds.api.xiaomi.com/ihealth-reg-user-profile/UserAgreementMiHomePlugin.html'}}
                    style={{position:'absolute', width:this.state.screenWidth,height:this.state.screenHeight - 64}}
                />



            </View>
        );
    }
});


var route = {
    key: 'AgreementPage',
    title: strings.ServiceAgreement,
    component: AgreementPage,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (<View />);
    }
};

module.exports = {
    component: AgreementPage,
    route: route
};