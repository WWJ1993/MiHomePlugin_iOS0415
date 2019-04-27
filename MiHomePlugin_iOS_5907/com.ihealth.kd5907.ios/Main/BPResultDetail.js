/**
 * Created by zhangmingli on 2016/11/8.
 */
'use strict';

var React = require('react-native');
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var interprebpDownload = require('../CommonModules/interprebpDownload');
var hex_md5 = require('../CommonModules/hex_md5');
var bpDataLevel = require('../CommonModules/bpDataLevel');
var bpm1DataUpdate = require('../CommonModules/bpm1DataUpdate');
var getLunarSpecialDate = require('../CommonModules/getLunarSpecialDate');
var Dimensions = require('Dimensions');
var ihealth = require('../CommonModules/ihealth');
var Aes = require('../CommonModules/Aes');
var strings = require('../CommonModules/ihealthLocalizedString');
var LocalizedStrings = require('../CommonModules/LocalizedStrings');
const { height,width } = Dimensions.get('window');

let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}

var {
    ScrollView,
    StyleSheet,
    View,
    Image,
    Text,
    TouchableWithoutFeedback,
    } = React;

var deviceWidth = Dimensions.get('window').width;
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var viewUnmount;
var BPResultDetail = React.createClass({

    getInitialState: function() {
        return {
            did: MHPluginSDK.deviceId,
            model: MHPluginSDK.deviceModel,
            apiLevel: MHPluginSDK.apiLevel,
            basePath: MHPluginSDK.basePath,
            devMode: MHPluginSDK.devMode,
            requestStatus: false,
            //好
            goodImageOff: MHPluginSDK.basePath + 'ihealthgoodMood.png',
            goodImageOn: MHPluginSDK.basePath + 'ihealthgoodMoodSelected.png',
            goodState: false,
            goodimagePath: MHPluginSDK.basePath + 'ihealthgoodMood.png',
            //一般
            normalImageOff: MHPluginSDK.basePath + 'ihealthnormalMoodm.png',
            normalImageOn: MHPluginSDK.basePath + 'ihealthnormalMoodSelected.png',
            normalState: false,
            normalimagePath: MHPluginSDK.basePath + 'ihealthnormalMoodm.png',
            //不好
            badImageOff: MHPluginSDK.basePath + 'ihealthbadMoodm.png',
            badImageOn: MHPluginSDK.basePath + 'ihealthbadMoodSelected.png',
            badState: false,
            badimagePath: MHPluginSDK.basePath + 'ihealthbadMoodm.png',
            //有
            haveImageOff: MHPluginSDK.basePath + 'ihealthhave.png',
            haveImageOn: MHPluginSDK.basePath + 'ihealthhaveSelected.png',
            haveState: false,
            haveimagePath: MHPluginSDK.basePath + 'ihealthhave.png',
            //没有
            nothingImageOff: MHPluginSDK.basePath + 'Ihealthnothing.png',
            nothingImageOn: MHPluginSDK.basePath + 'ihealthnothingSelected.png',
            nothingState: false,
            nothingimagePath: MHPluginSDK.basePath + 'Ihealthnothing.png',

            bpLevelimagePath: MHPluginSDK.basePath + 'ihealthlxxym.png',
            //理想血压
            lxxyImage: MHPluginSDK.basePath + 'ihealthlxxym.png',
            //正常血压
            zcxyImage: MHPluginSDK.basePath + 'ihealthzcxy.png',
            //正常偏高血压
            zcpgxyImage: MHPluginSDK.basePath + 'ihealthzcpgxy.png',
            //轻度血压
            qdgxyImage: MHPluginSDK.basePath + 'ihealthqdgxy.png',
            //中度血压
            zdgxyImage: MHPluginSDK.basePath + 'ihealthzdgxy.png',
            //重度血压
            yzgxyImage: MHPluginSDK.basePath + 'ihealthyzgxy.png',

            screenWidth: Dimensions.get('window').width,

            //血压数据相关
            PhoneDataId:'1234567',
            TargetUserId:'123',
            HighP:'0',
            LowP:'0',
            Mood:'0',
            TakePill:'-1',
            Hr:'12',
            Who:'理想',
            BPResultLevelNote:'理想血压',
            ResultNote:'血压测量应该持之以恒，并且血压最佳测量时间是清晨起床后，因为此时最为平静。',

            isActiveGreen: true,
            isActiveLightGreen: false,
            isActiveYellowGreen: false,
            isActiveYellow: false,
            isActiveOrangeRed:false,
            isActiveRed: false,
        };
    },

    componentWillUnmount(){
        viewUnmount = true;
    },

    getInterprebpDownload(bpLevelNum) {
        var bpLevel = '理想';
        ihealth.log("getInterprebpDownload", '---高压：'+this.props.bpResultData.HighP+'    '+'---低压：'+this.props.bpResultData.LowP);

        switch (bpLevelNum) {
            case '1':
                bpLevel = '重度';
                break;
            case '2':
                bpLevel = '中度';
                break;
            case '3':
                bpLevel = '轻度';
                break;
            case '4':
                bpLevel = '正常偏高';
                break;
            case '5':
                bpLevel = '正常';
                break;
            case '6':
                bpLevel = '理想';
                break;
            default:
                ihealth.log('根据血压值获取WHO失败！');
                bpLevel = '';
                break;
        }

        var myDate = new Date();
        var nDate = myDate.getFullYear();
        var yDate = myDate.getMonth();
        var rDate = myDate.getDate();
        var jieqi = getLunarSpecialDate(nDate, (yDate+1), rDate);

        var bodyDic={};
        bodyDic.verifyToken = this.props.AccessToken;
        bodyDic.queueNum = '103';
        bodyDic.interpretationkeys = '{"MeasureFrequency":"","Solarterms":"'+ jieqi +'","Hr":"' +this.props.bpResultData.HeartRate+ '", "PhoneDataId":"' +this.props.bpResultData.DataID+ '", "TargetUserId":"' +this.props.bpResultData.UserID+ '", "Who":"' + bpLevel + '"}';
        ihealth.log("getInterprebpDownload", bodyDic.interpretationkeys);
        ihealth.log("getInterprebpDownload", '年：'+nDate+'月：'+yDate+'日：'+rDate);
        bodyDic.AppGuid = this.props.AppGuid;
        bodyDic.PhoneID = this.props.PhoneID;

        //开始网络请求指示
        MHPluginSDK.showLoadingTips('');
        interprebpDownload(bodyDic, (isSuccess, responseData, errorStatus)=>{

                ihealth.log('MainPage--getInterprebpDownload', 'isSuccess:'+isSuccess+'  responseData:'+JSON.stringify(responseData)+'  errorStatus:'+errorStatus);
                //取消等待指示
                MHPluginSDK.dismissTips();

                if (viewUnmount === true) {
                    return;
                }

                if (isSuccess) {
                    var str = responseData.ReturnValue.data;
                    this.setState({'ResultNote': str.replace('undefined', '')});
                } else {
                    if (errorStatus == '102') {
                        //网络超时
                        MHPluginSDK.showFailTips("网络超时！");
                    } else {
                        //其他错误
                        MHPluginSDK.showFailTips("解读下载失败！");
                    }
                }
            }
        );
    },
    setLabelColor(bpLevelNum) {
        switch (bpLevelNum) {
            case '1':
                this.setState({
                    'isActiveGreen': false,
                    'isActiveLightGreen': false,
                    'isActiveYellowGreen': false,
                    'isActiveYellow': false,
                    'isActiveOrangeRed': false,
                    'isActiveRed': true,
                    'bpLevelimagePath': this.state.yzgxyImage,
                });
                break;
            case '2':
                this.setState({
                    'isActiveGreen': false,
                    'isActiveLightGreen': false,
                    'isActiveYellowGreen': false,
                    'isActiveYellow': false,
                    'isActiveOrangeRed': true,
                    'isActiveRed': false,
                    'bpLevelimagePath': this.state.zdgxyImage,
                });
                break;
            case '3':
                this.setState({
                    'isActiveGreen': false,
                    'isActiveLightGreen': false,
                    'isActiveYellowGreen': false,
                    'isActiveYellow': true,
                    'isActiveOrangeRed': false,
                    'isActiveRed': false,
                    'bpLevelimagePath': this.state.qdgxyImage,
                });
                break;
            case '4':
                this.setState({
                    'isActiveGreen': false,
                    'isActiveLightGreen': false,
                    'isActiveYellowGreen': true,
                    'isActiveYellow': false,
                    'isActiveOrangeRed': false,
                    'isActiveRed': false,
                    'bpLevelimagePath': this.state.zcpgxyImage,
                });
                break;
            case '5':
                this.setState({
                    'isActiveGreen': false,
                    'isActiveLightGreen': true,
                    'isActiveYellowGreen': false,
                    'isActiveYellow': false,
                    'isActiveOrangeRed': false,
                    'isActiveRed': false,
                    'bpLevelimagePath': this.state.zcxyImage,
                });
                break;
            case '6':
                this.setState({
                    'isActiveGreen': true,
                    'isActiveLightGreen': false,
                    'isActiveYellowGreen': false,
                    'isActiveYellow': false,
                    'isActiveOrangeRed': false,
                    'isActiveRed': false,
                    'bpLevelimagePath': this.state.lxxyImage,
                });
                break;
            default:
                this.setState({
                    'isActiveGreen': true,
                    'isActiveLightGreen': false,
                    'isActiveYellowGreen': false,
                    'isActiveYellow': false,
                    'isActiveOrangeRed': false,
                    'isActiveRed': false,
                    'bpLevelimagePath': this.state.lxxyImage,
                });
                break;
        }
    },
    setMoodAndMedicinePicture(mood, medicine) {
        ihealth.log("setMoodAndMedicinePicture", '心情和服药设置后：'+mood+'服药：'+ medicine);

        switch (mood) {
            case 0:
            {
                this.setState({
                    'goodimagePath': this.state.goodImageOff, 'goodState': false,
                    'normalimagePath': this.state.normalImageOff, 'normalState': false,
                    'badimagePath': this.state.badImageOff, 'badState': false,
                });
                ihealth.log("setMoodAndMedicinePicture", '心情设置为----无');
                break;
            }
            case 1:
            {
                this.setState({
                    'goodimagePath': this.state.goodImageOn, 'goodState': true,
                    'normalimagePath': this.state.normalImageOff, 'normalState': false,
                    'badimagePath': this.state.badImageOff, 'badState': false,
                });
                ihealth.log("setMoodAndMedicinePicture", '心情设置为----好');
                break;
            }
            case 3:
            {
                this.setState({
                    'goodimagePath': this.state.goodImageOff, 'goodState': false,
                    'normalimagePath': this.state.normalImageOn, 'normalState': true,
                    'badimagePath': this.state.badImageOff, 'badState': false,
                });
                ihealth.log("setMoodAndMedicinePicture", '心情设置为----一般');
                break;
            }
            case 5:
            {
                this.setState({
                    'goodimagePath': this.state.goodImageOff, 'goodState': false,
                    'normalimagePath': this.state.normalImageOff, 'normalState': false,
                    'badimagePath': this.state.badImageOn, 'badState': true,
                });
                ihealth.log("setMoodAndMedicinePicture", '心情设置为----坏');
                break;
            }
            default:
            {
                ihealth.log("setMoodAndMedicinePicture", '心情设置为----失败');
                break;
            }
        }

        switch (medicine) {
            case -1:
                this.setState({
                    'haveimagePath': this.state.haveImageOff, 'haveState': false,
                    'nothingimagePath': this.state.nothingImageOff, 'nothingState': false,
                });
                break;
            case 0:
                this.setState({
                    'haveimagePath': this.state.haveImageOff, 'haveState': false,
                    'nothingimagePath': this.state.nothingImageOn, 'nothingState': true,
                });
                break;
            case 1:
                this.setState({
                    'haveimagePath': this.state.haveImageOn, 'haveState': true,
                    'nothingimagePath': this.state.nothingImageOff, 'nothingState': false,
                });
                break;
            default:
                break;
        }
    },
    componentDidMount() {
        viewUnmount = false;
        ihealth.log("componentDidMount", 'xxx' + this.props.bpResultData.DataID);
        ihealth.log("componentDidMount", 'xxx' + this.props.bpResultData.UserID);
        ihealth.log("componentDidMount", 'xxx' + this.props.bpResultData.HighP);
        ihealth.log("componentDidMount", 'xxx' + this.props.bpResultData.LowP);
        ihealth.log("componentDidMount", 'xxx' + this.props.bpResultData.Mood);
        ihealth.log("componentDidMount", 'xxx' + this.props.bpResultData.TakePill);
        ihealth.log("componentDidMount", 'xxx' + this.props.bpResultData.HeartRate);

        this.setState({'PhoneDataId':this.props.bpResultData.DataID,
            'TargetUserId':this.props.bpResultData.UserID,
            'HighP': this.props.bpResultData.HighP,
            'LowP':this.props.bpResultData.LowP,
            'Mood':this.props.bpResultData.Mood,
            'TakePill':this.props.bpResultData.TakePill,
            'Hr':this.props.bpResultData.HeartRate
        });


        //根据血压计算血压等级
        var bpLevelNum = bpDataLevel(this.props.bpResultData.HighP, this.props.bpResultData.LowP);
        //根据血压等级设置血压和等级标签字体颜色
        this.setLabelColor(bpLevelNum);
        //设置血压等级
        this.setBPResultLevel(bpLevelNum);
        //根据服药和心情设置图片显示
        this.setMoodAndMedicinePicture(this.props.bpResultData.Mood, this.props.bpResultData.TakePill);
        //下载血压个性解读信息
        this.getInterprebpDownload(bpLevelNum);
    },

    setBPResultLevel(bpLevelNum) {
        ihealth.log("setBPResultLevel", '血压等级是： '+bpLevelNum);
        switch (bpLevelNum) {
            case '1':
                this.setState({'BPResultLevelNote': strings.SevereHypertension});
                break;
            case '2':
                this.setState({'BPResultLevelNote': strings.ModerateHypertension});
                break;
            case '3':
                this.setState({'BPResultLevelNote': strings.MildHypertension});
                break;
            case '4':
                this.setState({'BPResultLevelNote': strings.NormalPartialHypertension});
                break;
            case '5':
                this.setState({'BPResultLevelNote': strings.NormalBloodPressure});
                break;
            case '6':
                this.setState({'BPResultLevelNote': strings.IdealBloodPressure});
                break;
            default:
                this.setState({'BPResultLevelNote': strings.IdealBloodPressure});
                break;
        }
        ihealth.log("setBPResultLevel", '血压等级是： '+this.state.BPResultLevelNote);
    },
    showView() {
        var deviceWidth = Dimensions.get('window').width;

        //判断是否为3.5寸屏幕
        if (deviceWidth == 320) {
            return (
                <View style={styles.bpDataView}>
                    <View style={styles.bpDataUnit}>
                        <View style={styles.heightBPUnit}>
                            <Text style={styles.heightBPtitle_35}>{strings.HighPressure}</Text>
                            <Text style={styles.title2}>mmHg</Text>
                        </View>
                        <View style={styles.lowBPUnit}>
                            <Text style={styles.lowBPtitle_35}>{strings.LowPressure}</Text>
                            <Text style={styles.title2}>mmHg</Text>
                        </View>
                        <View style={styles.heartBPUnit}>
                            <Text style={styles.heartBPtitle_35}>{strings.HeartRate}</Text>
                            <Text style={styles.title2}>{strings.TimesPerMinute}</Text>
                        </View>
                    </View>
                    <View style={styles.columnSeparator}/>

                    <View style={styles.bpDataLabel}>
                        <View style={styles.bpDataLabelBlock1}>
                            <View style={styles.heightBPTextView}>
                                <Text style={[
                                                  this.state.isActiveGreen&&styles.heightBPTextGreen_35,
                                                  this.state.isActiveLightGreen&&styles.heightBPTextLightGreen_35,
                                                  this.state.isActiveYellowGreen&&styles.heightBPTextYellowGreen_35,
                                                  this.state.isActiveYellow&&styles.heightBPTextYellow_35,
                                                  this.state.isActiveOrangeRed&&styles.heightBPTextOrangeRed_35,
                                                  this.state.isActiveRed&&styles.heightBPTextRed_35,
                                              ]}>
                                    {this.state.HighP}
                                </Text>
                            </View>
                            <View style={styles.lowBPTextView}>
                                <Text style={[
                                                this.state.isActiveGreen&&styles.lowBPTextGreen_35,
                                                this.state.isActiveLightGreen&&styles.lowBPTextLightGreen_35,
                                                this.state.isActiveYellowGreen&&styles.lowBPTextYellowGreen_35,
                                                this.state.isActiveYellow&&styles.lowBPTextYellow_35,
                                                this.state.isActiveOrangeRed&&styles.lowBPTextOrangeRed_35,
                                                this.state.isActiveRed&&styles.lowBPTextRed_35,
                                              ]}>
                                    {this.state.LowP}
                                </Text>
                            </View>
                            <View style={styles.heartBPTextView_35}>
                                <Image style={styles.heartImage} source={{isStatic:!this.state.devMode, uri:MHPluginSDK.basePath + 'ihealthxin.png'}}/>
                                <Text style={styles.heartBPText}>{this.state.Hr}</Text>
                            </View>
                        </View>

                        <View style={styles.bpDataLabelBlock2}>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.bpDataView}>
                    <View style={styles.bpDataUnit}>

                        <View style={styles.heightBPUnit}>
                            <Text style={styles.heightBPtitle}>{strings.HighPressure}</Text>
                            <Text style={styles.title2}>mmHg</Text>
                        </View>

                        <View style={styles.lowBPUnit}>
                            <Text style={styles.lowBPtitle}>{strings.LowPressure}</Text>
                            <Text style={styles.title2}>mmHg</Text>
                        </View>

                        <View style={styles.heartBPUnit}>
                            <Text style={styles.heartBPtitle}>{strings.HeartRate}</Text>
                            <Text style={styles.title2}>{strings.TimesPerMinute}</Text>
                        </View>
                    </View>
                    <View style={styles.columnSeparator}/>

                    <View style={styles.bpDataLabel}>
                        <View style={styles.bpDataLabelBlock1}>

                            <View style={styles.heightBPTextView}>
                                <Text style={[
                                          this.state.isActiveGreen&&styles.heightBPTextGreen,
                                          this.state.isActiveLightGreen&&styles.heightBPTextLightGreen,
                                          this.state.isActiveYellowGreen&&styles.heightBPTextYellowGreen,
                                          this.state.isActiveYellow&&styles.heightBPTextYellow,
                                          this.state.isActiveOrangeRed&&styles.heightBPTextOrangeRed,
                                          this.state.isActiveRed&&styles.heightBPTextRed,
                                      ]}>
                                    {this.state.HighP}
                                </Text>
                            </View>

                            <View style={styles.lowBPTextView}>
                                <Text style={[
                                        this.state.isActiveGreen&&styles.lowBPTextGreen,
                                        this.state.isActiveLightGreen&&styles.lowBPTextLightGreen,
                                        this.state.isActiveYellowGreen&&styles.lowBPTextYellowGreen,
                                        this.state.isActiveYellow&&styles.lowBPTextYellow,
                                        this.state.isActiveOrangeRed&&styles.lowBPTextOrangeRed,
                                        this.state.isActiveRed&&styles.lowBPTextRed,
                                      ]}>
                                    {this.state.LowP}
                                </Text>
                            </View>

                            <View style={styles.heartBPTextView}>
                                <Image style={styles.heartImage} source={{isStatic:!this.state.devMode, uri:MHPluginSDK.basePath + 'ihealthxin.png'}}/>
                                <Text style={styles.heartBPText}>{this.state.Hr}</Text>
                            </View>
                        </View>
                        <View style={styles.bpDataLabelBlock2}>
                        </View>
                    </View>
                </View>
            );
        }
    },
    bpLevelViewItch() {
        var deviceWidth = Dimensions.get('window').width;

        //判断是否为3.5寸屏幕
        if (deviceWidth == 320) {
            return(
                <View style={{backgroundColor: '#ffffff', flexDirection: 'column',marginTop:5}}>
                    <Text style={styles.bpLevelText_35}>{strings.AccordingToWHO}</Text>
                    <Text style={[
                                this.state.isActiveGreen&&styles.BPLevelGreen_35,
                                this.state.isActiveLightGreen&&styles.BPLevelLightGreen_35,
                                this.state.isActiveYellowGreen&&styles.BPLevelYellowGreen_35,
                                this.state.isActiveYellow&&styles.BPLevelYellow_35,
                                this.state.isActiveOrangeRed&&styles.BPLevelOrangeRed_35,
                                this.state.isActiveRed&&styles.BPLevelRed_35,
                              ]}>
                        {this.state.BPResultLevelNote}
                    </Text>
                </View>
            );
        } else {
            return(
                <View style={{ backgroundColor: '#ffffff', flexDirection: 'column',marginTop:5}}>
                    <Text style={styles.bpLevelText}>{strings.AccordingToWHO}</Text>
                    <Text style={[
                              this.state.isActiveGreen&&styles.BPLevelGreen,
                              this.state.isActiveLightGreen&&styles.BPLevelLightGreen,
                              this.state.isActiveYellowGreen&&styles.BPLevelYellowGreen,
                              this.state.isActiveYellow&&styles.BPLevelYellow,
                              this.state.isActiveOrangeRed&&styles.BPLevelOrangeRed,
                              this.state.isActiveRed&&styles.BPLevelRed,
                            ]}>
                        {this.state.BPResultLevelNote}
                    </Text>
                </View>
            );
        }

    },
    render: function() {

        if (strings.BloodPressureOutcomeDetails == '血压结果详情') {
            return (
            
                //ScrollView布局
                <View style={{flex:1}}>
                    <View style={{marginTop:64 + APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                    </View>
                    <ScrollView automaticallyAdjustContentInsets={false} contentContainerStyle={(this.state.screenWidth != 320)?({backgroundColor: '#f8f8f8',flexDirection: 'column',height: 1200,marginLeft: 0,marginRight: 0, marginTop: 0}):({backgroundColor: '#f8f8f8',flexDirection: 'column',height: 1000,marginLeft: 0,marginRight: 0, marginTop: 0})}>
                        {this.bpLevelViewItch()}
                        <View style={styles.imageView}>
                            <Image style={styles.image} source={{isStatic:!this.state.devMode, uri:this.state.bpLevelimagePath}}/>
                        </View>
                        
                       
                            <View style={{flex: (deviceWidth > 414)?35:40, backgroundColor: '#ffffff', flexDirection: 'column'}}>
                            <View style={styles.bpDataViewStyle}>
                                {this.showView()}
                                <View style={styles.separator}/>
                                <View style={{flex: (deviceWidth > 414)?2:3, backgroundColor: '#ffffff', flexDirection: 'row'}}>
                                    <View style={styles.containerText}>
                                        <Text style={(this.state.screenWidth != 320)?({lineHeight: 30,fontSize: 20,color: '#555555'}):({lineHeight: 22,fontSize: 17,color: '#555555'})}>
                                            {'【解读】:' + this.state.ResultNote}
                                        </Text>
                                    </View>
                                </View>
    
                            </View>
                        </View>
                            
                        
                        
                        
                        <View style={styles.separator}/>
    
                        <View style={styles.darkView}>
                        </View>
                        <View style={styles.separator}/>
    
                        <View style={styles.userMoodView}>
                            <View style={styles.containerText}>
                                <Text style={(this.state.screenWidth != 320)?({lineHeight: 30,fontSize: 20,color: '#555555'}):({lineHeight: 25,fontSize: 17,color: '#555555'})}>
                                    {strings.HowDoYouFeelBeforeYouMeasure}
                                </Text>
                            </View>
    
                            <View style={styles.selectMoodContainer}>
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.switchMood('HelloDeveloper', "好心情").bind(this)}>
                                    <View style={styles.selectMoodGood}>
                                        <Image style={styles.selectMoodGoodImage} source={{isStatic:!this.state.devMode, uri:this.state.goodimagePath}}/>
                                        <Text style={[styles.selectMoodGoodText, {color:(this.state.goodState==true)?'#FF6633':'#555555'}]}>{strings.Good}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
    
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.switchMood('HelloDeveloper', "一般心情").bind(this)}>
                                    <View style={styles.selectMoodNormal}>
                                        <Image style={styles.selectMoodNormalImage} source={{isStatic:!this.state.devMode, uri:this.state.normalimagePath}}/>
                                        <Text style={[styles.selectMoodNormalText, {color:(this.state.normalState==true)?'#FF6633':'#555555'}]}>{strings.Commonly}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
    
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.switchMood('HelloDeveloper', "坏心情").bind(this)}>
                                    <View style={styles.selectMoodBad}>
                                        <Image style={styles.selectMoodBadImage} source={{isStatic:!this.state.devMode, uri:this.state.badimagePath}}/>
                                        <Text style={[styles.selectMooBadText, {color:(this.state.badState==true)?'#FF6633':'#555555'}]}>{strings.Bad}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                        <View style={styles.separator}/>
    
                        <View style={styles.darkView}>
                        </View>
    
                        <View style={styles.separator}/>
    
                        <View style={styles.takeMedicineView}>
                            <View style={styles.containerText}>
                                <Text style={(this.state.screenWidth != 320)?({lineHeight: 30,fontSize: 20,color: '#555555'}):({lineHeight: 25,fontSize: 17,color: '#555555'})}>
                                    {strings.TakingAntihypertensiveDrugsWithin2Hours}
                                </Text>
                            </View>
                            <View style={styles.takeMedicineContainer}>
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.takeMedicineSelect('HelloDeveloper', "已服药").bind(this)}>
                                    <View style={styles.takeMedicineYES}>
                                        <Image style={styles.takeMedicineYESImage} source={{isStatic:!this.state.devMode, uri:this.state.haveimagePath}}/>
                                        <Text style={[styles.takeMedicineYESText, {color: (this.state.haveState==true)?'#FF6633':'#555555'}]}>{strings.Yes}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
    
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.takeMedicineSelect('HelloDeveloper', "未服药").bind(this)}>
                                    <View style={styles.takeMedicineNO}>
                                        <Image style={styles.takeMedicineNOImage} source={{isStatic:!this.state.devMode, uri:this.state.nothingimagePath}}/>
                                        <Text style={[styles.takeMedicineNOText,  {color: (this.state.nothingState==true)?'#FF6633':'#555555'}]}>{strings.No}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
    
                        <View style={styles.separator}/>
                        <View style={styles.darkView}>
                        </View>
                    </ScrollView>
                </View>
            );
                    
        } else if (strings.BloodPressureOutcomeDetails == 'Detail Results') {
            return (
            
                //ScrollView布局
                <View style={{flex:1}}>
                    {/*导航栏 */}
                    <View style={{marginTop:64 + APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}></View>
                    {/*延展的布局*/}
                    <ScrollView automaticallyAdjustContentInsets={false} contentContainerStyle={(this.state.screenWidth != 320)?
                        ({backgroundColor: '#f8f8f8',flexDirection: 'column',height: 1200,marginLeft: 0,marginRight: 0, marginTop: 0})
                        :({backgroundColor: '#f8f8f8',flexDirection: 'column',height: 1000,marginLeft: 0,marginRight: 0, marginTop: 0})}>
                        {/* 结果文字 */}
                        {this.bpLevelViewItch()}
                        <View style={styles.imageView}>
                            <Image style={styles.image} source={{isStatic:!this.state.devMode, uri:this.state.bpLevelimagePath}}/>
                        </View>
                        

                            <View style={{flex: (deviceWidth > 414)?35:40, backgroundColor: '#ffffff', flexDirection: 'column'}}>
                            <View style={styles.bpDataViewStyle}>
                                {this.showView()}
                                <View style={styles.separator}/>
                                {/* <View style={{flex: (deviceWidth > 414)?2:3, backgroundColor: '#ffffff', flexDirection: 'row'}}>
                                    <View style={styles.containerText}>
                                        <Text style={(this.state.screenWidth != 320)?({lineHeight: 30,fontSize: 20,color: '#555555'}):({lineHeight: 22,fontSize: 17,color: '#555555'})}>
                                            {'【解读】:' + this.state.ResultNote}
                                        </Text>
                                    </View>
                                </View> */}
    
                            </View>
                        </View>
                
                        
                        
                        <View style={styles.separator}/>
    
                        <View style={styles.darkView}>
                        </View>
                        <View style={styles.separator}/>
    
                        <View style={styles.userMoodView}>
                            <View style={styles.containerText}>
                                <Text style={(this.state.screenWidth != 320)?({lineHeight: 30,fontSize: 20,color: '#555555'}):({lineHeight: 25,fontSize: 17,color: '#555555'})}>
                                    {strings.HowDoYouFeelBeforeYouMeasure}
                                </Text>
                            </View>
    
                            <View style={styles.selectMoodContainer}>
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.switchMood('HelloDeveloper', "好心情").bind(this)}>
                                    <View style={styles.selectMoodGood}>
                                        <Image style={styles.selectMoodGoodImage} source={{isStatic:!this.state.devMode, uri:this.state.goodimagePath}}/>
                                        <Text style={[styles.selectMoodGoodText, {color:(this.state.goodState==true)?'#FF6633':'#555555'}]}>{strings.Good}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
    
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.switchMood('HelloDeveloper', "一般心情").bind(this)}>
                                    <View style={styles.selectMoodNormal}>
                                        <Image style={styles.selectMoodNormalImage} source={{isStatic:!this.state.devMode, uri:this.state.normalimagePath}}/>
                                        <Text style={[styles.selectMoodNormalText, {color:(this.state.normalState==true)?'#FF6633':'#555555'}]}>{strings.Commonly}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
    
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.switchMood('HelloDeveloper', "坏心情").bind(this)}>
                                    <View style={styles.selectMoodBad}>
                                        <Image style={styles.selectMoodBadImage} source={{isStatic:!this.state.devMode, uri:this.state.badimagePath}}/>
                                        <Text style={[styles.selectMooBadText, {color:(this.state.badState==true)?'#FF6633':'#555555'}]}>{strings.Bad}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                        <View style={styles.separator}/>
    
                        <View style={styles.darkView}>
                        </View>
    
                        <View style={styles.separator}/>
    
                        <View style={styles.takeMedicineView}>
                            <View style={styles.containerText}>
                                <Text style={(this.state.screenWidth != 320)?({lineHeight: 30,fontSize: 20,color: '#555555'}):({lineHeight: 25,fontSize: 17,color: '#555555'})}>
                                    {strings.TakingAntihypertensiveDrugsWithin2Hours}
                                </Text>
                            </View>
                            <View style={styles.takeMedicineContainer}>
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.takeMedicineSelect('HelloDeveloper', "已服药").bind(this)}>
                                    <View style={styles.takeMedicineYES}>
                                        <Image style={styles.takeMedicineYESImage} source={{isStatic:!this.state.devMode, uri:this.state.haveimagePath}}/>
                                        <Text style={[styles.takeMedicineYESText, {color: (this.state.haveState==true)?'#FF6633':'#555555'}]}>{strings.Yes}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
    
                                <TouchableWithoutFeedback style={styles.rowContainer} underlayColor='#838383' onPress={this.takeMedicineSelect('HelloDeveloper', "未服药").bind(this)}>
                                    <View style={styles.takeMedicineNO}>
                                        <Image style={styles.takeMedicineNOImage} source={{isStatic:!this.state.devMode, uri:this.state.nothingimagePath}}/>
                                        <Text style={[styles.takeMedicineNOText,  {color: (this.state.nothingState==true)?'#FF6633':'#555555'}]}>{strings.No}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
    
                        <View style={styles.separator}/>
                        <View style={styles.darkView}>
                        </View>
                    </ScrollView>
                </View>
            );
            
        }


        
    },
    //上传心情和服药修改信息
    uploadMoodAndMedicineInfo(mood, medicine, changeType, subPageTitle) {

        ihealth.log("uploadMoodAndMedicineInfo", '[{"Mood":' + mood + ', "TakePill":' + medicine + ', "DataID":"' + this.state.PhoneDataId +'", "ChanPhoneDataIdgeType":' + changeType + ',"TS":1459151551}]');
        ihealth.log("uploadMoodAndMedicineInfo", Math.round(new Date().getTime()/1000));

        //开始网络请求指示
        MHPluginSDK.showLoadingTips('');

        var bodyDic={};
        bodyDic.verifyToken = this.props.AccessToken;
        bodyDic.queueNum = '106';
        bodyDic.mDeviceId = this.state.did;
        bodyDic.uploadData = '[{"Mood":' + mood + ', "TakePill":' + medicine + ', "DataID":"' + this.state.PhoneDataId + '", "ChangeType":' + changeType + ',"TS":'+ Math.round(new Date().getTime()/1000) +'}]';
        bodyDic.AppGuid = this.props.AppGuid;
        bodyDic.PhoneID = this.props.PhoneID;

        bpm1DataUpdate(bodyDic, (isSuccess, responseData, errorStatus)=>{
            ihealth.log('1212121MainPage--bpm1DataUpdate','');

                //取消等待指示
                MHPluginSDK.dismissTips();

                if (viewUnmount === true) {
                    return;
                }

                ihealth.log('MainPage--bpm1DataUpdate', 'isSuccess:'+isSuccess+'  responseData:'+JSON.stringify(responseData)+'  errorStatus:'+errorStatus);
                if (isSuccess) {
                    //改变服药状态
                    this.switchTakePillState(subPageTitle);
                    this.switchMoodState(subPageTitle);
                }else{
                    if (errorStatus == '102') {
                        //网络超时
                        MHPluginSDK.showFailTips("网络超时！");
                    } else if (errorStatus == '105') {
                        //数据格式错误
                        MHPluginSDK.showFailTips("数据格式错误！");
                    } else {
                        //其他错误
                        MHPluginSDK.showFailTips("上传失败！");
                    }
                }
            }
        )},
    takeMedicineSelect: function(subPageComponent, subPageTitle) {
        function subPage() {

            if (this.state.haveState) {

                if (subPageTitle == '已服药') {
                    //修改服药值
                    this.state.TakePill = '-1';
                    //上传修改信息
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                }
                else {
                    //未服药
                    if (subPageTitle == '未服药') {
                        //修改服药值
                        this.state.TakePill = '0';
                        //上传修改信息
                        this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                    }
                }
            }else if (this.state.nothingState) {

                if (subPageTitle == '未服药') {
                    //修改服药值
                    this.state.TakePill = '-1';
                    //上传修改信息
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                }
                else {
                    //点亮另外两个的一个
                    if (subPageTitle == '已服药') {
                        //修改服药值
                        this.state.TakePill = '1';
                        //上传修改信息
                        this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                    }
                }
            }
            else {
                if (subPageTitle == '已服药') {
                    //修改服药值
                    this.state.TakePill = '1';
                    //上传修改信息
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                }else if (subPageTitle == '未服药') {
                    //修改服药值
                    this.state.TakePill = '0';
                    //上传修改信息
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                }
            }
        }
        return subPage;
    },
    switchTakePillState(subPageTitle) {
        if (this.state.haveState) {

            if (subPageTitle == '已服药') {
                //熄灭已服药
                this.setState({'haveimagePath': this.state.haveImageOff, 'haveState': false});
            }
            else {
                //未服药
                if (subPageTitle == '未服药') {
                    this.setState({'haveimagePath': this.state.haveImageOff, 'haveState': false, 'nothingimagePath': this.state.nothingImageOn, 'nothingState': true});
                }
            }
        }else if (this.state.nothingState) {

            if (subPageTitle == '未服药') {
                //熄灭一未服药
                this.setState({'nothingimagePath': this.state.nothingImageOff, 'nothingState': false});
            }
            else {
                //点亮另外两个的一个
                if (subPageTitle == '已服药') {
                    this.setState({'nothingimagePath': this.state.nothingImageOff, 'nothingState': false, 'haveimagePath': this.state.haveImageOn, 'haveState': true});
                }
            }
        }
        else {
            if (subPageTitle == '已服药') {
                this.setState({'haveimagePath': this.state.haveImageOn, 'haveState': true});
            }else if (subPageTitle == '未服药') {
                this.setState({'nothingimagePath': this.state.nothingImageOn, 'nothingState': true});
            }
        }
    },
    switchMood: function(subPageComponent,subPageTitle) {
        function subPage() {

            if (this.state.goodState) {

                if (subPageTitle == '好心情') {
                    //修改服药值
                    this.state.Mood = '0';
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                } else {
                    //点亮另外两个的一个
                    if (subPageTitle == '一般心情') {
                        //修改服药值
                        this.state.Mood = '3';
                        this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                    }else if (subPageTitle == '坏心情') {
                        //修改服药值
                        this.state.Mood = '5';
                        this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                    }
                }
            } else if (this.state.normalState) {

                if (subPageTitle == '一般心情') {
                    //修改服药值
                    this.state.Mood = '0';
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                } else {
                    //点亮另外两个的一个
                    if (subPageTitle == '好心情') {
                        //修改服药值
                        this.state.Mood = '1';
                        this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                    }else if (subPageTitle == '坏心情') {
                        //修改服药值
                        this.state.Mood = '5';
                        this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                    }
                }
            } else if (this.state.badState) {

                if (subPageTitle == '坏心情') {
                    //修改服药值
                    this.state.Mood = '0';
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                } else {
                    //点亮另外两个的一个
                    if (subPageTitle == '好心情') {
                        //修改服药值
                        this.state.Mood = '1';
                        this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                    }else if (subPageTitle == '一般心情') {
                        //修改服药值
                        this.state.Mood = '3';
                        this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                    }
                }
            } else {
                if (subPageTitle == '好心情') {
                    //修改服药值
                    this.state.Mood = '1';
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                } else if (subPageTitle == '一般心情') {
                    //修改服药值
                    this.state.Mood = '3';
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                } else if (subPageTitle == '坏心情') {
                    //修改服药值
                    this.state.Mood = '5';
                    this.uploadMoodAndMedicineInfo(this.state.Mood, this.state.TakePill, '1', subPageTitle);
                }
            }
        }
        return subPage;
    },
    switchMoodState(subPageTitle) {
        if (this.state.goodState) {

            if (subPageTitle == '好心情') {

                this.setState({'goodimagePath': this.state.goodImageOff, 'goodState': false});
            } else {
                if (subPageTitle == '一般心情') {

                    this.setState({'goodimagePath': this.state.goodImageOff, 'goodState': false, 'normalimagePath': this.state.normalImageOn, 'normalState': true});
                }else if (subPageTitle == '坏心情') {

                    this.setState({'goodimagePath': this.state.goodImageOff, 'goodState': false, 'badimagePath': this.state.badImageOn, 'badState': true});
                }
            }
        }else if (this.state.normalState) {

            if (subPageTitle == '一般心情') {

                this.setState({'normalimagePath': this.state.normalImageOff, 'normalState': false});
            } else {
                if (subPageTitle == '好心情') {
                    this.setState({'normalimagePath': this.state.normalImageOff, 'normalState': false, 'goodimagePath': this.state.goodImageOn, 'goodState': true});

                }else if (subPageTitle == '坏心情') {
                    this.setState({'normalimagePath': this.state.normalImageOff, 'normalState': false, 'badimagePath': this.state.badImageOn, 'badState': true});
                }
            }
        }else if (this.state.badState) {

            if (subPageTitle == '坏心情') {
                this.setState({'badimagePath': this.state.badImageOff, 'badState': false});
            } else {
                if (subPageTitle == '好心情') {
                    this.setState({'badimagePath': this.state.badImageOff, 'badState': false, 'goodimagePath': this.state.goodImageOn, 'goodState': true});
                }else if (subPageTitle == '一般心情') {
                    this.setState({'badimagePath': this.state.badImageOff, 'badState': false, 'normalimagePath': this.state.normalImageOn, 'normalState': true});
                }
            }
        }
        else {
            if (subPageTitle == '好心情') {
                this.setState({'goodimagePath': this.state.goodImageOn, 'goodState': true});
            }else if (subPageTitle == '一般心情') {
                this.setState({'normalimagePath': this.state.normalImageOn, 'normalState': true});
            }else if (subPageTitle == '坏心情') {
                this.setState({'badimagePath': this.state.badImageOn, 'badState': true});
            }
        }
    },
});

