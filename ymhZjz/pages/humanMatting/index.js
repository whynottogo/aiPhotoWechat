const app = getApp();

Page({
  data: {
    
  },

  // 页面加载时请求第一页数据
  onLoad() {
    
  },

  chooseImg() {
    if (wx.getStorageSync("token") == "") {
      wx.navigateTo({
        url: '/pages/login/index',
      });
      return;
    }
    wx.chooseMedia({
      count: 1,
      mediaType: 'image',
      sourceType: ['album'],
      sizeType: 'original',
      camera: 'back',
      success: (res) => {
        const file = res.tempFiles[0];
        const fileType = file.tempFilePath.split('.').pop().toLowerCase();
        const fileSizeMB = file.size / (1024 * 1024);

        // 检查文件格式
        if (fileType !== 'png' && fileType !== 'jpg' && fileType !== 'jpeg') {
          wx.showToast({
            title: '不支持该图片格式',
            icon: 'none',
            duration: 2000
          });
          return;
        }

        // 检查文件大小
        if (fileSizeMB > 15) {
          wx.showToast({
            title: '图片太大啦，不能超15M哦',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        this.imgUpload(res.tempFiles[0].tempFilePath)
      }
    })
  },
  imgUpload(filePath) {
    wx.showLoading({
      title: '图片检测中',
    })
    wx.uploadFile({
      url: app.url + 'api/humanMatting',
      filePath: filePath,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data',
        "token": wx.getStorageSync("token")
      },
      success: (res) => {
        wx.hideLoading();
        let data = JSON.parse(res.data);
        if (data.code == 200) {
          let imgUrl = data.data;
          wx.navigateTo({
            url: '/pages/commonImage/index?imgUrl=' + imgUrl
          })
        } else if (data.code == 404 || data.code == 500) {
          wx.showToast({
            title: data.msg,
            icon: "none",
          });
        } else {
          wx.navigateTo({
            url: '/pages/login/index',
          });
        }
      }
    })
  }
});
