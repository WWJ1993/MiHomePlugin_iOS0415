
var configureInfo = require('./configureInfo');
var ihealth = require('../CommonModules/ihealth');

var MHPluginSDK = require('NativeModules').MHPluginSDK;

function toQueryString(obj) {
    return obj ? Object.keys(obj).sort().map(function (key) {
        var val = obj[key];
        if (Array.isArray(val)) {
            return val.sort().map(function (val2) {
                return encodeURI(key) + '=' + encodeURI(val2);
            }).join('&');
        }

        return encodeURI(key) + '=' + encodeURI(val);
    }).join('&') : '';
}

function userThirdPartyLogin(bodyDic, callBack)
{
    var timeoutFlag = false;

    //启动定时器,登录接口设置60s超时
    timer = this.setTimeout(()=>{

       timeoutFlag = true;

       ihealth.log("userThirdPartyLogin", '用户验证-----网络访问超时！！！');
       callBack(false, '超时错误', '102');

     }, 15000);


     //获取请求配置信息
     var configureInfo={
      'ApiType':'registerthird',
      'sc':'7c789858c0ec4ebf8189ebb14b6730a5',
      'sv':'3e26d033c9d94e8b925caea86f4b2d39',
      'AppVersion':'MiHome_i_1.0.1',
      'AppGuid':bodyDic.AppGuid,
      'PhoneID':bodyDic.PhoneID,
      'PhoneName':MHPluginSDK.systemInfo.mobileModel,
      'PhoneOS':MHPluginSDK.systemInfo.sysName + MHPluginSDK.systemInfo.sysVersion,
      'PhoneLanguage':'zh',
      'PhoneRegion':'CN',
      'Token':MHPluginSDK.userId+'@mi',
      'Un':MHPluginSDK.userId+'@mi',
      'QueueNum' : bodyDic.queueNum,
      'client_id':'',
      'client_secret':'',
      'Pw' : bodyDic.pw
    };

    ihealth.log("userThirdPartyLogin configureInfo:", JSON.stringify(configureInfo));
    MHPluginSDK.callThirdPartyAPI("10021",[],configureInfo, (code,response) => {

      ihealth.log("registerthird code",code);
      ihealth.log("registerthird", JSON.stringify(response));

        if (!timeoutFlag)
        {
            ihealth.log('userThirdPartyLogin', '无超时');
            this.clearTimeout(timer);

            //code==0,请求成功
            if((code == 0) && response){

                var responseData = JSON.parse(JSON.parse(response).result);

                if (responseData.ResultMessage == '100') {
                    callBack(true, responseData, '100');
                }
                else if (responseData.ResultMessage == '208') {
                    //接收服务器返回的正确地址
                    callBack(false, '服务器地址错误', '208');
                }
                else if (responseData.ResultMessage == '212') {
                    //刷新token
                    callBack(false, 'token失效', '212');
                }
                else if ((responseData.ResultMessage == '221') || (responseData.ResultMessage == '218')) {
                    //令牌错误或刷新令牌错误，需要重新登录获取令牌和刷新令牌
                    callBack(false, '令牌错误', '221');
                }
                else {
                    //其他错误
                    callBack(false, '其他错误', '500');
                }
            }
            else {
                //其他错误
                callBack(false, '其他错误', '500');
            }
        }
    });

/*
     webSiteStr = 'https://api.ihealthlabs.com.cn:8443/bp3mapi/v2/registerthird_return.htm';
     bodyStr = toQueryString({
        'sc':'7c789858c0ec4ebf8189ebb14b6730a5',
        'sv':'3e26d033c9d94e8b925caea86f4b2d39',
        'client_id':'',
        'client_secret':''
     });
     bodyStr  = bodyStr+'&'+configureInfo('',);
     bodyStr  = bodyStr+'&'+toQueryString({
        'Pw' : bodyDic.pw,
        'QueueNum' : bodyDic.queueNum,
        'AppGuid' : bodyDic.AppGuid,
        'PhoneID' : bodyDic.PhoneID
     });

    ihealth.log('userThirdPartyLogin', bodyStr);

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
              ihealth.log("userThirdPartyLogin", JSON.stringify(responseData));

              if (responseData.ResultMessage == '100') {
                  callBack(true, responseData, '100');
              }
              else if (responseData.ResultMessage == '208') {
                  //接收服务器返回的正确地址
                  callBack(false, '服务器地址错误', '208');
              }
              else if (responseData.ResultMessage == '212') {
                  //刷新token
                  callBack(false, 'token失效', '212');
              }
              else if ((responseData.ResultMessage == '221') || (responseData.ResultMessage == '218')) {
                  //令牌错误或刷新令牌错误，需要重新登录获取令牌和刷新令牌
                  callBack(false, '令牌错误', '221');
              }
              else {
                  //其他错误
                  callBack(false, '其他错误', '500');
              }
          }
      })
    */
}
module.exports = userThirdPartyLogin;
