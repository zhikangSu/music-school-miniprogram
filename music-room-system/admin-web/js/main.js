// 管理后台主要JavaScript文件
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
}