/**
 * Created by guobo on 2018/05/28.
 */

'use strict';
var strings = require('../CommonModules/ihealthLocalizedString');
var React = require('react-native');
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var AgreementPage = require('./AgreementPage');
var PrivacyPage = require('./PrivacyPage');
var Dimensions = require('Dimensions');

const { height,width } = Dimensions.get('window');
var {
    StyleSheet,
    View,
    StatusBar,
    Platform,
    Navigator,
    TouchableHighlight,
    Text,
    Component,
    Image,
    Alert,
} = React;

let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}

class PrivacyAgreement extends Component {

    render() {
        var rowAgreementPage = this._createPageRow(AgreementPage);
        var rowPrivacyPage = this._createPageRow(PrivacyPage);
        

        return (
            <View style={styles.containerAll}>
                <View style={{marginTop:APPBAR_MARGINTOP, height: 0.5, width: width, backgroundColor: '#d0d0d0'}}>
                </View>
                <View style={styles.containerMenu}>
                    {/*使用条款*/}
                    {rowAgreementPage}
                    {/*隐私协议*/}
                    {rowPrivacyPage}
                   
                    <Text style={{marginTop:45, height: 50, width: width, backgroundColor: '#ffffff',fontSize: 14,color: '#EE2823',lineHeight:35,textAlign:'center',alignItems:'center'}} onPress={this._click}> {strings.RevokeTheTermsOfUseAndPrivacyPolicyAuthorization}
                    </Text>
                </View>
                
            </View>
        );
    }

    _createPageRow(component) {
        return [
            (<TouchableHighlight key={"touch_" + component.route.title} style={styles.rowContainer}
                                 underlayColor='#838383' onPress={this._onOpenSubPage(component).bind(this)}>

                <View style={{flexDirection: 'row', flex: 1, height: 58,backgroundColor: '#ffffff'}}>

                    <Text style={{fontSize: 16, alignItems: 'center', alignSelf: 'center', color: '#333333', flex: 2, width: 200, marginLeft:24}}>{component.route.title}</Text>

                    <View style={{flex: 1, justifyContent:'center', alignItems:'flex-end'}}>
                        <Image style={{ width: 15, height: 15, marginRight: 24}} source={this.props.app.sourceOfImage("sub_arrow.png")} />
                    </View>

                </View>


            </TouchableHighlight>),
            (<View key={"sep_" + component.route.title} style={styles.separator}/>)
        ];
    }
    _createMenuRowA(component){
        return [
          (<TouchableHighlight key={"touch_"+component} style={{alignSelf:'stretch', flexDirection: 'row', height: 58}} underlayColor='#838383' onPress={()=>{this._component(component)}}>
            <View style={{flexDirection: 'row', flex: 1, height: 58,backgroundColor: '#ffffff'}}>
              <Text style={{fontSize: 16, alignItems: 'center', alignSelf: 'center', color: '#333333', flex: 2, width: 200, marginLeft:24}}>{component}</Text>
              <View style={{flex: 1, justifyContent:'center', alignItems:'flex-end'}}>
                <Image style={{ width: 15, height: 15, marginRight: 24}} source={this.props.app.sourceOfImage("sub_arrow.png")} />
              </View>
            </View>
          </TouchableHighlight>),
          (<View key={"sep_"+component} style={styles.separator} />)
        ];
      }

