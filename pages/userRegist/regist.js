const app = getApp()

Page({
   data:{

   },
  doRegist:function(e){
    var formObject= e.detail.value;
    var username=formObject.username;
    var password=formObject.password;
    if(username.length==0||password.length==0){
        wx.showToast({
          title: '用户名或密码不能为空',
          icon:"none",
          duration:3000
        })
    }else{
      var serverUrl=app.serverUrl;
      wx.request({
        url: serverUrl +'/regist',
        method:'POST',
        data:{
          username:username,
          password:password
        },
        header:{
          'content-type': 'application/json'
        },
        success:function(res){
          console.log(res.data)
          if (res.data.status==200){
              wx.showToast({
                title: '恭喜你，注册成功',
                icon:"none",
                duration:3000
              })
          }else{
            wx.showToast({
              title: res.data.msg,
              icon:"none",
              duration:3000
            })
          }

        }
      })
    }
  },
  goLoginPage:function(){
    wx.navigateTo({
      url: '../userLogin/login'
    })
  }

})