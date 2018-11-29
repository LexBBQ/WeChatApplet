// var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false,
    publishId:"",
    fansCounts:0
  },
  onLoad:function(params){
    var me=this;
    // var userInfo=app.userInfo;
    //从缓存中获取到用户对象
    var userInfo = app.getGlobalUserInfo("userInfo");
    var serverUrl = app.serverUrl;
    //获取当前登陆者的id
    var userId=userInfo.id;
    var publishId = params.publishId;
    if(publishId!=null&&publishId!=undefined&&publishId!=""){
        me.setData({
          publishId: publishId
        })
        if(userId==publishId){
          me.setData({
            isMe: true
          })
        }else{
          userId = publishId;
          me.setData({
            isMe: false
          })
        }
       
    }
   //userInfo.id为当前登录者的id
   //请求后端接口查找个人信息
    wx.request({
      url: serverUrl + '/user/findUserInfo?id=' + userId + '&fansId='+userInfo.id,
      method:'POST',
      header: {
        'content-type': 'application/json',
        //因为需要做认证处理，所以要传入当前对象的id和token
        'userId': userInfo.id,
        'userToken':userInfo.token

      },
      success:function(res){
        var user = res.data.data;
        console.log(res.data);
        if(res.data.status==200){
          if (user.faceImage == null && user.faceImage == '' && user.faceImage == undefined) {
            me.setData({
              //如果用户为第一次登陆，该用户没有头像信息，将系统默认的头像路径赋值给faceUrl
              faceUrl: "../resource/images/noneface.png"
            })
          }
          me.setData({
            //分别获取返回信息并赋值给对应变量
            faceUrl: serverUrl + user.faceImage,
            fansCounts: user.fansCounts,
            followCounts: user.followCounts,
            receiveLikeCounts: user.receiveLikeCounts,
            nickname: user.nickname,
            isFollow:user.followed
          })
        }else if(res.data.status==502){
          //502状态码为我们自定义返回的状态码，当token认证出现问题是就会返回该值，会将页面重定向到登录页
          wx.showToast({
            title: res.data.msg,
            icon:"none",
            duration:3000,
            success:function(){
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
        
      
      }
    })
  },

  logout:function(){
    var serverUrl = app.serverUrl;
    // var userInfo=app.userInfo;
    var userInfo=app.getGlobalUserInfo("userInfo");
    //调用注销接口
    wx.request({
      url:serverUrl+ '/logout?id='+userInfo.id,
      method:'POST',
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        console.log(res.data);
        wx.showToast({
          title: '注销成功',
        })
        //调用该方法清除用户的本地缓存
        wx.removeStorageSync("userInfo");
        //并重定向到登录页面
        wx.redirectTo({
          url: '../userLogin/login'
        })
      }
    })
  },
  changeFace:function(){
    var me=this;
    //调用微信官方的图片选择接口
    wx.chooseImage({
      //最多可以选择的图片张数
      count: 1,
      //所选的图片的尺寸
      sizeType: [ 'compressed'],
      //选择图片的来源
      sourceType: ['album', 'camera'],
      //该回调函数会返回一个该文件的临时路径
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片，该返回值为一个数组对象
        const tempFilePaths = res.tempFilePaths
            var serverUrl=app.serverUrl;
            // var userInfo=app.userInfo;
            var userInfo=app.getGlobalUserInfo("userInfo");
            //向用户显示上传状态
            wx.showLoading({
              title: '上传中',
            })
            wx.uploadFile({
              //调用后端的上传文件接口
              url: serverUrl+'/user/upload?id='+userInfo.id, 
              //因为上传的为单文件，所以只需要取得数组中的第一个值即可
              filePath: tempFilePaths[0],
              //该名字需要和后端接口定义的文件的变量名相同
              name: 'file',
              //传入认证消息
              header: {
                'content-type': 'application/json',
                'userId': userInfo.id,
                'userToken': userInfo.token
              },
              success(res) {
                console.log(res.data)
                //因为该方法的回调函数的返回值为String类型的字符串，并不是一个json对象，所以需要进行转换
                const data = JSON.parse(res.data);
                //隐藏提醒消息
                wx.hideLoading();
                wx.showToast({
                  title: '上传成功',
                })
              
               //将后端返回的头像的相对路径获取并赋值给imageUrl
                var imageUrl=data.data;
                me.setData({
                  faceUrl:serverUrl+imageUrl
                })
              }
            })
      }
    })
  },
  uploadVideo:function(){
    var me =this;
    //微信小程序提供的api，用于选择视频
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        //对视频的长度进行判断，如果小于1s则会提醒用户
        if (duration<1){
          wx.showToast({
            title: '你的视频太短了',
            icon:'none'
          })
          return;
        }else{
          //如果验证通过
          //获得该视频的时间长度
          var duration =res.duration;
          //获得视频的高度
          var height= res.height;
          //获得视频的尺寸
          var size =res.size;
          //获得视频的临时路径
          var tempFilePath =res.tempFilePath;
          //获得视频的宽度
          var width =res.width;
          //跳转到选择背景音乐的界面，并将所获得的参数传递过去
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration+
              '&height=' + height+
              '&size=' + size +
              '&tempFilePath=' + tempFilePath +
              '&width=' + width 
          })
        }
      }
    })
  },
  follow:function(){
    var me =this;
    var isFollow = me.data.isFollow;
    var serverUrl=app.serverUrl;
    var user =app.getGlobalUserInfo("userInfo")
    var publishId = me.data.publishId;
    //如果isFollow为false 就说明没有关注该用户 调用关注用户接口
    if (!isFollow){
      wx.request({
        url: serverUrl + '/user/follow?id=' + publishId + '&fansId=' + user.id,
        method:'POST',
        header: {
          'content-type': 'application/json',
          'userId': user.id,
          'userToken': user.token
        },
        success:function(res){
          wx.showToast({
            title: '关注成功',
            icon:"none",
            duration:2000
          })
          console.log(res)
          me.setData({
            fansCounts: ++me.data.fansCounts,
            isFollow: !isFollow
          })
        }
      })
    }else{
      wx.request({
        url: serverUrl + '/user/unfollow?id=' + publishId + '&fansId=' + user.id,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'userId': user.id,
          'userToken': user.token
        },
        success: function (res) {
          wx.showToast({
            title: '取消关注',
            icon: "none",
            duration: 2000
          })
          console.log(res)
          me.setData({
            fansCounts: --me.data.fansCounts,
            isFollow: !isFollow
          })
        }
      })
    }
   

  }

})
