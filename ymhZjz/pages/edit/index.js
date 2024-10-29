const app = getApp()
let canOnePointMove = false;
let onePoint = {
  x: 0,
  y: 0
};
let twoPoint = {
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0
};

import Dialog from '@vant/weapp/dialog/dialog'
Page({
  data: {
    backColor: [
      //蓝色
      {color: "#438edb", style: "background-color:#438edb"},
      //白色
      {color: "#ffffff", style: "background-color:#ffffff"},
      //红色
      {color: "#ff0000", style: "background-color:#ff0000"},
      //浅蓝色
      {color: "#66b5f2", style: "background-color:#66b5f2"},
      //绿色
      {color: "#07c160", style: "background-color:#07c160"},
      //黄色
      {color: "#ffc300", style: "background-color:#ffc300"}
    ],
    imageData: {},
    showScale: 480 / 295,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    scale: 1,
    rotate: 0,
    bgc: '#ffffff',
    maskLeft: 0,
    maskTop: 0,
    maskScale: 1,
    maskRotate: 0,
    pick: false,
    color: "438edb",
    picUrl: "",
    downloadOne: 1,
    downloadTwo: 2,
    videoUnitId: 0,
    rewardedVideoAd: null,
    typeDownload: 1
  },

  onLoad: function () {
    this.getImageData();
    this.getWeb();
  },

  getImageData() {
    const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel();
    eventChannel &&
      eventChannel.on('sendImageData', (data) => {
        this.setData({
          imageData: data
        });
        wx.setNavigationBarTitle({
          title: this.data.imageData.name + "（预览）"
        });
      });
  },

  getWeb() {
    wx.request({
      url: app.url + 'api/getWeb',
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "POST",
      success: (res) => {
        this.setData({
          downloadOne: res.data.downloadOne,
          downloadTwo: res.data.downloadTwo,
          videoUnitId: res.data.videoUnitId
        });
        this.initRewardedVideoAd(res.data.videoUnitId);
      }
    });
  },

  // 点击换背景
  toggleBg(e) {
    wx.showLoading({
      title: '制作中...',
    })
    this.setData({
      color: e.currentTarget.dataset.color
    })
    this.updateColor(this.data.color, this.data.imageData.kimg);
  },


  toPick: function () {
    this.setData({
      pick: true
    })
  },

  //自定义换背景
  pickColor(e) {
    wx.showLoading({
      title: '制作中...',
    })
    let color = this.rgbStringToHex(e.detail.color);
    this.setData({
      color: color
    })
    this.updateColor(color, this.data.imageData.kimg);
  },

  //调用换背景
  updateColor(color, tu) {
    wx.request({
      url: app.url + 'api/updateIdPhoto',
      data: {
        "image": tu,
        "colors": color
      },
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "POST",
      success: (res) => {
        if (res.data.code == 200) {
          this.setData({
            'imageData.cimg': res.data.data.cimg
          });
          wx.hideLoading();
        } else if (res.data.code == 404 || res.data.code == 500) {
          wx.hideLoading();
          wx.showToast({
            title: res.data.data,
            icon: 'error'
          })

        }
      }
    });

  },

  //调用广告，根据type区分下载，1普通，2高清
  openSavePhoto(e) {
    this.setData({
      typeDownload: e.currentTarget.dataset.type
    });

    //普通下载没开启广告
    if(this.data.downloadOne==1 && e.currentTarget.dataset.type==1){
      this.saveNormalPhoto();
      return;
    }
    //高清下载没开启广告
    if(this.data.downloadTwo==1 && e.currentTarget.dataset.type==2){
      this.saveHDPhoto();
      return;
    }

    //剩下都是开启广告了，弹出询问
    Dialog.confirm({
      title: '提示',
      message: '观看一次广告，才能下载哦，您每观看完一次广告都是对我们最大的帮助',
    })
      .then(() => {
        const rewardedVideoAd = this.data.rewardedVideoAd;
        if (rewardedVideoAd) {
          // 尝试播放广告
          rewardedVideoAd.show().catch(() => {
            // 如果广告未加载成功，则重新加载并播放广告
            this.loadRewardedVideoAd(e.currentTarget.dataset.type);
          });
        } else {
          console.error('广告实例不存在');
          //防止广告权限被封或无广告权限导致用户无法下载
          if (e.currentTarget.dataset.type == 1) {
            this.saveNormalPhoto();
          } else {
            this.saveHDPhoto()
          }
        }
      })
      .catch(() => {
       
      });
    
    

  },



  //保存证件照
  saveNormalPhoto() {
    wx.showLoading({
      title: '下载中...',
    })
    wx.request({
      url: app.url + 'api/updateUserPhoto',
      data: {
        "image": this.data.imageData.cimg,
        "photoId": this.data.imageData.id2
      },
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "POST",
      success: (res) => {
        if (res.data.code == 200) {
          this.setData({
            'picUrl': res.data.data.picUrl
          });
          //调用保存
          this.savePicUrlAndImg();
        } else if (res.data.code == 404 || res.data.code == 500) {
          wx.showToast({
            title: res.data.data,
            icon: 'none'
          })

        }
      }
    });
  },

  //保存高清照
  saveHDPhoto() {
    this.setData({
      'picUrl': ""
    });
    this.updateColor(this.data.color, this.data.imageData.oimg);
    wx.nextTick(() => {
      this.saveNormalPhoto();
    });
  },

  // 根据图片url下载保存
  savePicUrlAndImg() {
    const that = this;
    wx.downloadFile({
      url: this.data.picUrl,
      success: function (res) {
        wx.hideLoading();
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
            that.checkq(); //解决用户拒绝相册
          }
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '下载图片失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 解决用户拒绝相册问题
  checkq() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.showModal({
            title: '提示',
            content: '保存图片需要授权哦',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    this.savePicUrlAndImg();
                  },
                  fail: (res) => {
                    console.log(res);
                  }
                });
              }
            }
          });
        }
      }
    });
  },




  //去分享页面(待开发分享下载)
  async composeImage() {
    wx.showLoading({
      title: '制作中...'
    });
    wx.redirectTo({
      url: './complete/index?msg=111&tempFilePath=pa&url=https://www.haimati.cn/img/1_7_1.98819809.jpg',
    });
  },




  // 初始化激励视频广告
  initRewardedVideoAd(adUnitId) {
    if (wx.createRewardedVideoAd) {
      const rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: adUnitId
      });

      // 确保广告事件只监听一次
      rewardedVideoAd.offLoad();
      rewardedVideoAd.offError();
      rewardedVideoAd.offClose();

      // 监听广告加载成功
      rewardedVideoAd.onLoad(() => {
        console.log('重新拉取广告成功');
      });

      // 监听广告加载失败
      rewardedVideoAd.onError((err) => {
        console.error('激励视频广告加载失败', err);
        //用户可能观看广告上限，防止无法下载，仍发放奖励
        if (this.data.typeDownload == 1) {
          this.saveNormalPhoto();
        } else {
          this.saveHDPhoto()
        }
      });

      // 监听广告关闭事件
      rewardedVideoAd.onClose((res) => {
        if (res && res.isEnded) {
          //发放奖励
          if (this.data.typeDownload == 1) {
            this.saveNormalPhoto();
          } else {
            this.saveHDPhoto()
          }
        } else {
          console.log('没看完广告，不发奖励');
          wx.showToast({
            title: "需要看完广告才能下载哦~",
            icon: 'none',
            duration: 1500
          });
        }
      });
      this.setData({
        rewardedVideoAd: rewardedVideoAd
      });
    } else {
      console.error('微信版本太低不支持激励视频广告');
      //防止无法下载，所以仍然发放奖励
      if (this.data.typeDownload == 1) {
        this.saveNormalPhoto();
      } else {
        this.saveHDPhoto()
      }
    }
  },



  // 加载激励视频广告
  loadRewardedVideoAd(type) {
    const rewardedVideoAd = this.data.rewardedVideoAd;
    rewardedVideoAd
      .load()
      .then(() => rewardedVideoAd.show())
      .catch((err) => {
        console.error('广告加载失败', err);
        //看广告上限/网络失败，为了防止无法下载，仍发放奖励
        if (type == 1) {
          this.saveNormalPhoto();
        } else {
          this.saveHDPhoto()
        }
      });
  },


















  rgbStringToHex(rgbString) {
    // 提取 rgb 值
    const rgbValues = rgbString.match(/\d+/g);

    // 将 rgb 值转换为十六进制
    const r = parseInt(rgbValues[0], 10);
    const g = parseInt(rgbValues[1], 10);
    const b = parseInt(rgbValues[2], 10);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  },

  bindload: function (e) {
    wx.hideLoading({});
    const {
      width,
      height
    } = e.detail;
    const {
      widthPx,
      heightPx
    } = this.data.imageData;
    const _width = widthPx;
    const _height = (_width * height) / width;

    const topOffset = wx.getWindowInfo().screenHeight * 0.1;

    const imgLoadSetData = {
      originImgWidth: width,
      originImgHeight: height,
      initImgWidth: _width,
      initImgHeight: _height,
      width: _width,
      height: _height,
      left: _width / 2,
      top: _height / 2 + heightPx - _height + topOffset - 86,
      maskLeft: _width / 2,
      maskTop: _height / 2 + heightPx - _height + topOffset - 86,
    };

    this.setData(imgLoadSetData);
  },

  touchstart: function (e) {
    if (e.touches.length < 2) {
      canOnePointMove = true;
      onePoint.x = e.touches[0].pageX * 2;
      onePoint.y = e.touches[0].pageY * 2;
    } else {
      twoPoint.x1 = e.touches[0].pageX * 2;
      twoPoint.y1 = e.touches[0].pageY * 2;
      twoPoint.x2 = e.touches[1].pageX * 2;
      twoPoint.y2 = e.touches[1].pageY * 2;
    }
  },

  touchmove: function (e) {
    const {
      data
    } = this;
    const thatData = data;

    if (e.touches.length < 2 && canOnePointMove) {
      // 单指移动
      const onePointDiffX = e.touches[0].pageX * 2 - onePoint.x;
      const onePointDiffY = e.touches[0].pageY * 2 - onePoint.y;

      this.setData({
        left: thatData.left + onePointDiffX,
        top: thatData.top + onePointDiffY,
        maskLeft: thatData.maskLeft + onePointDiffX,
        maskTop: thatData.maskTop + onePointDiffY,
      });

      onePoint.x = e.touches[0].pageX * 2;
      onePoint.y = e.touches[0].pageY * 2;
    } else if (e.touches.length > 1) {
      // 双指缩放/旋转
      const preTwoPoint = JSON.parse(JSON.stringify(twoPoint));
      twoPoint.x1 = e.touches[0].pageX * 2;
      twoPoint.y1 = e.touches[0].pageY * 2;
      twoPoint.x2 = e.touches[1].pageX * 2;
      twoPoint.y2 = e.touches[1].pageY * 2;

      const preAngle = Math.atan((preTwoPoint.y1 - preTwoPoint.y2) / (preTwoPoint.x1 - preTwoPoint.x2)) * 180 / Math.PI;
      const curAngle = Math.atan((twoPoint.y1 - twoPoint.y2) / (twoPoint.x1 - twoPoint.x2)) * 180 / Math.PI;

      const preDistance = Math.sqrt(Math.pow(preTwoPoint.x1 - preTwoPoint.x2, 2) + Math.pow(preTwoPoint.y1 - preTwoPoint.y2, 2));
      const curDistance = Math.sqrt(Math.pow(twoPoint.x1 - twoPoint.x2, 2) + Math.pow(twoPoint.y1 - twoPoint.y2, 2));

      const angleThreshold = 0.5;
      const distanceThreshold = 2;

      if (Math.abs(curAngle - preAngle) > angleThreshold || Math.abs(curDistance - preDistance) > distanceThreshold) {
        const smoothFactor = 0.2;
        let newScale = thatData.scale + (curDistance - preDistance) * 0.005 * smoothFactor;
        if (newScale < 0.5) newScale = 0.5;

        this.setData({
          scale: newScale,
          rotate: thatData.rotate + (curAngle - preAngle) * smoothFactor,
          maskScale: newScale,
          maskRotate: thatData.rotate + (curAngle - preAngle) * smoothFactor,
        });
      }
    }
  },

  touchend: function () {
    canOnePointMove = false;
  },
});