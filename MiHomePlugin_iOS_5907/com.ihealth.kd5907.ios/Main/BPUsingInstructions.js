/**
 * Created by zhangmingli on 2016/11/8.
 */
'use strict';
var strings = require('../CommonModules/ihealthLocalizedString');
var ihealth = require('../CommonModules/ihealth');
var Dimensions = require('Dimensions');
const { width } = Dimensions.get('window');

var React = require('react-native');

var {
    ScrollView,
    StyleSheet,
    Image,
    View,
    } = React;

var MHPluginSDK = require('NativeModules').MHPluginSDK;
var BPUsingInstructions = React.createClass({

    getInitialState: function() {

        return {
            did: MHPluginSDK.deviceId,
            model: MHPluginSDK.deviceModel,
            apiLevel: MHPluginSDK.apiLevel,
            basePath: MHPluginSDK.basePath,
            devMode: MHPluginSDK.devMode,
            bpHelpImage: MHPluginSDK.basePath + 'ihealthBPHelp.png',
            screenHeight: Dimensions.get('window').height,
            screenWidth: Dimensions.get('window').width,
            status: false
        };
    },
    render() {
        ihealth.log("render", "进入帮助页面了");
        return (
            <View style={{flex:1}}>
                <View style={{marginTop:64, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                </View>
                <ScrollView automaticallyAdjustContentInsets={false} contentContainerStyle={{backgroundColor: '#f8f8f8',flexDirection: 'column', height: 1035*this.state.screenWidth/320, marginTop: 0}}>
                    <Image style={{position:'absolute', resizeMode:'stretch', top:37*this.state.screenWidth/320, left:25*this.state.screenWidth/320, width:270*this.state.screenWidth/320, height:965*this.state.screenWidth/320}} source={{isStatic:!this.state.devMode, uri:this.state.bpHelpImage}} />
                </ScrollView>
            </View>
        );
    }
});

var styles = StyleSheet.create({
    containerAll: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#838383',
        marginTop: 64
    }
});

var route = {
    key: 'BPUsingInstructions',
    title: '使用说明',
    component: BPUsingInstructions,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (<View />);
    }
};

module.exports = {
    component: BPUsingInstructions,
    route: route
};