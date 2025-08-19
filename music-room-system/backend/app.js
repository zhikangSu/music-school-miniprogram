// 琴房管理系统后端 - Node.js + Express + MySQL
// package.json 依赖项
/*
{
  "dependencies": {
    "express": "^4.18.0",
    "mysql2": "^3.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "moment": "^2.29.0",
    "axios": "^1.3.0"
  }
}
*/

// app.js - 主应用文件
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'music_room_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// 初始化数据库连接池
async function initDatabase() {
  pool = await mysql.createPool(dbConfig);
  console.log('数据库连接池创建成功');
  await createTables();
}

// 创建数据表
async function createTables() {
  const connection = await pool.getConnection();
  try {
    // 用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        openid VARCHAR(100) UNIQUE,
        role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
        name VARCHAR(50),
        phone VARCHAR(20),
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 课程类型表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS course_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        status TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 教师信息表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        introduction TEXT,
        experience_years INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 5.00,
        total_students INT DEFAULT 0,
        status TINYINT DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 教师课程价格表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teacher_prices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT,
        course_type_id INT,
        price DECIMAL(10,2),
        duration INT DEFAULT 60,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id),
        FOREIGN KEY (course_type_id) REFERENCES course_types(id),
        UNIQUE KEY unique_teacher_course (teacher_id, course_type_id)
      )
    `);

    // 教师可用时间表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teacher_schedules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT,
        day_of_week INT,
        start_time TIME,
        end_time TIME,
        is_available TINYINT DEFAULT 1,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      )
    `);

    // 课程预约表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        teacher_id INT,
        course_type_id INT,
        appointment_date DATE,
        start_time TIME,
        end_time TIME,
        price DECIMAL(10,2),
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (teacher_id) REFERENCES teachers(id),
        FOREIGN KEY (course_type_id) REFERENCES course_types(id)
      )
    `);

    // 工资记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS salary_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT,
        year INT,
        month INT,
        total_hours DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        status ENUM('pending', 'paid') DEFAULT 'pending',
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id),
        UNIQUE KEY unique_teacher_month (teacher_id, year, month)
      )
    `);

    console.log('所有数据表创建成功');
  } finally {
    connection.release();
  }
}

// JWT中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未授权' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token无效' });
    req.user = user;
    next();
  });
};

// 角色权限中间件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
};

// ============ API路由 ============

// 1. 用户认证相关
// 微信小程序登录
app.post('/api/auth/wxlogin', async (req, res) => {
  const { code, userInfo } = req.body;
  
  try {
    // 这里应该调用微信API获取openid
    // const wxResponse = await getWxOpenId(code);
    // 为演示，这里模拟openid
    const openid = 'mock_openid_' + Date.now();
    
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
          'INSERT INTO users (openid, name, avatar) VALUES (?, ?, ?)',
          [openid, userInfo?.nickName || '用户', userInfo?.avatarUrl || '']
        );
        user = {
          id: result.insertId,
          openid,
          role: 'student',
          name: userInfo?.nickName || '用户'
        };
      } else {
        user = users[0];
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      res.json({ token, user });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 2. 课程类型管理
// 获取所有课程类型
app.get('/api/course-types', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM course_types WHERE status = 1 ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取课程类型失败' });
  }
});

// 添加课程类型（管理员）
app.post('/api/course-types', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { name, description, icon } = req.body;
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO course_types (name, description, icon) VALUES (?, ?, ?)',
      [name, description, icon]
    );
    res.json({ id: result.insertId, message: '添加成功' });
  } catch (error) {
    res.status(500).json({ error: '添加失败' });
  }
});

// 3. 教师管理
// 获取教师列表
app.get('/api/teachers', async (req, res) => {
  const { courseTypeId } = req.query;
  
  try {
    let query = `
      SELECT t.*, u.name, u.avatar, u.phone
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 1
    `;
    
    if (courseTypeId) {
      query = `
        SELECT DISTINCT t.*, u.name, u.avatar, u.phone, tp.price
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        JOIN teacher_prices tp ON t.id = tp.teacher_id
        WHERE t.status = 1 AND tp.course_type_id = ?
      `;
      const [rows] = await pool.execute(query, [courseTypeId]);
      res.json(rows);
    } else {
      const [rows] = await pool.execute(query);
      res.json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: '获取教师列表失败' });
  }
});

// 设置教师课程价格
app.post('/api/teacher-prices', authenticateToken, requireRole(['teacher', 'admin']), async (req, res) => {
  const { teacherId, courseTypeId, price, duration } = req.body;
  
  try {
    await pool.execute(
      `INSERT INTO teacher_prices (teacher_id, course_type_id, price, duration) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE price = ?, duration = ?`,
      [teacherId, courseTypeId, price, duration || 60, price, duration || 60]
    );
    res.json({ message: '价格设置成功' });
  } catch (error) {
    res.status(500).json({ error: '设置失败' });
  }
});

