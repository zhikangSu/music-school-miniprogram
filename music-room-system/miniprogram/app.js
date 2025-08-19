App({
  globalData: {
    userInfo: null,
    token: null,
    // 云托管环境配置
    cloudEnv: 'prod-8gpcrif54e9d77ad', // 您的云托管环境ID
    containerName: 'express-p6cw', // 容器名称
    role: null
  },

  onLaunch() {
    // 初始化云托管
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.cloudEnv,
        traceUser: true
      });
    }

    // 获取本地存储的token
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.role = userInfo.role;
    }
  },

  // 云托管请求方法
  callContainer(options) {
    const token = this.globalData.token;
    
    return new Promise((resolve, reject) => {
      wx.cloud.callContainer({
        config: {
          env: this.globalData.cloudEnv
        },
        path: options.url,
        method: options.method || 'GET',
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'X-WX-SERVICE': this.globalData.containerName,
          ...options.header
        },
        data: options.data,
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
        fail: (err) => {
          console.error('云托管调用失败:', err);
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  },

  // 兼容旧的request方法
  request(options) {
    // 如果是云托管环境，使用callContainer
    if (wx.cloud) {
      return this.callContainer(options);
    } else {
      // 开发环境使用普通请求
      return this.normalRequest(options);
    }
  },

  // 普通HTTP请求（用于开发环境）
  normalRequest(options) {
    const apiUrl = 'http://localhost:3000'; // 本地开发地址
    const token = this.globalData.token;
    
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: apiUrl + options.url,
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  }
});