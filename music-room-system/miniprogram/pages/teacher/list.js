// ========== /pages/teacher/list.js ==========
Page({
  data: {
    courseId: null,
    courseName: '',
    teachers: [],
    loading: false,
    filterOptions: ['全部', '好评优先', '经验优先', '价格优先'],
    filterIndex: 0
  },

  onLoad(options) {
    this.setData({
      courseId: options.courseId || null,
      courseName: options.courseName || '全部教师'
    });
    
    wx.setNavigationBarTitle({
      title: this.data.courseName
    });
    
    this.loadTeachers();
  },

  loadTeachers() {
    this.setData({ loading: true });
    
    const url = this.data.courseId 
      ? `/teachers?courseTypeId=${this.data.courseId}`
      : '/teachers';
    
    getApp().request({
      url: url,
      method: 'GET'
    }).then(data => {
      this.setData({ 
        teachers: data.map(teacher => ({
          ...teacher,
          avatar: teacher.avatar || '/images/default-avatar.png',
          tags: this.getTeacherTags(teacher)
        })),
        loading: false 
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  getTeacherTags(teacher) {
    const tags = [];
    if (teacher.experience_years >= 5) tags.push('资深');
    if (teacher.rating >= 4.8) tags.push('好评');
    if (teacher.total_students >= 50) tags.push('人气');
    return tags;
  },

  changeFilter(e) {
    this.setData({ filterIndex: e.detail.value });
    this.sortTeachers();
  },

  sortTeachers() {
    const { filterIndex, teachers } = this.data;
    let sorted = [...teachers];
    
    switch(filterIndex) {
      case 1: // 好评优先
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 2: // 经验优先
        sorted.sort((a, b) => b.experience_years - a.experience_years);
        break;
      case 3: // 价格优先
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
    }
    
    this.setData({ teachers: sorted });
  },

  viewTeacherDetail(e) {
    const teacherId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/teacher/detail?id=${teacherId}`
    });
  },

  bookCourse(e) {
    const teacher = e.currentTarget.dataset.teacher;
    
    if (!getApp().globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/appointment/create?teacherId=${teacher.id}&courseId=${this.data.courseId}&teacherName=${teacher.name}`
    });
  }
});
