/**
 * Created by zhangmingli on 2016/11/8.
 */
'use strict';

var React = require('react-native');
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var RefreshInfiniteListView = require('./RefreshInfiniteListView');
var BPResultDetail = require('./BPResultDetail');
var TimerMixin = require('react-timer-mixin');
var bpDataLevel = require('../CommonModules/bpDataLevel');
var ihealth = require('../CommonModules/ihealth');
var historyApi = require('../CommonModules/historyApi');
var Aes = require('../CommonModules/Aes');
var strings = require('../CommonModules/ihealthLocalizedString');
var LocalizedStrings = require('../CommonModules/LocalizedStrings');
var deleteBPData = require('../CommonModules/deleteBPData');
var Dimensions = require('Dimensions');
const { height,width } = Dimensions.get('window');

var {
    StyleSheet,
    Image,
    ListView,
    Text,
    View,
    Alert,
    TouchableOpacity,
    ActivityIndicatorIOS,
    PixelRatio,
    TouchableWithoutFeedback,
    LayoutAnimation,
    DeviceEventEmitter,
    Platform,
    } = React;

var isFirst = 1,
    isPulldown = 2,
    isPullup = 3,
    loadDataLength = 20,
    currentLoadDataLength = 20,
    lastDateTime = "",
    sectionNumber = -1,
    data,
    sections,
    rows,
    viewUnmount;

let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
const customAnim = {
    customSpring: {
        duration: 70,
        create: {
            type: LayoutAnimation.Types.linear,
            property: LayoutAnimation.Properties.opacity,
        },
        update: {
            type: LayoutAnimation.Types.linear,
        }
    },
    customLinear: {
        duration: 200,
        create: {
            type: LayoutAnimation.Types.linear,
            property: LayoutAnimation.Properties.opacity,
        },
        update: {
            type: LayoutAnimation.Types.easeInEaseOut
        }
    }
};

