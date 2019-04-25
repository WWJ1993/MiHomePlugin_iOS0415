'use strict';

var React = require('react-native');
var ActionSheetIOS = require('ActionSheetIOS');
var FindMore = require('./FindMore');
var ReactART = require('ReactNativeART');
var HistoryListView = require('./HistoryListView');
var HistoryListViewM = require('./HistoryListViewM');
var BPStory = require('./BPStory');
var userThirdPartyLogin = require('../CommonModules/userThirdPartyLogin');
var setDeviceConfig = require('../CommonModules/setDeviceConfig');
var userBpmBind = require('../CommonModules/userBpmBind');
var hex_md5 = require('../CommonModules/hex_md5');
var ihealth = require('../CommonModules/ihealth');
var historyApi = require('../CommonModules/historyApi');
var downloadActivity = require('../CommonModules/downloadActivity');
var BPM1MoreHelp = require('./BPM1MoreHelp');
var strings = require('../CommonModules/ihealthLocalizedString');
var Aes = require('../CommonModules/Aes');
var UUID = require('../CommonModules/UUID');
var packageInfoData = require('../packageInfo.json');


var {
    Alert,
    AppRegistry,
    StyleSheet,
    Text,
    TouchableHighlight,
    Image,
    View,
    TextInput,
    PixelRatio,
    StatusBar,
    TouchableOpacity,
    Platform,
    DeviceEventEmitter,
    PanResponder,
    Animated
} = React;

var {
    Surface,
    Path,
    Group,
    Transform,
    Shape,
} = ReactART;

var MHPluginSDK = require('NativeModules').MHPluginSDK;
var Dimensions = require('Dimensions');

var subscription;
var horizontalGap = 50;
var tag = 'MainPage';
var deviceWidth = 0;
var deviceHeight = 0;
var chartContainerHeight = 0;
var yAxisHeight= 0;
var xAxisWidth = 0;
var fatherHighP = [100, 150];
var fatherLowP = [50, 100];
var fatherDateArray = [];
var motherHighP = [70, 120];
var motherLowP = [30, 100];
var motherDateArray = [];
var fatherDateLoaded = false;
var motherDateLoaded = false;
var isFatherData = 1;
var isMotherData = 2;
var isFatherDataList = 3;
var isMotherDataList = 4;
var deviceInfo = {},
    viewUnmount;

let _previousLeft=0;
let _previousTop=0;

let lastLeft=0;
let lastTop=0;

var MoreMenu = require('./MoreMenu');
var DearRemind = require('./DearRemind');
var SettingPage = require('./SettingPage');
var ImageButton = require('../CommonModules/ImageButton');

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}

var BUTTONS = [
    '宝贝提醒',
    '通用设置',
    '帮助与反馈',
    '取消',
];
var saveAuth = {};

// let subscription1 = DeviceEventEmitter.addListener(MHPluginSDK.onReceivingForegroundPushEventName,(notification) => {
//     // 插件在前台收到push通知回调
//     console.log(JSON.stringify(notification));
//     console.log('888888');
//   });

class MainPage extends React.Component {


    constructor(props, context) {
        super(props, context);

        // var a = DeviceEventEmitter.addListener(MHPluginSDK.onReceivingForegroundPushEventName,(notification) => {
        //     // 插件在前台收到push通知回调
        //     console.log(JSON.stringify(notification));
        //     console.log('888888');
        //   });
        //   console.log('8888811118');

        deviceWidth = Dimensions.get('window').width;
        deviceHeight = Dimensions.get('window').height - 64;
        chartContainerHeight = deviceHeight * 19/54;
        xAxisWidth = deviceWidth - 30;
        yAxisHeight = chartContainerHeight - 40;

        this.state = {
            requestStatus: false,
            dateLoaded : false,
            did: MHPluginSDK.deviceId,
            model: MHPluginSDK.deviceModel,
            apiLevel: MHPluginSDK.apiLevel,
            basePath: MHPluginSDK.basePath,
            devMode: MHPluginSDK.devMode,
            screenWidth: Dimensions.get('window').width,
            activityShow: false,
            activityUrl:'',
            activityTitle:'',
            userId:'',
            buttonStyle:{
              top:0,
              left:0
            }
        };


    }

    deviceBindUser() {
        //调用绑定接口
        var bodyDic={};
        bodyDic.verifyToken = Aes.Ctr.decrypt(deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128);
        bodyDic.queueNum = '101';
        bodyDic.AppGuid = deviceInfo.AppGuid;
        bodyDic.PhoneID = deviceInfo.PhoneID;
        bodyDic.uploadData = '[{"TS":' + Math.round(new Date().getTime()/1000) + ', "MAC":' + this.state.did + ', "Model":"bpm1"}]';

        userBpmBind(bodyDic, (isSuccess, responseData, errorStatus)=>{
                ihealth.log('MainPage--deviceBindUser', 'isSuccess:'+isSuccess+'  responseData:'+JSON.stringify(responseData)+'  errorStatus:'+errorStatus);
                if (isSuccess) {
                    ihealth.log("deviceBindUser", '设备绑定成功！');

                    //设备绑定成功，下载数据
                    this.fetchDataFather();
                    this.fetchDataMother();
                } else {
                    //错误处理,隐藏等待指示
                    MHPluginSDK.dismissTips();

                    if (errorStatus == '102') {
                        //网络超时
                        MHPluginSDK.showFailTips("网络超时！");
                    }
                    else {
                        //其他错误
                        MHPluginSDK.showFailTips("设备绑定失败！");
                    }

                    //退出插件
                    MHPluginSDK.closeCurrentPage();
                }
            }
        )}