var styles = StyleSheet.create({
    //ScrollView布局
    contentContainer: {
        //flex: 1,
        backgroundColor: '#f8f8f8',
        flexDirection: 'column',
        height: 1000,
        marginLeft: 0,
        marginRight: 0,
    },
    //血压等级
    bpLevelView: {
        flex: 8,
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    bpLevelText:{
        //alignItems: 'center',
        fontSize: 15,
        marginLeft: 20,
        marginTop: 10,
        color: '#555555',
        flex: 3,
    },
    bpLevelText_35:{
        //alignItems: 'center',
        fontSize: 12,
        marginLeft: 20,
        marginTop: 10,
        color: '#555555',
        flex: 2,
    },
    //数据展示布局
    bpDataViewContainer:{
        flex: 50,
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    //血压等级彩条布局
    imageView:{
        flex: 3,
        backgroundColor: '#ffffff',
    },
    imageViewStyle:{
        flex: 3,
        flexDirection: 'row',
    },

    imageStyleMood:{
        flex: 2,
        //marginTop: 25,
        width: 40,
        height: 40,
        resizeMode: 'contain',
        justifyContent: 'center',
    },

    selectMoodContainer:{
        flex: 3,
        flexDirection: 'row',
    },

    selectMoodGood: {
        flex: 3,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    selectMoodGoodImage:{
        marginRight: 5,
        marginTop: 5,
        width: 40,
        height: 40,
    },
    selectMoodGoodText:{
        marginRight: 15,
        marginTop: 20,
        fontSize: 15,
    },

    selectMoodNormal: {
        flex: 3,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    selectMoodNormalImage:{
        marginTop: 5,
        width: 40,
        height: 40,
    },
    selectMoodNormalText:{
        marginLeft:5,
        marginTop: 20,
        fontSize: 15,
    },

    selectMoodBad: {
        flex: 3,
        flexDirection: 'row',
    },
    selectMoodBadImage:{
        marginLeft: 15,
        marginTop: 5,
        width: 40,
        height: 40,
    },
    selectMooBadText:{
        marginLeft: 5,
        marginTop: 20,
        fontSize: 15,
    },

    takeMedicineContainer:{
        flex: 3,
        flexDirection: 'row',
    },
    takeMedicineYES: {
        flex: 3,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    takeMedicineYESImage:{
        marginRight: 5,
        marginTop: 5,
        width: 40,
        height: 40,
    },
    takeMedicineYESText:{
        marginRight: 40,
        marginTop: 20,
        fontSize: 15,
    },
    takeMedicineNO:{
        flex: 3,
        flexDirection: 'row',
    },
    takeMedicineNOImage:{
        marginLeft: 40,
        marginTop: 5,
        width: 40,
        height: 40,
    },
    takeMedicineNOText:{
        marginLeft: 5,
        marginTop: 20,
        fontSize: 15,
    },
    imageStyleMoodText:{
        //fontSize: 20,
        flex: 1,
        //resizeMode: 'contain',
        alignItems: 'center',
        justifyContent: 'center',
        //marginTop: 35,
    },
    imageStyleMedicine:{
        //flex: 1,
        marginTop: 5,
        marginLeft: 100,
        width: 40,
        height: 40,
    },
    image:{
        flex: 1,
        resizeMode:'stretch',
    },
    //高低压和note布局
    bpDataViewStyle:{
        flex: 47,
        flexDirection: 'column',
    },
    //高低压布局
    bpDataView:{
        flex: 7,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
    },
    //左侧单位布局，子空间纵向排列
    bpDataUnit:{
        backgroundColor: '#ffffff',
        flex: 63,
        flexDirection: 'column',
    },
    //高压单位布局
    heightBPUnit:{
        marginTop: 0,
        backgroundColor: '#ffffff',
        flex: 1,
    },
    heightBPTextView:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 10,
        marginTop: 0,
    },
    //高压血压之布局
    heightBPText:{
        fontWeight: 'bold',
        fontSize: 35,
        color: '#4C8862',
    },
    //Green
    BPLevelGreen:{
        fontWeight: 'bold',
        fontSize: 35,
        marginLeft: 20,
        marginTop: 8,
        flex: 3,
        color: '#4C8862',
    },
    //LightGreen
    BPLevelLightGreen:{
        fontWeight: 'bold',
        fontSize: 35,
        marginLeft: 20,
        marginTop: 8,
        flex: 3,
        color: '#87C25D',
    },
    //YellowGreen
    BPLevelYellowGreen:{
        fontWeight: 'bold',
        fontSize: 35,
        marginLeft: 20,
        marginTop: 8,
        flex: 3,
        color: '#CDD75E',
    },
    //Yellow
    BPLevelYellow:{
        fontWeight: 'bold',
        fontSize: 35,
        marginLeft: 20,
        marginTop: 8,
        flex: 3,
        color: '#F3BB4E',
    },
    //OrangeRed
    BPLevelOrangeRed:{
        fontWeight: 'bold',
        fontSize: 35,
        marginLeft: 20,
        marginTop: 8,
        flex: 3,
        color: '#E97C46',
    },
    //Red
    BPLevelRed:{
        fontWeight: 'bold',
        fontSize: 35,
        marginLeft: 20,
        marginTop: 8,
        flex: 3,
        color: '#DC4147',
    },
    //Green
    BPLevelGreen_35:{
        fontWeight: 'bold',
        fontSize: 30,
        marginLeft: 20,
        marginTop: 0,
        flex: 3,
        color: '#4C8862',
    },
    //LightGreen
    BPLevelLightGreen_35:{
        fontWeight: 'bold',
        fontSize: 30,
        marginLeft: 20,
        marginTop: 0,
        flex: 3,
        color: '#87C25D',
    },
    //YellowGreen
    BPLevelYellowGreen_35:{
        fontWeight: 'bold',
        fontSize: 30,
        marginLeft: 20,
        marginTop: 0,
        flex: 3,
        color: '#CDD75E',
    },
    //Yellow
    BPLevelYellow_35:{
        fontWeight: 'bold',
        fontSize: 30,
        marginLeft: 20,
        marginTop: 0,
        flex: 3,
        color: '#F3BB4E',
    },
    //OrangeRed
    BPLevelOrangeRed_35:{
        fontWeight: 'bold',
        fontSize: 30,
        marginLeft: 20,
        marginTop: 0,
        flex: 3,
        color: '#E97C46',
    },
    //Red
    BPLevelRed_35:{
        fontWeight: 'bold',
        fontSize: 30,
        marginLeft: 20,
        marginTop: 0,
        flex: 3,
        color: '#DC4147',
    },
    //Green
    heightBPTextGreen_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#4C8862',
        marginTop:15,
    },
    //LightGreen
    heightBPTextLightGreen_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#87C25D',
        marginTop:15,
    },
    //YellowGreen
    heightBPTextYellowGreen_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#CDD75E',
        marginTop:15,
    },
    //Yellow
    heightBPTextYellow_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#F3BB4E',
        marginTop:15,
    },
    //OrangeRed
    heightBPTextOrangeRed_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#E97C46',
        marginTop:15,
    },
    //Red
    heightBPTextRed_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#DC4147',
        marginTop:15,
    },
    //Green
    lowBPTextGreen_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#4C8862',
        marginTop: 5,
    },
    //LightGreen
    lowBPTextLightGreen_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#87C25D',
        marginTop: 5,
    },
    //YellowGreen
    lowBPTextYellowGreen_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#CDD75E',
        marginTop: 5,
    },
    //Yellow
    lowBPTextYellow_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#F3BB4E',
        marginTop: 5,
    },
    //OrangeRed
    lowBPTextOrangeRed_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#E97C46',
        marginTop: 5,
    },
    //Red
    lowBPTextRed_35:{
        fontWeight: 'bold',
        fontSize: 75,
        color: '#DC4147',
        marginTop: 5,
    },
    heartBPTextView_35:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 10,
        marginTop: -13,
    },
    //Green
    heightBPTextGreen:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#4C8862',
        marginTop: 20,
    },
    //LightGreen
    heightBPTextLightGreen:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#87C25D',
        marginTop: 20,
    },
    //YellowGreen
    heightBPTextYellowGreen:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#CDD75E',
        marginTop: 20,
    },
    //Yellow
    heightBPTextYellow:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#F3BB4E',
        marginTop: 20,
    },
    //OrangeRed
    heightBPTextOrangeRed:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#E97C46',
        marginTop: 20,
    },
    //Red
    heightBPTextRed:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#DC4147',
        marginTop: 20,
    },
    //Green
    lowBPTextGreen:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#4C8862',
        marginTop: 21,
    },
    //LightGreen
    lowBPTextLightGreen:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#87C25D',
        marginTop: 21,
    },
    //YellowGreen
    lowBPTextYellowGreen:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#CDD75E',
        marginTop: 21,
    },
    //Yellow
    lowBPTextYellow:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#F3BB4E',
        marginTop: 21,
    },
    //OrangeRed
    lowBPTextOrangeRed:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#E97C46',
        marginTop: 21,
    },
    //Red
    lowBPTextRed:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#DC4147',
        marginTop: 21,
    },
    //低压单位布局
    lowBPUnit:{
        marginTop: 0,
        backgroundColor: '#ffffff',
        flex: 1,
    },
    lowBPTextView:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 10,
        marginTop: 0,
    },
    //低压血压值布局
    lowBPText:{
        fontWeight: 'bold',
        fontSize: 90,
        color: '#4C8862',
    },
    //心率单位布局
    heartBPUnit:{
        marginTop: 0,
        backgroundColor: '#ffffff',
        flex: 1,
    },
    heartBPTextView:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 10,
        marginTop: 20,
    },
    //心率值布局
    heartBPText:{
        fontWeight: 'bold',
        fontSize: 50,
        color: '#999999',
        marginTop: 10,
    },
    heartImage:{
        marginTop: 25,
        marginRight: 10,
        width: 25,
        height: 25,
    },
    //右侧血压值布局
    bpDataLabel:{
        backgroundColor: '#ffffff',
        flex: 127,
        flexDirection: 'row',
    },
    bpDataLabelBlock1:{
        flex: 15,
        flexDirection: 'column',
    },
    bpDataLabelBlock2:{
        flex: 3,
    },
    //note布局
    bpNoteView:{
        flex: 2,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
    },
    //心情布局
    userMoodView: {
        flex: 15,
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    //服药布局
    takeMedicineView: {
        flex: 15,
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    //文字
    title: {
        alignItems: 'center',
        alignSelf: 'center',
        // textAlign: 'auto',
        fontSize: 20,
        marginTop: 0,
        //marginRight: 5,
        //justifyContent: 10,
        color: '#555555',
    },
    heightBPtitle_35: {
        alignItems: 'center',
        alignSelf: 'center',
        fontSize: 20,
        marginTop: 38,
        color: '#555555',
    },
    heightBPtitle: {
        alignItems: 'center',
        alignSelf: 'center',
        fontSize: 20,
        marginTop: 50,
        color: '#555555',
    },
    lowBPtitle_35: {
        alignItems: 'center',
        alignSelf: 'center',
        fontSize: 20,
        marginTop: 30,
        color: '#555555',
    },
    lowBPtitle: {
        alignItems: 'center',
        alignSelf: 'center',
        fontSize: 20,
        marginTop: 42,
        color: '#555555',
    },
    heartBPtitle_35: {
        alignItems: 'center',
        alignSelf: 'center',
        fontSize: 20,
        marginTop: 15,
        color: '#555555',
    },
    heartBPtitle: {
        alignItems: 'center',
        alignSelf: 'center',
        fontSize: 20,
        marginTop: 30,
        color: '#555555',
    },
    //文字
    title2: {
        alignItems: 'center',
        alignSelf: 'center',
        // textAlign: 'auto',
        fontSize: 14,
        marginTop: 2,
        //marginLeft: 5,
        //marginRight: 5,
        //justifyContent: 10,
        color: '#555555',
    },
    separator: {
        height: 1.0,
        alignSelf: 'stretch',
        backgroundColor: '#dddddd',
        marginLeft:0,
        marginRight: 0,
    },
    columnSeparator: {
        width: 1.0,
        alignSelf: 'stretch',
        backgroundColor: '#dddddd',
        marginTop:-5,
        marginBottom: 0,
    },
    darkView:{
        backgroundColor: '#f8f8f8',
        flex: 1,
    },
    containerText: {
        flex: 2,
        flexDirection: 'column',
        marginLeft: 5,
        marginTop: 15,
    },
    titleStyle: {
        lineHeight: 30,
        fontSize: 20,
        color: '#555555',
    },
});

module.exports = BPResultDetail;
