// ========== /pages/appointment/create.js (云托管版) ==========
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

  // 加载课程类型
  loadCourseTypes() {
    getApp().callContainer({
      path: '/api/course-types',
      method: 'GET'
    }).then(data => {
      this.setData({ courseTypes: data });
      
      if (this.data.courseId) {
        const course = data.find(c => c.id == this.data.courseId);
        this.setData({ 
          selectedCourse: course,
          price: this.calculatePrice(course) // 根据课程和教师计算价格
        });
      }
    }).catch(err => {
      console.error('加载课程类型失败:', err);
      wx.showToast({ title: '加载课程失败', icon: 'none' });
    });
  },

  // 计算课程价格
  calculatePrice(course) {
    // 这里应该从后端获取教师的课程价格
    // 暂时使用默认价格
    return course.basePrice || 200;
  },

  // 加载教师日程
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

  // 检查时间是否可用
  checkTimeAvailable(hour) {
    // 基础规则：排除午休和晚餐时间
    return ![12, 13, 18].includes(hour);
  },

  // 加载已有预约
  loadAppointments() {
    getApp().callContainer({
      path: `/api/appointments`,
      method: 'GET',
      data: {
        teacherId: this.data.teacherId,
        date: this.data.selectedDate
      }
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
    }).catch(err => {
      console.error('加载预约信息失败:', err);
    });
  },

  // 选择课程
  bindCourseChange(e) {
    const index = e.detail.value;
    const course = this.data.courseTypes[index];
    this.setData({
      selectedCourse: course,
      courseId: course.id,
      price: this.calculatePrice(course) * (this.data.duration / 60)
    });
  },

  // 选择日期
  bindDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
    this.loadTeacherSchedule();
  },

  // 选择时间
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

  // 选择时长
  bindDurationChange(e) {
    const durations = [60, 90, 120];
    const duration = durations[e.detail.value];
    const basePrice = this.data.selectedCourse ? 
      this.calculatePrice(this.data.selectedCourse) : 200;
    
    this.setData({ 
      duration: duration,
      price: basePrice * (duration / 60)
    });
  },

  // 输入备注
  inputNotes(e) {
    this.setData({ notes: e.detail.value });
  },

  // 验证表单
  validateForm() {
    if (!this.data.selectedCourse) {
      wx.showToast({ title: '请选择课程类型', icon: 'none' });
      return false;
    }
    
    if (!this.data.selectedTime) {
      wx.showToast({ title: '请选择上课时间', icon: 'none' });
      return false;
    }
    
    return true;
  },

  // 计算结束时间
  calculateEndTime() {
    const [hour] = this.data.selectedTime.split(':');
    const endHour = parseInt(hour) + (this.data.duration / 60);
    return `${endHour}:00`;
  },

  // 提交预约（带支付）
  submitAppointment() {
    if (!this.validateForm()) return;
    
    wx.showModal({
      title: '确认预约',
      content: `教师：${this.data.teacherName}\n课程：${this.data.selectedCourse.name}\n时间：${this.data.selectedDate} ${this.data.selectedTime}\n时长：${this.data.duration}分钟\n费用：¥${this.data.price}`,
      success: (res) => {
        if (res.confirm) {
          // 先请求订阅消息权限
          this.requestSubscribeMessage().then(() => {
            this.createAppointmentWithPayment();
          }).catch(() => {
            // 即使订阅失败也继续预约流程
            this.createAppointmentWithPayment();
          });
        }
      }
    });
  },

  // 请求订阅消息权限
  requestSubscribeMessage() {
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds: ['YOUR_TEMPLATE_ID'], // 替换为实际的模板ID
        success: (res) => {
          if (res['YOUR_TEMPLATE_ID'] === 'accept') {
            resolve();
          } else {
            reject();
          }
        },
        fail: reject
      });
    });
  },

  // 创建预约并支付
  createAppointmentWithPayment() {
    wx.showLoading({ title: '创建订单...' });
    
    // 先创建预约
    getApp().callContainer({
      path: '/api/appointments',
      method: 'POST',
      data: {
        teacherId: this.data.teacherId,
        courseTypeId: this.data.courseId,
        appointmentDate: this.data.selectedDate,
        startTime: this.data.selectedTime,
        endTime: this.calculateEndTime(),
        duration: this.data.duration,
        notes: this.data.notes,
        price: this.data.price
      }
    }).then(appointment => {
      // 创建支付订单
      return getApp().callContainer({
        path: '/api/payment/create',
        method: 'POST',
        data: {
          appointmentId: appointment.id,
          amount: this.data.price,
          description: `${this.data.selectedCourse.name} - ${this.data.teacherName}`
        }
      });
    }).then(paymentData => {
      wx.hideLoading();
      // 调起微信支付
      this.requestPayment(paymentData);
    }).catch(err => {
      wx.hideLoading();
      console.error('创建订单失败:', err);
      wx.showToast({ 
        title: err.message || '创建订单失败', 
        icon: 'none' 
      });
    });
  },

  // 调起微信支付
  requestPayment(paymentData) {
    wx.requestPayment({
      timeStamp: paymentData.payment.timeStamp,
      nonceStr: paymentData.payment.nonceStr,
      package: paymentData.payment.package,
      signType: paymentData.payment.signType || 'MD5',
      paySign: paymentData.payment.paySign,
      success: (res) => {
        console.log('支付成功:', res);
        wx.showToast({ title: '支付成功', icon: 'success' });
        
        // 发送订阅消息
        this.sendSubscribeMessage();
        
        // 跳转到预约列表
        setTimeout(() => {
          wx.switchTab({ url: '/pages/appointment/list' });
        }, 1500);
      },
      fail: (err) => {
        console.error('支付失败:', err);
        if (err.errMsg === 'requestPayment:fail cancel') {
          wx.showToast({ title: '已取消支付', icon: 'none' });
          // 取消支付后可能需要取消预约
          this.cancelUnpaidAppointment(paymentData.appointmentId);
        } else {
          wx.showToast({ title: '支付失败', icon: 'none' });
        }
      }
    });
  },

  // 取消未支付的预约
  cancelUnpaidAppointment(appointmentId) {
    getApp().callContainer({
      path: `/api/appointments/${appointmentId}/cancel`,
      method: 'POST'
    }).then(() => {
      console.log('未支付预约已取消');
    }).catch(err => {
      console.error('取消预约失败:', err);
    });
  },

  // 发送订阅消息
  sendSubscribeMessage() {
    const app = getApp();
    const openid = app.globalData.userInfo ? app.globalData.userInfo.openid : '';
    
    if (!openid) {
      console.warn('无法发送订阅消息：缺少openid');
      return;
    }
    
    getApp().callContainer({
      path: '/api/message/subscribe',
      method: 'POST',
      data: {
        touser: openid,
        templateId: 'YOUR_TEMPLATE_ID', // 替换为实际的模板ID
        page: 'pages/appointment/detail',
        data: {
          thing1: { value: this.truncateString(this.data.selectedCourse.name, 20) },
          name2: { value: this.truncateString(this.data.teacherName, 10) },
          time3: { value: `${this.data.selectedDate} ${this.data.selectedTime}` },
          amount4: { value: `¥${this.data.price}` },
          thing5: { value: '预约成功，请准时参加' }
        }
      }
    }).then(() => {
      console.log('订阅消息发送成功');
    }).catch(err => {
      console.error('发送订阅消息失败:', err);
      // 订阅消息发送失败不影响主流程
    });
  },

  // 截断字符串（订阅消息有长度限制）
  truncateString(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: `预约${this.data.teacherName}老师的${this.data.selectedCourse ? this.data.selectedCourse.name : '课程'}`,
      path: `/pages/appointment/create?teacherId=${this.data.teacherId}&teacherName=${this.data.teacherName}&courseId=${this.data.courseId}`
    };
  }
});