/**
 * Created by zhangmingli on 2016/11/8.
 */
'use strict';
var React = require('react-native');
var ReactART = require('ReactNativeART');
var dataCompute = require('../CommonModules/dataCompute');
var strings = require('../CommonModules/ihealthLocalizedString');
var LocalizedStrings = require('../CommonModules/LocalizedStrings');
var Dimensions = require('Dimensions');
const { height,width } = Dimensions.get('window');

var {
    Alert,
    ScrollView,
    StyleSheet,
    View,
    Image,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Component,
    AlertIOS,
    } = React;

var {
    Surface,
    Path,
    Group,
    Transform,
    Shape,
    } = ReactART;

var MHPluginSDK = require('NativeModules').MHPluginSDK;

let APPBAR_MARGINTOP = 0;
if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}

var subscription;
var horizontalGap;
var tag = 'FindMore';
var deviceWidth = 0;
var deviceHeight = 0;
var chartContainerHeight = 0;
var yAxisHeight= 0;
var xAxisWidth = 0;
var ada = 123;
var data = {};
var highPMarginalValue = 139, //高压临界值
    lowPMarginalValue = 89, //低压临界值
    differentialPMarginalValue = 60; //脉压差临界值
class FindMore extends Component{

    constructor(props) {

        deviceWidth = Dimensions.get('window').width;
        deviceHeight = Dimensions.get('window').height - 64;
        chartContainerHeight = deviceHeight * 19/68;
        xAxisWidth = deviceWidth - 30;
        yAxisHeight = chartContainerHeight - 40;

        super(props);
        var dataStatistics = dataCompute.dataStatistics(this.props.highPs, this.props.lowPs);
        var highAverage = dataCompute.dataAverage(this.props.highPs);
        var lowAverage = dataCompute.dataAverage(this.props.lowPs);
        var averageWrong = highAverage - lowAverage;
        data = {lowAverage: lowAverage,
            highAverage: highAverage,
            averageWrong: averageWrong,
            mostHighHistory: dataCompute.dataMostHistory(this.props.highPs),
            mostLowHistory: dataCompute.dataMostHistory(this.props.lowPs),
            normalHistory: dataStatistics.normalHistory,
            highHistory: dataStatistics.highHistory};
        this.state = {
            did: MHPluginSDK.deviceId,
            model: MHPluginSDK.deviceModel,
            apiLevel: MHPluginSDK.apiLevel,
            basePath: MHPluginSDK.basePath,
            devMode: MHPluginSDK.devMode,
            requestStatus: false,
            //好
            goodImageOff: MHPluginSDK.basePath + 'goodMood.png',
            goodImageOn: MHPluginSDK.basePath + 'goodMoodSelected.png',
            goodState: false,
            goodimagePath: MHPluginSDK.basePath + 'goodMood.png',
            //脉压差
            ihealthAandQPath: MHPluginSDK.basePath + 'ihealthAandQ.png',
        };
    }

    componentDidMount() {

    }

    renderAverageIsNormal(lowAverageValue, highAverageValue, lowBoundaryValue, highBoundaryValue) {
        return ((lowAverageValue <= lowBoundaryValue) && (highAverageValue <= highBoundaryValue));
    }

    renderIsNormal(showValue, boundaryValue) {
        return (showValue <= boundaryValue);
    }