    //上传设备经纬度
    setDeviceLocation(longitude, latitude) {

        //添加loading页面
        MHPluginSDK.showLoadingTips('');
        var bodyDic={};
        bodyDic.deviceModel = packageInfoData.models;
        bodyDic.AppGuid = deviceInfo.AppGuid;
        bodyDic.PhoneID = deviceInfo.PhoneID;
        bodyDic.verifyToken = Aes.Ctr.decrypt(deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128);
        bodyDic.queueNum = '105';
        bodyDic.mDeviceId = MHPluginSDK.deviceId;
        bodyDic.sv = '399027b443041d4b93b6570576318a8e';
        bodyDic.ApiType = 'deviceUploadStatus';
        bodyDic.uploadData = '{"DevLocation":{"Lat":'+latitude+',"Lon":'+longitude+'}}';

        setDeviceConfig(bodyDic, (isSuccess, responseData, errorStatus)=>{
                //收到网络返回,隐藏等待指示
                MHPluginSDK.dismissTips();
                ihealth.log('设置地理位置函数回调了', 'isSuccess:' + isSuccess + ' responseData:' + JSON.stringify(responseData) + ' errorStatus:' + errorStatus);

                if (isSuccess) {
                    ihealth.log('setDeviceRemind', '设置地理位置成功了');
                    //MHPluginSDK.showFinishTips('保存成功');
                } else {
                    if (errorStatus == '102') {
                        //网络超时
                        //MHPluginSDK.showFailTips("网络超时！");
                    } else {
                        //其他错误
                        //MHPluginSDK.showFailTips("设置地理位置失败！");
                    }
                }
            }
        )}

    //第三方登录
    userLogin() {
        var bodyDic={};
        bodyDic.queueNum = '100';
        bodyDic.pw = hex_md5((MHPluginSDK.userId + '@miihealth'));
        bodyDic.AppGuid = deviceInfo.AppGuid;
        bodyDic.PhoneID = deviceInfo.PhoneID;

        //调用登录接口，登录验证
        userThirdPartyLogin(bodyDic, (isSuccess, responseData, errorStatus)=>{
                ihealth.log('MainPage--userThirdPartyLogin', 'isSuccess:'+isSuccess+'  responseData:'+JSON.stringify(responseData)+'  errorStatus:'+errorStatus);
                if (isSuccess) {
                    //登录成功，存储vtoken，rtoken等登录信息
                    //记录登录标志
                    deviceInfo.userLoginFlagForActivity = true;
                    //存储登录用户userID
                    deviceInfo.userID = MHPluginSDK.userId;
                    //存储AccessToken

                    deviceInfo.AccessToken = Aes.Ctr.encrypt(responseData.ReturnValue.Result.AccessToken, 'iHealthlabs.AijiaKang', 128);
                    //存储RefreshToken
                    deviceInfo.RefreshToken = Aes.Ctr.encrypt(responseData.ReturnValue.Result.RefreshToken, 'iHealthlabs.AijiaKang', 128);
                    //存储host
                    deviceInfo.RegionHost = responseData.ReturnValue.Result.RegionHost;
                    //存储iHealthUserId
                    deviceInfo.iHealthUserId = responseData.ReturnValue.Result.ID;
                    //存储本地
                    MHPluginSDK.saveInfo(deviceInfo);

                    //登录成功，下载数据
                    this.fetchDataFather();
                    this.fetchDataMother();
					if(deviceInfo.activityShow){
						this.setState({
							activityShow:true,
							activityUrl:deviceInfo.activityUrl,
							activityTitle:deviceInfo.activityTitle,

						});
					}
					this.downloadActivity();

                } else {
                    //错误处理,隐藏等待指示
                    MHPluginSDK.dismissTips();

                    if (errorStatus == '102') {
                        //网络超时
                        MHPluginSDK.showFailTips("网络超时！");
                    } else {
                        //其他错误
                        MHPluginSDK.showFailTips("用户验证失败！");
                    }

                    //退出插件
                    MHPluginSDK.closeCurrentPage();
                }
            }
        )}