var HistoryListView = React.createClass({

    mixins: [TimerMixin],
    // initial state
    getInitialState: function() {
        var getSectionData = (dataBlob, sectionID) => {
            return sectionID;
        }

        var getRowData = (dataBlob, sectionID, rowID) => {
            return dataBlob[sectionID + ':' + rowID];
        }

        return {
            deleteButtonColor: 'rgba(255, 102, 51, 0.5)',
            successFlag: false,
            failedFlag: false,
            visible: true,
            modalVisible: false,
            height: 0,
            selectEditBPDataButton: '全选',
            deleteBPDataButton: '确定',
            deleteDataArr:[],
            loaded: false,
            model: MHPluginSDK.deviceModel,
            apiLevel: MHPluginSDK.apiLevel,
            basePath: MHPluginSDK.basePath,
            ihealthSelectedUrl: MHPluginSDK.basePath+'ihealthSelected.png',
            ihealthNoSelectedUrl: MHPluginSDK.basePath+'ihealthNoSelected.png',
            ihealthButtonUrl: MHPluginSDK.basePath+'ihealthNoSelected.png',
            devMode: MHPluginSDK.devMode,
            dataSourceCopy: null,
            dataSource: new ListView.DataSource({
                getSectionData           : getSectionData,
                getRowData               : getRowData,
                rowHasChanged            : (row1, row2) => row1 !== row2,
                sectionHeaderHasChanged  : (s1, s2) => s1 !== s2
            })
        }
    },

    componentWillMount: function(){
        this.state.loaded=true;
        MHPluginSDK.showLoadingTips('');
    },

    // loading data
    componentDidMount: function(){
        viewUnmount = false;
        this._fetchData("0", isFirst);

        this._editBPDataListener = DeviceEventEmitter.addListener('EditBPDataListView_Edit', (event) => {
            if(this.state.height>0){
                LayoutAnimation.configureNext(customAnim.customSpring);
                // set state
                this.setState({
                    dataSource : this.state.dataSourceCopy,
                    loaded     : true
                });
                this.setState({height: 0, deleteDataArr:[], selectEditBPDataButton:'全选'});
            }else{
                LayoutAnimation.configureNext(customAnim.customSpring);
                // set state
                this.setState({
                    dataSource : this.state.dataSourceCopy,
                    loaded     : true
                });
                this.setState({height: 50});
            }
        });

        this._editBPDataListener_OK = DeviceEventEmitter.addListener('EditBPDataListView_OK', (event) => {
            if(this.state.height>0){
                LayoutAnimation.configureNext(customAnim.customSpring);
                // set state
                this.setState({
                    dataSource : this.state.dataSourceCopy,
                    loaded     : true
                });
                this.setState({height: 0, deleteDataArr:[], selectEditBPDataButton:'全选'});
            }else{
                LayoutAnimation.configureNext(customAnim.customSpring);
                // set state
                this.setState({
                    dataSource : this.state.dataSourceCopy,
                    loaded     : true
                });
                this.setState({height: 50});
            }
        });
    },

    componentWillUnmount: function(){
        viewUnmount = true;
        this._editBPDataListener.remove('EditBPDataListView_Edit');
        this._editBPDataListener_OK.remove('EditBPDataListView_OK');

        DeviceEventEmitter.emit('ListViewCallBack');
    },

    // format date
    formatDate: function(number) {
        var date = new Date(number*1000);
        return date.getFullYear() + strings.nian + (date.getMonth() + 1) + strings.yue + date.getDate() + strings.ri;
    },

    formatDateHour: function(number) {
        var date = new Date(number*1000);
        var dateFormat = date.getHours() + ":";
        if (date.getHours() < 10) {
            dateFormat = "0" + date.getHours() + ":";
        }
        if (date.getMinutes() < 10) {
            dateFormat += "0";
        }
        dateFormat += date.getMinutes();
        return dateFormat;
    },

    // fetch data
    _fetchData: function(refreshTime, type) {

        var bodyDic={};
        bodyDic.verifyToken = this.props.AccessToken;
        bodyDic.queueNum = '102';
        bodyDic.pageSize = String(loadDataLength);
        bodyDic.position = this.props.position;
        bodyDic.ts = refreshTime;
        bodyDic.didList = '["'+this.props.did+'"]';
        bodyDic.AppGuid = this.props.AppGuid;
        bodyDic.PhoneID = this.props.PhoneID;

        historyApi(bodyDic, (isSuccess, responseData, errorStatus)=>{
                ihealth.log('MainPage--_fetchData', 'isSuccess:'+isSuccess+'  responseData:'+JSON.stringify(responseData)+'  errorStatus:'+errorStatus);
                if (isSuccess) {
                    this.CallBackDeal(responseData, type);
                } else {
                    //错误处理,隐藏等待指示
                    MHPluginSDK.dismissTips();

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
    },

    CallBackDeal: function(callBackData, type) {
        if (viewUnmount === true) {
            return;
        }
        var Data = callBackData.ReturnValue.Data,
            i,
            j = -1,
            dataBlob = {},
            sectionIDs = [],
            rowIDs = [],
            dateWithYear,
            date,
            dateWithHour;

        if (type === isPullup) {
            dataBlob = data;
            sectionIDs = sections;
            rowIDs = rows;
            j = sectionNumber;
        }

        currentLoadDataLength = Data.length;
        ihealth.log("currentLoadDataLength", "currentLoadDataLength" + currentLoadDataLength);
        ihealth.log("currentLoadDataLength", "lastDateTime1" + lastDateTime);
        if (type !== isFirst && type !== isPulldown && lastDateTime !== "") {
            ihealth.log("currentLoadDataLength", "lastDateTime is exit");
            date = this.formatDate(lastDateTime);
        }
        for(i=0; i<currentLoadDataLength; i++) {

            if (i === currentLoadDataLength - 1) {
                lastDateTime =  Data[i].MeasureTime;
            }

            ihealth.log("currentLoadDataLength", "Time" + Data[i].MeasureTime);

            dateWithYear = this.formatDate(Data[i].MeasureTime);
            if (dateWithYear !== date) {
                date = dateWithYear;
                sectionIDs.push(dateWithYear);
                dataBlob[dateWithYear] = dateWithYear;
                j += 1;
                rowIDs[j] = [];
            }

            rowIDs[j].push(Data[i].DataID);
            dataBlob[dateWithYear + ':' + Data[i].DataID] = Data[i];
        }

        ihealth.log("currentLoadDataLength", "lastDateTime2" + lastDateTime);
        data = dataBlob;
        sections = sectionIDs;
        rows = rowIDs;
        sectionNumber = j;
        ihealth.log("currentLoadDataLength", sectionIDs);
        ihealth.log("currentLoadDataLength", rowIDs);

        // set state
        this.setState({
            dataSource : this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
            dataSourceCopy : this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
            loaded     : true
        });
        ihealth.log("currentLoadDataLength", type);

        switch(type){
            case 1: {
                break;
            }
            case 2: {
                this.list.hideHeader();
                break;
            }
            case 3: {
                this.list.hideFooter();
                break;
            }
            default : {
                ihealth.log("currentLoadDataLength", "数据加载类型错误");
                break;
            }
        }

        MHPluginSDK.dismissTips();
    },

    render: function() {
        if(!this.state.loaded) {
            return this.renderLoadingView();
        }

        return this.renderListView();
    },

    renderPressureRankImage: function(highP, lowP) {
        var level = bpDataLevel(highP, lowP);
        var imageName = "";
        switch(level) {
            case '1':{  //重度
                imageName = "serious.png"
                break;
            }
            case '2':{
                imageName = "moderate.png"
                break;
            }
            case '3':{
                imageName = "mild.png"
                break;
            }
            case '4':{
                imageName = "littleHigh.png"
                break;
            }
            case '5':{
                imageName = "normal.png"
                break;
            }
            case '6':{  //理想
                imageName = "ideal.png"
                break;
            }
        }
        return (
            <Image style={styles.rowImage} source={{isStatic:!this.state.devMode, uri:this.state.basePath + imageName}} />
        )
    },

    renderLoadingView: function() {
        return (
            <View style={styles.header}>
                <Text style={styles.headerText}>User List</Text>
                <View style={styles.container}>
                    <ActivityIndicatorIOS
                        animating={!this.state.loaded}
                        style={[styles.activityIndicator, {height: 80}]}
                        size="large" />
                </View>
            </View>
        )
    },

    formatData: function(HighP, LowP) {
        var str = HighP + '/' + LowP;
        return str;
    },

    onInfinite() {
        ihealth.log("onInfinite", '上拉刷新开始');
        this.state.loaded = false;
        ihealth.log("onInfinite", "上拉刷新最后时间戳－－－" + lastDateTime);
        this._fetchData(lastDateTime, isPullup);
        // this.setTimeout(()=>{
        //   this.list.hideFooter();
        // }, 1000);
    },

    loadedAllData() {
        return currentLoadDataLength < loadDataLength;
        // return this.data.index >= this.data.maxIndex||this.data.index===0;
    },

    onRefresh() {
        ihealth.log("onRefresh", '下拉刷新开始');
        this.state.loaded = false;
        this._fetchData("0", isPulldown);
        // this.setTimeout(()=>{
        //   this.list.hideHeader();
        // }, 1000);
    },

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    },

    hideModal(){
        this.setState({
            visible: false
        });
    },

    _alertView_SUCCESS(height){
        if(height){
            return(
                <View style={{
                   position:'absolute',
                   top:0,
                   left:0,
                   height:height,
                   width:width,
                   backgroundColor: 'rgba(111,111,111,.3)',
                   alignItems:'center',
                   //justifyContent:'center'
                 }}>

                    <Animated.View style={[{
                         top:239,
                         backgroundColor: 'white',
                         borderRadius:5,
                         padding:10
                    }]}>
                        <Image style={{marginLeft:0, marginTop:0, width:160, height:109}} source={{uri:MHPluginSDK.basePath+'iHealthSuccess.png'}} />
                        <Text style={{position:'absolute', top:85, color:'#666666', left:57, fontSize:16}}>删除成功</Text>
                    </Animated.View>

                </View>
            )
        }else{
            return(
                <View>
                </View>
            )
        }
    },

    _alertView_FAILED(height){
        if(!height){
            return(
                <View style={{
                   position:'absolute',
                   top:0,
                   left:0,
                   height:height,
                   width:width,
                   backgroundColor: 'rgba(111,111,111,.3)',
                   alignItems:'center',
                   //justifyContent:'center'
                 }}>

                    <Animated.View style={[{
                         top:239,
                         backgroundColor: 'white',
                         borderRadius:5,
                         padding:10
                    }]}>
                        <Image style={{marginLeft:0, marginTop:0, width:160, height:109}} source={{uri:MHPluginSDK.basePath+'iHealthSuccess.png'}} />
                        <Text style={{position:'absolute', top:85, color:'#666666', left:27, fontSize:16}}>删除失败请重试</Text>
                    </Animated.View>

                </View>
            )
        }else{
            return(
                <View>
                </View>
            )
        }
    },

    renderListView: function() {
        return (
            <View style={styles.container}>
                <View style={{marginTop:0, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                </View>
                <RefreshInfiniteListView
                    ref = {(list) => {this.list= list}}
                    dataSource = {this.state.dataSource}
                    style      = {{marginLeft:0}}
                    renderRow  = {this.renderRow}
                    onRefresh = {this.onRefresh}
                    onInfinite = {this.onInfinite}
                    initialListSize={12}
                    loadedAllData={this.loadedAllData}
                    scrollEventThrottle={10}
                    renderSectionHeader = {this.renderSectionHeader} />

                {/*编辑血压数据时下方的按键*/}

                {(this.state.successFlag)?(
                    <View style={{
                       position:'absolute',
                       top:0,
                       left:0,
                       height:height,
                       width:width,
                       backgroundColor: 'rgba(111,111,111,.3)',
                       alignItems:'center'
                     }}>
                        <View style={[{
                             top:height/2-70-55,
                             backgroundColor: 'white',
                             borderRadius:10,
                             padding:10
                          }]}>
                            <Image style={{marginLeft:0, marginTop:0, width:160, height:109}} source={{uri:MHPluginSDK.basePath+'iHealthSuccess.png'}} />
                            <Text style={{position:'absolute', top:85, color:'#666666', left:57, fontSize:16}}>删除成功</Text>
                        </View>
                    </View>
                ):(
                    <View>
                    </View>
                )}

                {(this.state.failedFlag)?(
                    <View style={{
                       position:'absolute',
                       top:0,
                       left:0,
                       height:height,
                       width:width,
                       backgroundColor: 'rgba(111,111,111,.3)',
                       alignItems:'center'
                     }}>
                        <View style={[{
                         top:239,
                         backgroundColor: 'white',
                         borderRadius:10,
                         padding:10
                        }]}>
                            <Image style={{marginLeft:0, marginTop:0, width:160, height:109}} source={{uri:MHPluginSDK.basePath+'iHealthFailed.png'}} />
                            <Text style={{position:'absolute', top:85, color:'#666666', left:33, fontSize:16}}>删除失败请重试</Text>
                        </View>
                    </View>
                ):(
                    <View>
                    </View>
                )}

                <View style={{marginBottom: 0, height:this.state.height, backgroundColor:'#f8f8f8'}}>
                    <View style={styles.separator} />
                    {/*删除和全选按钮*/}
                    <View style={{flexDirection:'row', flex:1}}>
                        <TouchableWithoutFeedback style={{flex:1}} underlayColor='#838383' onPress={
                            ()=>{
                                if(this.state.selectEditBPDataButton == '全选'){
                                    this.setState({selectEditBPDataButton:'取消全选', deleteDataArr:[], deleteButtonColor:'rgba(255,102,51,0.5)'});
                                    //清空
                                    if(this.state.dataSource.rowIdentities.length>0){
                                        for(var n=0; n<this.state.dataSource.rowIdentities.length; n++){
                                            for(var m=0; m<this.state.dataSource.rowIdentities[n].length; m++){
                                                var dataID = this.state.dataSource.rowIdentities[n][m];
                                                var index = this.state.deleteDataArr.indexOf(dataID);

                                                if(index == -1){
                                                    this.state.deleteDataArr.push(dataID);

                                                }else{
                                                    this.state.deleteDataArr.splice(index,1);
                                                }
                                            }
                                        }
                                    }

                                    //刷新listviewUI
                                    this.setState({
                                        dataSource : this.state.dataSourceCopy,
                                        loaded     : true,
                                        deleteButtonColor:'rgba(255,102,51,1.0)'
                                    });
                                }else{
                                    this.setState({selectEditBPDataButton:'全选', deleteDataArr:[], deleteButtonColor:'rgba(255,102,51,0.5)'});
                                }
                            }}>
                            <View style={{flex:1, justifyContent:'center', backgroundColor:'#ffffff'}}>
                                <Text style={{paddingLeft:15, width:100, fontSize:this.state.height-32, color:'#FF6633'}}>{this.state.selectEditBPDataButton}</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <View style={{flex:1, backgroundColor:'#ffffff'}}>
                        </View>

                        <TouchableWithoutFeedback style={{flex:1}} underlayColor='#838383' onPress={()=>{
                                //调用删除数据的接口
                                (this.state.deleteDataArr.length!=0)?this._deleteBPDataAlert():null
                            }}>
                            <View style={{justifyContent:'center', alignItems:'flex-end', flex:1, backgroundColor:'#ffffff'}}>
                                <Text style={{paddingRight:15, width:100, textAlign:'right', fontSize:this.state.height-32, color:this.state.deleteButtonColor}}>删除</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>

            </View>
        )
    },

    //删除血压数据的实际操作
    _deleteBPData(arr){
        var deleteArr=[];
        var bodyDic={};

        for(var i=0; i<arr.length; i++){

            var bpObj={
                "data_id": arr[i]+'',
                "take_pill": 0+'',
                "mood": 0+'',
                "change_type": 0+'',
            };
            deleteArr.push(bpObj);
        }

        bodyDic.dataArr = deleteArr;
        bodyDic.sid = '102';
        bodyDic.AppGuid = this.props.AppGuid;
        bodyDic.PhoneID = this.props.PhoneID;

        //删除数据arr为空
        //打开lodding
        if(deleteArr.length>0){
            //添加loading页面
            MHPluginSDK.showLoadingTips('');
            deleteBPData(bodyDic, (isSuccess, responseData, errorStatus)=>{
                    ihealth.log('HistoryListView--deleteBPData', 'isSuccess:'+isSuccess+'  responseData:'+JSON.stringify(responseData)+'  errorStatus:'+errorStatus);
                    if (isSuccess) {

                        //重新请求一次数据
                        viewUnmount = false;
                        this._fetchData("0", isFirst);

                        MHPluginSDK.dismissTips();
                        //提示成功
                        this.setState({successFlag:true});
                        var thar=this;
                        setTimeout(function(){
                            thar.setState({successFlag:false, deleteButtonColor:'rgba(255,102,51,0.5)'})
                        }, 1000);

                    } else {
                        //错误处理,隐藏等待指示
                        MHPluginSDK.dismissTips();

                        //提示失败
                        this.setState({failedFlag:true});
                        var thar=this;
                        setTimeout(function(){
                            thar.setState({failedFlag:false, deleteButtonColor:'rgba(255,102,51,0.5)'})
                        }, 1000);

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
    },

    //弹出提示确定提醒是否删除数据
    _deleteBPDataAlert: function(){
        Alert.alert(
            '数据删除后, 将无法恢复, 确定删除?',
            null,
            [
                {text: '取消', onPress: () => console.log('OK Pressed!')},
                {text: '确定', onPress: () => {this._deleteBPData(this.state.deleteDataArr)}}
            ]
        )
    },

    renderSectionHeader: function(sectionData, sectionID) {
        return (
            <View style={styles.section}>
                <Text style={styles.text}>{sectionID}</Text>
            </View>
        );
    },

    renderRow : function (rowData, sectionID, rowID) {

        var index = this.state.deleteDataArr.indexOf(rowData.DataID);
        var imageUrl;
        if(index == -1){
            imageUrl = this.state.ihealthNoSelectedUrl;
        }else{
            imageUrl = this.state.ihealthSelectedUrl;
        }

        //alert('alert:'+imageUrl);

        this.state.ihealthButtonUrl = MHPluginSDK.basePath + (rowData['isRemind']?'ihealthSelected.png' : 'ihealthNoSelected.png');

        return (
            <View style={styles.fatherFindTouchable}>
                <TouchableOpacity onPress={
                    this.test(this.state.height, rowID, BPResultDetail, strings.BloodPressureOutcomeDetails, rowData)
                  } style={styles.fatherFindTouchable}>

                    <View style={{marginLeft:0, width:this.state.height, height: 60, backgroundColor:'#ffffff'}}>
                        <Image style={{marginLeft:12, marginTop:18, width:this.state.height-26, height:24}} source={{isStatic:!this.state.devMode, uri:imageUrl}} />
                        <View style={{height: 1,alignSelf: 'stretch',backgroundColor: '#e0e0e0',marginLeft:0,marginRight: -10,marginTop:17}} />
                    </View>

                    <View style={{marginLeft:0, flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingLeft: 10, height: 60, borderTopColor: '#fff', borderLeftColor: '#fff', borderRightColor: '#fff', borderBottomColor: '#E0E0E0', borderWidth: 1}}>
                        <Text style={styles.rowTime}>{this.formatDateHour(rowData.MeasureTime)}</Text>
                        <View style={styles.containerFlex}>
                            {this.renderPressureRankImage(rowData.HighP, rowData.LowP)}
                        </View>
                        <Text style={styles.rowText}>{this.formatData(rowData.HighP, rowData.LowP)}</Text>
                        <Text style={styles.rowUnit}>mmHg</Text>
                        <View style={styles.containerFlexEnd}>
                            <Image style={styles.rowArrow} source={{isStatic:!this.state.devMode, uri:this.state.basePath + "sub_arrow.png"}} />
                        </View>
                    </View>

                </TouchableOpacity>
            </View>
        );
    },

    test: function(height, rowID, title, type, data) {
        if (height > 0) {
            return (()=>this._onOpenSubPage(data));
        } else {
            return (this.onOpenSubPage(title, type, data).bind(this));
        }
    },

    //处理删除数据arr
    _onOpenSubPage: function(data){
        var index = this.state.deleteDataArr.indexOf(data.DataID);
        if(index == -1){
            this.state.deleteDataArr.push(data.DataID);
        }else{
            this.state.deleteDataArr.splice(index,1);
        }

        if(this.state.deleteDataArr.length==0){
            this.setState({
                dataSource : this.state.dataSourceCopy,
                loaded     : true,
                deleteButtonColor:'rgba(255,102,51,0.5)'
            });
        }else{
            this.setState({
                dataSource : this.state.dataSourceCopy,
                loaded     : true,
                deleteButtonColor:'rgba(255,102,51,1.0)'
            });
        }
    },

    onOpenSubPage: function(subPageComponent,subPageTitle,passPropsClick) {

        function subPage() {
            this.props.navigator.push({
                title: subPageTitle,
                component: subPageComponent,
                leftButtonIcon: {isStatic:true, uri:MHPluginSDK.uriNaviBackButtonImage, scale:(PixelRatio.get() == 3)?3:2},
                onLeftButtonPress: () => {
                    this.props.navigator.pop();
                    this.onRefresh();
                },
                passProps: {
                    bpResultData: passPropsClick,
                    AccessToken : this.props.AccessToken,
                    AppGuid : this.props.AppGuid,
                    PhoneID : this.props.PhoneID,
                },
            });
        }
        return subPage;
    },
});

var styles = StyleSheet.create({
    button: {
        backgroundColor: '#ccc',
        borderRadius: 5,
        padding: 10
    },
    close: {
        position: 'absolute',
        right: 20,
        top: 40,
        backgroundColor: 'red'
    },
    modalContainer: {
        height: 100,
        width: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue'
    },
    container: {
        marginTop: 64 + APPBAR_MARGINTOP,
        flex: 1,
        backgroundColor: '#edeeef'
    },
    activityIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        paddingTop: 25
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff'
    },
    text: {
        color: '#000',
        paddingLeft: 10,
        paddingHorizontal: 8,
        fontSize: 16
    },
    rowStyle: {

    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    userName: {
        flex: 1,
        justifyContent: "center",
    },
    rowTime: {
        flex : 2,
        color: '#212121',
        fontSize: 16,
        marginLeft: 5,
    },
    rowImage: {
        flex: 1,
        width: 15,
        height: 15,
        marginLeft: 5,
    },
    rowText: {
        flex: 3,
        color: '#212121',
        fontSize: 16,
        marginLeft: 0,
    },
    rowUnit: {
        flex: 2,
        color: '#212121',
        fontSize: 16,
        marginLeft: 5,
    },
    rowArrow: {
        flex: 1,
        width: 15,
        height: 15,
        marginRight: 15,
    },
    subText: {
        fontSize: 14,
        color: '#757575'
    },
    section: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: 40,
        backgroundColor: '#eee',
    },
    containerFlex: {
        flex: 2
    },
    containerFlexEnd: {
        justifyContent: 'flex-end',
    },
    fatherFindTouchable: {
        flex: 1,
        flexDirection:'row',
        backgroundColor: '#ffffff',
    },
    separator: {
        height: 0.5,
        alignSelf: 'stretch',
        backgroundColor: '#dddddd',
        marginLeft:0,
        marginRight: 0,
    }
});

var route = {
    key: 'HistoryListView',
    title: strings.DadsBloodPressure,
    component: HistoryListView,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (
            <View
                style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, justifyContent:'center', alignItems:'center'}}>

                <Text key='edit'
                      style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, color:'#FF6633', fontSize:18, paddingLeft:10, paddingTop:10}}
                      onPress={() => {
                          DeviceEventEmitter.emit('EditBPDataListView_Edit', route);
                      }}>

                    {strings.编辑}
                </Text>
            </View>
        );
    }
}

module.exports = {
    component: HistoryListView,
    route: route,
}

