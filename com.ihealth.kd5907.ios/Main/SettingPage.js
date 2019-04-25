/**
 * Created by zhangmingli on 2016/11/11.
 */
'use strict';
var strings = require('../CommonModules/ihealthLocalizedString');
var React = require('react-native');
var AccessWeChat = require('./AccessWeChat');
var DeviceInformation = require('./DeviceInformation');
var PrivacyAgreement = require('./PrivacyAgreement');
var ihealth = require('../CommonModules/ihealth');
var Aes = require('../CommonModules/Aes');
var BPM1MoreHelp = require('./BPM1MoreHelp');
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var MoreMenu = require('./MoreMenu');
var Dimensions = require('Dimensions');
let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}
const { width } = Dimensions.get('window');

var {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    Component,
    } = React;

class SettingPage extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            viewUnmount:false,
            deviceInfo:{},
            did: MHPluginSDK.deviceId,
            devMode: MHPluginSDK.devMode,
            switchState: false,
            switchImageOff: MHPluginSDK.basePath + 'switchOFF.png',
            switchImageOn: MHPluginSDK.basePath + 'switchON.png',
        };
    }

    componentDidMount() {
        this.state.viewUnmount = false;

        //添加loading页面
        // MHPluginSDK.showLoadingTips('');

        //读取本地存储内容
        MHPluginSDK.loadInfoCallback(info => {
            if (info != null){
                this.deviceInfo = info;
                ihealth.log("DeviceInformation---componentDidMount", JSON.stringify(this.deviceInfo));

            }else {
                ihealth.log("本地没有设备信息");
                this.deviceInfo={};
            }

            MHPluginSDK.getDevicePropertyFromMemCache(["mac"], (props) => {

                //存储设备序列号
                this.deviceInfo.SN = props.mac.replace(/:/g,"");

                ihealth.log('getDevicePropertyFromMemCache', this.deviceInfo.SN);

                //存储本地
                MHPluginSDK.saveInfo(this.deviceInfo);
            });

            });
    }

    componentWillUnmount() {
        //收到网络返回,隐藏等待指示
        this.state.viewUnmount = true;
        MHPluginSDK.dismissTips();
        ihealth.log('收到网络返回,隐藏等待指示---dismissTips');
    }


    render() {
        var rowAccessWeChat = this._createMenuRow(AccessWeChat);
        var rowDeviceInformation = this._createMenuRow(DeviceInformation);
        var rowMoreMenu = this._createMenuRow(MoreMenu);
        var rowFeedBack = this._createMenuRow(BPM1MoreHelp);
        var rowPrivacyAgreement = this._createMenuRow(PrivacyAgreement);
        


        return (
            <View style={styles.containerAll} >
                <View style={{marginTop:APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                </View>
                <View style={styles.containerMenu}>

                    {/*接入微信*/}
                    {rowAccessWeChat}
                    {/*通用设置*/}
                    {rowMoreMenu}
                    {/*设备信息*/}
                    {rowDeviceInformation}
                    {/*帮助*/}
                    {rowFeedBack}
                    {/*隐私政策与用户协议*/}
                    {rowPrivacyAgreement}
                    
                </View>
            </View>
        );
    }

    //微信接入\宝贝提醒\设备信息
    _createMenuRow(component) {
        return [
            (<TouchableHighlight key={"touch_"+component.route.title} style={{alignSelf:'stretch', flexDirection: 'row', height: 58}} underlayColor='#838383' onPress={this._onOpenSubPage(component).bind(this)}>

                <View style={{flexDirection: 'row', flex: 1, height: 58}}>

                    <Text style={{fontSize: 16, alignItems: 'center', alignSelf: 'center', color: '#333333', flex: 2, width: 200, marginLeft:24}}>{component.route.title}</Text>

                    <View style={{flex: 1, justifyContent:'center', alignItems:'flex-end'}}>
                        <Image style={{ width: 15, height: 15, marginRight: 24}} source={this.props.app.sourceOfImage("sub_arrow.png")} />
                    </View>

                </View>

            </TouchableHighlight>),
            (<View key={"sep_"+component.route.title} style={styles.separator} />)
        ];
    }

    _onOpenSubPage(subPageComponent) {
        
        function subPage() {
            console.log('_onOpenSubPage',this.deviceInfo);
            this.props.navigator.push({
                ...subPageComponent.route,
                passProps: {
                    message: 'amazing!',
                    verifyToken : Aes.Ctr.decrypt(this.deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128),
                    AppGuid : this.deviceInfo.AppGuid,
                    PhoneID :  this.deviceInfo.PhoneID,
                    SN : this.deviceInfo.SN
                },
            });
        }
        return subPage;
    }

    


}

var styles = StyleSheet.create({
    containerAll: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#838383',
        marginTop: 64
    },
    containerMenu: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        alignSelf: 'stretch'
    },
    rowContainer: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        height: 58
    },
    separator: {
        height: 0.5,
        alignSelf: 'stretch',
        backgroundColor: '#dddddd',
        marginLeft:24,
        marginRight: 24
    }
});

var route = {
    key: 'SettingPage',
    title: strings.更多,
    component: SettingPage,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (
            <View />
        )
    }
};

module.exports = {
    component: SettingPage,
    route: route
};