    //插件登录验证
    loginVerification() {
        MHPluginSDK.loadInfoCallback(info => {
            var isChange = false;

            if (info != null){
                deviceInfo = info;
                ihealth.log("loginVerification", JSON.stringify(deviceInfo));
            }

            if (!deviceInfo.AppGuid) {
                deviceInfo.AppGuid = UUID.prototype.createUUID();
                isChange = true;
            }
            if (!deviceInfo.PhoneID) {
                deviceInfo.PhoneID = UUID.prototype.createUUID();
                isChange = true;
            }

            if (isChange) {
                MHPluginSDK.saveInfo(deviceInfo);
            }

            //开始网络请求指示
            MHPluginSDK.showLoadingTips('');
            if (!(deviceInfo != null) && !(deviceInfo.userLoginFlagForActivity == true) && !(deviceInfo.userID === MHPluginSDK.userId))
            {
                //用户已经登录过且userID一致，直接开始下载用户数据
                ihealth.log("loginVerification", '用户已经登录过，开始下载用户数据！');

                //this.deviceBindUser();
                //上传地理位置
                MHPluginSDK.getDevicePropertyFromMemCache(["longitude","latitude" ], (props) => {
                    //获取当前设备的经纬度信息并上传
                    if ((props.longitude != null || props.longitude != undefined || props.longitude != '')
                        && (props.latitude != null || props.latitude != undefined || props.latitude != '')) {
                        this.setDeviceLocation(props.longitude, props.latitude);
                    }
                });
                this.fetchDataFather();
                this.fetchDataMother();
				if(deviceInfo.activityShow){
					this.setState({
						activityShow:true,
						activityUrl:deviceInfo.activityUrl,
						activityTitle:deviceInfo.activityTitle,

					});
				}
				//登录成功，下载数据
				this.downloadActivity();
            }
            else
            {
                //用户未在本地登录过，第一次登录
                ihealth.log("loginVerification", '用户未登录过！');
                this.userLogin();
            }

        });
    }
    
    showAuthDialog() {
        MHPluginSDK.loadInfoCallback(info=>{
            if (info!=null) {
              saveAuth = info;
              console.log('saveAuth',saveAuth)
              if(saveAuth.ifAuth==1){
                return
              }
            }
            MHPluginSDK.openPrivacyLicense("服务协议","https://cnbj2.fds.api.xiaomi.com/ihealth-reg-user-profile/UserAgreementMiHomePlugin.html",
            "隐私条款","https://cnbj2.fds.api.xiaomi.com/ihealth-reg-user-profile/PrivacyPolicyMiHomePlugin.html",(result)=>{
              if(result == "ok") {
                
                saveAuth.ifAuth = 1;
                MHPluginSDK.saveInfo(saveAuth);
                console.log('saveAuth1',saveAuth)
              } else {
                  this.onClosePage();
              }
            })
          });
  
      }

    componentDidMount() {
        viewUnmount = false;
        this.loginVerification();
        this.showAuthDialog();
    }

    componentWillUnmount(){
        viewUnmount = true;
        MHPluginSDK.dismissTips();
    }

    callbackFunction() {
        fatherDateLoaded = false;
        motherDateLoaded = false;
        this.setState({
            dateLoaded  : false,
        });

        //打开loading提示
        MHPluginSDK.showLoadingTips('');

        this.fetchDataFather();
        this.fetchDataMother();
    }

    renderDateView(dateArray, dataArray) {
        if (this.state.dateLoaded === false ||dataArray == undefined|| dataArray.length <= 0) return;
        return (
            <View style={styles.xLabels}>
              <Text style={styles.timeStart}>{dateArray[1]}</Text>
              <Text style={[styles.timeEnd, {
                  left:(dataArray.length - 1) * horizontalGap
              }]}>{dateArray[0]}</Text>
            </View>
        )
    }

    //下载血压故事活动
    downloadActivity(){
        let bodyDic={};
        bodyDic.verifyToken = Aes.Ctr.decrypt(deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128);
        bodyDic.queueNum = '102';
        bodyDic.AppGuid = deviceInfo.AppGuid;
        bodyDic.PhoneID = deviceInfo.PhoneID;
        downloadActivity(bodyDic, (isSuccess, responseData, errorStatus)=>{
            if (isSuccess) {
                //活动下载成功，将url和状态存储在本地
				let arr = responseData.ReturnValue;
				for(let index=0; index<arr.length; index++){
					let activityObj = arr[index];
					if(activityObj.ActCode == '61'){
						let activityArr = activityObj.Data;
						let activityData = activityArr[0];
						if(activityData.PaperType == '1' && activityData.DataId == '226'){
							//存储活动
							deviceInfo.activityShow = true;
							deviceInfo.activityUrl = activityData.PaperUrl;
							deviceInfo.activityTitle = activityData.PaperContent.replace("&nbsp;", "");
							MHPluginSDK.saveInfo(deviceInfo);
							//下载到活动进行显示,如果本地未显示活动则显示
							if(!this.state.activityShow){
								this.setState({
									activityShow: true,
									activityUrl: deviceInfo.activityUrl,
									activityTitle: deviceInfo.activityTitle
								});
							}
						}
						break;
					}else{ //当前活动非血压故事
						deviceInfo.activityShow = false;
						MHPluginSDK.saveInfo(deviceInfo);
						if(this.state.activityShow){
							this.setState({
								activityShow: false
							});
						}
					}
				}
				if(arr.length == 0){
					deviceInfo.activityShow = false;
					MHPluginSDK.saveInfo(deviceInfo);
					if(this.state.activityShow){
						this.setState({
							activityShow: false
						});
					}
				}
            } else {
                //活动下载失败,关闭活动显示
				deviceInfo.activityShow = false;
				MHPluginSDK.saveInfo(deviceInfo);
				if(this.state.activityShow){
					this.setState({
						activityShow: false
					});
				}
            }
        });
    }

