/**
 * Created by zhangmingli on 2016/11/8.
 */
'use strict';
var strings = require('../CommonModules/ihealthLocalizedString');
var LocalizedStrings = require('../CommonModules/LocalizedStrings');
var ihealth = require('../CommonModules/ihealth');
var React = require('react-native');
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var getDeviceConfig = require('../CommonModules/getDeviceConfig');
var setDeviceConfig = require('../CommonModules/setDeviceConfig');
var Aes = require('../CommonModules/Aes');
var Dimensions = require('Dimensions');
const { height,width } = Dimensions.get('window');

var {
    ListView,
    StyleSheet,
    Text,
    Image,
    View,
    Platform,
    TouchableWithoutFeedback,
    TouchableHighlight,
    } = React;

var remindWeekArray;
var changeStatus = false;
var dataSource;

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}
var DearRemind = React.createClass({

    getInitialState: function() {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        remindWeekArray = [{'week' : strings.MON,
            'isRemind' : false},
            {'week' : strings.TUE,
                'isRemind' : false},
            {'week' : strings.WED,
                'isRemind' : false},
            {'week' : strings.THU,
                'isRemind' : false},
            {'week' : strings.FRI,
                'isRemind' : false},
            {'week' : strings.SAT,
                'isRemind' : false},
            {'week' : strings.SUN,
                'isRemind' : false}];
        dataSource = ds.cloneWithRows(remindWeekArray);
        return {
            changeStatus: false,
            devMode: MHPluginSDK.devMode,
        };
    },

    render() {
        ihealth.log('render', '刷新ui了');
        if (changeStatus) {
            ihealth.log('render', '刷新ui了----1');
            return (
                <View style={styles.listViewContainer}>
                    <View style={{marginTop:APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                    </View>
                    <ListView
                        automaticallyAdjustContentInsets={false}
                        dataSource={dataSource}
                        renderRow={this._renderRow}
                        renderHeader = {this._renderSectionHeader} />
                </View>
            );
        }
        else{
            ihealth.log('render', '刷新ui了----2');
            return (
                <View style={styles.listViewContainer}>
                    <View style={styles.listViewContainer1}>
                        <View style={{marginTop:APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                        </View>
                        <ListView
                            automaticallyAdjustContentInsets={false}
                            dataSource={dataSource}
                            renderRow={this._renderRow}
                            renderHeader = {this._renderSectionHeader} />
                    </View>
                </View>
            );
        }
    },

    _renderSectionHeader: function() {
        return (
            <View style={styles.section}>
                <View style={styles.headTextContainer}>
                    <Text style={styles.headText}>{strings.WhenTheBloodPressureMonitorOn}</Text>
                </View>
                <View style={styles.separator} />
            </View>
        );
    },

    //cell右侧点击处理函数
    didClcik: function(rowData){

        function dealClick(){
            ihealth.log('点击了我', rowData);

            var num = this.isRemind(rowData);
            if (num !== 7) {
                remindWeekArray[num]['isRemind'] = !remindWeekArray[num]['isRemind'];

                changeStatus = !changeStatus;
                //this.props.route.changeCallBack(remindWeekArray);
                ihealth.log('changeStatus', remindWeekArray[num]['isRemind']);
                this.setState({'isRemind' : changeStatus});
            }
        }

        return dealClick;
    },

    isRemind: function(rowData){

        var week = rowData['week'];

        ihealth.log('进入isRemind', week);

        switch(week){
            case strings.MON:{
                ihealth.log('isRemind', 1);
                return 0;
                break;
            }
            case strings.TUE:{
                ihealth.log('isRemind', 2);
                return 1;
                break;
            }
            case strings.WED:{
                ihealth.log('isRemind', 3);
                return 2;
                break;
            }
            case strings.THU:{
                ihealth.log('isRemind', 4);
                return 3;
                break;
            }
            case strings.FRI:{
                ihealth.log('isRemind', 5);
                return 4;
                break;
            }
            case strings.SAT:{
                ihealth.log('isRemind', 6);
                return 5;
                break;
            }
            case strings.SUN:{
                ihealth.log('isRemind', 7);
                return 6;
                break;
            }
            default:{
                ihealth.log('DearRemind---isRemind:', '传入星期有错误');
                return 7;
                break;
            }
        }
    },

    _renderRow: function(rowData, rowID) {

        var rowStyle = rowData['isRemind']?styles.rowSelect : styles.rowUnSelect;
        var image = MHPluginSDK.basePath + (rowData['isRemind']?'ihealthSelected.png' : 'ihealthNoSelected.png');
        var textStyle = rowData['isRemind']?styles.text : styles.textUnSelect;
        var lineStyle = rowData['isRemind']?styles.line : styles.lineUnSelect;
        var weekStyle = rowData['isRemind']?styles.week : styles.weekUnSelect;
        var separatorStyle = rowData['isRemind']?styles.separator : styles.separatorUnSelect;

        return (
            <View style={{marginTop:0}}>
                <View style={rowStyle}>
                    <Text style={weekStyle}>{rowData['week']}</Text>
                    <View style={lineStyle}></View>
                    <View style={styles.textContain}>
                        <Text style={textStyle}>{strings.MomAndDadRemind}</Text>
                    </View>
                    <View style={styles.imageContainer}>
                        <TouchableWithoutFeedback key={rowData['week']} style={styles.imageContainer} onPress={this.didClcik(rowData).bind(this)}>
                            <Image
                                style={styles.selectImage}
                                source={{isStatic:!this.state.devMode, uri:image}} />
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={separatorStyle} />
            </View>
        );
    },

    //获取宝贝提醒
    getDeviceRemindInfo:function() {

        var bodyDic = {};

        bodyDic.verifyToken = this.props.verifyToken;
        bodyDic.queueNum = '104';
        bodyDic.mDeviceId = MHPluginSDK.deviceId;
        bodyDic.AppGuid = this.props.AppGuid;
        bodyDic.PhoneID = this.props.PhoneID;
        bodyDic.ApiType = 'deviceGetMeasureRemind';
        bodyDic.sv = 'c7d2bbd8c0ec4e9493a4a97bc9bf0afb';

        //添加loading页面
        MHPluginSDK.showLoadingTips('');

        getDeviceConfig(bodyDic, (isSuccess, responseData, errorStatus)=>{

            //收到网络返回,隐藏等待指示
            MHPluginSDK.dismissTips();

            ihealth.log('getDeviceRemindInfo---回调函数', 'isSuccess:' + isSuccess + 'responseData:' + JSON.stringify(responseData) + 'errorStatus:' + errorStatus);

            if (isSuccess) {

                //数组
                var measureRemind = responseData.ReturnValue.MeasureRemind;

                if (measureRemind.length>0) {

                    for (var i = 0; i < measureRemind.length; i++) {
                        if (measureRemind[i].Model != 'off') {
                            ihealth.log('getDeviceRemindInfo-Days', measureRemind[i].Days);
                            var day = parseInt(measureRemind[i].Days) - 1;
                            remindWeekArray[day]['isRemind'] = true;
                        }
                    }

                    for (var i = 0; i < remindWeekArray.length; i++) {
                        ihealth.log(remindWeekArray[i]['week'] ,remindWeekArray[i]['isRemind']);
                    }

                    //刷新ui
                    changeStatus = !changeStatus;
                    this.setState({'isRemind' : changeStatus});
                }
                else
                {
                    ihealth.log('getDeviceRemindInfo----Days', '无提醒数据');
                }
            }
            else
            {
                //错误处理,隐藏等待指示
                MHPluginSDK.dismissTips();

                if (errorStatus == '102') {
                    //网络超时
                    MHPluginSDK.showFailTips("网络超时！");
                } else {
                    //其他错误
                    MHPluginSDK.showFailTips("获取提醒失败！");
                }

                //启动定时器,1.5s后返回设置界面
                this.timer = setTimeout(() => {
                    ihealth.log('请求宝贝提醒信息错误', '返回设置界面');
                    this.props.navigator.pop();
                }, 1200);
            }
        });
    },

    componentDidMount() {
        this.getDeviceRemindInfo();
    },

    componentWillUnmount() {
        MHPluginSDK.dismissTips();
        // 如果存在this.timer，则使用clearTimeout清空。
        // 如果你使用多个timer，那么用多个变量，或者用个数组来保存引用，然后逐个clear
        ihealth.log('componentWillUnmount' ,'清除定时器');
        this.timer && clearTimeout(this.timer);
    },

});

var styles = StyleSheet.create({

    listViewContainer:{
        flex:1,
        top:64,
    },
    listViewContainer1:{
        flex:1,
    },
    section: {
        backgroundColor: '#f8f8f8',
        height: 37,
    },

    line: {
        top: 7,
        height: 35,
        backgroundColor: '#CCCCCC',
        width: 1,
    },

    lineUnSelect: {
        top: 5,
        height: 35,
        backgroundColor: '#DDDDDE',
        width: 1,
    },

    selectImage: {
        position: 'absolute',
        flex: 1,
        resizeMode: 'contain',
        top: 13.5,
        right: 10,
        height: 24,
        width: 24,
    },

    week: {
        flex: 1.2,
        alignSelf: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    weekUnSelect: {
        flex: 1.2,
        alignSelf: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#BEBEBE',
    },

    imageContainer: {
        flex: 1,
    },

    headText: {
        color: '#999',
    },

    headTextContainer: {
        marginTop: 15,
        marginLeft: 17,
        marginBottom: 9,
        height: 12,
    },

    rowSelect: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 50,
        backgroundColor: '#fff',
    },

    rowUnSelect: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 50,
        backgroundColor: '#f7f7f8',
    },

    textContain: {
        flex : 4,
    },

    text: {
        flex: 4,
        left: 12,
        paddingTop: 17,
        fontSize: 15,
        color: '#000',
    },

    textUnSelect: {
        flex: 1,
        left: 12,
        paddingTop: 17,
        fontSize: 15,
        color: '#D3D3D4',
    },

    separatorUnSelect: {
        height: 1,
        backgroundColor: '#DDDDDE',
    },

    separator: {
        marginBottom: 0,
        height: 1,
        backgroundColor: '#CCCCCC',
    },

});

var updateDearRemind=function(){
    ihealth.log('saveDearRemind', remindWeekArray);
    if (remindWeekArray) {

        ihealth.log('saveDearRemind', '宝贝提醒日期有改变');
        var days = '';
        for (var i = 0; i < remindWeekArray.length; i++) {

            ihealth.log(remindWeekArray[i]['week'] ,remindWeekArray[i]['isRemind']);
            if (remindWeekArray[i]['isRemind']) {
                var day = isRemind(remindWeekArray[i]);
                if (day !== 7) {
                    day++;
                    days += day;
                }
                else{
                    ihealth.log('saveDearRemind----day', '传入星期有错误');
                }
            }
        }

        ihealth.log('saveDearRemind ---days', days);

        //读取本地存储内容
        MHPluginSDK.loadInfoCallback(info => {

            if (info != null){
                var deviceInfo = info;

                setDeviceRemind(days, deviceInfo);
            }
            else {
                ihealth.log("本地没有设备信息");
            }
        });

    }
    else{
        ihealth.log('saveDearRemind', '宝贝提醒日期没有改变');
        MHPluginSDK.showFinishTips('保存成功');
    }
}

var isRemind=function(rowData){

    var week = rowData['week'];

    ihealth.log('进入isRemind', week);

    switch(week){
        case strings.MON:{
            ihealth.log('isRemind', 1);
            return 0;
            break;
        }
        case strings.TUE:{
            ihealth.log('isRemind', 2);
            return 1;
            break;
        }
        case strings.WED:{
            ihealth.log('isRemind', 3);
            return 2;
            break;
        }
        case strings.THU:{
            ihealth.log('isRemind', 4);
            return 3;
            break;
        }
        case strings.FRI:{
            ihealth.log('isRemind', 5);
            return 4;
            break;
        }
        case strings.SAT:{
            ihealth.log('isRemind', 6);
            return 5;
            break;
        }
        case strings.SUN:{
            ihealth.log('isRemind', 7);
            return 6;
            break;
        }
        default:{
            ihealth.log('DearRemind---isRemind:', '传入星期有错误');
            return 7;
            break;
        }
    }
}

//设置宝贝提醒
var setDeviceRemind=function(days, deviceInfo) {

    //添加loading页面
    MHPluginSDK.showLoadingTips('');

    var bodyDic={};
    bodyDic.AppGuid = deviceInfo.AppGuid;
    bodyDic.PhoneID = deviceInfo.PhoneID;
    bodyDic.verifyToken = Aes.Ctr.decrypt(deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128);
    bodyDic.queueNum = '105';
    bodyDic.mDeviceId = MHPluginSDK.deviceId;
    bodyDic.ApiType = 'deviceSetMeasureRemind';
    bodyDic.sv = 'c7d2bbd8c0ec4e9493a4a97bc9bf0aff';
    bodyDic.uploadData = '{"MeasureRemind":[{"Days":' + days + ',"Model":"once","Remark":"","RemindTS":'+ Math.round(new Date().getTime()/1000) + ',"RemindTime":"0000"}]}';

    setDeviceConfig(
        bodyDic,
        (isSuccess, responseData, errorStatus)=>{

            //收到网络返回,隐藏等待指示
            MHPluginSDK.dismissTips();

            //this.dearRemindViewLoad = false;

            ihealth.log('设置宝贝提醒函数回调了', 'isSuccess:' + isSuccess + ' responseData:' + JSON.stringify(responseData) + ' errorStatus:' + errorStatus);

            if (isSuccess) {
                ihealth.log('setDeviceRemind', '设置宝贝提醒成功了');
                MHPluginSDK.showFinishTips('保存成功');
            } else {
                if (errorStatus == '102') {
                    //网络超时
                    MHPluginSDK.showFailTips("网络超时！");
                } else {
                    //其他错误
                    MHPluginSDK.showFailTips("设置提醒失败！");
                }
            }
        }
    )
}

var route = {
    key: 'DearRemind',
    title: strings.DearRemind,
    component: DearRemind,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (
            <View style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                <Text
                    style={{color:'#FF6633', fontSize:17}}
                    onPress={() => {
                    //右键保存提醒
                    updateDearRemind();
                }}>保存</Text>
            </View>
        );
    }
}

module.exports = {
    component: DearRemind,
    route: route,
}