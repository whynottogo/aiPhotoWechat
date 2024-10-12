const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //轮播图配置
    autoplay: true,
    interval: 3000,
    duration: 1200,
    homeLeftInfo: "拍照技巧",
    homeLeftUrl: "/pages/methods/index"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    that.getWeb();
    const data = {
      "swiperDatas": [{
          "id": 1,
          "imgurl": "../../images/home/1.jpg"
        },
        {
          "id": 2,
          "imgurl": "../../images/home/2.jpg"
        }
      ]
    };
    that.setData({
      swiperDatas: data.swiperDatas
    })
  },

  // 路由跳转
  navigateTo(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },
  navigateToLeft(e) {
    wx.navigateTo({
      url: this.data.homeLeftUrl
    })
  },

  loginJump(e) {
    if (wx.getStorageSync("token") == "") {
      wx.navigateTo({
        url: "/pages/login/index",
      });
    } else {
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
      });
    }
  },

  //即将上线项目弹出
  toBeLaunched() {
    wx.showToast({
      title: "您未解锁本功能",
      icon: 'none',
      duration: 1500
    });

  },
  goToCommon() {
    wx.navigateTo({
      url: "/pages/commonImage/index"
    })
  },
  goToColor() {
    wx.navigateTo({
      url: "/pages/colorImage/index"
    })
  },
  goToHumanMatting() {
    wx.navigateTo({
      url: "/pages/humanMatting/index"
    })
  },

  onShareAppMessage() {
    return {
      title: '哇塞，这个证件照小程序也太好用了吧！好清晰，还免费',
      path: 'pages/home/index',
      imageUrl: '../../images/share.jpg'
    }
  },
  getWeb() {
    wx.request({
      url: app.url + 'api/getWeb',
      method: "POST",
      success: (res) => {
        this.setData({
          homeLeftInfo: res.data.homeLeftInfo,
          homeLeftUrl: res.data.homeLeftUrl
        });
      }
    });
  },



})