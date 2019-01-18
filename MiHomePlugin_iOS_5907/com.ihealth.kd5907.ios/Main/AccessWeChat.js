/**
 * Created by zhangmingli on 2016/11/8.
 */
'use strict';
var strings = require('../CommonModules/ihealthLocalizedString');
var ihealth = require('../CommonModules/ihealth');
var getQRcode = require('../CommonModules/getQRcode');
var React = require('react-native');
var Dimensions = require('Dimensions');
var packageInfoData = require('../packageInfo.json');

const { width } = Dimensions.get('window');

var {
    StyleSheet,
    Text,
    Image,
    View,
    TouchableOpacity,
    } = React;

var MHPluginSDK = require('NativeModules').MHPluginSDK;
var imageUri = '',
    viewUnmount;

var AccessWeChat = React.createClass({

    getInitialState: function() {

        return {
            did: MHPluginSDK.deviceId,
            model: MHPluginSDK.deviceModel,
            apiLevel: MHPluginSDK.apiLevel,
            basePath: MHPluginSDK.basePath,
            devMode: MHPluginSDK.devMode,
            attentionImage: MHPluginSDK.basePath + 'ihealthAttention.png',
            richScanImage: MHPluginSDK.basePath + 'ihealthRichScan.png',
            ihealthBPIcon: MHPluginSDK.basePath + 'ihealthBP5907Icon.png',
            ihealthWeChatShare: MHPluginSDK.basePath + 'ihealthBp5907WeChatShare.png',
            ihealthButton: MHPluginSDK.basePath + 'ihealthButton.png',
            ihealthPlusButton: MHPluginSDK.basePath + 'ihealthplus.png',
            ihealthPadButton: MHPluginSDK.basePath + 'ihealthipad.png',
            screenHeight: Dimensions.get('window').height,
            screenWidth: Dimensions.get('window').width,
            status: false
        };
    },
    render() {
        ihealth.log("render", "进入微信接入页面了");
        return (
            <View style={styles.containerAll}>
                <View style={{marginTop:0, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                </View>
                {/* title */}
                <View style={{marginTop:(this.state.screenWidth>414)?240:60, height:15, flexDirection: 'row', alignItems: 'center',alignSelf: 'center',justifyContent: 'center'}}>
                    <Image style={{resizeMode:'contain', width:32, height:32}} source={{isStatic:!this.state.devMode, uri:this.state.ihealthBPIcon}} />
                    <Text style={{fontSize: 15,color: '#767575'}}>{strings.iHealthBloodPressureMonitor}</Text>
                </View>

                {/* 二维码区域 */}
                <View style={{marginTop:30, height:150, alignItems: 'center',alignSelf: 'center'}}>
                    <Image style={{resizeMode:'contain', width:150, height:150}} source={{uri: imageUri}} />
                </View>

                {/* 提示文字 */}
                <View style={{marginTop:30, height:40, alignItems: 'center',alignSelf: 'center'}}>
                    <Text style={{fontSize: 15, marginLeft:40, marginRight:40, color: '#767575'}}>{strings.ShareWeChat}</Text>
                </View>


                {/* 分享按键 */}
                <View style={{marginTop:this.state.screenHeight-((this.state.screenWidth>414)?680:460), height:43, justifyContent:'flex-end', alignItems: 'center'}}>
                    <TouchableOpacity style={{flex:1}} underlayColor='#ff0000' onPress={this.onOpenSubPage("", "周日").bind(this)}>
                        <Image style={{resizeMode:'contain', width:this.state.screenWidth, height:44}} source={{isStatic:!this.state.devMode, uri:(this.state.screenWidth>414)?this.state.ihealthPadButton:((this.state.screenWidth==414)?this.state.ihealthPlusButton:this.state.ihealthButton)}} >
                            <View style={{flex:1,  alignItems: 'center',  justifyContent: 'center'}}>
                                <Text style={{fontSize: 14, color: '#767575',backgroundColor:'#ffffff'}}>{strings.SharetoWeChatfriends}</Text>
                            </View>
                        </Image>
                    </TouchableOpacity>
                </View>
            </View>
        );
    },
    onOpenSubPage: function(subPageComponent, subPageTitle) {
        function subPage() {
            if(this.state.status){
                MHPluginSDK.addRecord("微信分享点击", {"点击微信分享": 1}, {});
                MHPluginSDK.shareToWeChatSession("iHealth智控血压",
                    "分享血压计二维码给微信亲友，方便亲友实时关注您的血压变化",
                    this.state.ihealthWeChatShare,
                    'https://act.ihealthlabs.com.cn/actFront/qrcode/index.html'+'?Un='+MHPluginSDK.userId+
                    '@mi&VerifyToken='+this.props.verifyToken+
                    '&Did='+MHPluginSDK.deviceId+
                    '&Mac='+this.props.SN+
                    '&deviceModel='+packageInfoData.models);
            }
        }
        return subPage;
    },
    componentDidMount: function() {
        viewUnmount = false;
        ihealth.log("componentDidMount", "－－－－componentDidMount－－－－－");
        this.fetchQRcodeData();
    },

    componentWillUnmount() {
        viewUnmount = true;
        MHPluginSDK.dismissTips();
    },

    fetchQRcodeData: function(argument) {
        ihealth.log("fetchQRcodeData", "开始请求数据了");
        var bodyDic={};

        var UploadData = '{"device_list":[{"auth_key":"" , "auth_ver":"0", "close_strategy":"1", "conn_strategy":"1", "connect_protocol":"4", "crypt_method":"0", "id":"'+MHPluginSDK.deviceId+'", "mac":"'+this.props.SN+'", "manu_mac_pos":"-1", "ser_mac_pos":"-2"}], "device_num":"1", "op_type":"0", "tokentype":"bpm1"}';

        ihealth.log("UploadData", UploadData);
        bodyDic.verifyToken = this.props.verifyToken;
        bodyDic.queueNum = '106';
        bodyDic.UploadData = UploadData;
        bodyDic.AppGuid = this.props.AppGuid;
        bodyDic.PhoneID = this.props.PhoneID;

        //添加loading页面
        MHPluginSDK.showLoadingTips('');
        getQRcode(bodyDic, (isSuccess, responseData, errorStatus)=>{

            //请求返回,隐藏等待指示
            MHPluginSDK.dismissTips();

            if (viewUnmount === true) {
                return;
            }

            ihealth.log("fetchQRcodeData", "回调函数来了");
            ihealth.log("fetchQRcodeData", responseData);
            if (isSuccess) {
                ihealth.log("fetchQRcodeData", "二维码数据请求成功");
                ihealth.log("fetchQRcodeData",JSON.stringify(responseData));
                ihealth.log("fetchQRcodeData", responseData.ReturnValue.url);
                imageUri = responseData.ReturnValue.url;

                this.setState({
                    status : true
                });
            }
            else
            {
                if (errorStatus == '102') {
                    //网络超时
                    MHPluginSDK.showFailTips("网络超时！");
                } else {
                    //其他错误
                    MHPluginSDK.showFailTips("获取二维码失败！");
                }
            }
        });
    }
});

var styles = StyleSheet.create({
    containerAll: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#f8f8f8',
        marginTop: 64
    }
});

var route = {
    key: 'AccessWeChat',
    title: strings.AccessWeChat,
    component: AccessWeChat,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (<View />);
    }
};

module.exports = {
    component: AccessWeChat,
    route: route
};
