'use strict';

var React = require('react-native');
var strings = require('../CommonModules/ihealthLocalizedString');
var LocalizedStrings = require('../CommonModules/LocalizedStrings');
var BPM1MoreHelp = require('./BPM1MoreHelp');
var ihealth = require('../CommonModules/ihealth');
var ImageButton = require('../CommonModules/ImageButton');
var Aes = require('../CommonModules/Aes');
var Dimensions = require('Dimensions');
const { height,width } = Dimensions.get('window');

var {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Component,
  DeviceEventEmitter,
  Platform,
} = React;

var MHPluginSDK = require('NativeModules').MHPluginSDK;

let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}

class MoreMenu extends Component {
  constructor(props, context) {
    super(props, context);

    var string = this.interceptionStringsWithCount(MHPluginSDK.deviceName, 20);

    this.state = {
      deviceNameStr:string
    };
  }

  render() {
    var rowChangeDeviceName = this._createChangeDeviceNameRow(strings.重命名);
    var rowShareDevicePage =  this._createMenuRowA(strings.设备共享);
    var rowDeleteDevice = this._createMenuRowA(strings.解除连接);
    var rowDeviceUpgrade = this._createMenuRowA(strings.检查固件更新);
    // var rowFeedBack = this._createMenuRow(BPM1MoreHelp);
    var rowFeedBack =  this._createFeedBackRow(strings.feedback);

    return (
        <View style={styles.containerAll} >
          <View style={{marginTop:APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
          </View>
          <View style={styles.containerMenu}>
            {/*重命名*/}
            {rowChangeDeviceName}
            {/*设备共享*/}
            {rowShareDevicePage}
            {/*检查固件更新*/}
            {rowDeviceUpgrade}
            {/*解除连接*/}
            {rowDeleteDevice}
            {/*反馈*/}
            {rowFeedBack}
          </View>
        </View>
    );
  }

  _component(component){
    var comp;
    switch (component){
      case strings.重命名:
          comp = MHPluginSDK.openChangeDeviceName();
        break;
      case strings.设备共享:
          comp = MHPluginSDK.openShareDevicePage();
        break;
      case strings.解除连接:
        comp = MHPluginSDK.openDeleteDevice();
        break;
      case strings.检查固件更新:
        comp = MHPluginSDK.openDeviceUpgradePage();
        break;
      case '反馈':
        comp = MHPluginSDK.openFeedback();
        break;
      default:
        break;
    }
    return comp
  }

  interceptionStringsWithCount(string, count){
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

  componentDidMount(){

    this._deviceNameChangedListener = DeviceEventEmitter.addListener(MHPluginSDK.deviceNameChangedEvent, (event) => {

      var str=this.interceptionStringsWithCount(event.newName, 20);
      this.setState({deviceNameStr: str});
        ihealth.log('componentDidMount----'+str);
    });
  }

  componentWillUnmount() {
    this._deviceNameChangedListener.remove();

  }

  //设备重命名
  _createChangeDeviceNameRow(component){
    return [
      (<TouchableWithoutFeedback key={"touch_"+component} style={styles.rowContainer} underlayColor='#838383' onPress={()=>{this._component(component)}}>
        <View style={styles.rowContainer}>
          <View style={{flex:1, flexDirection: 'row'}}>
            <Text style={{fontSize: 16, alignItems: 'center', alignSelf: 'center', color: '#333333', flex: 1, marginLeft:24}}>{component}</Text>

            <View style={{flex: 4, alignSelf:'center', justifyContent:'flex-end', flexDirection: 'row'}}>
              <Text style={{textAlign:'right', fontSize: 13, color: 'rgba(0,0,0,0.5)', justifyContent:'center', marginRight: 10}}>{this.state.deviceNameStr}</Text>
              <Image style={{ width: 15, height: 15, marginRight: 24}} source={this.props.app.sourceOfImage("sub_arrow.png")} />
            </View>

          </View>

        </View>
      </TouchableWithoutFeedback>),
      (<View key={"sep_"+component} style={styles.separator} />)
    ];
  }

  _createMenuRowA(component){
    return [
      (<TouchableHighlight key={"touch_"+component} style={{alignSelf:'stretch', flexDirection: 'row', height: 58}} underlayColor='#838383' onPress={()=>{this._component(component)}}>
        <View style={{flexDirection: 'row', flex: 1, height: 58}}>
          <Text style={{fontSize: 16, alignItems: 'center', alignSelf: 'center', color: '#333333', flex: 2, width: 200, marginLeft:24}}>{component}</Text>
          <View style={{flex: 1, justifyContent:'center', alignItems:'flex-end'}}>
            <Image style={{ width: 15, height: 15, marginRight: 24}} source={this.props.app.sourceOfImage("sub_arrow.png")} />
          </View>
        </View>
      </TouchableHighlight>),
      (<View key={"sep_"+component} style={styles.separator} />)
    ];
  }

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


  _createFeedBackRow(component) {
    return [
        (<TouchableHighlight key={"touch_"+component} style={styles.rowContainer} underlayColor='#838383' onPress={()=>MHPluginSDK.openFeedbackInput()}>
            <View style={{flexDirection: 'row', flex: 1, height: 58}}>

                <Text style={{fontSize: 16, alignItems: 'center', alignSelf: 'center', color: '#333333', flex: 2, width: 200, marginLeft:24}}>{component}</Text>

                <View style={{flex: 1, justifyContent:'center', alignItems:'flex-end'}}>
                    <Image style={{ width: 15, height: 15, marginRight: 24}} source={this.props.app.sourceOfImage("sub_arrow.png")} />
                </View>

            </View>

        </TouchableHighlight>),
        (<View key={"sep_"+component} style={styles.separator} />)
    ];
}

  _onOpenSubPage(subPageComponent) {
    function subPage() {
      this.props.navigator.push({
        ...subPageComponent.route,
        passProps: {
          message: 'amazing!',
        },
      });
    }
    return subPage;
  }

};

var styles = StyleSheet.create({
  containerAll: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#838383',
    marginTop: 64,
  },
  containerMenu: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    alignSelf: 'stretch',
  },
  rowContainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    //flex: 1,
    height: 58,
  },
  title: {
    fontSize: 16,
    alignItems: 'center',
    alignSelf: 'center',
    color: '#333333',
    //flex: 1,
    width: 200,
    marginLeft:24
  },
  subArrow: {
    position: 'absolute',
    width: 9,
    height: 17,
    marginTop: 17,
    marginLeft: 70,
  },
  deviceName:{
    position: 'absolute',
    color: '#333333',
    width: 100,
    height: 17,
    marginTop: 17,
    marginLeft: 90,
    fontSize: 16
  },
  separator: {
    height: 0.5,
    alignSelf: 'stretch',
    backgroundColor: '#dddddd',
    marginLeft:24,
    marginRight: 24,
  },
  voiceButton: {
    width: 55,
    height: 35,
    alignSelf: 'center',
  },
  voiceButton2: {
    width: 55,
    height: 35,
    marginLeft: 120,
    alignSelf: 'center',
  },
  voiceButtonContainer: {
    width: 55,
    height: 35,
    marginLeft: 120,
    alignSelf: 'center',
  }
});

// 打开更多菜单
var openAccessWeChat = function (navigator) {
  navigator.push(AccessWeChat.route);
};

var route = {
  key: 'MoreMenu',
  title: strings.UniversalSettings,
  component: MoreMenu,
  renderNavRightComponent: function(route, navigator, index, navState) {
    return (
      <View />
      )
  }
}

module.exports = {
  component: MoreMenu,
  route: route,
}
