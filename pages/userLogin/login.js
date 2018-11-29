const app = getApp()

Page({
  data: {
    realUrl:""
  },
  onLoad:function(params){
    var me =this;
    var realUrl = params.realUrl;
    if(realUrl!=null||realUrl!=undefined||realUrl!=""){
      realUrl = realUrl.replace(/#/g, "?");
      realUrl = realUrl.replace(/@/g, "="); 
    }
     
    me.realUrl=realUrl;  
    me.setData({
      realUrl:realUrl
    })
  },
  doLogin:function(e){
    var me =this;
    var formObject=e.detail.value;
    var username = formObject.username;
    var password = formObject.password;
    var serverUrl=app.serverUrl;
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: "none",
        duration: 3000
      })
      }else{
        // wx.showToast({
        //   title: '登录ing..',
        //   icon:"none"
        // })
        wx.showLoading({
          title: '登陆ing',
        })
        wx.request({
          url: serverUrl+'/login',
          method:'POST',
          data: {
            username: username,
            password: password
          },
          header: {
            'content-type': 'application/json'
          },
          success:function(res){
          
            if(res.data.status==200){
              wx.showToast({
                title: '登陆成功',
                icon: "success"
              })
              // app.userInfo=res.data.data;
              //将后端返回的用户信息存入缓存中
              app.setGlobalUserInfo(res.data.data);
              var realUrl = me.data.realUrl;
              
              if(realUrl==null||realUrl==undefined||realUrl==""){
                wx.redirectTo({
                  url: '../mine/mine'
                })
              }else{
                wx.redirectTo({
                  url: realUrl,
                })
              }
              
            }else{
              wx.showToast({
                title: '登陆失败',
                icon: "none"
              })
            }
            console.log(res.data);
          }
        })
      }
  },
  goRegistPage:function(){
    wx.navigateTo({
      url: '../userRegist/regist',
    })
  }


})