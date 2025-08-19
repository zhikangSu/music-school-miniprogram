// ==================== 额外页面文件 ====================

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

// ========== /pages/teacher/detail.wxml ==========
`<view class="container">
  <!-- 教师信息头部 -->
  <view class="teacher-header">
    <image class="teacher-avatar" src="{{teacherInfo.avatar}}"></image>
    <view class="teacher-info">
      <view class="teacher-name">{{teacherInfo.name}}</view>
      <view class="teacher-meta">
        <text class="meta-item">{{teacherInfo.experience_years}}年教龄</text>
        <text class="meta-item">{{teacherInfo.total_students}}位学生</text>
      </view>
      <view class="teacher-rating">
        <text class="stars">⭐⭐⭐⭐⭐</text>
        <text class="score">{{teacherInfo.rating}}分</text>
      </view>
    </view>
  </view>
  
  <!-- 标签页 -->
  <view class="tabs">
    <view class="tab-item {{activeTab === 0 ? 'active' : ''}}" 
          bindtap="switchTab" data-index="0">简介</view>
    <view class="tab-item {{activeTab === 1 ? 'active' : ''}}" 
          bindtap="switchTab" data-index="1">课程</view>
    <view class="tab-item {{activeTab === 2 ? 'active' : ''}}" 
          bindtap="switchTab" data-index="2">评价</view>
  </view>
  
  <!-- 内容区域 -->
  <view class="content">
    <!-- 简介标签页 -->
    <view wx:if="{{activeTab === 0}}" class="intro-content">
      <view class="section">
        <view class="section-title">个人简介</view>
        <view class="section-content">{{teacherInfo.introduction}}</view>
      </view>
      
      <view class="section">
        <view class="section-title">教学成就</view>
        <view class="achievement-list">
          <view class="achievement-item" wx:for="{{teacherInfo.achievements}}" wx:key="*this">
            <text class="achievement-icon">✓</text>
            <text class="achievement-text">{{item}}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 课程标签页 -->
    <view wx:if="{{activeTab === 1}}" class="course-content">
      <view class="course-card" wx:for="{{courses}}" wx:key="id">
        <view class="course-name">{{item.name}}</view>
        <view class="course-meta">
          <text class="course-duration">{{item.duration}}分钟/节</text>
          <text class="course-price">¥{{item.price}}</text>
        </view>
      </view>
    </view>
    
    <!-- 评价标签页 -->
    <view wx:if="{{activeTab === 2}}" class="review-content">
      <view class="review-card" wx:for="{{reviews}}" wx:key="id">
        <view class="review-header">
          <text class="student-name">{{item.student_name}}</text>
          <text class="review-date">{{item.date}}</text>
        </view>
        <view class="review-rating">
          <text class="stars">⭐⭐⭐⭐⭐</text>
        </view>
        <view class="review-text">{{item.content}}</view>
      </view>
    </view>
  </view>
  
  <!-- 底部预约按钮 -->
  <view class="bottom-bar">
    <button class="book-btn" bindtap="bookCourse">立即预约</button>
  </view>
</view>`

// ========== /pages/teacher/detail.wxss ==========
`.teacher-header {
  display: flex;
  padding: 30rpx;
  background: white;
}

.teacher-avatar {
  width: 150rpx;
  height: 150rpx;
  border-radius: 75rpx;
  margin-right: 30rpx;
}

.teacher-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.teacher-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.teacher-meta {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.meta-item {
  font-size: 26rpx;
  color: #666;
}

.teacher-rating {
  display: flex;
  align-items: center;
}

.stars {
  font-size: 24rpx;
  margin-right: 10rpx;
}

.score {
  font-size: 28rpx;
  color: #ff9500;
  font-weight: bold;
}

.tabs {
  display: flex;
  background: white;
  margin-top: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 30rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #4A90E2;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #4A90E2;
}

.content {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.section-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.achievement-list {
  margin-top: 20rpx;
}

.achievement-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.achievement-icon {
  color: #4A90E2;
  margin-right: 15rpx;
  font-size: 28rpx;
}

.achievement-text {
  font-size: 28rpx;
  color: #666;
}

.course-card {
  background: white;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 15rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.course-meta {
  text-align: right;
}

.course-duration {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 10rpx;
}

.course-price {
  font-size: 36rpx;
  color: #ff4444;
  font-weight: bold;
}

.review-card {
  background: white;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 15rpx;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.student-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.review-date {
  font-size: 24rpx;
  color: #999;
}

.review-rating {
  margin-bottom: 15rpx;
}

.review-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: white;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}

.book-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 45rpx;
  font-size: 32rpx;
  border: none;
}`

// ========== /pages/teacher/detail.json ==========
// {
//   "navigationBarTitleText": "教师详情"
// }

// ========== /pages/teacher/schedule.js ==========
Page({
  data: {
    weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    timeSlots: [],
    schedules: {},
    currentWeek: [],
    selectedDate: ''
  },

  onLoad() {
    this.initTimeSlots();
    this.initWeekDates();
    this.loadMySchedule();
  },

  initTimeSlots() {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      slots.push({
        start: `${hour}:00`,
        end: `${hour + 1}:00`,
        label: `${hour}:00-${hour + 1}:00`
      });
    }
    this.setData({ timeSlots: slots });
  },

  initWeekDates() {
    const today = new Date();
    const currentWeek = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i + 1);
      currentWeek.push({
        date: this.formatDate(date),
        day: this.data.weekDays[i],
        dayNum: date.getDate()
      });
    }
    
    this.setData({ 
      currentWeek,
      selectedDate: this.formatDate(today)
    });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  loadMySchedule() {
    // 获取教师的时间表
    const userInfo = getApp().globalData.userInfo;
    if (!userInfo) return;
    
    // 模拟数据
    const schedules = {};
    this.data.currentWeek.forEach(day => {
      schedules[day.date] = [];
    });
    
    this.setData({ schedules });
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date });
  },

  toggleTimeSlot(e) {
    const { time } = e.currentTarget.dataset;
    const { selectedDate, schedules } = this.data;
    
    if (!schedules[selectedDate]) {
      schedules[selectedDate] = [];
    }
    
    const index = schedules[selectedDate].indexOf(time);
    if (index > -1) {
      schedules[selectedDate].splice(index, 1);
    } else {
      schedules[selectedDate].push(time);
    }
    
    this.setData({ schedules });
  },

  isTimeSelected(time) {
    const { selectedDate, schedules } = this.data;
    return schedules[selectedDate] && schedules[selectedDate].includes(time);
  },

  saveSchedule() {
    wx.showLoading({ title: '保存中...' });
    
    // 整理数据格式
    const scheduleData = [];
    Object.keys(this.data.schedules).forEach(date => {
      this.data.schedules[date].forEach(time => {
        scheduleData.push({
          date: date,
          time: time
        });
      });
    });
    
    // 调用API保存
    getApp().request({
      url: '/teacher-schedules',
      method: 'POST',
      data: { schedules: scheduleData }
    }).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
    }).catch(() => {
      wx.hideLoading();
    });
  }
});