    render() {
        return (
            //ScrollView布局
            <View style={styles.contentContainer}>
                <View style={{marginTop:APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                </View>
                <View style={styles.bpTrendContainer}>
                    <View style={styles.fatherTitle}>
                        <Text style={styles.fatherTitleText}></Text>
                        <Text style={styles.fatherUnit}>mmHg</Text>
                    </View>

                    <View style={styles.fatherContainer}>

                        <View style={styles.chartContainer}>
                            <Surface width={deviceWidth} height={chartContainerHeight}>
                                <Shape  d={this.getHorizontalLine200()} stroke="#eeeeee" strokeWidth={1} />
                                <Shape  d={this.getHorizontalLine150()} stroke="#eeeeee" strokeWidth={1} />
                                <Shape  d={this.getHorizontalLine100()} stroke="#eeeeee" strokeWidth={1} />
                                <Shape  d={this.getHorizontalLine50()} stroke="#eeeeee" strokeWidth={1} />
                                <Shape  d={this.getHorizontalLine0()} stroke="#eeeeee" strokeWidth={1} />
                                <Shape  d={this.getVerticalLine0()} stroke="#eeeeee" strokeWidth={1} />
                                <Group x={30} y={8}>
                                    {this.drawSysPath(this.props.highPs)}
                                    {this.drawDiaPath(this.props.lowPs)}
                                </Group>
                            </Surface>

                            <View style={styles.yLabels}>
                                <Text style={styles.y_200}>200</Text>
                                <Text style={styles.y_150}>150</Text>
                                <Text style={styles.y_100}>100</Text>
                                <Text style={styles.y_50}>50</Text>
                                <Text style={styles.y_0}>0</Text>
                            </View>

                            <View style={styles.xLabels}>
                                <Text style={styles.timeStart}>{this.props.dateArray[1]}</Text>
                                <Text style={[styles.timeEnd, {
                                left:(this.props.highPs.length-1) * horizontalGap
                                }]}>{this.props.dateArray[0]}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.separator}/>
                <View style={styles.darkView}/>

                <View style={styles.separator}/>
                {this.showViewwithTheInch()}
                <View style={styles.separator}/>
            </View>
        );
    }

    showViewwithTheInch() {
        var deviceWidthTemp = Dimensions.get('window').width;

        //判断是否为3.5寸屏幕
        if (deviceWidthTemp == 320) {
            return (
                <View style={styles.bpResultAnalysisContainer}>
                    <View style={styles.bpMeasurementResultTimes}>
                        <View style={styles.bpMeasurementResultTimesNormal}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultTimesNormalTitle}>{strings.ResultsOfNormalBloodPressure}</Text>
                            </View>
                            <View style={styles.title2}>
                                <Text style={styles.bpMeasurementResultTimesNormalValue}>{data.normalHistory}</Text>
                            </View>
                        </View>

                        <View style={styles.columnSeparator}/>

                        <View style={styles.bpMeasurementResultTimesHigh}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultTimesHighTitle}>{strings.HighBloodPressureResults}</Text>
                            </View>
                            <View style={styles.title2}>
                                <Text style={styles.bpMeasurementResultTimesHighValue}>{data.highHistory}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.separator}/>

                    <View style={styles.bpMeasurementResult}>
                        <View style={styles.bpMeasurementResultHighValue}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultHighValueTitle}>
                                    {strings.HighVoltageHighestValue + " "}
                                    <Text style={{color:'#fff', fontSize: 12, fontWeight: 'bold', backgroundColor: this.renderIsNormal(data.mostHighHistory, highPMarginalValue)?'#97CA78':'#DF5C5F'}}>
                                        {this.renderIsNormal(data.mostHighHistory, highPMarginalValue)?strings.Normal+ " ":strings.High+ "\n"}
                                        
                                    </Text>

                                </Text>
                                <View style={{marginLeft:'15%'}}>
                                <Text style={{color:'#666666'}}>{strings.Mmhg}</Text>
                                </View>
                                <View style={styles.title2}>
                                <Text style={{color:'#fff', fontSize: 12, fontWeight: 'bold',backgroundColor:'#ffffff'}}>
                                    1111
                                     </Text>
                                     </View>
                            </View>
                            <View style={styles.title2}>
                                <Text style={{fontSize: 36,marginTop:10,color: this.renderIsNormal(data.mostHighHistory, highPMarginalValue)?'#666666':'#666666'}}>{data.mostHighHistory}</Text>
                            </View>
                        </View>

                        <View style={styles.columnSeparator}/>

