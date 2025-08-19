// ========== /pages/teacher/detail.js ==========
Page({
  data: {
    teacherId: null,
    teacherInfo: null,
    courses: [],
    reviews: [],
    activeTab: 0
  },

  onLoad(options) {
    this.setData({ teacherId: options.id });
    this.loadTeacherInfo();
    this.loadCourses();
    this.loadReviews();
  },

  loadTeacherInfo() {
    wx.showLoading({ title: '加载中...' });
    
    // 模拟数据，实际应该调用API
    this.setData({
      teacherInfo: {
        id: this.data.teacherId,
        name: '李老师',
        avatar: '/images/default-avatar.png',
        experience_years: 5,
        total_students: 128,
        rating: 4.9,
        introduction: '毕业于中央音乐学院，具有丰富的教学经验，擅长钢琴和声乐教学。注重培养学生的音乐素养和演奏技巧。',
        achievements: [
          '中央音乐学院硕士学位',
          '全国钢琴比赛金奖指导教师',
          '5年以上教学经验'
        ]
      }
    });
    
    wx.hideLoading();
  },

  loadCourses() {
    // 加载教师教授的课程
    this.setData({
      courses: [
        { id: 1, name: '钢琴', price: 200, duration: 60 },
        { id: 2, name: '声乐', price: 180, duration: 60 }
      ]
    });
  },

  loadReviews() {
    // 加载评价
    this.setData({
      reviews: [
        {
          id: 1,
          student_name: '张同学',
          rating: 5,
          content: '老师非常专业，教学认真负责！',
          date: '2024-01-10'
        },
        {
          id: 2,
          student_name: '李同学',
          rating: 5,
          content: '课程内容丰富，收获很大',
          date: '2024-01-08'
        }
      ]
    });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.index });
  },

  bookCourse() {
    if (!getApp().globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/appointment/create?teacherId=${this.data.teacherId}&teacherName=${this.data.teacherInfo.name}`
    });
  }
});
