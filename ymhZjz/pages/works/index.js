// 引入Dialog
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Notify from '@vant/weapp/notify/notify';
const app = getApp();

Page({
  data: {
    workList: [],
    pageNum: 1,
    pageSize: 5,
    hasMore: true,
    isFirst: true
  },

  // 页面加载时请求第一页数据
  onLoad() {
    Notify({
      type: 'success',
      message: '只有下载过，才会出现在这里哦~',
      selector: '#van-notify'
    });
    this.getSizeList();
  },
  onShow() {
    if(this.data.isFirst) {
      this.setData({
        isFirst: false
      })
    } else {
      this.setData({
        pageNum: 1,
        pageSize: 5,
        hasMore: true,
        workList: []
      })
      this.getListData();
    }
  },

  getListData() {
    const that = this;
    wx.request({
      url: app.url + 'item/photoList',
      data: {
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
      },
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "GET",
      success(res) {
        wx.hideLoading();
        if (res.data.code === 200) {
          const newData = res.data.data;
          that.setData({
            workList: that.data.pageNum === 1 ? newData : that.data.workList.concat(newData), // 拼接新数据
            hasMore: newData.length === that.data.pageSize // 如果返回的数据少于 pageSize，表示没有更多数据了
          });
          var windowHeight = wx.getWindowInfo().screenHeight
          if (windowHeight > 155*that.data.workList.length && that.data.hasMore) {
            that.onReachBottom();
          }
        } else if (res.data.code === 404 || res.data.code === 500) {
          that.setData({
            hasMore: false
          });
        } else {
          wx.navigateTo({
            url: '/pages/login/index',
          });
        }
      },
      fail() {
        wx.hideLoading();
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 获取数据
  getSizeList() {

    if (!this.data.hasMore) {
      return; // 如果没有更多数据，直接返回
    }
    wx.showLoading({
      title: '加载中...',
    });
    this.getListData();
  },

  // 删除操作
  remove(e) {
    let that = this;
    const itemId = e.currentTarget.dataset.id;

    Dialog.confirm({
      message: '确定要删除这张吗？',
    }).then(() => {
      wx.request({
        url: app.url + 'item/deletePhotoId',
        data: {
          id: itemId,
        },
        header: {
          "token": wx.getStorageSync("token")
        },
        method: "GET",
        success(res) {
          wx.hideLoading();
          if (res.data.code === 200) {
            // 本地移除页面元素
            const updatedList = that.data.workList.filter(item => item.id !== itemId);
            that.setData({
              workList: updatedList
            });
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 2000
            });
          }
        },
        fail() {
          wx.showToast({
            title: '删除失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      });
    }).catch(() => {});
  },

  // 页面上拉触底事件（下滑加载下一页）
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({
        pageNum: this.data.pageNum + 1
      });
      this.getSizeList();
    }
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
  layoutPhoto(e) {
    wx.showLoading({
      title: '生成中'
    })
    let imgUrl = e.target.dataset.url
    wx.request({
      url: app.url + 'api/layoutPhoto',
      data: {
        "imgUrl": imgUrl,
      },
      header: {
        "token": wx.getStorageSync("token")
      },
      method: "POST",
      success(res) {
        wx.hideLoading();
        wx.navigateTo({
          url: '/pages/commonImage/index?imgUrl=' + res.data.data
        })
      },
      fail() {
        wx.hideLoading();
        wx.showToast({
          title: '生成排版照失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});