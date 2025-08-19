const app = getApp();

Page({
  data: {
    userInfo: null,
    role: '',
    stats: {
      totalCourses: 0,
      totalAmount: 0,
      totalHours: 0
    },
    menuItems: []
  },

  onLoad() {
    this.loadUserInfo();
    this.loadStats();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo;
    const role = app.globalData.role;
    
    if (!userInfo) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    
    this.setData({ 
      userInfo,
      role,
      menuItems: this.getMenuItems(role)
    });
  },

  // ===== 添加的云存储上传功能 =====
  // 点击头像更换
  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        wx.showLoading({ title: '上传中...' });
        
        // 使用云存储上传
        wx.cloud.uploadFile({
          cloudPath: `avatars/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`,
          filePath: tempFilePath,
          success: uploadRes => {
            console.log('上传成功', uploadRes.fileID);
            
            // 更新用户头像
            this.updateUserAvatar(uploadRes.fileID);
          },
          fail: err => {
            wx.hideLoading();
            console.error('上传失败', err);
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 更新用户头像
  updateUserAvatar(fileID) {
    // 先获取临时链接
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        const tempFileURL = res.fileList[0].tempFileURL;
        
        // 调用后端API更新用户头像
        app.callContainer({
          path: '/api/user/avatar',
          method: 'PUT',
          data: {
            avatar: tempFileURL
          }
        }).then(() => {
          wx.hideLoading();
          wx.showToast({
            title: '头像更新成功',
            icon: 'success'
          });
          
          // 更新本地显示
          const userInfo = this.data.userInfo;
          userInfo.avatar = tempFileURL;
          this.setData({ userInfo });
          
          // 更新全局数据
          app.globalData.userInfo.avatar = tempFileURL;
          wx.setStorageSync('userInfo', app.globalData.userInfo);
        }).catch(() => {
          wx.hideLoading();
          wx.showToast({
            title: '更新失败',
            icon: 'none'
          });
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('获取临时链接失败', err);
      }
    });
  },

  getMenuItems(role) {
    const items = [
      { id: 'profile', icon: '👤', title: '个人资料', url: '/pages/my/profile' },
      { id: 'history', icon: '📚', title: '课程记录', url: '/pages/my/history' }
    ];
    
    if (role === 'teacher') {
      items.push(
        { id: 'schedule', icon: '📅', title: '时间管理', url: '/pages/teacher/schedule' },
        { id: 'income', icon: '💰', title: '收入统计', url: '/pages/teacher/income' }
      );
    } else if (role === 'admin') {
      items.push(
        { id: 'admin', icon: '🔧', title: '后台管理', url: '/pages/admin/dashboard' }
      );
    }
    
    items.push(
      { id: 'feedback', icon: '💬', title: '意见反馈', url: '/pages/my/feedback' },
      { id: 'about', icon: 'ℹ️', title: '关于我们', url: '/pages/my/about' },
      { id: 'settings', icon: '⚙️', title: '设置', url: '/pages/my/settings' }
    );
    
    return items;
  },

  loadStats() {
    // 加载统计数据
    // 这里应该调用API获取实际数据
    this.setData({
      stats: {
        totalCourses: 24,
        totalAmount: 4800,
        totalHours: 24
      }
    });
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          getApp().globalData.token = null;
          getApp().globalData.userInfo = null;
          getApp().globalData.role = null;
          wx.redirectTo({ url: '/pages/login/login' });
        }
      }
    });
  }
});