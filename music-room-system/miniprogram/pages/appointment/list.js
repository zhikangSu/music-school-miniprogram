Page({
  data: {
    tabs: ['待确认', '已确认', '已完成', '已取消'],
    activeTab: 0,
    appointments: [],
    filteredAppointments: []
  },

  onLoad() {
    this.loadAppointments();
  },

  onShow() {
    this.loadAppointments();
  },

  loadAppointments() {
    wx.showLoading({ title: '加载中...' });
    
    getApp().request({
      url: '/appointments',
      method: 'GET'
    }).then(data => {
      wx.hideLoading();
      this.setData({ appointments: data });
      this.filterAppointments();
    }).catch(() => {
      wx.hideLoading();
    });
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.filterAppointments();
  },

  filterAppointments() {
    const statusMap = ['pending', 'confirmed', 'completed', 'cancelled'];
    const status = statusMap[this.data.activeTab];
    
    const filtered = this.data.appointments.filter(a => a.status === status);
    this.setData({ filteredAppointments: filtered });
  },

  cancelAppointment(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          getApp().request({
            url: `/appointments/${id}/status`,
            method: 'PATCH',
            data: { status: 'cancelled' }
          }).then(() => {
            wx.showToast({ title: '已取消', icon: 'success' });
            this.loadAppointments();
          });
        }
      }
    });
  },

  confirmComplete(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认完成',
      content: '确认已完成这节课程吗？',
      success: (res) => {
        if (res.confirm) {
          getApp().request({
            url: `/appointments/${id}/status`,
            method: 'PATCH',
            data: { status: 'completed' }
          }).then(() => {
            wx.showToast({ title: '已完成', icon: 'success' });
            this.loadAppointments();
          });
        }
      }
    });
  },

  makePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    });
  }
});