    //下载用戶1测血压数据
    fetchDataFather() {
        var bodyDic={};
        bodyDic.verifyToken = Aes.Ctr.decrypt(deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128);
        bodyDic.queueNum = '102';
        bodyDic.pageSize = '20';
        bodyDic.position = '1';
        bodyDic.ts = '0';
        bodyDic.didList = '["' +  this.state.did + '"]';
        bodyDic.AppGuid = deviceInfo.AppGuid;
        bodyDic.PhoneID = deviceInfo.PhoneID;

        historyApi(bodyDic, (isSuccess, responseData, errorStatus)=>{

                ihealth.log('MainPage--fetchDataFather', 'isSuccess:'+isSuccess+'  responseData:'+JSON.stringify(responseData)+'  errorStatus:'+errorStatus);
                if (isSuccess) {
                    this.fatherCallBackDeal(responseData);
                } else {
                    //错误处理,隐藏等待指示
                    MHPluginSDK.dismissTips();

                    //this.props.route.setDataLoadFinish();

                    if (errorStatus == '102') {
                        //网络超时
                        MHPluginSDK.showFailTips("网络超时！");
                    } else if(errorStatus == '200'){
                        //弹窗提示用户分享关系已解除
                        Alert.alert(
                            '分享关系已取消',
                            null,
                            [
                                {text: '我知道了', onPress: () => this.onClosePage()}
                            ]);

                    } else {
                        //其他错误
                        MHPluginSDK.showFailTips("数据下载失败！");
                    }
                }
            }
        );
    }

    //下载用户2测血压
    fetchDataMother() {
        var bodyDic={};
        bodyDic.verifyToken = Aes.Ctr.decrypt(deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128);
        bodyDic.queueNum = '102';
        bodyDic.pageSize = '20';
        bodyDic.position = '2';
        bodyDic.ts = '0';
        bodyDic.didList = '["' +  this.state.did + '"]';
        bodyDic.AppGuid = deviceInfo.AppGuid;
        bodyDic.PhoneID = deviceInfo.PhoneID;

        historyApi(
            bodyDic,
            (isSuccess, responseData, errorStatus)=>{
                ihealth.log('MainPage--fetchDataMother', 'isSuccess:'+isSuccess+'  responseData:'+JSON.stringify(responseData)+'  errorStatus:'+errorStatus);
                if (isSuccess) {
                    this.motherCallBackDeal(responseData);

                } else {
                    //错误处理,隐藏等待指示
                    MHPluginSDK.dismissTips();

                    //this.props.route.setDataLoadFinish();

                    if (errorStatus == '102') {
                        //网络超时
                        MHPluginSDK.showFailTips("网络超时！");
                    } else {
                        //其他错误
                        MHPluginSDK.showFailTips("数据下载失败！");
                    }
                }
            }
        );
    }

    fatherCallBackDeal(callBackData) {
        if (viewUnmount === true) {
            return;
        }
        var fatherData = callBackData.ReturnValue.Data,
            i,
            dateArray = [],
            length = fatherData.length,
            fatherHighPs = [],
            fatherLowPs = [];
        for(i=0; i<length; i++) {
            if (i===0 || i===length-1) {
                dateArray.push(this.formatDate(fatherData[i].MeasureTime));
            };
            fatherHighPs.unshift(fatherData[i].HighP);
            fatherLowPs.unshift(fatherData[i].LowP);
        }

        if (dateArray.length === 1) {
            dateArray.push("");
        }
        fatherDateArray = dateArray;
        fatherHighP = fatherHighPs;
        fatherLowP = fatherLowPs;
        fatherDateLoaded = true;

        if (motherDateLoaded === true) {
            //取消等待指示
            MHPluginSDK.dismissTips();

            //this.props.route.setDataLoadFinish();

            this.setState({
                dateLoaded  : true
            });
        };
    }

    formatDate(number) {
        var date = new Date(number*1000);
        return (date.getMonth() + 1) + strings.yue + date.getDate() + strings.ri;
    }

    motherCallBackDeal(callBackData) {
        if (viewUnmount === true) {
            return;
        }
        var motherData = callBackData.ReturnValue.Data,
            i,
            dateArray = [],
            length = motherData.length,
            motherHighPs = [],
            motherLowPs = [];

        for(i=0; i<length; i++) {
            if (i===0 || i===length-1) {
                dateArray.push(this.formatDate(motherData[i].MeasureTime));
            };
            motherHighPs.unshift(motherData[i].HighP);
            motherLowPs.unshift(motherData[i].LowP);
        }

        if (dateArray.length === 1) {
            dateArray.push("");
        }
        motherDateArray = dateArray;
        motherHighP = motherHighPs;
        motherLowP = motherLowPs;
        motherDateLoaded = true;

        if (fatherDateLoaded === true) {
            //取消等待指示
            MHPluginSDK.dismissTips();

            //this.props.route.setDataLoadFinish();

            this.setState({
                dateLoaded  : true
            });
        };
    }

