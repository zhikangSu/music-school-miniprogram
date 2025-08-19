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
          // 使用云托管登录
          app.callContainer({
            path: '/api/auth/wxlogin',
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
            
            // 订阅消息授权（可选）
            this.requestSubscribeMessage();
            
            if (result.user.role === 'admin') {
              wx.redirectTo({ url: '/pages/admin/dashboard' });
            } else {
              wx.switchTab({ url: '/pages/index/index' });
            }
          }).catch(() => {
            wx.hideLoading();
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 请求订阅消息权限
  requestSubscribeMessage() {
    wx.requestSubscribeMessage({
      tmplIds: [
        'YOUR_TEMPLATE_ID_1', // 预约成功通知
        'YOUR_TEMPLATE_ID_2'  // 课程提醒通知
      ],
      success(res) {
        console.log('订阅消息授权结果:', res);
      },
      fail(err) {
        console.log('订阅消息授权失败:', err);
      }
    });
  }
});