      _click(){
        var comp;

        MHPluginSDK.loadInfoCallback(info=>{
          if (info!=null) {

           let saveAuth = info;
            console.log('saveAuth',saveAuth)
            if(saveAuth.ifAuth==1){
              saveAuth.ifAuth = 0;
              MHPluginSDK.saveInfo(saveAuth); 

            }
          }
      
        });

        if (strings.取消 == 'Cancle') {
          comp = MHPluginSDK.openDeleteDeviceWithCustomMessage(strings.撤销授权后设备会与您当前登陆的账号解除绑定并清除该设备之前存储在服务端的数据物理设备中存储的数据需要您进行人工本地物理重置后清除若设备支持您可以直接在设备上进行重置或参照隐私政策中的撤销授权进行重置上述数据撤销后均不可恢复若要重新使用设备需要您再次进行绑定并且重新授权); 
          
      } else {
        comp = MHPluginSDK.openDeleteDeviceWithCustomMessage('撤销授权后，设备会与您当前登录的账号解除绑定并清除该设备之前存储在服务端的数据；物理设备中存储的数据需要您进行人工本地物理重置后清除，若设备支持，您可以直接在设备上进行重置或参照\"隐私政策\"中的撤销授权进行重置，上述数据撤销后均不可恢复，若要重新使用设备，需要您再次进行绑定并且重新授权'); 
      }
        
        
        
      
      }
      _component(component){
        var comp;
        switch (component){
            case '撤销"使用条款和隐私政策"授权':
            comp = MHPluginSDK.openDeleteDeviceWithCustomMessage('撤销授权后，设备会与您当前登陆的账号解除绑定并清除该设备之前存储在服务端的数据；物理设备中存储的数据需要您进行人工本地物理重置后清除，若设备支持，您可以直接在设备上进行重置或参照\"隐私政策\"中的撤销授权进行重置，上述数据撤销后均不可恢复，若要重新使用设备，需要您再次进行绑定并且重新授权'); 
           
            //弹出提示框
            // Alert.alert(
            //            '确定撤销授权吗？',
            //            '撤销授权后，设备会与您当前登陆的账号解除绑定并清除该设备之前存储在服务端的数据；物理设备中存储的数据需要您进行人工本地物理重置后清除，若设备支持，您可以直接在设备上进行重置或参照\"隐私政策\"中的撤销授权进行重置，上述数据撤销后均不可恢复，若要重新使用设备，需要您再次进行绑定并且重新授权',
            //            [
            //              {text: '取消', onPress: () => {
                        
            //              }},
            //              {text: '确定', onPress: () => {
                        

            //                   comp = MHPluginSDK.openDeleteDeviceWithCustomMessage(11111); 
            //              }},
            //            ]
            //          )
            break;
          default:
            break;
        }
        return comp
      }
    
    //   interceptionStringsWithCount(string, count){
    //     var str=string;
    //     var charCount=0;
    //     var bytesCount=0;
    //     for (var i = 0; i < str.length; i++)
    //     {
    //       var c = str.charAt(i);
    //       var char2=false;
    
    //       charCount++;
    //       if (/^[\u0000-\u00ff]$/.test(c)) //匹配双字节
    //       {
    //         bytesCount += 1;
    //       }
    //       else
    //       {
    //         char2=true;
    //         bytesCount += 2;
    //       }
    
    //       if(bytesCount>count ){
    //         if(char2){
    //           str=str.substring(0,charCount-2);
    //         }else{
    //           str=str.substring(0,charCount-1);
    //         }
    //         str = str+'...'
    //         break;
    //       }
    //     }
    //     return str;
    //   }
    
    //   componentDidMount(){
    
    
    //     this._deviceCancelAuthorization = DeviceEventEmitter.addListener(MHPluginSDK. deviceCancelAuthorization,(event) => {
    //       var str=this.interceptionStringsWithCount(event.newName, 20);
    //       this.setState({deviceNameStr: str});
    //     });
    
    //   }

    //   componentWillMount() { 
    //     this._deviceCancelAuthorization = DeviceEventEmitter.addListener(MHPluginSDK. deviceCancelAuthorization, (event) => {

    //        var str=this.interceptionStringsWithCount(event.newName, 20);
    //        this.setState({deviceNameStr: str});
    //     });
    //   }
      
    //   componentWillUnmount() {
    //     this._deviceCancelAuthorization.remove();
    //   }
    
    
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
        backgroundColor: '#EFEFF0',
        alignSelf: 'stretch',
    },
    rowContainer: {
        // alignSelf: 'stretch',
        flexDirection: 'row',
        // flex: 1,
        height: 58,
    },
    title: {
        fontSize: 16,
        alignItems: 'center',
        alignSelf: 'center',
        color: '#333333',
        //flex: 1,
        width: 200,
        marginLeft:15
    },
    subArrow: {
        position: 'absolute',
        width: 15,
        height: 15,
        marginTop: 18,
        marginLeft: 170,
    },
    separator: {
        height: 0.5,
        alignSelf: 'stretch',
        backgroundColor: '#dddddd',
        marginLeft:15,
        marginRight: 15,
    },
});





var route = {
    key: 'PrivacyAgreement',
    title: strings.AgreementAndPolicy,
    component: PrivacyAgreement,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (
            <View />
        );
    }
}

module.exports = {
    component: PrivacyAgreement,
    route: route,
}
