/**
 * Created by zhangmingli on 2016/11/8.
 */
'use strict';
var strings = require('../CommonModules/ihealthLocalizedString');
var LocalizedStrings = require('../CommonModules/LocalizedStrings');
var ihealth = require('../CommonModules/ihealth');
var getDeviceConfig = require('../CommonModules/getDeviceConfig');
var Aes = require('../CommonModules/Aes');
var React = require('react-native');
var Dimensions = require('Dimensions');
const { height,width } = Dimensions.get('window');

var {
    AppRegistry,
    StyleSheet,
    Text,
    Image,
    View,
    Component,
    TouchableWithoutFeedback,
    } = React;

var MHPluginSDK = require('NativeModules').MHPluginSDK;
var mcu_fw_ver = '',
    viewUnmount;
var deviceInfo ={};

let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}

var DeviceInformation = React.createClass({
    getInitialState: function() {
        return {
            deviceSN: '',
            did: MHPluginSDK.deviceId,
            model: MHPluginSDK.deviceModel,
            apiLevel: MHPluginSDK.apiLevel,
            basePath: MHPluginSDK.basePath,
            devMode: MHPluginSDK.devMode,
            requestStatus: false,
            Battery: '1',
            switchState: false,
            switchImageOff: MHPluginSDK.basePath + 'switchOFF.png',
            switchImageOn: MHPluginSDK.basePath + 'switchON.png',
            Batterya: MHPluginSDK.basePath + 'powera.png',
            Battery01: MHPluginSDK.basePath + 'power01.png',
            Battery02: MHPluginSDK.basePath + 'power02.png',
            Batteryd: MHPluginSDK.basePath + 'powerd.png',
            Batterye: MHPluginSDK.basePath + 'powere.png',
            imagePathBattery: MHPluginSDK.basePath + 'power02.png',

            screenHeight: Dimensions.get('window').height,
        };
    },

    showView: function(){

        MHPluginSDK.addRecord("音量开关状态次数统计", {"点击音量开关": 1}, {});

        if (this.state.switchState) {
            return(
                <Image style={styles.voiceButton2} source={{isStatic:!this.state.devMode, uri:this.state.switchImageOn}} />
            );
        }
        else {
            return(
                <View style={styles.voiceButtonContainer}>
                    <Image style={styles.voiceButton} source={{isStatic:!this.state.devMode, uri:this.state.switchImageOff}} />
                </View>
            );
        }
    },

    render() {
        ihealth.log('重新渲染设备信息页面：' + this.state.imagePathBattery);

        return (
            <View style={styles.containerAll}>
                <View style={{marginTop:APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                </View>
                <View style={{marginTop:0, height:174, width:this.state.screenWidth, flexDirection: 'column',backgroundColor: '#ffffff',alignSelf: 'stretch'}}>
                    <View style={{marginTop:0, height:58, width:this.state.screenWidth, alignSelf: 'stretch',flexDirection: 'row'}}>
                        <Text style={styles.title}>{strings.BatteryPower}</Text>
                        <Image style={styles.subArrow} source={{isStatic:!this.state.devMode, uri:this.state.imagePathBattery}} />
                    </View>

                    <View style={styles.separator}/>

                    <View style={{marginTop:0, height:58, width:this.state.screenWidth, alignSelf: 'stretch',flexDirection: 'row'}}>
                        <Text style={styles.title}>{strings.SerialNumber}</Text>
                        <Text style={styles.serialNumber}>{this.props.SN}</Text>
                    </View>

                    <View style={styles.separator}/>

                    <View style={{marginTop:0, height:58, width:this.state.screenWidth, alignSelf: 'stretch',flexDirection: 'row'}}>
                        <Text style={styles.title}>{strings.FirmwareVersion}</Text>
                        <Text style={styles.serialNumber}>{mcu_fw_ver}</Text>
                    </View>
                </View>

                <View style={styles.separator}/>

                <View style={{marginTop:0, height:58, width:this.state.screenWidth, alignSelf: 'stretch',flexDirection: 'row',backgroundColor: '#ffffff'}}>
                    <Text style={styles.title}>{strings.PluginVersion}</Text>
                    <Text style={styles.serialNumber}>{"V1.0.0"}</Text>
                </View>
                <View style={styles.separator}/>
            </View>
        );
    },

    //获取获取电量、序列号信息
    getDeviceBatteryInfo:function() {

        var bodyDic={};
        bodyDic.verifyToken = this.props.verifyToken;
        bodyDic.queueNum = '107';
        bodyDic.mDeviceId = this.state.did;
        bodyDic.AppGuid = this.props.AppGuid;
        bodyDic.PhoneID = this.props.PhoneID;
        bodyDic.sv = 'c7d2bbd8c0ec4e9493a4a97bc9bf0afb';
        bodyDic.ApiType = 'deviceGetStatus';
        getDeviceConfig(
            bodyDic,
            (isSuccess, responseData, errorStatus)=>{

                ihealth.log('getDeviceBatteryInfo---回调函数', 'isSuccess:' + isSuccess + 'responseData:' + JSON.stringify(responseData) + 'errorStatus:' + errorStatus);

                if (isSuccess) {

                    //电池电量
                    deviceInfo.Battery = responseData.ReturnValue.DeviceConfig.Battery;

                    //存储设备硬件版本号
                    deviceInfo.HwVer = responseData.ReturnValue.DeviceConfig.HwVer;

                    //存储设备软件版本号（序列号）
                    var mcu_fw_ver1 = responseData.ReturnValue.DeviceConfig.mcu_fw_ver;
                    if (mcu_fw_ver1 !== "" && (mcu_fw_ver1.length > 3)) {
                        mcu_fw_ver1 = 'V' + mcu_fw_ver1.charAt(0) + '.' + mcu_fw_ver1.charAt(1) + '.' + mcu_fw_ver1.charAt(2);
                        deviceInfo.mcu_fw_ver = mcu_fw_ver1;
                        mcu_fw_ver = mcu_fw_ver1
                        ihealth.log('getDeviceBatteryInfo---服务器传回来的序列号:', mcu_fw_ver1);
                        //刷新序列号
                        this.setState({"mcu_fw_ver": deviceInfo.mcu_fw_ver});
                    }else{
                        ihealth.log("getDeviceBatteryInfo", "服务器传回来的序列号为空");
                    }

                    //存储本地
                    MHPluginSDK.saveInfo(deviceInfo);

                    //刷新电池电量图片
                    this.setDeviceInfomation(deviceInfo.Battery);

                    ////请求语音开关信息
                    //this.getDeviceVoiceInfo();

                    //请求返回,隐藏等待指示
                    MHPluginSDK.dismissTips();

                } else {
                    //错误处理,隐藏等待指示
                    MHPluginSDK.dismissTips();

                    if (errorStatus == '102') {
                        //网络超时
                        MHPluginSDK.showFailTips("网络超时！");
                    } else {
                        //其他错误
                        MHPluginSDK.showFailTips("获取设备信息失败！");
                    }
                }
            }
        );
    },

    componentWillUnmount() {
        //收到网络返回,隐藏等待指示
        viewUnmount = true;
        MHPluginSDK.dismissTips();
    },

    //设置设备电量展示图片信息
    setDeviceInfomation: function(Battery) {
        switch (Battery) {
            case 0:
                this.setState({'imagePathBattery': this.state.Batterya});
                break;
            case 1:
                this.setState({'imagePathBattery': this.state.Battery01});
                break;
            case 2:
                this.setState({'imagePathBattery': this.state.Battery02});
                break;
            case 3:
                this.setState({'imagePathBattery': this.state.Batteryd});
                break;
            case 4:
                this.setState({'imagePathBattery': this.state.Batterye});
                break;
            default:
                this.setState({'imagePathBattery': this.state.Battery02});
                break;
        }
    },

    componentDidMount: function() {
        viewUnmount = false;

        //添加loading页面
        MHPluginSDK.showLoadingTips('');

        //读取本地存储内容
        MHPluginSDK.loadInfoCallback(info => {

            if (info != null){
                deviceInfo = info;
                ihealth.log("DeviceInformation---componentDidMount", JSON.stringify(deviceInfo));

                mcu_fw_ver = deviceInfo.mcu_fw_ver;

                //设置展示电量图片信息
                this.setDeviceInfomation(deviceInfo.Battery);
            }else {
                ihealth.log("本地没有设备信息");
                deviceInfo={};
            }

            //请求设备电量信息
            this.getDeviceBatteryInfo();
        });
    }
});

var styles = StyleSheet.create({
    containerAll: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        marginTop: 64
    },
    containerRGB: {
        flex: 10,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        alignSelf: 'stretch'
    },
    flowRight: {
        flexDirection: 'row'
    },
    iconText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#ffffff',
        marginTop: 20,
        alignSelf: 'center'
    },

    rowContainer: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        flex: 3
    },
    title: {
        fontSize: 16,
        alignItems: 'center',
        alignSelf: 'center',
        color: '#333333',
        flex: 1,
        marginLeft:24
    },
    subArrow: {
        width: 37,
        height: 18,
        marginRight: 24,
        alignSelf: 'center'
    },
    separator: {
        height: 1,
        alignSelf: 'stretch',
        backgroundColor: '#dddddd',
        marginLeft: 24,
        marginRight: 24
    },
    serialNumber: {
        fontSize: 16,
        alignItems: 'center',
        alignSelf: 'center',
        color: '#333333',
        marginRight:24
    },
    voiceButton: {
        width: 55,
        height: 35,
        //marginRight: 15,
        // marginTop: 5,
        alignSelf: 'center'
    },
    voiceButton2: {
        width: 55,
        height: 35,
        marginRight: 15,
        // marginTop: 5,
        alignSelf: 'center'
    },
    voiceButtonContainer: {
        width: 55,
        height: 35,
        marginRight: 15,
        // marginTop: 5,
        alignSelf: 'center'
    },
    containerDark: {
        flex: 0.8,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        alignSelf: 'stretch'
    }
});

var route = {
    key: 'DeviceInformation',
    title: strings.DeviceInformation,
    component: DeviceInformation,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (<View />);
    }
};

module.exports = {
    component: DeviceInformation,
    route: route
};