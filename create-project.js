const fs = require('fs');
const path = require('path');

// 项目文件结构定义
const projectStructure = {
  'music-room-system': {
    'backend': {
      'package.json': JSON.stringify({
        "name": "music-room-backend",
        "version": "1.0.0",
        "description": "音乐教室管理系统后端",
        "main": "app.js",
        "scripts": {
          "start": "node app.js",
          "dev": "nodemon app.js"
        },
        "dependencies": {
          "express": "^4.18.0",
          "cors": "^2.8.5",
          "body-parser": "^1.20.0",
          "mysql2": "^3.6.0",
          "jsonwebtoken": "^9.0.0",
          "bcryptjs": "^2.4.3",
          "dotenv": "^16.3.0"
        }
      }, null, 2),
      'app.js': `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.get('/', (req, res) => {
  res.json({ message: '音乐教室管理系统后端API' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(\`服务器运行在端口 \${PORT}\`);
});`,
      '.env': `# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_room_system

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 服务器端口
PORT=3000`,
      '.gitignore': `node_modules/
.env
*.log
dist/
.DS_Store`
    },
    'miniprogram': {
      'app.js': `App({
  onLaunch() {
    console.log('音乐教室小程序启动');
  },
  globalData: {
    userInfo: null,
    baseUrl: 'http://localhost:3000'
  }
});`,
      'app.json': JSON.stringify({
        "pages": [
          "pages/index/index",
          "pages/login/login",
          "pages/course/list",
          "pages/teacher/list",
          "pages/teacher/detail",
          "pages/teacher/schedule",
          "pages/appointment/create",
          "pages/appointment/list",
          "pages/admin/dashboard",
          "pages/admin/salary",
          "pages/my/index"
        ],
        "window": {
          "backgroundTextStyle": "light",
          "navigationBarBackgroundColor": "#fff",
          "navigationBarTitleText": "音乐教室",
          "navigationBarTextStyle": "black"
        },
        "tabBar": {
          "color": "#7A7E83",
          "selectedColor": "#3cc51f",
          "borderStyle": "black",
          "backgroundColor": "#ffffff",
          "list": [
            {
              "pagePath": "pages/index/index",
              "iconPath": "images/home.png",
              "selectedIconPath": "images/home-active.png",
              "text": "首页"
            },
            {
              "pagePath": "pages/course/list",
              "iconPath": "images/course.png",
              "selectedIconPath": "images/course-active.png",
              "text": "课程"
            },
            {
              "pagePath": "pages/my/index",
              "iconPath": "images/my.png",
              "selectedIconPath": "images/my-active.png",
              "text": "我的"
            }
          ]
        }
      }, null, 2),
      'app.wxss': `/**app.wxss**/
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 200rpx 0;
  box-sizing: border-box;
}`,
      'pages': {
        'index': {
          'index.js': `Page({
  data: {
    motto: '欢迎来到音乐教室',
    userInfo: {},
    hasUserInfo: false
  },
  onLoad() {
    console.log('首页加载');
  }
});`,
          'index.wxml': `<view class="container">
  <view class="userinfo">
    <text class="userinfo-nickname">{{motto}}</text>
  </view>
</view>`,
          'index.wxss': `.userinfo {
  display: flex;
  flex-direction: column;
  align-items: center;
}`,
          'index.json': JSON.stringify({
            "usingComponents": {},
            "navigationBarTitleText": "首页"
          }, null, 2)
        },
        'login': {
          'login.js': `Page({
  data: {
    username: '',
    password: ''
  },
  onLoad() {
    console.log('登录页加载');
  }
});`,
          'login.wxml': `<view class="container">
  <text>登录页面</text>
</view>`,
          'login.wxss': `.container {
  padding: 20rpx;
}`,
          'login.json': JSON.stringify({
            "usingComponents": {},
            "navigationBarTitleText": "登录"
          }, null, 2)
        },
        'course': {
          'list.js': `Page({
  data: {
    courses: []
  },
  onLoad() {
    console.log('课程列表页加载');
  }
});`,
          'list.wxml': `<view class="container">
  <text>课程列表</text>
</view>`,
          'list.wxss': `.container {
  padding: 20rpx;
}`,
          'list.json': JSON.stringify({
            "usingComponents": {},
            "navigationBarTitleText": "课程列表"
          }, null, 2)
        },
        'teacher': {
          'list.js': `Page({
  data: {
    teachers: []
  }
});`,
          'list.wxml': `<view class="container">
  <text>教师列表</text>
</view>`,
          'list.wxss': `.container { padding: 20rpx; }`,
          'list.json': JSON.stringify({"usingComponents": {}, "navigationBarTitleText": "教师列表"}, null, 2),
          'detail.js': `Page({
  data: {
    teacher: {}
  }
});`,
          'detail.wxml': `<view class="container">
  <text>教师详情</text>
</view>`,
          'detail.wxss': `.container { padding: 20rpx; }`,
          'detail.json': JSON.stringify({"usingComponents": {}, "navigationBarTitleText": "教师详情"}, null, 2),
          'schedule.js': `Page({
  data: {
    schedule: []
  }
});`,
          'schedule.wxml': `<view class="container">
  <text>教师排课</text>
</view>`,
          'schedule.wxss': `.container { padding: 20rpx; }`,
          'schedule.json': JSON.stringify({"usingComponents": {}, "navigationBarTitleText": "教师排课"}, null, 2)
        },
        'appointment': {
          'create.js': `Page({
  data: {
    form: {}
  }
});`,
          'create.wxml': `<view class="container">
  <text>创建预约</text>
</view>`,
          'create.wxss': `.container { padding: 20rpx; }`,
          'create.json': JSON.stringify({"usingComponents": {}, "navigationBarTitleText": "创建预约"}, null, 2),
          'list.js': `Page({
  data: {
    appointments: []
  }
});`,
          'list.wxml': `<view class="container">
  <text>预约列表</text>
</view>`,
          'list.wxss': `.container { padding: 20rpx; }`,
          'list.json': JSON.stringify({"usingComponents": {}, "navigationBarTitleText": "预约列表"}, null, 2)
        },
        'admin': {
          'dashboard.js': `Page({
  data: {
    stats: {}
  }
});`,
          'dashboard.wxml': `<view class="container">
  <text>管理员仪表板</text>
</view>`,
          'dashboard.wxss': `.container { padding: 20rpx; }`,
          'dashboard.json': JSON.stringify({"usingComponents": {}, "navigationBarTitleText": "管理员仪表板"}, null, 2),
          'salary.js': `Page({
  data: {
    salary: []
  }
});`,
          'salary.wxml': `<view class="container">
  <text>工资管理</text>
</view>`,
          'salary.wxss': `.container { padding: 20rpx; }`,
          'salary.json': JSON.stringify({"usingComponents": {}, "navigationBarTitleText": "工资管理"}, null, 2)
        },
        'my': {
          'index.js': `Page({
  data: {
    userInfo: {}
  }
});`,
          'index.wxml': `<view class="container">
  <text>个人中心</text>
</view>`,
          'index.wxss': `.container { padding: 20rpx; }`,
          'index.json': JSON.stringify({"usingComponents": {}, "navigationBarTitleText": "个人中心"}, null, 2)
        }
      },
      'images': {
        'home.png': '# 图片文件占位符',
        'home-active.png': '# 图片文件占位符',
        'course.png': '# 图片文件占位符',
        'course-active.png': '# 图片文件占位符',
        'my.png': '# 图片文件占位符',
        'my-active.png': '# 图片文件占位符'
      }
    },
    'admin-web': {
      'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>音乐教室管理后台</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <h1>音乐教室管理后台</h1>
        <nav>
            <ul>
                <li><a href="#dashboard">仪表板</a></li>
                <li><a href="#teachers">教师管理</a></li>
                <li><a href="#courses">课程管理</a></li>
                <li><a href="#appointments">预约管理</a></li>
                <li><a href="#salary">工资管理</a></li>
            </ul>
        </nav>
        <main id="content">
            <p>欢迎使用音乐教室管理系统</p>
        </main>
    </div>
    <script src="js/main.js"></script>
</body>
</html>`,
      'css': {
        'style.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
}

nav ul li {
    margin: 0 15px;
}

nav ul li a {
    text-decoration: none;
    color: #007bff;
    padding: 10px 15px;
    border-radius: 5px;
    transition: background-color 0.3s;
}

nav ul li a:hover {
    background-color: #007bff;
    color: white;
}

#content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`
      },
      'js': {
        'main.js': `// 管理后台主要JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    console.log('音乐教室管理后台已加载');
    
    // 绑定导航点击事件
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            loadSection(section);
        });
    });
});

function loadSection(section) {
    const content = document.getElementById('content');
    
    switch(section) {
        case 'dashboard':
            content.innerHTML = '<h2>仪表板</h2><p>系统概览数据</p>';
            break;
        case 'teachers':
            content.innerHTML = '<h2>教师管理</h2><p>教师信息管理</p>';
            break;
        case 'courses':
            content.innerHTML = '<h2>课程管理</h2><p>课程信息管理</p>';
            break;
        case 'appointments':
            content.innerHTML = '<h2>预约管理</h2><p>预约信息管理</p>';
            break;
        case 'salary':
            content.innerHTML = '<h2>工资管理</h2><p>工资计算与管理</p>';
            break;
        default:
            content.innerHTML = '<p>欢迎使用音乐教室管理系统</p>';
    }
}`
      }
    }
  }
};

// 递归创建文件和文件夹的函数
function createStructure(structure, basePath = '') {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);
    
    if (typeof content === 'object' && content !== null) {
      // 创建文件夹
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 创建文件夹: ${fullPath}`);
      }
      // 递归创建子内容
      createStructure(content, fullPath);
    } else {
      // 创建文件
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`📄 创建文件: ${fullPath}`);
      } else {
        console.log(`⚠️  文件已存在，跳过: ${fullPath}`);
      }
    }
  }
}

// 执行创建
console.log('🚀 开始创建项目结构...\n');
createStructure(projectStructure);
console.log('\n✅ 项目结构创建完成！');
console.log('\n📋 后续步骤：');
console.log('1. cd music-room-system/backend');
console.log('2. npm install');
console.log('3. 配置.env文件中的数据库连接信息');
console.log('4. npm start 启动后端服务');
console.log('5. 使用微信开发者工具打开miniprogram文件夹');
console.log('6. 在浏览器中打开admin-web/index.html');