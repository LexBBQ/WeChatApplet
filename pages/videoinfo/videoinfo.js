// var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    video:null,
    userLikeVideo:false,
    publishUser:null,
    serverUrl:app.serverUrl,
    commentsPage:1,
    commentsSize:1,
    totalPage:1,
    commentsList:[],
    placeholder:"说点什么...",
    toUserId:""
  },
  onLoad:function(param){
    var me=this;
    var serverUrl = app.serverUrl;
    var user=app.getGlobalUserInfo("userInfo");
    var video = JSON.parse(param.video);
    var src = video.videoPath;
    var page = me.data.commentsPage;
   
    
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
        var realUrl = "../videoinfo/videoinfo#video@" + JSON.stringify(video) ;
        if (res.data.status==502){
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
          userLikeVideo: res.data.data.isLike,
          publishUser:res.data.data.users
        })
      }
    })

 
    
    me.setData({
      src:serverUrl+src,
      video:video
    })
    // var id= param.id;
    // var serverUrl=app.serverUrl;
    // wx.request({
    //   url: serverUrl +'/video/findVideo?id='+id,
    //   method:'POST',
    //   success:function(res){
    //     var src = res.data.data.videoPath;
    //     me.setData({
    //       src:src
    //     })
    //   }
    // })
    me.getCommentsList(page);
  },
  showSearch:function(){
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },
  showIndex:function(){
    wx.redirectTo({
      url: '../index/index',
    })
  },
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
  likeVideoOrNot:function(){
    var me =this;
    var user = app.getGlobalUserInfo("userInfo");
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
  shareMe:function(){
    wx.showActionSheet({
      itemList: ['下载视频','举报用户','分享'],
    })
  },
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
      var video=me.data.video;
      wx.showLoading({
        title: '加载中',
      })
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