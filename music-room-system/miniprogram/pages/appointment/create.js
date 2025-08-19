// ========== /pages/appointment/create.js ==========
Page({
  data: {
    teacherId: null,
    courseId: null,
    teacherName: '',
    courseTypes: [],
    selectedCourse: null,
    selectedDate: '',
    selectedTime: '',
    timeSlots: [],
    notes: '',
    price: 0,
    duration: 60
  },

  onLoad(options) {
    const today = new Date();
    const dateStr = this.formatDate(today);
    
    this.setData({
      teacherId: options.teacherId,
      courseId: options.courseId,
      teacherName: options.teacherName,
      selectedDate: dateStr
    });
    
    this.loadCourseTypes();
    this.loadTeacherSchedule();
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  loadCourseTypes() {
    getApp().request({
      url: '/course-types',
      method: 'GET'
    }).then(data => {
      this.setData({ courseTypes: data });
      
      if (this.data.courseId) {
        const course = data.find(c => c.id == this.data.courseId);
        this.setData({ 
          selectedCourse: course,
          price: 200 // 这里应该从教师价格表获取
        });
      }
    });
  },

  loadTeacherSchedule() {
    // 生成时间段
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      slots.push({
        value: `${hour}:00`,
        label: `${hour}:00 - ${hour + 1}:00`,
        available: this.checkTimeAvailable(hour)
      });
    }
    this.setData({ timeSlots: slots });
    
    // 获取教师已预约时间
    this.loadAppointments();
  },

  checkTimeAvailable(hour) {
    // 这里应该检查实际的预约情况
    // 模拟一些时间段不可用
    return ![12, 13, 18].includes(hour);
  },

  loadAppointments() {
    getApp().request({
      url: `/appointments?teacherId=${this.data.teacherId}&date=${this.data.selectedDate}`,
      method: 'GET'
    }).then(data => {
      // 更新时间段可用性
      const slots = this.data.timeSlots.map(slot => {
        const [hour] = slot.value.split(':');
        const isBooked = data.some(apt => {
          const [aptHour] = apt.start_time.split(':');
          return aptHour === hour && apt.status !== 'cancelled';
        });
        return {
          ...slot,
          available: !isBooked && this.checkTimeAvailable(parseInt(hour))
        };
      });
      this.setData({ timeSlots: slots });
    });
  },

  bindCourseChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedCourse: this.data.courseTypes[index],
      courseId: this.data.courseTypes[index].id
    });
  },

  bindDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
    this.loadTeacherSchedule();
  },

  selectTime(e) {
    const time = e.currentTarget.dataset.time;
    if (time.available) {
      this.setData({ selectedTime: time.value });
    } else {
      wx.showToast({
        title: '该时间段不可选',
        icon: 'none'
      });
    }
  },

  bindDurationChange(e) {
    const durations = [60, 90, 120];
    this.setData({ 
      duration: durations[e.detail.value],
      price: this.data.price * (durations[e.detail.value] / 60)
    });
  },

  inputNotes(e) {
    this.setData({ notes: e.detail.value });
  },

  submitAppointment() {
    if (!this.data.selectedCourse) {
      wx.showToast({ title: '请选择课程类型', icon: 'none' });
      return;
    }
    
    if (!this.data.selectedTime) {
      wx.showToast({ title: '请选择上课时间', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '确认预约',
      content: `教师：${this.data.teacherName}\n课程：${this.data.selectedCourse.name}\n时间：${this.data.selectedDate} ${this.data.selectedTime}\n费用：¥${this.data.price}`,
      success: (res) => {
        if (res.confirm) {
          this.doSubmit();
        }
      }
    });
  },

  doSubmit() {
    const [hour] = this.data.selectedTime.split(':');
    const endHour = parseInt(hour) + (this.data.duration / 60);
    const endTime = `${endHour}:00`;
    
    wx.showLoading({ title: '提交中...' });
    
    getApp().request({
      url: '/appointments',
      method: 'POST',
      data: {
        teacherId: this.data.teacherId,
        courseTypeId: this.data.courseId,
        appointmentDate: this.data.selectedDate,
        startTime: this.data.selectedTime,
        endTime: endTime,
        notes: this.data.notes
      }
    }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '预约成功', icon: 'success' });
      
      setTimeout(() => {
        wx.switchTab({ url: '/pages/appointment/list' });
      }, 1500);
    }).catch(() => {
      wx.hideLoading();
    });
  }
});
