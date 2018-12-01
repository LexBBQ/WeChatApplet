const app = getApp()

Page({
  data: {
    // 用于分页的属性
    page:1,
    //视频列表
    videoList:[],
    //总页数
    totalPage:"",
    //屏幕宽度
    screenWidth: 350,
    //搜索关键字
    searchValue:""
  
  },
  onLoad:function(params){
    var me=this;
    var page=me.data.page;
    //该方法为可以获取用户手机的屏幕宽度
    var screenWidth=  wx.getSystemInfoSync().screenWidth;
    var serverUrl=app.serverUrl;
    var searchValue=params.searchValue;
    //判断用户是否在进行查询操作，如果不为空则说明，用户是在做搜索操作
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
  //封装一个查询视频列表的方法
  findAllVideos:function(page){
    var me =this;
    var serverUrl=app.serverUrl;
    //从data中获取到搜索关键字
    var searchValue = me.data.searchValue;
    //如果搜索关键字为空，说明用户没有进行搜索操作，将searchValue设置为空，模糊查询全部数据
    if (searchValue == null || searchValue==undefined){
        searchValue="";
    }
    //调用查询视频接口
    wx.request({
      url: serverUrl + '/video/findVideoList?searchValue=' + searchValue+'&pageNum=' + page,
      method: 'POST',
      success: function (res) {
        //隐藏掉两个加载动画
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        console.log(res.data);
        //如果返回的rows长度为0说明，用户查询的视频不存在
        if (res.data.data.rows.length==0){
            wx.showToast({
              title: '你搜索的视频不存在QAQ',
              icon:"none",
              duration:4000
            })
        }
        //获取到当前页数
        var page = res.data.data.page;
        //如果当前页数为1就清空videoList
        if (page === 1) {
          me.setData({
            videoList: []
          })
        }
        //获取到返回的videoList
        var videoList = res.data.data.rows;
        //获取页面原来的newVideoList
        var newVideoList = me.data.videoList;
        me.setData({
          //将原来的videoList和新查询到的videoList进行拼接并赋值给data中的videoList
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.totalPage,
          serverUrl: serverUrl
        })
      }
    })
  },
  //触顶事件
  onPullDownRefresh:function(){
    var me =this;
    //页面顶端显示加载中符号
    wx.showNavigationBarLoading();
    //查询第一页的内容
    me.findAllVideos(1);
  },
  //触底事件
  onReachBottom:function(){
    var me =this;
    //获取页面当前的页数
    var currentPage=me.data.page;
    //获取总页数
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
  //当用户点击某个视频时候，会进入视频详情页
  showVideoInfo:function(e){
    var me =this;
    //获取用当前点击视频的索引值
    var arr=e.target.dataset.arrindex;
    //获取视频列表
    var videoList=me.data.videoList;
    //因为要整体作为参数传递到下个页面，所以将该videoVo对象转换为字符串传递给下个页面
    var video=JSON.stringify (videoList[arr]);
    wx.redirectTo({
      url: '../videoinfo/videoinfo?video='+video,
    })
  
  }
   

})