    getHorizontalLine200() {
        return 'M30,8 L' + deviceWidth + ',8';
    }
    getHorizontalLine150() {
        return 'M30,' + (8 + yAxisHeight/4) + ' L' + deviceWidth + ',' + (8 + yAxisHeight/4);
    }
    getHorizontalLine100() {
        return 'M30,' + (8 + 2 * yAxisHeight/4) + ' L' + deviceWidth + ',' + (8 + 2 * yAxisHeight/4);
    }
    getHorizontalLine50() {
        return 'M30,' + (8 + 3 * yAxisHeight/4) + ' L' + deviceWidth + ',' + (8 + 3 * yAxisHeight/4);
    }
    getHorizontalLine0() {
        return 'M30,' + (8 + yAxisHeight) + ' L' + deviceWidth + ',' + (8 + yAxisHeight);
    }
    getVerticalLine0() {
        return 'M30,' + (8 + yAxisHeight) + ' L30' + ',8';
    }
    drawSysPath(sysData) {
        if (this.state.dateLoaded === false || sysData.length <= 0) return;
        var x = 15;
        var y = yAxisHeight * (1 - sysData[0]/200);
        var path = 'M' + x + ',' + y + ' L' + (x+1) + ',' + y + ' L' + (x+1) + ',' + (y-1) + ' L' + x + ',' + (y-1) + ' L' + x + ',' + y;
        horizontalGap = sysData.length >5 ? (xAxisWidth - 46) / (sysData.length -1) : 50;
        for(var i=1; i<sysData.length; i++) {
            x = (15 + i * horizontalGap);
            y = yAxisHeight * (1 - sysData[i]/200);
            path += 'L' + x + ',' + y + ' L' + (x+1) + ',' + y + ' L' + (x+1) + ',' + (y-1) + ' L' + x + ',' + (y-1) + ' L' + x + ',' + y;
        }
        return <Shape d={path} stroke="#FF6633" strokeWidth={2}/>
    }
    drawDiaPath(diaData) {
        if (this.state.dateLoaded === false || diaData.length <= 0) return;
        var x = 15;
        var y = yAxisHeight * (1 - diaData[0]/200);
        var path = 'M' + x + ',' + y + ' L' + (x+1) + ',' + y + ' L' + (x+1) + ',' + (y-1) + ' L' + x + ',' + (y-1) + ' L' + x + ',' + y;
        horizontalGap = diaData.length >5 ? (xAxisWidth - 46) / (diaData.length -1) : 50;
        for(var i=1; i<diaData.length; i++) {
            x = (15 + i * horizontalGap);
            y = yAxisHeight * (1 - diaData[i]/200);
            path += 'L' + x + ',' + y + ' L' + (x+1) + ',' + y + ' L' + (x+1) + ',' + (y-1) + ' L' + x + ',' + (y-1) + ' L' + x + ',' + y;
        }
        return <Shape d={path} stroke="#13B5B1" strokeWidth={2}/>
    }

    render() {
        return (
            <View style={styles.container}>
              <View style={{marginTop:APPBAR_MARGINTOP, height:0.5, width:this.state.screenWidth, backgroundColor: '#d0d0d0'}}>
              </View>
              <StatusBar barStyle='default' />

              <View style={styles.fatherTitle}>
                <Text style={styles.fatherTitleText}>
                    <Image
                        
                        style={(this.state.screenWidth != 320)?({marginRight: 15,width: 15,height: 15,alignSelf: 'center'}):({marginRight: 15,width: 15,height: 15,alignSelf: 'center'})}
                        source={{isStatic:!this.state.devMode, uri:this.state.basePath + "porper@2x.png"}}/>
                    {strings.UserFBloodPressure}
                    
                    {/* 1 测的血压 */}
                    </Text>
                <Text style={styles.fatherUnit}>mmHg</Text>
              </View>

              <View style={styles.fatherContainer}>
                <TouchableOpacity onPress={

                    (this.state.dateLoaded === true && fatherHighP.length > 0)?this._onOpenSubPage(HistoryListView, '1').bind(this):null

                } style={styles.fatherChartTouchable}>

                  <View style={styles.chartContainer}>
                    <Surface
                        width={deviceWidth}
                        height={chartContainerHeight}>
                      <Shape  d={this.getHorizontalLine200()} stroke="#eeeeee" strokeWidth={1} />
                      <Shape  d={this.getHorizontalLine150()} stroke="#eeeeee" strokeWidth={1} />
                      <Shape  d={this.getHorizontalLine100()} stroke="#eeeeee" strokeWidth={1} />
                      <Shape  d={this.getHorizontalLine50()} stroke="#eeeeee" strokeWidth={1} />
                      <Shape  d={this.getHorizontalLine0()} stroke="#eeeeee" strokeWidth={1} />
                      <Shape  d={this.getVerticalLine0()} stroke="#eeeeee" strokeWidth={1} />
                      <Group x={30} y={8}>
                          {this.drawSysPath(fatherHighP)}
                          {this.drawDiaPath(fatherLowP)}
                      </Group>
                    </Surface>
                    <View style={styles.yLabels}>
                      <Text style={styles.y_200}>200</Text>
                      <Text style={styles.y_150}>150</Text>
                      <Text style={styles.y_100}>100</Text>
                      <Text style={styles.y_50}>50</Text>
                      <Text style={styles.y_0}>0</Text>
                    </View>
                      {this.renderDateView(fatherDateArray, fatherHighP)}
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.fatherLine}>
              </View>
              <View style={styles.fatherFind}>
                <TouchableOpacity onPress={() =>{
                    if (this.state.dateLoaded === true && fatherHighP.length > 0) {
                        ihealth.log("render", "爸爸的发现更多---1");
                        MHPluginSDK.addRecord("“爸爸测”发现更多点击", {"点击“爸爸测”发现更多": 1}, {});
                        this.onOpenSubPage(FindMore, strings.DadsBloodPressure, isFatherData);
                    }else{
                        ihealth.log("render", "爸爸的发现更多---2");
                    }
                }
                } style={styles.fatherFindTouchable}>
                  <View style={styles.rowContainer}>
                    <Text style={styles.fatherFindText}>{strings.Findmore}</Text>
                    <Image
                        source={{isStatic:!this.state.devMode, uri:this.state.basePath + "listreturn.png"}}
                        style={(this.state.screenWidth != 320)?({marginRight: 15,width: 12,height: 18,alignSelf: 'center'}):({marginRight: 15,width: 10,height: 15,alignSelf: 'center'})}/>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.fatherGap}>
              </View>
              <View style={styles.motherTitle}>
                <Text style={styles.motherTitleText}>
                    <Image
                        
