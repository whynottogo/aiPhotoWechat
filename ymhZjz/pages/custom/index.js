import tool from '././util'
const app = getApp();

Page({
  data: {
    width: '',
    height: '',
    name: '',
    px: '0*0 px',
    size: '0*0 mm'
  },

  onLoad: function () {
    if (!wx.getStorageSync('token')) {
      wx.navigateTo({
        url: '/pages/login/index'
      });
    }
  },

  changeName(e) {
    const value = e.detail || '';
    this.setData({
      name: value
    });
  },

  changeWidth: tool.debounce(function (e) {
    const value = e.detail;
    this.setData({
      width: value
    });
    this.updateSize();
  }, 300),

  changeHeight: tool.debounce(function (e) {
    const value = e.detail;
    this.setData({
      height: value
    });
    this.updateSize();
  }, 300),

  updateSize() {
    let width = parseInt(this.data.width, 10);
    let height = parseInt(this.data.height, 10);
    let width_px = isNaN(width) ? 0 : width;
    let height_px = isNaN(height) ? 0 : height;
    let width_mm = Math.floor(width_px / 11.8);
    let height_mm = Math.floor(height_px / 11.8);
    this.setData({
      px: `${width_px}*${height_px} px`,
      size: `${width_mm}*${height_mm} mm`
    });
  },

  addSize() {
    const name = this.data.name.trim();
    const width = parseInt(this.data.width, 10);
    const height = parseInt(this.data.height, 10);
    
    if (!name) {
      wx.showToast({
        title: '名称为必填',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      wx.showToast({
        title: '宽或高必须大于0',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    if (!this.isValidName(name)) {
      wx.showToast({
        title: '名称不能包含特殊符号',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    wx.request({
      url: app.url + 'item/saveCustom',
      method: 'POST',
      data: {
        name: name,
        widthPx: width,
        heightPx: height,
        size: this.data.size
      },
      header: {
        token: wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.code == 200) {
          wx.showToast({
            title: '定制成功',
            duration: 2000,
            mask: true
          });
          this.setData({
            name: '',
            width: '',
            height: '',
            px: '0*0 px',
            size: '0*0 mm'
          });
          wx.navigateTo({
            url: "/pages/sizeList/index?name=4",
          });
        } else if(res.data.code == 404 || res.data.code == 500){
          wx.showToast({
            title: res.data.data,
            duration: 2000,
            icon: 'none',
            mask: true
          });
        }else{
          wx.navigateTo({
            url: "/pages/login/index",
          });
        }
      },
    });
  },

  isValidName(name) {
    const reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
    return reg.test(name);
  }
});
