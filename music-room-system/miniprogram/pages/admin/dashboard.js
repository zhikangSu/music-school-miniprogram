// ========== /pages/admin/dashboard.js ==========
Page({
  data: {
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      todayAppointments: 0,
      monthRevenue: 0
    },
    recentAppointments: [],
    chartData: null
  },

  onLoad() {
    this.checkAdminRole();
    this.loadDashboardData();
  },

  checkAdminRole() {
    const role = getApp().globalData.role;
    if (role !== 'admin') {
      wx.showToast({
        title: '无权限访问',
        icon: 'none'
      });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    }
  },

  loadDashboardData() {
    wx.showLoading({ title: '加载中...' });
    
    // 模拟数据，实际应该调用多个API
    this.setData({
      stats: {
        totalStudents: 256,
        totalTeachers: 18,
        todayAppointments: 24,
        monthRevenue: 45280
      },
      recentAppointments: [
        {
          id: 1,
          student_name: '张三',
          teacher_name: '李老师',
          course_name: '钢琴',
          appointment_date: '2024-01-15',
          start_time: '14:00',
          status: 'confirmed'
        },
        {
          id: 2,
          student_name: '李四',
          teacher_name: '王老师',
          course_name: '吉他',
          appointment_date: '2024-01-15',
          start_time: '15:00',
          status: 'pending'
        }
      ]
    });
    
    wx.hideLoading();
  },

  goToSalary() {
    wx.navigateTo({ url: '/pages/admin/salary' });
  },

  goToCourseManage() {
    wx.navigateTo({ url: '/pages/admin/course' });
  },

  goToTeacherManage() {
    wx.navigateTo({ url: '/pages/admin/teacher' });
  },

  goToStudentManage() {
    wx.navigateTo({ url: '/pages/admin/student' });
  },

  viewAppointmentDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin/appointment-detail?id=${id}` });
  },

  exportData() {
    wx.showModal({
      title: '导出数据',
      content: '确定要导出本月数据报表吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '导出成功', icon: 'success' });
        }
      }
    });
  }
});