                        style={(this.state.screenWidth != 320)?({marginRight: 15,width: 15,height: 15,alignSelf: 'center'}):({marginRight: 15,width: 15,height: 15,alignSelf: 'center'})}
                        source={{isStatic:!this.state.devMode, uri:this.state.basePath + "porper@2x.png"}}/>
                    {strings.UserMBloodPressure}
                    {/* 2 测的血压 */}
                    </Text>
                <Text style={styles.motherUnit}>mmHg</Text>
              </View>
              <View style={styles.motherContainer}>
                <TouchableOpacity onPress={

                    (this.state.dateLoaded === true && motherHighP.length > 0)?this._onOpenSubPage(HistoryListViewM, '2').bind(this):null

                }
                                  style={styles.motherChartTouchable}>
                  <View style={styles.chartContainer}>
                    <Surface
                        width={deviceWidth}
                        height={chartContainerHeight}>
                      <Group>
                        <Shape  d={this.getHorizontalLine200()} stroke="#eeeeee" strokeWidth={1} />
                        <Shape  d={this.getHorizontalLine150()} stroke="#eeeeee" strokeWidth={1} />
                        <Shape  d={this.getHorizontalLine100()} stroke="#eeeeee" strokeWidth={1} />
                        <Shape  d={this.getHorizontalLine50()} stroke="#eeeeee" strokeWidth={1} />
                        <Shape  d={this.getHorizontalLine0()} stroke="#eeeeee" strokeWidth={1} />
                        <Shape  d={this.getVerticalLine0()} stroke="#eeeeee" strokeWidth={1} />
                        <Group x={30} y={8}>
                            {this.drawSysPath(motherHighP)}
                            {this.drawDiaPath(motherLowP)}
                        </Group>
                      </Group>
                    </Surface>
                    <View style={styles.yLabels}>
                      <Text style={styles.y_200}>200</Text>
                      <Text style={styles.y_150}>150</Text>
                      <Text style={styles.y_100}>100</Text>
                      <Text style={styles.y_50}>50</Text>
                      <Text style={styles.y_0}>0</Text>
                    </View>
                      {this.renderDateView(motherDateArray, motherHighP)}
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.motherLine}>
              </View>
              <View style={styles.motherFind}>
                <TouchableOpacity onPress={
                    () =>{
                        if (this.state.dateLoaded === true && motherHighP.length > 0) {
                            ihealth.log("render", "妈妈的发现更多---1");
                            MHPluginSDK.addRecord("“妈妈测”发现更多点击", {"点击“妈妈测”发现更多": 1}, {});
                            this.onOpenSubPage(FindMore, strings.MothersBloodPressure, isMotherData);
                        }else{
                            ihealth.log("render", "妈妈的发现更多---2");
                        }
                    }
                } style={styles.motherFindTouchable}>
                  <View style={styles.rowContainer}>
                    <Text style={styles.motherFindText}>{strings.Findmore}</Text>
                    <Image
                        source={{isStatic:!this.state.devMode, uri:this.state.basePath + "listreturn.png"}}
                        style={(this.state.screenWidth != 320)?({marginRight: 15,width: 12,height: 18,alignSelf: 'center'}):({marginRight: 15,width: 10,height: 15,alignSelf: 'center'})}/>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.motherGap}>
              </View>
                {this.getActivityButtonState()}
            </View>
        );
    }
    //获取当前活动状态，是否显示进入活动页按钮
    getActivityButtonState(){
        if(this.state.activityShow){
            return(
                <View style={{position:'absolute', left:Dimensions.get('window').width-45, top:Dimensions.get('window').height*21/40}}>
                  <View style={[{width: 45, height: 62}, this.state.buttonStyle]} {...this._panResponder.panHandlers}>
                    <Image style={{width: 45, height: 62}} source={{isStatic:!this.state.devMode, uri:this.state.basePath+'blood_pressure_story.png'}}/>
                  </View>
                </View>
            )
        }
    }

    onOpenSubPage(subPageComponent,subPageTitle, type) {
        var highPs = [],
            lowPs = [],
            dateArray = [],
            position = "0";
        switch(type) {
            case 1:{
                highPs = fatherHighP;
                lowPs = fatherLowP;
                dateArray = fatherDateArray;
                break;
            }
            case 2: {
                highPs = motherHighP;
                lowPs = motherLowP;
                dateArray = motherDateArray;
                break;
            }
            case 3: {
                position = "1";
                break;
            }
            case 4: {
                position = "2";
                break;
            }
            default: {
                ihealth.log("onOpenSubPage", "绘图界面打开其他界面类型错误");
                break;
            }
        }

        this.props.navigator.push({
            title: subPageTitle,
            component: subPageComponent,
            leftButtonIcon: {isStatic:true, uri:MHPluginSDK.uriNaviBackButtonImage, scale:(PixelRatio.get() == 3)?3:2},
            onLeftButtonPress: () => {
                if (type === isFatherDataList || type === isMotherDataList) {
                    alert('1234');
                    this.callbackFunction();
                }
                this.props.navigator.pop();
            },

            passProps: {highPs: highPs,
                lowPs: lowPs,
                dateArray: dateArray,
                position : position,
                AccessToken : Aes.Ctr.decrypt(deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128),
                AppGuid : deviceInfo.AppGuid,
                PhoneID : deviceInfo.PhoneID,
                did : this.state.did}
        });
    }

    onClosePage() {
        MHPluginSDK.closeCurrentPage();
    }

    _onOpenSubPage(subPageComponent, type) {

        var highPs = [],
            lowPs = [],
            dateArray = [],
            position = type;

        function subPage() {
            this.props.navigator.push({
                ...subPageComponent.route,
                passProps: {
                    highPs: highPs,
                    lowPs: lowPs,
                    dateArray: dateArray,
                    position : position,
                    AccessToken : Aes.Ctr.decrypt(deviceInfo.AccessToken, 'iHealthlabs.AijiaKang', 128),
                    AppGuid : deviceInfo.AppGuid,
                    PhoneID : deviceInfo.PhoneID,
                    did : this.state.did
                },
            });
        }
        return subPage;
    }

    componentWillMount() {
        this._deviceNameChangedListener = DeviceEventEmitter.addListener(MHPluginSDK.deviceNameChangedEvent, (event) => {
            route.title = interceptionStringsWithCount(event.newName,20);
            this.forceUpdate();
        });

        this._listViewCallBack = DeviceEventEmitter.addListener('ListViewCallBack', (event) => {
            this.callbackFunction();
        });

        this.initActivity();
    }

    initActivity(){
        this._animatedValue = new Animated.ValueXY();
        this._value = {x: 0, y: 0};
        this._animatedValue.addListener((value) => this._value = value);

        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: (e, gestureState) => {
                if (gestureState._accountsForMovesUpTo != 0){
                    this.setState({
                        buttonStyle:{
                            left:_previousLeft,
                            top:_previousTop,
                        }
                    });
                }
            },

            onPanResponderMove : (evt, gestureState)=> {
                if (gestureState._accountsForMovesUpTo != 0){
                    _previousLeft = lastLeft + gestureState.dx;
                    _previousTop = lastTop + gestureState.dy;
                    //限制边界

                    _previousLeft = (_previousLeft>=0)?0:_previousLeft;
                    _previousLeft = (_previousLeft<=-(Dimensions.get('window').width-45))?-(Dimensions.get('window').width-45):_previousLeft;

                    _previousTop = (_previousTop>=(Dimensions.get('window').height*19/40-126))?(Dimensions.get('window').height*19/40-126):_previousTop;
                    _previousTop = (_previousTop<=-Dimensions.get('window').height*21/40)?-Dimensions.get('window').height*21/40:_previousTop;

                    //实时更新
                    this.setState({
                        buttonStyle:{
                            left:_previousLeft,
                            top:_previousTop,
                        }
                    });
                }
            },

            onPanResponderRelease: (e, gestureState) => {
                if (gestureState.dx >=-2 && gestureState.dx <=2 && gestureState.dy >=-2 && gestureState.dy <=2){
                    //this.initActivity();
                    this.props.navigator.push({
                        title: this.state.activityTitle,
                        component: BPStory,
                        renderNavLeftComponent:function(route, navigator, index, navState){
                            return (
                                <View style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, justifyContent:'center', alignItems:'center'}}>
                                  <ImageButton
                                      source={{uri:MHPluginSDK.uriNaviBackButtonImage, scale:PixelRatio.get()}}
                                      onPress={() => {
                                          if (index === 0) {
                                              MHPluginSDK.closeCurrentPage();
                                          } else {
                                              navigator.pop();
                                          }
                                      }}
                                      style={[{width:29, height:29, tintColor: '#000000'}, route.navLeftButtonStyle]}
                                  />
                                </View>
                            );
                        },
                        passProps: {
                            activityUrl: this.state.activityUrl+'&id='+deviceInfo.iHealthUserId,
                            activityTitle: this.state.activityTitle
                        }
                    });
                }else{
					_previousLeft=(_previousLeft <= -((Dimensions.get('window').width-45)/2))?(-(Dimensions.get('window').width-45)):0;
					lastLeft=_previousLeft;
                    lastTop=_previousTop;

                    this.setState({
                        buttonStyle:{
                            left:_previousLeft,
                            top:_previousTop,
                        }
                    });
                }

            }
        });
    }

    componentWillUnmount() {
        this._deviceNameChangedListener.remove();
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
        marginTop: 64,
        backgroundColor: '#EFEFF0',
    },
    title: {
        height: 64,
        alignItems: 'center',
    },
    titleText: {
        // position: 'absolute',
        top: 33,
        fontSize: 18,
    },
    fatherTitle: {
        flex: 3,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
        // flexDirection: 'column',
    },
    fatherTitleText: {
        // flex: 1,
        fontSize: 15,
        color: '#666666',
        // alignSelf: 'center',
    },
    fatherUnit: {
        position: 'absolute',
        left: 3,
        bottom: 5,
        color: 'grey',
        fontSize: 8,
    },
    fatherContainer: {
        flex: 19,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
    },
    fatherChartTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    chartContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },

    fatherLine: {
        height: 1.0,
        backgroundColor: "#EFEFF0",
    },
    fatherFind: {
        flex: 4,
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
    },
    fatherFindTouchable: {
        flex: 1,

    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    fatherFindText: {
        fontSize: 17,
        color: '#FF6633',
        alignSelf: 'center',
        marginLeft: 16,
        flex: 1,
    },
    fatherFindArrow: {
        marginRight: 15,
        width: 12,
        height: 18,
        alignSelf: 'center',
    },
    fatherGap: {
        flex: 1,
    },
    motherTitle: {
        flex: 3,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    motherTitleText: {
        fontSize: 15,
        color: '#666666',
    },
    motherUnit: {
        position: 'absolute',
        left: 3,
        bottom: 5,
        color: 'grey',
        fontSize: 8,
    },
    motherContainer: {
        flex: 19,
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
    },
    motherChartTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        flex: 1,
    },
    motherChart: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        flex: 1,
        alignSelf: 'center',
    },
    motherLine: {
        height: 1.0,
        backgroundColor: "#EFEFF0",
    },
    motherFind: {
        flex: 4,
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
    },
    motherFindTouchable: {
        flex: 1,
    },
    motherFindText: {
        marginLeft: 16,
        fontSize: 17,
        color: '#FF6633',
        flex: 1,
        alignSelf: 'center',
    },
    motherFindArrow: {
        marginRight: 15,
        width: 12,
        height: 18,
        alignSelf: 'center',
    },
    motherGap: {
        flex: 1,
    },
    y_200: {
        flex: 1,
        left: 7,
        color: '#999999',
        fontSize: 10,
    },
    y_150: {
        flex: 1,
        left: 7,
        color: '#999999',
        fontSize: 10,
    },
    y_100: {
        flex: 1,
        left: 7,
        color: '#999999',
        fontSize: 10,
    },
    y_50: {
        flex: 1,
        left: 7,
        color: '#999999',
        fontSize: 10,
    },
    y_0: {
        left: 7,
        color: '#999999',
        fontSize: 10,
    },
    yLabels: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 30,
        bottom: 32,
        backgroundColor: 'transparent',
        flexDirection: 'column',
    },
    xLabels: {
        position: 'absolute',
        paddingTop: 10,
        left: 30,
        height: 32,
        bottom: 0,
        flex: 1,
    },
    timeStart: {
        position: 'absolute',
        left: 0,
        fontSize: 11,
        color: '#999999',
    },
    timeEnd: {
        position: 'absolute',
        left: 50,
        fontSize: 11,
        color: '#999999',
    },
});

