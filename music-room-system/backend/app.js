const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 云托管环境变量
const isDev = process.env.NODE_ENV !== 'production';

// 数据库连接配置 - 使用云托管环境变量
const dbConfig = {
  host: process.env.MYSQL_ADDRESS ? process.env.MYSQL_ADDRESS.split(':')[0] : 'localhost',
  port: process.env.MYSQL_ADDRESS ? process.env.MYSQL_ADDRESS.split(':')[1] : 3306,
  user: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'music_room_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// 初始化数据库连接池
async function initDatabase() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log('数据库连接池创建成功');
    await createTables();
  } catch (error) {
    console.error('数据库连接失败:', error);
    // 云托管环境下，如果数据库连接失败，等待后重试
    if (!isDev) {
      setTimeout(initDatabase, 5000);
    }
  }
}

// 创建数据表（与之前相同）
async function createTables() {
  const connection = await pool.getConnection();
  try {
    // 用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        openid VARCHAR(100) UNIQUE,
        unionid VARCHAR(100),
        role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
        name VARCHAR(50),
        phone VARCHAR(20),
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 其他表结构与之前相同...
    console.log('所有数据表创建成功');
  } finally {
    connection.release();
  }
}

// ========== 微信登录 - 云托管版本 ==========
app.post('/api/auth/wxlogin', async (req, res) => {
  const { code, userInfo } = req.body;
  
  try {
    let openid, unionid, sessionKey;
    
    // 在云托管环境中，可以使用内置的微信API
    if (!isDev) {
      // 云托管环境 - 使用内置服务调用
      const wxRes = await axios.get(`http://api.weixin.qq.com/sns/jscode2session`, {
        params: {
          appid: process.env.APPID,
          secret: process.env.APPSECRET,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });
      
      openid = wxRes.data.openid;
      unionid = wxRes.data.unionid;
      sessionKey = wxRes.data.session_key;
    } else {
      // 开发环境 - 模拟数据
      openid = 'dev_openid_' + Date.now();
      unionid = 'dev_unionid_' + Date.now();
    }
    
    const connection = await pool.getConnection();
    try {
      // 查找或创建用户
      let [users] = await connection.execute(
        'SELECT * FROM users WHERE openid = ?',
        [openid]
      );
      
      let user;
      if (users.length === 0) {
        // 创建新用户
        const [result] = await connection.execute(
          'INSERT INTO users (openid, unionid, name, avatar) VALUES (?, ?, ?, ?)',
          [openid, unionid, userInfo?.nickName || '用户', userInfo?.avatarUrl || '']
        );
        user = {
          id: result.insertId,
          openid,
          unionid,
          role: 'student',
          name: userInfo?.nickName || '用户'
        };
      } else {
        user = users[0];
        // 更新用户信息
        if (userInfo) {
          await connection.execute(
            'UPDATE users SET name = ?, avatar = ? WHERE id = ?',
            [userInfo.nickName, userInfo.avatarUrl, user.id]
          );
        }
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { id: user.id, openid: user.openid, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      res.json({ 
        token, 
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// ========== 微信支付接口 - 云托管专用 ==========
app.post('/api/payment/create', async (req, res) => {
  const { appointmentId, amount } = req.body;
  const { openid } = req.user;
  
  try {
    // 调用微信支付API
    const paymentParams = {
      appid: process.env.APPID,
      mchid: process.env.MCHID,
      description: '琴房课程费用',
      out_trade_no: 'MUSIC_' + appointmentId + '_' + Date.now(),
      amount: {
        total: amount * 100, // 转换为分
        currency: 'CNY'
      },
      payer: {
        openid: openid
      },
      notify_url: `https://${process.env.CLOUD_HOST}/api/payment/notify`
    };
    
    // 云托管环境下可以直接调用微信支付API
    const paymentRes = await axios.post(
      'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi',
      paymentParams,
      {
        headers: {
          'Authorization': generateWxPayAuth(paymentParams)
        }
      }
    );
    
    res.json({
      prepay_id: paymentRes.data.prepay_id,
      // 返回小程序调起支付所需参数
      payment: generatePaymentParams(paymentRes.data.prepay_id)
    });
  } catch (error) {
    console.error('创建支付失败:', error);
    res.status(500).json({ error: '创建支付失败' });
  }
});

// ========== 发送订阅消息 - 云托管版本 ==========
app.post('/api/message/send', async (req, res) => {
  const { touser, templateId, data, page } = req.body;
  
  try {
    // 获取access_token（云托管环境可以缓存）
    const tokenRes = await axios.get(`https://api.weixin.qq.com/cgi-bin/token`, {
      params: {
        grant_type: 'client_credential',
        appid: process.env.APPID,
        secret: process.env.APPSECRET
      }
    });
    
    const accessToken = tokenRes.data.access_token;
    
    // 发送订阅消息
    const messageRes = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
      {
        touser,
        template_id: templateId,
        page,
        data,
        miniprogram_state: isDev ? 'developer' : 'formal'
      }
    );
    
    res.json({ success: true, result: messageRes.data });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

// ========== 上传文件到云存储 ==========
app.post('/api/upload', async (req, res) => {
  // 云托管环境可以直接使用云存储
  // 这里需要配置 multer 等文件上传中间件
  try {
    // 文件上传逻辑
    res.json({ 
      url: `https://${process.env.CLOUD_STORAGE_DOMAIN}/uploads/${filename}`
    });
  } catch (error) {
    res.status(500).json({ error: '上传失败' });
  }
});

// 健康检查接口（云托管需要）
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 其他API接口与之前相同...

// 启动服务器 - 云托管默认使用80端口
const PORT = process.env.PORT || 80;

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log('环境:', isDev ? '开发' : '生产');
  });
}).catch(error => {
  console.error('服务启动失败:', error);
  process.exit(1);
});