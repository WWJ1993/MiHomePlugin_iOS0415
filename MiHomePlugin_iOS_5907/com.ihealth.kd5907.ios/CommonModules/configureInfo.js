
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var ihealth = require('../CommonModules/ihealth');
// var packageInfoData = require('../packageInfo.json');

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

function configureInfo(Port_Type)
{
    var configureInfoDic={};

    switch (Port_Type) {
      case 'getDeviceConfig':
        {
            configureInfoDic.sc = '7c789858c0ec4ebf8189ebb14b6730a5';
            configureInfoDic.sv = '388072b443041d4b93b6570576318a8e';
        }
        break;

      case 'setDeviceConfig':
        {

            configureInfoDic.sc = '7c789858c0ec4ebf8189ebb14b6730a5';
            configureInfoDic.sv = '399027b443041d4b93b6570576318a8e';
        }
        break;

      case 'BPM1Bind':
        {
          configureInfoDic.sc = '7c789858c0ec4ebf8189ebb14b6730a5';
          configureInfoDic.sv = '388072b543041d9h93b6075576381a0e';
        }
        break;

      case 'BPM1_UnBind':
        {
          configureInfoDic.sc = '7c789858c0ec4ebf8189ebb14b6730a5';
          configureInfoDic.sv = '388072b543041d9h93b6075576381a0e';
        }
        break;

      case 'BPM1Data_Update':
        {
          configureInfoDic.sc = '7c789858c0ec4ebf8189ebb14b6730a5';
          configureInfoDic.sv = '39907b2543xx1d9h93b6075576381a0e';
        }
        break;

      case 'BPM1Data_DownLoad':
        {
          configureInfoDic.sc = '7c789858c0ec4ebf8189ebb14b6730a5';
          configureInfoDic.sv = '39907b2543041d9h93b6075576381a0e';
        }
        break;

      case 'register_third':
        {
          configureInfoDic.sc = '7c789858c0ec4ebf8189ebb14b6730a5';
          configureInfoDic.sv = '73f1fc2d0fc2472c8e1bb2b7a5a4638d';
        }
        break;
      case 'Interprebp_download':
        {
          configureInfoDic.sc = '7c789858c0ec4ebf8189ebb14b6730a5';
          configureInfoDic.sv = 'c7d2bbd8c0ec4e9493a4a97bc9bf0afb';
        }
        break;
      default:
          ihealth.log("configureInfo", 'sc和sv没有');
        break;
    }


    configureInfoDic.AppVersion = 'MiHome_i_1.0.1';
    configureInfoDic.PhoneName = MHPluginSDK.systemInfo.mobileModel;
    configureInfoDic.PhoneOS = MHPluginSDK.systemInfo.sysName + MHPluginSDK.systemInfo.sysVersion;
    configureInfoDic.PhoneLanguage = 'zh';
    configureInfoDic.PhoneRegion = 'CN';
    configureInfoDic.Token = MHPluginSDK.userId+'@mi';
    configureInfoDic.Un = MHPluginSDK.userId+'@mi';

    return toQueryString(configureInfoDic);
}

module.exports = configureInfo;
