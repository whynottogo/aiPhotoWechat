const app = getApp();

Page({
  data: {
    imgSrc: "https://th.bing.com/th/id/OIP.BGQoAUARHpPYX5C5W5Cq8gHaI6?rs=1&pid=ImgDetMain"
  },
  // 页面加载时请求第一页数据
  onLoad(option) {
    let imgUrl = option.imgUrl
    if (imgUrl != undefined) {
      this.setData({
        imgSrc: imgUrl
      })
    }
  },
  clickImg: function(e) {
    var imgSrc = this.data.imgSrc;
    wx.previewImage({
      urls: [imgSrc], // 需要预览的图片http链接列表，注意是数组
      current: '', // 当前显示图片的http链接，默认是第一个
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  returns: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  // 根据图片url下载保存
  savePicUrlAndImg(e) {
    wx.downloadFile({
      url: e.target.dataset.url,
      success: function (res) {
        // 下载成功后将图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
          },
          fail: function () {
            wx.showToast({
              title: '保存失败，请开启相册权限',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '下载图片失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
});