// 4. 预约管理
// 创建预约
app.post('/api/appointments', authenticateToken, async (req, res) => {
  const { teacherId, courseTypeId, appointmentDate, startTime, endTime, notes } = req.body;
  const studentId = req.user.id;
  
  try {
    // 获取课程价格
    const [prices] = await pool.execute(
      'SELECT price FROM teacher_prices WHERE teacher_id = ? AND course_type_id = ?',
      [teacherId, courseTypeId]
    );
    
    if (prices.length === 0) {
      return res.status(400).json({ error: '该教师未设置此课程价格' });
    }
    
    const price = prices[0].price;
    
    // 检查时间冲突
    const [conflicts] = await pool.execute(
      `SELECT id FROM appointments 
       WHERE teacher_id = ? AND appointment_date = ? 
       AND status IN ('confirmed', 'pending')
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [teacherId, appointmentDate, startTime, startTime, endTime, endTime]
    );
    
    if (conflicts.length > 0) {
      return res.status(400).json({ error: '该时间段已被预约' });
    }
    
    // 创建预约
    const [result] = await pool.execute(
      `INSERT INTO appointments 
       (student_id, teacher_id, course_type_id, appointment_date, start_time, end_time, price, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, teacherId, courseTypeId, appointmentDate, startTime, endTime, price, notes]
    );
    
    res.json({ id: result.insertId, message: '预约成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '预约失败' });
  }
});

// 获取预约列表
app.get('/api/appointments', authenticateToken, async (req, res) => {
  const { role, id } = req.user;
  const { status, startDate, endDate } = req.query;
  
  try {
    let query = `
      SELECT a.*, 
             u_student.name as student_name, 
             u_teacher.name as teacher_name,
             ct.name as course_name
      FROM appointments a
      JOIN users u_student ON a.student_id = u_student.id
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u_teacher ON t.user_id = u_teacher.id
      JOIN course_types ct ON a.course_type_id = ct.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // 根据角色过滤
    if (role === 'student') {
      query += ' AND a.student_id = ?';
      params.push(id);
    } else if (role === 'teacher') {
      const [teachers] = await pool.execute('SELECT id FROM teachers WHERE user_id = ?', [id]);
      if (teachers.length > 0) {
        query += ' AND a.teacher_id = ?';
        params.push(teachers[0].id);
      }
    }
    
    // 状态过滤
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    // 日期范围过滤
    if (startDate) {
      query += ' AND a.appointment_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND a.appointment_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY a.appointment_date DESC, a.start_time DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取预约列表失败' });
  }
});

// 更新预约状态
app.patch('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await pool.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ message: '状态更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 5. 工资统计
// 获取教师月度统计
app.get('/api/salary/monthly', authenticateToken, requireRole(['admin', 'teacher']), async (req, res) => {
  const { year, month, teacherId } = req.query;
  
  try {
    let query = `
      SELECT 
        t.id as teacher_id,
        u.name as teacher_name,
        COUNT(a.id) as total_classes,
        SUM(TIMESTAMPDIFF(MINUTE, a.start_time, a.end_time) / 60) as total_hours,
        SUM(a.price) as total_amount
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN appointments a ON t.id = a.teacher_id 
        AND YEAR(a.appointment_date) = ? 
        AND MONTH(a.appointment_date) = ?
        AND a.status = 'completed'
      WHERE 1=1
    `;
    
    const params = [year, month];
    
    if (teacherId) {
      query += ' AND t.id = ?';
      params.push(teacherId);
    }
    
    query += ' GROUP BY t.id, u.name';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 生成工资记录
app.post('/api/salary/generate', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { year, month } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // 获取所有教师的月度统计
    const [stats] = await connection.execute(`
      SELECT 
        t.id as teacher_id,
        SUM(TIMESTAMPDIFF(MINUTE, a.start_time, a.end_time) / 60) as total_hours,
        SUM(a.price) as total_amount
      FROM teachers t
      LEFT JOIN appointments a ON t.id = a.teacher_id 
        AND YEAR(a.appointment_date) = ? 
        AND MONTH(a.appointment_date) = ?
        AND a.status = 'completed'
      GROUP BY t.id
    `, [year, month]);
    
    // 插入或更新工资记录
    for (const stat of stats) {
      await connection.execute(`
        INSERT INTO salary_records (teacher_id, year, month, total_hours, total_amount)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          total_hours = VALUES(total_hours),
          total_amount = VALUES(total_amount)
      `, [stat.teacher_id, year, month, stat.total_hours || 0, stat.total_amount || 0]);
    }
    
    await connection.commit();
    res.json({ message: '工资记录生成成功' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: '生成失败' });
  } finally {
    connection.release();
  }
});

// 6. 教师时间表管理
// 设置教师可用时间
app.post('/api/teacher-schedules', authenticateToken, requireRole(['teacher']), async (req, res) => {
  const { schedules } = req.body; // 数组：[{dayOfWeek, startTime, endTime}]
  
  try {
    const [teachers] = await pool.execute('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
    if (teachers.length === 0) {
      return res.status(400).json({ error: '教师信息不存在' });
    }
    
    const teacherId = teachers[0].id;
    
    // 删除旧的时间表
    await pool.execute('DELETE FROM teacher_schedules WHERE teacher_id = ?', [teacherId]);
    
    // 插入新的时间表
    for (const schedule of schedules) {
      await pool.execute(
        'INSERT INTO teacher_schedules (teacher_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [teacherId, schedule.dayOfWeek, schedule.startTime, schedule.endTime]
      );
    }
    
    res.json({ message: '时间表设置成功' });
  } catch (error) {
    res.status(500).json({ error: '设置失败' });
  }
});

// 获取教师可用时间
app.get('/api/teacher-schedules/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM teacher_schedules WHERE teacher_id = ? AND is_available = 1',
      [teacherId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}).catch(error => {
  console.error('数据库初始化失败:', error);
  process.exit(1);
});

// 导出app供测试使用
module.exports = app;