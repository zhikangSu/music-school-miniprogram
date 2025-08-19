// ========== /pages/admin/salary.js ==========
Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    salaryData: [],
    totalAmount: 0,
    selectedTeacher: null
  },

  onLoad() {
    this.loadSalaryData();
  },

  loadSalaryData() {
    wx.showLoading({ title: '加载中...' });
    
    getApp().request({
      url: `/salary/monthly?year=${this.data.currentYear}&month=${this.data.currentMonth}`,
      method: 'GET'
    }).then(data => {
      wx.hideLoading();
      
      const total = data.reduce((sum, item) => sum + (item.total_amount || 0), 0);
      
      this.setData({
        salaryData: data,
        totalAmount: total
      });
    }).catch(() => {
      wx.hideLoading();
    });
  },

  bindDateChange(e) {
    const [year, month] = e.detail.value.split('-');
    this.setData({
      currentYear: parseInt(year),
      currentMonth: parseInt(month)
    });
    this.loadSalaryData();
  },

  generateSalary() {
    wx.showModal({
      title: '确认生成',
      content: `确定要生成${this.data.currentYear}年${this.data.currentMonth}月的工资单吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '生成中...' });
          
          getApp().request({
            url: '/salary/generate',
            method: 'POST',
            data: {
              year: this.data.currentYear,
              month: this.data.currentMonth
            }
          }).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '生成成功', icon: 'success' });
            this.loadSalaryData();
          }).catch(() => {
            wx.hideLoading();
          });
        }
      }
    });
  },

  viewTeacherDetail(e) {
    const teacher = e.currentTarget.dataset.teacher;
    this.setData({ selectedTeacher: teacher });
    
    wx.navigateTo({
      url: `/pages/admin/teacher-salary?id=${teacher.teacher_id}&year=${this.data.currentYear}&month=${this.data.currentMonth}`
    });
  },

  markAsPaid(e) {
    const teacherId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认发放',
      content: '确定已向该教师发放工资吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '已标记为已发放', icon: 'success' });
          // 更新状态
          this.loadSalaryData();
        }
      }
    });
  },

  exportSalary() {
    wx.showToast({ title: '正在导出...', icon: 'loading' });
    // 实际导出逻辑
    setTimeout(() => {
      wx.showToast({ title: '导出成功', icon: 'success' });
    }, 1500);
  }
});