                        <View style={styles.bpMeasurementResultLowValue}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultLowValueTitle}>
                                    {strings.LowVoltageHighestValue + " "}
                                    <Text style={{color:'#fff', fontSize: 12, fontWeight: 'bold', backgroundColor: this.renderIsNormal(data.mostLowHistory, lowPMarginalValue)?'#97CA78':'#DF5C5F'}}>
                                        {this.renderIsNormal(data.mostLowHistory, lowPMarginalValue)?strings.Normal:strings.High}
                                    </Text>
                                </Text>
                            </View>
                            <View style={{marginLeft:'15%'}}>
                                <Text style={{color:'#666666'}}>{strings.Mmhg}</Text>
                            </View>
                            <View style={styles.title2}>
                                <Text style={{fontSize: 36,marginTop:10,color: this.renderIsNormal(data.mostLowHistory, lowPMarginalValue)?'#666666':'#666666'}}>
                                    {data.mostLowHistory}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.separator}/>

                    <View style={styles.bpMeasurementAverage}>
                        <View style={styles.bpMeasurementAverageBp}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultLowValueTitle}>
                                    {strings.BloodPressureMean + " "}
                                    <Text style={{color:'#fff', fontSize: 12, fontWeight: 'bold', backgroundColor: this.renderAverageIsNormal(data.lowAverage, data.highAverage, lowPMarginalValue, highPMarginalValue)?'#97CA78':'#DF5C5F'}}>
                                        {this.renderAverageIsNormal(data.lowAverage, data.highAverage, lowPMarginalValue, highPMarginalValue)?strings.Normal:strings.High}
                                    </Text>
                                </Text>
                            </View>
                            <View style={{marginLeft:'15%'}}>
                                <Text style={{color:'#666666'}}>{strings.Mmhg}</Text>
                            </View>
                            <View style={styles.title2}>
                                <Text style={{fontSize: 36,marginTop:10,color: this.renderAverageIsNormal(data.lowAverage, data.highAverage, lowPMarginalValue, highPMarginalValue)?'#666666':'#666666'}}>
                                    {data.highAverage + "/" + data.lowAverage}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.columnSeparator}/>

                        <View style={styles.bpMeasurementAverageHeartRate}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultLowValueTitle}>
                                    {strings.MeanValueOfPulsePressure + " "}
                                    <Text style={{color:'#fff', fontSize: 12, fontWeight: 'bold', backgroundColor: this.renderIsNormal(data.averageWrong, differentialPMarginalValue)?'#97CA78':'#DF5C5F'}}>
                                        {this.renderIsNormal(data.averageWrong, differentialPMarginalValue)?strings.Normal:strings.High}
                                    </Text>
                                </Text>
                            </View>
                            <View style={{marginLeft:'15%'}}>
                                <Text style={{color:'#666666'}}>{strings.Mmhg}</Text>
                            </View>
                            <View style={styles.title2averageWrong}>
                                <Text style={{alignSelf: 'center',alignItems: 'center',fontSize: 36,marginTop:10,color: this.renderIsNormal(data.averageWrong, differentialPMarginalValue)?'#666666':'#666666'}}>
                                    {data.averageWrong}
                                </Text>

                                <TouchableOpacity style={{flex:1}} underlayColor='#838383' onPress={ () => {

                                    if (strings.更多 == '更多') {
                                        AlertIOS.alert(
                                            null,
                                            parseInt(MHPluginSDK.systemInfo.sysVersion.charAt(0))>7?
                                            ('脉压是指收缩压与舒张压之间\r\n'+
                                            '的差值，正常范围是20-60\r\n'+
                                            'mmHg，脉压偏大或偏小都是\r\n'+
                                            '身体健康失衡的一种表现，应\r\n'+
                                            '该及时去医院查明原因，治疗\r\n'+
                                            '原发病。\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'):
                                            ('脉压是指收缩压与舒张压之间\r\n'+
                                            '的差值，正常范围是20-60\r\n'+
                                            'mmHg，脉压偏大或偏小都是\r\n'+
                                            '身体健康失衡的一种表现，应\r\n'+
                                            '该及时去医院查明原因，治疗\r\n'+
                                            '       原发病。                                              ')
                                          )
                                        
                                    } else if (strings.更多 == 'More') {
                                        AlertIOS.alert(
                                            null,
                                            parseInt(MHPluginSDK.systemInfo.sysVersion.charAt(0))>7?
                                            ('Pulse pressure refers to the difference between\r\n'+
                                            'systolic pressure and diastolic pressure, \r\n'+
                                            'the normal range is 20-60mmHg,\r\n'+
                                            'pulse pressure difference is large or\r\n'+
                                            'small is a manifestation of physical health imbalance,\r\n'+
                                            'should go to the hospital in time to find out the cause,, \r\n'+
                                            'treatment of the original disease.\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'):
                                            ('Pulse pressure refers to the difference between\r\n'+
                                            'systolic pressure and diastolic pressure,\r\n'+
                                            'the normal range is 20-60mmHg,\r\n'+
                                            'pulse pressure difference is large or\r\n'+
                                            'small is a manifestation of physical health imbalance,\r\n'+
                                            'should go to the hospital in time to find out the cause,, \r\n'+
                                            '      treatment of the original disease.                                              ')
                                          )
                                        
                                    }


                                  
                                    }}>
                                    <Image style={{position:'absolute',right: 30,top: -30,width: 23,height: 23}} source={{isStatic:!this.state.devMode, uri:this.state.ihealthAandQPath}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.bpResultAnalysisContainer}>
                    <View style={styles.bpMeasurementResultTimes}>
                        <View style={styles.bpMeasurementResultTimesNormal}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultTimesNormalTitle_55Itch}>{strings.ResultsOfNormalBloodPressure}</Text>
                            </View>
                            <View style={styles.title2}>
                                <Text style={styles.bpMeasurementResultTimesNormalValue_55Itch}>{data.normalHistory}</Text>
                            </View>
                        </View>

                        <View style={styles.columnSeparator}/>

                        <View style={styles.bpMeasurementResultTimesHigh}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultTimesHighTitle_55Itch}>{strings.HighBloodPressureResults}</Text>
                            </View>
                            <View style={styles.title2}>
                                <Text style={styles.bpMeasurementResultTimesHighValue_55Itch}>{data.highHistory}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.separator}/>

                    <View style={styles.bpMeasurementResult}>
                        <View style={styles.bpMeasurementResultHighValue}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultHighValueTitle_55Itch}>
                                    {strings.HighVoltageHighestValue + " "}
                                    <Text style={{color:'#fff', fontSize: 14, fontWeight: 'bold', backgroundColor: this.renderIsNormal(data.mostHighHistory, highPMarginalValue)?'#97CA78':'#DF5C5F'}}>
                                        {this.renderIsNormal(data.mostHighHistory, highPMarginalValue)?strings.Normal:strings.High}
                                    </Text>
                                </Text>
                            </View>
                            <View style={{marginLeft:'15%'}}>
                                <Text style={{color:'#666666'}}>{strings.Mmhg}</Text>
                            </View>
                            <View style={styles.title2} >
                                <Text style={{fontSize: 42,marginTop:10,color: this.renderIsNormal(data.mostHighHistory, highPMarginalValue)?'#666666':'#666666'}}>{data.mostHighHistory}</Text>
                            </View>
                        </View>

                        <View style={styles.columnSeparator}/>

                        <View style={styles.bpMeasurementResultLowValue}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultLowValueTitle_55Itch}>
                                    {strings.LowVoltageHighestValue + " "}
                                    <Text style={{color:'#fff', fontSize: 14, fontWeight: 'bold', backgroundColor: this.renderIsNormal(data.mostLowHistory, lowPMarginalValue)?'#97CA78':'#DF5C5F'}}>
                                        {this.renderIsNormal(data.mostLowHistory, lowPMarginalValue)?strings.Normal:strings.High}
                                    </Text>
                                </Text>
                            </View>
                            <View style={{marginLeft:'15%'}}>
                                <Text style={{color:'#666666'}}>{strings.Mmhg}</Text>
                            </View>
                            <View style={styles.title2}>
                                <Text style={{fontSize: 42,marginTop:10,color: this.renderIsNormal(data.mostHighHistory, lowPMarginalValue)?'#666666':'#666666'}}>
                                    {data.mostLowHistory}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.separator}/>

                    <View style={styles.bpMeasurementAverage}>
                        <View style={styles.bpMeasurementAverageBp}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultLowValueTitle_55Itch}>
                                    {strings.BloodPressureMean + " "}
                                    <Text style={{color:'#fff', fontSize: 14, fontWeight: 'bold', backgroundColor: this.renderAverageIsNormal(data.lowAverage, data.highAverage, lowPMarginalValue, highPMarginalValue)?'#97CA78':'#DF5C5F'}}>
                                        {this.renderAverageIsNormal(data.lowAverage, data.highAverage, lowPMarginalValue, highPMarginalValue)?strings.Normal:strings.High}
                                    </Text>
                                </Text>
                            </View>
                            <View style={{marginLeft:'15%'}}>
                                <Text style={{color:'#666666'}}>{strings.Mmhg}</Text>
                            </View>
                            <View style={styles.title2}>
                                <Text style={{fontSize: 42,marginTop:10,color: this.renderAverageIsNormal(data.lowAverage, data.highAverage, lowPMarginalValue, highPMarginalValue)?'#666666':'#666666'}}>
                                    {data.highAverage + "/" + data.lowAverage}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.columnSeparator}/>

                        <View style={styles.bpMeasurementAverageHeartRate}>
                            <View style={styles.title1}>
                                <Text style={styles.bpMeasurementResultLowValueTitle_55Itch}>
                                    {strings.MeanValueOfPulsePressure + " "}
                                    <Text style={{color:'#fff', fontSize: 14, fontWeight: 'bold', backgroundColor: this.renderIsNormal(data.averageWrong, differentialPMarginalValue)?'#97CA78':'#DF5C5F'}}>
                                        {this.renderIsNormal(data.averageWrong, differentialPMarginalValue)?strings.Normal:strings.High}
                                    </Text>
                                </Text>
                            </View>
                            <View style={{marginLeft:'15%'}}>
                                <Text style={{color:'#666666'}}>{strings.Mmhg}</Text>
                            </View>
                            <View style={styles.title2averageWrong}>
                                <Text style={{alignSelf: 'center',alignItems: 'center',fontSize: 42,marginTop:10,color: this.renderIsNormal(data.averageWrong, differentialPMarginalValue)?'#666666':'#666666'}}>
                                    {data.averageWrong}
                                </Text>

                                <TouchableOpacity style={{flex:1}} underlayColor='#838383' onPress={ () => {


                                if (strings.更多 == '更多') {
                                    Alert.alert(
                                        null,
                                        parseInt(MHPluginSDK.systemInfo.sysVersion.charAt(0))>7?
                                        ('脉压是指收缩压与舒张压之间\r\n'+
                                        '的差值，正常范围是20-60\r\n'+
                                        'mmHg，脉压偏大或偏小都是\r\n'+
                                        '身体健康失衡的一种表现，应\r\n'+
                                        '该及时去医院查明原因，治疗\r\n'+
                                        '原发病。\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'):
                                        ('脉压是指收缩压与舒张压之间\r\n'+
                                        '的差值，正常范围是20-60\r\n'+
                                        'mmHg，脉压偏大或偏小都是\r\n'+
                                        '身体健康失衡的一种表现，应\r\n'+
                                        '该及时去医院查明原因，治疗\r\n'+
                                        '       原发病。                                              ')
                                    )
                                    
                                } else if (strings.更多 == 'More') {
                                    Alert.alert(
                                        null,
                                        parseInt(MHPluginSDK.systemInfo.sysVersion.charAt(0))>7?
                                        ('Pulse pressure refers to the difference between\r\n'+
                                        'systolic pressure and diastolic pressure, \r\n'+
                                        'the normal range is 20-60mmHg,\r\n'+
                                        'pulse pressure difference is large or\r\n'+
                                        'small is a manifestation of physical health imbalance,\r\n'+
                                        'should go to the hospital in time to find out the cause,, \r\n'+
                                        'treatment of the original disease.\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'):
                                        ('Pulse pressure refers to the difference between\r\n'+
                                        'systolic pressure and diastolic pressure,\r\n'+
                                        'the normal range is 20-60mmHg,\r\n'+
                                        'pulse pressure difference is large or\r\n'+
                                        'small is a manifestation of physical health imbalance,\r\n'+
                                        'should go to the hospital in time to find out the cause,, \r\n'+
                                        '      treatment of the original disease.                                              ')
                                    )
                                    
                                }



                                //   Alert.alert(
                                //       null,
                                //       '脉压是指收缩压与舒张压之间\r\n'+
                                //       '的差值，正常范围是20-60\r\n'+
                                //       'mmHg，脉压偏大或偏小都是\r\n'+
                                //       '身体健康失衡的一种表现，应\r\n'+
                                //       '该及时去医院查明原因，治疗\r\n'+
                                //       '原发病。\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'
                                //     )
                                    }}>
                                    <Image style={{position:'absolute',right: 42,top: -33,width: 25,height: 25}} source={{isStatic:!this.state.devMode, uri:this.state.ihealthAandQPath}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }
    }
    takeMedicineSelect(subPageComponent, subPageTitle) {
        function subPage() {

        }
        return subPage;
    }
    getHorizontalLine200(){
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
};

