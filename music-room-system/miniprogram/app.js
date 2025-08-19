// 微信小程序 - 琴房管理系统前端

// ========== /app.js ==========
App({
  globalData: {
    userInfo: null,
    token: null,
    apiUrl: 'https://your-api-domain.com/api', // 修改为您的实际API地址
    role: null
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.role = userInfo.role;
    }
  },

  request(options) {
    const token = this.globalData.token;
    
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: this.globalData.apiUrl + options.url,
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            wx.redirectTo({ url: '/pages/login/login' });
            reject(res);
          } else {
            wx.showToast({
              title: res.data.error || '请求失败',
              icon: 'none'
            });
            reject(res);
          }
        },
        fail: reject
      });
    });
  }
});