var packageInfoData = require('../packageInfo.json');
var ihealth = require('./ihealth');
var MHPluginSDK = require('NativeModules').MHPluginSDK;

function getQRcode(bodyDic, callBack)
{
	var timer;
    var timeoutFlag = false;
    var bodyStr='';

    //启动定时器,登录接口设置60s超时
    timer = this.setTimeout(()=>{
       timeoutFlag = true;

       ihealth.log("getQRcode", '数据下载-----网络访问超时！！！');
       callBack(false, '超时错误', '102');
     }, 15000);

    var configureInfo={
      'ApiType':'deviceGetQRCode',
      'deviceModel':packageInfoData.models,
      'sc':'7c789858c0ec4ebf8189ebb14b6730a5',
      'sv':'999027b543041d9h93b607557638111e',
      'AppVersion':'MiHome_i_1.0.1',
      'PhoneName':MHPluginSDK.systemInfo.mobileModel,
      'PhoneOS':MHPluginSDK.systemInfo.sysName + MHPluginSDK.systemInfo.sysVersion,
      'PhoneLanguage':'zh',
      'PhoneRegion':'CN',
      'Token':MHPluginSDK.userId+'@mi',
      'Un':MHPluginSDK.userId+'@mi',

      'VerifyToken' : bodyDic.verifyToken,
      'QueueNum' : bodyDic.queueNum,
      'UploadData' : bodyDic.UploadData,
      'AppGuid' : bodyDic.AppGuid,
      'PhoneID' : bodyDic.PhoneID
    };
    ihealth.log("getQRcode--configureInfo", JSON.stringify(configureInfo));
    MHPluginSDK.callThirdPartyAPI("10021",[],configureInfo, (code,response) => {
        // this.clearTimeout(timer);
        ihealth.log("getQRcode--code:" + code,'response:' + JSON.stringify(response));

        if (!timeoutFlag && code === 0 && response) {
          {
              ihealth.log('getQRcode', '无超时');
              //取消登录超时
              this.clearTimeout(timer);

              var responseData = JSON.parse(JSON.parse(response).result);
              ihealth.log("getQRcode--:", JSON.stringify(responseData));

              switch(responseData.ResultMessage){
                case '100':{
                  callBack(true, responseData, '100');
                  break;
                  
                }
                case '208':{
                  //接收服务器返回的正确地址
                  callBack(false, '服务器地址错误', '208');
                  break;
                }
                case '212':{
                  //刷新token
                  callBack(false, 'token失效', '212');
                  break;
                }
                case '221':
                case '218':{
                  //令牌错误或刷新令牌错误，需要重新登录获取令牌和刷新令牌
                  callBack(false, '令牌错误', '221');
                  break;
                }
                default:{
                  //其他错误
                  callBack(false, '其他错误', '500');
                }
              }
          }
        }
    });

/*
    //获取请求配置信息
     var webSiteStr = 'https://api.ihealthlabs.com.cn:8443/Bpm1Api/GetQRcode.ashx';
     bodyStr = toQueryString({
        'sc':'7c789858c0ec4ebf8189ebb14b6730a5',
        'sv':'999027b543041d9h93b607557638111e'
     });
     bodyStr  = bodyStr+'&'+configureInfo();
     bodyStr  = bodyStr+'&'+toQueryString({
       'VerifyToken' : bodyDic.verifyToken,
       'QueueNum' : bodyDic.queueNum,
       'UploadData' : bodyDic.UploadData,
     });
     ihealth.log("webSiteStr", webSiteStr);
     ihealth.log("bodyStr", bodyStr);
    fetch(webSiteStr, {
        method: 'post',
        body: bodyStr,
      })
      .then((response) => response.json())
      .then((responseData) => {

          if (!timeoutFlag)
          {
              //取消登录超时
              this.clearTimeout(timer);
              ihealth.log("getQRcode", JSON.stringify(responseData));

              switch(responseData.ResultMessage){
              	case '100':{
              		callBack(true, responseData, '100');
              		break;
              	}
              	case '208':{
              		//接收服务器返回的正确地址
                  	callBack(false, '服务器地址错误', '208');
              		break;
              	}
              	case '212':{
              		//刷新token
                  	callBack(false, 'token失效', '212');
              		break;
              	}
              	case '221':
              	case '218':{
              		//令牌错误或刷新令牌错误，需要重新登录获取令牌和刷新令牌
                  	callBack(false, '令牌错误', '221');
              		break;
              	}
              	default:{
              		//其他错误
                  callBack(false, '其他错误', '500');
              	}
              }
              // if (responseData.ResultMessage == '100') {
              //     callBack(true, responseData, '100');
              // }
              // else if (responseData.ResultMessage == '208') {
              //     //接收服务器返回的正确地址
              //     callBack(false, '服务器地址错误', '208');
              // }
              // else if (responseData.ResultMessage == '212') {
              //     //刷新token
              //     callBack(false, 'token失效', '212');
              // }
              // else if ((responseData.ResultMessage == '221') || (responseData.ResultMessage == '218')) {
              //     //令牌错误或刷新令牌错误，需要重新登录获取令牌和刷新令牌
              //     callBack(false, '令牌错误', '221');
              // }
              // else {
              //     //其他错误
              //     callBack(false, '其他错误', '500');
              // }
          }
      });
*/
}

module.exports = getQRcode;
