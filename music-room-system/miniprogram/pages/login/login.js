// ========== /pages/login/login.js ==========
const app = getApp();

Page({
  data: {
    canIUseGetUserProfile: false
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.wxLogin(res.userInfo);
      },
      fail: () => {
        wx.showToast({
          title: '需要授权才能使用',
          icon: 'none'
        });
      }
    });
  },

  wxLogin(userInfo) {
    wx.showLoading({ title: '登录中...' });
    
    wx.login({
      success: (res) => {
        if (res.code) {
          app.request({
            url: '/auth/wxlogin',
            method: 'POST',
            data: {
              code: res.code,
              userInfo: userInfo
            }
          }).then(result => {
            wx.hideLoading();
            
            app.globalData.token = result.token;
            app.globalData.userInfo = result.user;
            app.globalData.role = result.user.role;
            
            wx.setStorageSync('token', result.token);
            wx.setStorageSync('userInfo', result.user);
            
            if (result.user.role === 'admin') {
              wx.redirectTo({ url: '/pages/admin/dashboard' });
            } else {
              wx.switchTab({ url: '/pages/index/index' });
            }
          }).catch(() => {
            wx.hideLoading();
          });
        }
      }
    });
  }
});
