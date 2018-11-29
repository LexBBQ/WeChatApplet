const app = getApp()

Page({
    data: {
     
    bgmList:{},
    serverUrl:app.serverUrl,
    videoParams:{}

    },
    onLoad:function(params){
      var me=this;
      var serverUrl=app.serverUrl;
      //获取到上个页面传入的参数，并保存在videoParams
      me.setData({
        videoParams:params
      })
      //调用查询全部bgm的接口
      wx.request({
        url: serverUrl + '/bgmList',
        method:'POST',
        header: {
          'content-type': 'application/json'
        },
        success:function(res){
          //将返回值赋值给bgmList，在页面上遍历出来
          me.setData({
            bgmList:res.data.data
          })
          console.log(res.data)
        }
      })
    },
    //上传方法
  upload:function(e){
    var me =this;
    //获取视频的时长
    var duration=me.data.videoParams.duration;
    //获取视频的高度
    var height= me.data.videoParams.height;
    //获取上个页面返回的该视频的临时路径
    var tempFilePath = me.data.videoParams.tempFilePath;
    //获取该视频的宽度
    var width =me.data.videoParams.width;
    //获取用户所选择的bgmId
    var bgmId= e.detail.value.bgmId;
    //获取用户所输入的内容
    var desc = e.detail.value.desc;
    var serverUrl=app.serverUrl;

    // var user=app.userInfo;
    var user = app.getGlobalUserInfo("userInfo");
    wx.showLoading({
      title: '上传中',
    })
    //上传时候同样需要进行身份认证
    wx.uploadFile({
      url: serverUrl + '/video/uploadVideo', 
      filePath: tempFilePath,
      name: 'file',
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.token
      },
      //在uploadFile中如果要传多个数据可以使用formData
      formData:{
        id:user.id,
        videoSeconds: duration,
        videoHeight: height,
   
        videoWidth: width,
        bgmId: bgmId,
        desc: desc

      },
      success(res) {
        console.log(res.data)
        // const data = JSON.parse(res.data);
        wx.hideLoading();
        wx.showToast({
          title: '上传成功',
        })

     
      wx.redirectTo({
        url: '../mine/mine',
      })
      }
    })
    console.log(bgmId,desc)
  }

   
})