var styles = StyleSheet.create({
    //ScrollView布局
    contentContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        flexDirection: 'column',
        marginTop: 64,
    },
    //血压等级
    bpTrendContainer: {
        flex: 25,
        backgroundColor: '#EFEFF0',
    },

    bpResultAnalysisContainer:{
        flex: 50,
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    bpMeasurementResultTimes:{
        flex: 1,
        flexDirection: 'row',
    },

    bpMeasurementResultTimesNormal:{
        flex: 1,
        flexDirection: 'column',
    },
    bpMeasurementResultTimesNormalTitle:{
        color: '#666666',
        fontSize: 12,
    },
    bpMeasurementResultTimesNormalTitle_55Itch:{
        color: '#666666',
        fontSize: 14,
    },
    bpMeasurementResultTimesNormalValue:{
        color: '#666666',
        fontSize: 36,
        //fontWeight: 'bold',
        marginTop:10,
    },
    bpMeasurementResultTimesNormalValue_55Itch:{
        color: '#666666',
        fontSize: 42,
        //fontWeight : 'bold',
        marginTop:10,
    },
    bpMeasurementResultTimesHigh:{
        flex: 1,
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    bpMeasurementResultTimesHighTitle:{
        color: '#666666',
        fontSize: 12,
    },
    bpMeasurementResultTimesHighTitle_55Itch:{
        color: '#666666',
        fontSize: 14,
    },
    bpMeasurementResultTimesHighValue:{
        color: '#666666',
        fontSize: 36,
        //fontWeight: 'bold',
        marginTop:10,
    },
    bpMeasurementResultTimesHighValue_55Itch:{
        color: '#666666',
        fontSize: 42,
        //fontWeight: 'bold',
        marginTop:10,
    },
    bpMeasurementResult:{
        flex: 1,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
    },

    bpMeasurementResultHighValue:{
        flex: 1,
        flexDirection: 'column',
    },
    bpMeasurementResultHighValueTitle:{
        color: '#666666',
        fontSize: 12,
    },
    bpMeasurementResultHighValueTitle_55Itch:{
        color: '#666666',
        fontSize: 14,
    },
    bpMeasurementResultLowValue:{
        flex: 1,
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    bpMeasurementResultLowValueTitle:{
        color: '#666666',
        fontSize: 12,
    },
    bpMeasurementResultLowValueTitle_55Itch:{
        color: '#666666',
        fontSize: 14,
    },
    bpMeasurementAverage:{
        flex: 1,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
    },

    bpMeasurementAverageBp:{
        flex: 1,
        flexDirection: 'column',
    },
    bpMeasurementAverageBpTitle:{
        color: '#666666',
        fontSize: 12,
    },

    bpMeasurementAverageHeartRate:{
        flex: 1,
        flexDirection: 'column',
    },
    bpMeasurementAverageHeartRateTitle:{
        color: '#666666',
        fontSize: 12,
        marginBottom: 5,
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
        marginTop:0,
        marginBottom: 0,
    },
    darkView:{
        backgroundColor: '#f8f8f8',
        flex: 1,
    },
    title1:{
        flex: 2,
        alignSelf: 'center',
        justifyContent:'flex-end',
    },

    title2:{
        flex: 3,
        alignSelf: 'center',
        alignItems: 'center',
        //justifyContent: 'center',
    },
    title2averageWrong:{
        flex: 3,
        //flexDirection: 'row',
        //justifyContent: 'center',
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
        left: 0,
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
        paddingTop: 8,
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

// var sysData=[90, 80, 100, 95, 104,99,88,123,140,110, 108, 87,101,92,99,100,106,88,141,100];
// var diaData=[80, 76, 65, 81, 67,60,82,77,66,59, 69, 57,80,83,70,72,75,77,71,70];
// var xLabels = ['12月15日','12月25日'];

module.exports = FindMore;
