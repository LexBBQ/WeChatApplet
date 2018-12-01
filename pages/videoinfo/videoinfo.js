// var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    //定义视频信息
    video:null,
    //用户是否对该视频点赞
    userLikeVideo:false,
    //视频发布者信息
    publishUser:null,
    serverUrl:app.serverUrl,
    //默认评论页数
    commentsPage:1,
    //默认没页展示的条数
    commentsSize:1,
    //总页数
    totalPage:1,
    //评论列表集合
    commentsList:[],
    placeholder:"说点什么...",
    toUserId:""
  },
  onLoad:function(param){
    var me=this;
    var serverUrl = app.serverUrl;
    //获取当前登陆者信息
    var user=app.getGlobalUserInfo("userInfo");
    //将从index页面传过来的string类型的video对象转换成json对象
    var video = JSON.parse(param.video);
    //获得该视频的路径
    var src = video.videoPath;
    //获取当前评论的页数
    var page = me.data.commentsPage;
   
    //调用查询视频发布者信息接口（需要身份认证）
    wx.request({
      url: serverUrl + '/user/findPublish?id=' + user.id + '&videoId=' + video.id + '&publishId=' + video.userId,
      method:'POST',
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.token
      },
      success:function(res){
        console.log(res.data)
     //定义一个用来回跳的路径，若用户没用登录在登录之后可以直接跳转到原理的路径
    //因为在参数在传递的时候如果作为参数的值在添加参数的话不会被识别，所以这里使用#代替？使用@代替=，在登录页面在进行转义即可
        var realUrl = "../videoinfo/videoinfo#video@" + JSON.stringify(video) ;
        if (res.data.status==502){
          //如果用户没登录，会重定向到登录界面，并将realUrl传递过去
          wx.showToast({
            title: res.data.msg,
            icon:"none",
            success:function(){
              wx.redirectTo({
                url: '../userLogin/login?realUrl=' + realUrl,
              })
            }
          })
        }
        me.setData({
          //将后端获取到的值赋过来
          userLikeVideo: res.data.data.isLike,
          //将查询到的发布者信息赋值给users
          publishUser:res.data.data.users
        })
      }
    })

 
    
    me.setData({
      //将视频路径进行赋值
      src:serverUrl+src,
      video:video
    })

    //调用查询评论的函数
    me.getCommentsList(page);
  },
  //跳转到搜索页面
  showSearch:function(){
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },
  //返回首页
  showIndex:function(){
    wx.redirectTo({
      url: '../index/index',
    })
  },
  //查看登录者的个人信息
  showMine:function(){
    var user = app.getGlobalUserInfo("userInfo");
    if(user==null||user==undefined||user==""){
        wx.navigateTo({
          url: '../userLogin/login',
        })
    }else{
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },
  //视频上传
  upload:function(){
    var me = this;
    var video = JSON.stringify(me.data.video);
    var realUrl = "../videoinfo/videoinfo#video@" + video;
    var user = app.getGlobalUserInfo("userInfo");
    if  (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/login?realUrl='+realUrl,
      })
  }else{
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        success(res) {
          console.log(res)
          if (duration < 1) {
            wx.showToast({
              title: '你的视频太短了',
              icon: 'none'
            })
          } else {
            var duration = res.duration;
            var height = res.height;
            var size = res.size;
            var tempFilePath = res.tempFilePath;
            var width = res.width;
            wx.navigateTo({
              url: '../chooseBgm/chooseBgm?duration=' + duration +
                '&height=' + height +
                '&size=' + size +
                '&tempFilePath=' + tempFilePath +
                '&width=' + width
            })
          }
        }
      })
  }
  },
  //用户点赞和取消点赞的函数
  likeVideoOrNot:function(){
    var me =this;
    var user = app.getGlobalUserInfo("userInfo");
    //判断用于是否登录，如果没登录重定向到登录页面
    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      var serverUrl=app.serverUrl;
      var flag = me.data.userLikeVideo;
      var video=me.data.video;
      var url = serverUrl + '/user/like?id=' + user.id + '&videoId=' + video.id +'&videoCreatedId='+video.userId;
      if (flag) {
      var url = serverUrl + '/user/unlike?id=' + user.id + '&videoId=' + video.id +'&videoCreatedId='+video.userId;
      }
      wx.request({
        url: url,
        method:'POST',
        header: {
          'content-type': 'application/json',
          'userId': user.id,
          'userToken': user.token
        },
        success:function(res){
          console.log(res)
          if (!flag){
              wx.showToast({
                title: '点赞成功',
                icon:"none",
                duration:1500
              })
          }else{
            wx.showToast({
              title: '取消点赞',
              icon: "none",
              duration: 1500
            })
          }
          me.setData({
            userLikeVideo: !flag
          })
        },
        
      })
    }
  },
  //查看视频发布者信息
  showPublisher:function(){
    var me=this;
    var video = me.data.video;
    var realUrl = "../mine/mine#publish@" + video.userId;
    var user = app.getGlobalUserInfo("userInfo");
    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/login?realUrl=' + realUrl,
      })
    }else{
      wx.navigateTo({
        url: '../mine/mine?publishId='+video.userId,
      })
    }
  },
  //分享按钮
  shareMe:function(){
    wx.showActionSheet({
      //这里只是做了展示，相关功能实现只需要调用对应的官方的api即可，这里就不足具体实现了
      itemList: ['下载视频','举报用户','分享'],
    })
  },
  //留言函数
  leaveComment:function(){
    var me =this;
    this.setData({
      commentFocus:true
    })
  },
  /**
   * 发送评论
   */
  saveComment:function(e){
    var me =this;
    var commentValue= e.detail.value;
    var user=app.getGlobalUserInfo("userInfo");
    var video=me.data.video;
    var realUrl = "../videoinfo/videoinfo#video@" + video;
    var serverUrl =app.serverUrl;
    var toUserId = me.data.toUserId
    wx.showLoading({
      title: '评论中',
    })
    wx.request({
      url: serverUrl +'/video/saveComments',
      method: 'POST',
      data:{
        videoId:me.data.video.id,
        comment: commentValue,
        fromUserId:user.id,
        toUserId: toUserId,
        fatherCommentId: user.id
      },
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.token
      },
      success: function (res) {
        console.log(res.data)
        wx.hideLoading();
        if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            icon: "none",
            success: function () {
              wx.redirectTo({
                url: '../userLogin/login?realUrl=' + realUrl,
              })
            }
          })
          return;
        }
        
        me.setData({
          contentValue:"",
          commentsList:[]
        })
        me.getCommentsList(1);
      }
    })
  },
  /**
   * 查询全部评论列表
   */
  getCommentsList:function(page){
      var me =this;
      var serverUrl=app.serverUrl;
      //获取到当前的视频对象
      var video=me.data.video;
      wx.showLoading({
        title: '加载中',
      })
      //调用查询视频留言的接口
      wx.request({
        url: serverUrl + '/video/findComments?videoId=' + video.id+'&page='+page,
        method:"POST",
        success:function(res){
          wx.hideLoading();
          console.log(res.data.data)
          var commentsList=res.data.data.rows;
          var oldcommentsList = me.data.commentsList
          me.setData({
            commentsList: oldcommentsList.concat(commentsList),
            totalPage: res.data.data.totalPage,
            page:res.data.data.page,
            placeholder:"说点什么..."
          })
        }
      })
  },
  onReachBottom:function(){
    var me=this;
    var page= me.data.page;
    var totalPage=me.data.totalPage;
    if(page==totalPage){
      wx.showToast({
        title: '没有更多评论了QAQ',
        icon:"none",
        duration:2000
      })
      return;
    }
    var page=page+1;
    me.getCommentsList(page);
  },
  replyFocus:function(e){
    var me =this;
    // var fathercommentid =e.currentTarget.dataset.fathercommentid;
    var toNickname = e.currentTarget.dataset.tonickname;
    // var serverUrl=app.serverUrl;
    var toUserId = e.currentTarget.dataset.touserid;
    // var user=app.getGlobalUserInfo("userInfo");
    // var commentValue = e.detail.value;
    // var video=me.data.video;
 
    me.setData({
      commentFocus:true,
      placeholder: "回复:" + toNickname,
      toUserId: toUserId

    })
    // wx.request({
    //   url: serverUrl + '/video/appendComments?id=' + video.id + '&fatherCommentId=' + user.id + '&toUserId=' + toUserId + '&comment='+commentValue,
    //   method:"POST",
    //   success:function(){
    //     me.getCommentsList(1);
    //   }
    // })
  }
})