const KEY_OF_MAINPAGE = 'MainPage';

// 打开更多菜单
var openMorePage = function (navigator) {
    navigator.push(MoreMenu.route);
};

// 打开宝贝提醒
var openDearRemind = function (navigator) {
    navigator.push(DearRemind.route);
};

// 打开帮助与反馈
var openFeedback = function (navigator) {
    navigator.push(BPM1MoreHelp.route);
};

var showActionSheet = function(navigator) {
    ActionSheetIOS.showActionSheetWithOptions({
            options: BUTTONS,
            cancelButtonIndex: 3,
            //destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
            switch(buttonIndex){
                case 0:
                    openDearRemind(navigator);
                    break;

                case 1:
                    openMorePage(navigator);
                    break;

                case 2:
                    openFeedback(navigator);
                    break;

                default:
                    break;

            }
        });
}

var test = function(route, navigator, index, navState){
    return (
        <View style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, justifyContent:'center', alignItems:'center'}}>

        </View>
    )
}

var interceptionStringsWithCount = function(string, count){
    var str=string;
    var charCount=0;
    var bytesCount=0;
    for (var i = 0; i < str.length; i++)
    {
        var c = str.charAt(i);
        var char2=false;

        charCount++;
        if (/^[\u0000-\u00ff]$/.test(c)) //匹配双字节
        {
            bytesCount += 1;
        }
        else
        {
            char2=true;
            bytesCount += 2;
        }

        if(bytesCount>count ){
            if(char2){
                str=str.substring(0,charCount-2);
            }else{
                str=str.substring(0,charCount-1);
            }
            str = str+'...'
            break;
        }
    }
    return str;
}

// 每个页面export自己的route
var route = {
    key: KEY_OF_MAINPAGE,
    title: interceptionStringsWithCount(MHPluginSDK.deviceName,20),
    component: MainPage,
    navLeftButtonStyle: {
        tintColor:'#888888',
    },
    navBarStyle: {
        backgroundColor:'#efeff0',
    },
    isNavigationBarHidden: false,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (
            <View style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, justifyContent:'center', alignItems:'center'}}>
              <ImageButton
                  source={{uri:MHPluginSDK.uriNaviMoreButtonImage, scale:PixelRatio.get()}}
                  onPress={() => {
                      //切换到设置页
                      navigator.push(SettingPage.route);
                  }}
                  style={[{width:29, height:29, tintColor: '#888888'}]}
              />
            </View>
        );
    },
}

module.exports = {
    component: MainPage,
    route: route,
}
