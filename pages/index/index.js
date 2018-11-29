const app = getApp()

Page({
  data: {
    // 用于分页的属性
    page:1,
    videoList:[],
    totalPage:"",
    screenWidth: 350,
    searchValue:""
  
  },
  onLoad:function(params){
    var me=this;
    var page=me.data.page;
    var screenWidth=  wx.getSystemInfoSync().screenWidth;
    var serverUrl=app.serverUrl;
    var searchValue=params.searchValue;
    if (searchValue != null || searchValue != undefined || searchValue!=""){
      me.setData({
        searchValue: searchValue
      })
    }
    me.setData({
      screenWidth: screenWidth
      
    })
    wx.showLoading({
      title: '加载中',
    })
    me.findAllVideos(page);
  },
  findAllVideos:function(page){
    var me =this;
    var serverUrl=app.serverUrl;
    var searchValue = me.data.searchValue;
    if (searchValue == null || searchValue==undefined){
        searchValue="";
    }
    wx.request({
      url: serverUrl + '/video/findVideoList?searchValue=' + searchValue+'&pageNum=' + page,
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        console.log(res.data);
        if (res.data.data.rows.length==0){
            wx.showToast({
              title: '你搜索的视频不存在QAQ',
              icon:"none",
              duration:4000
            })
        }
        var page = res.data.data.page;
        if (page === 1) {
          me.setData({
            videoList: []
          })
        }
        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;
        me.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.totalPage,
          serverUrl: serverUrl
        })
      }
    })
  },
  onPullDownRefresh:function(){
    var me =this;
    wx.showNavigationBarLoading();
    me.findAllVideos(1);
  },
  onReachBottom:function(){
    var me =this;
    var currentPage=me.data.page;
    var totalPage = me.data.totalPage;
    wx.showLoading({
      title: '加载中',
    })
    //判断是否与总页数相等，如果相等则不能下拉
    if (currentPage === totalPage){
        wx.showToast({
          title: '已经是最后一页了QAQ',
          icon:"none"
        })
        return;
    }
    var page=currentPage+1
    me.findAllVideos(page);
    wx.hideLoading();
  },
  showVideoInfo:function(e){
    var me =this;
    var arr=e.target.dataset.arrindex;
    var videoList=me.data.videoList;
    var video=JSON.stringify (videoList[arr]);
    wx.redirectTo({
      url: '../videoinfo/videoinfo?video='+video,
    })
  
  }
   

})
