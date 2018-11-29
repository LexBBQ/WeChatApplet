//app.js
App({
  //服务器的路径
  serverUrl:"http://lex.s3.natapp.cc",
  userInfo:null,
  //该函数为将用户信息存入手机的缓存中
  setGlobalUserInfo:function(user){
    wx.setStorageSync("userInfo", user);
  },
  //从缓存中取出用户信息
  getGlobalUserInfo: function (key) {
    return wx.getStorageSync(key);
  }
})