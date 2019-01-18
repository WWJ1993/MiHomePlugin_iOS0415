var ihealth = require('../CommonModules/ihealth');

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

function userBpmUnBind( userUN,        /* 用户名：12345678@mi */
                        appVersion,    /* App版本：BP1.1.0 */
                        appGuid,       /* appGuid ：205C342F-2FB3-4485-9B26-00714F05661E */
                        phoneID,       /* PhoneID：BA587BAD-093F-4FFA-B708-71B86793646F */
                        phoneName,     /* phoneName：iPhone */
                        phoneOS,       /* PhoneOS：iPhone OS 9.2 */
                        phoneLanguage, /* PhoneLanguage：zh */
                        phoneRegion,   /* phoneRegion：US */
                        verifyToken,   /* verifyToken */
                        queueNum,      /* queueNum： */
                        mac,           /* mac：设备ID */
                        uploadData,    /* uploadData： */
                        callBack)
{
  fetch("https://api.ihealthlabs.com.cn:8443/Bpm1Api/BPM1_UnBind.htm", {
        method: 'post',
        body: toQueryString({
          'sc': '7c789858c0ec4ebf8189ebb14b6730a5',
          'sv': '388072b543041d9h93b6075576381a0e',
          'AppVersion': appVersion,
          'AppGuid': appGuid,
          'PhoneID': phoneID,
          'PhoneName': phoneName,
          'PhoneOS': phoneOS,
          'PhoneLanguage': phoneLanguage,
          'PhoneRegion': phoneRegion,
          'Token': userUN,
          'VerifyToken': verifyToken,
          'QueueNum': queueNum,
          'Un': userUN,
          'UploadData': uploadData,
        })
      })

      .then((response) => response.json())
      .then((responseData) => {

            if (responseData.ResultMessage == '100') {
                ihealth.log("userBpmUnBind", responseData);
                callBack(true, responseData);
            }
            else {
                ihealth.log("userBpmUnBind", responseData);
                callBack(false, responseData);
            }
      })
}

module.exports = userBpmUnBind;
