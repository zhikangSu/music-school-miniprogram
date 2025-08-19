// ========== /pages/my/index.js ==========
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
    const userInfo = getApp().globalData.userInfo;
    const role = getApp().globalData.role;
    
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