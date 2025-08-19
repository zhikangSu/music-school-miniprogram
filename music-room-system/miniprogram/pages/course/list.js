// ========== /pages/course/list.js ==========
Page({
  data: {
    courseTypes: []
  },

  onLoad() {
    this.loadCourseTypes();
  },

  loadCourseTypes() {
    wx.showLoading({ title: '加载中...' });
    
    getApp().request({
      url: '/course-types',
      method: 'GET'
    }).then(data => {
      wx.hideLoading();
      this.setData({ 
        courseTypes: data.map(item => ({
          ...item,
          icon: this.getCourseIcon(item.name),
          studentCount: Math.floor(Math.random() * 100) + 50,
          teacherCount: Math.floor(Math.random() * 10) + 5
        }))
      });
    }).catch(() => {
      wx.hideLoading();
    });
  },

  getCourseIcon(name) {
    const icons = {
      '钢琴': '🎹',
      '吉他': '🎸',
      '声乐': '🎤',
      '古筝': '🎻',
      '小提琴': '🎻',
      '架子鼓': '🥁',
      '尤克里里': '🎸',
      '萨克斯': '🎺'
    };
    return icons[name] || '🎵';
  },

  selectCourse(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/teacher/list?courseId=${id}&courseName=${name}`
    });
  }
});