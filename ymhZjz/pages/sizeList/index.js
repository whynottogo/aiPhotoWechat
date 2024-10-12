const app = getApp();
Page({
  data: {
    active: 1,
    category: "1",
    photoSizeList: [],
    pageNum: 1,
    pageSize: 10,
    hasMoreData: true,
    scrollTop: 0,
  },

  clickTab: function (e) {
    this.setData({
      photoSizeList: [],
      category: e.detail.name,
      pageNum: 1,
      hasMoreData: true,
    });
    if (this.data.category == 5) {
      wx.navigateTo({
        url: '/pages/searchs/index',
      });
    } else if (this.data.category == 4 && wx.getStorageSync("token") == "") {
      wx.navigateTo({
        url: '/pages/login/index',
      });
    } else {
      this.getSizeList();
    }
  },

  getSizeList: function () {
    if (!this.data.hasMoreData) return;
    wx.showLoading({ title: '加载中...' });
    const that = this;
    wx.request({
      url: app.url + 'item/itemList',
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        type: this.data.category,
      },
      header: { token: wx.getStorageSync("token") },
      method: "GET",
      success(res) {
        wx.hideLoading();
        if (res.data.code == 200) {
          let newData = res.data.data || [];
          that.setData({
            photoSizeList: that.data.photoSizeList.concat(newData),
            pageNum: that.data.pageNum + 1,
            hasMoreData: newData.length >= that.data.pageSize,
          });
        } else if (res.data.code == 404 || res.data.code == 500) {
          console.log(that.data.category)
          if(that.data.category==4){
            wx.showToast({
              title: "您还没有定制过尺寸哦~",
              icon: 'none',
              duration: 2000
            });
          }else{
            wx.showToast({
              title: "没有更多尺寸啦~",
              icon: 'none',
              duration: 1500
            });
          }
        }
      }
    });
  },

  moredata: function () {
    this.getSizeList();
  },

  goNextPage: function (e) {
    console.log('/pages/preEdit/index?index=' + e.currentTarget.dataset.index + '&data=' + JSON.stringify(this.data.photoSizeList[e.currentTarget.dataset.index]))
    wx.navigateTo({
      url: '/pages/preEdit/index?index=' + e.currentTarget.dataset.index + '&data=' + JSON.stringify(this.data.photoSizeList[e.currentTarget.dataset.index]),
    });
  },

  scrollToTop: function () {
    this.setData({ scrollTop: 0 });
  },

  onLoad: function (options) {
    const name = options.name
    if (name != undefined) {
      this.setData({
        active: name,
        category: name
      })
    }
    this.getSizeList();
  },

  onPullDownRefresh: function () {
    this.setData({
      photoSizeList: [],
      pageNum: 1,
      hasMoreData: true,
    });
    this.getSizeList();
  },

  onReachBottom: function () {
    this.moredata();
  },
});
