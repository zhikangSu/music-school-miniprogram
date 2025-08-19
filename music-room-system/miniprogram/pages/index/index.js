// ========== /pages/index/index.js ==========
Page({
  data: {
    courseTypes: [],
    banners: [
      { id: 1, image: '/images/banner1.jpg', title: '专业音乐教育' },
      { id: 2, image: '/images/banner2.jpg', title: '名师授课' }
    ],
    teachers: [],
    stats: {
      totalTeachers: 0,
      totalStudents: 0,
      totalCourses: 0
    }
  },

  onLoad() {
    this.checkLogin();
    this.loadCourseTypes();
    this.loadTopTeachers();
    this.loadStats();
  },

  onShow() {
    if (getApp().globalData.token) {
      this.loadCourseTypes();
    }
  },

  checkLogin() {
    if (!getApp().globalData.token) {
      wx.redirectTo({ url: '/pages/login/login' });
    }
  },

  loadCourseTypes() {
    getApp().request({
      url: '/course-types',
      method: 'GET'
    }).then(data => {
      this.setData({ 
        courseTypes: data.map(item => ({
          ...item,
          icon: this.getCourseIcon(item.name)
        }))
      });
    });
  },

  getCourseIcon(name) {
    const icons = {
      '钢琴': '🎹',
      '吉他': '🎸',
      '声乐': '🎤',
      '古筝': '🎻',
      '小提琴': '🎻',
      '架子鼓': '🥁'
    };
    return icons[name] || '🎵';
  },

  loadTopTeachers() {
    getApp().request({
      url: '/teachers',
      method: 'GET'
    }).then(data => {
      this.setData({ 
        teachers: data.slice(0, 4).map(teacher => ({
          ...teacher,
          avatar: teacher.avatar || '/images/default-avatar.png'
        }))
      });
    });
  },

  loadStats() {
    // 模拟统计数据，实际应从API获取
    this.setData({
      stats: {
        totalTeachers: 18,
        totalStudents: 256,
        totalCourses: 1024
      }
    });
  },

  selectCourse(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/teacher/list?courseId=${id}&courseName=${name}`
    });
  },

  viewTeacher(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher/detail?id=${teacherId}`
    });
  },

  goToAllTeachers() {
    wx.navigateTo({
      url: '/pages/teacher/list'
    });
  },

  goToAllCourses() {
    wx.navigateTo({
      url: '/pages/course/list'
    });
  }
});