# 部署文档

## 前置要求

1. **阿里云 ECS 配置**
   - 操作系统：Ubuntu 20.04+ / CentOS 8+
   - 配置建议：2核4G 起步（推荐 4核8G）
   - 磁盘：至少 40GB（系统 + 依赖 + 向量数据库）
   - 公网 IP：已分配
   - 安全组：开放 22（SSH）、80（HTTP）、443（HTTPS）端口

2. **域名（可选但推荐）**
   - 已备案的域名
   - DNS 解析指向 ECS 公网 IP

3. **DashScope API Key**
   - 在阿里云百炼平台申请：https://dashscope.console.aliyun.com/

## 快速部署

### 1. 连接到 ECS

```bash
ssh root@YOUR_ECS_IP
```

### 2. 执行环境初始化脚本

```bash
# 下载初始化脚本
wget https://raw.githubusercontent.com/YOUR_USERNAME/LangChain-ReAct-Agent/main/deploy/setup_ecs.sh
chmod +x setup_ecs.sh
./setup_ecs.sh
```

### 3. 克隆项目并部署

```bash
# 下载部署脚本
wget https://raw.githubusercontent.com/YOUR_USERNAME/LangChain-ReAct-Agent/main/deploy/deploy.sh
chmod +x deploy.sh

# 首次运行会提示配置 .env
./deploy.sh

# 编辑 .env 填入 API Key
cd /opt/langchain-react-agent
vim .env  # 填入 DASHSCOPE_API_KEY

# 再次运行完成部署
cd ~
./deploy.sh
```

### 4. 验证部署

```bash
# 检查服务状态
sudo supervisorctl status langchain-agent

# 查看日志
sudo supervisorctl tail -f langchain-agent

# 测试 API
curl http://localhost:8000/api/v1/health

# 浏览器访问
# http://YOUR_ECS_IP
```

## 详细步骤

### 步骤 1：环境准备

参考 `setup_ecs.sh` 脚本，手动执行以下操作：

1. **更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **安装 Python 3.9+**
   ```bash
   sudo apt install -y python3.9 python3.9-venv python3.9-dev python3-pip
   ```

3. **安装 Node.js 18+**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **安装 Nginx**
   ```bash
   sudo apt install -y nginx
   sudo systemctl enable nginx
   sudo systemctl start nginx
   ```

5. **安装 Supervisor**
   ```bash
   sudo apt install -y supervisor
   sudo systemctl enable supervisor
   sudo systemctl start supervisor
   ```

### 步骤 2：克隆项目

```bash
# 创建项目目录
sudo mkdir -p /opt
cd /opt

# 克隆代码（替换为你的仓库地址）
sudo git clone https://github.com/YOUR_USERNAME/LangChain-ReAct-Agent.git langchain-react-agent
sudo chown -R $USER:$USER langchain-react-agent
cd langchain-react-agent
```

### 步骤 3：配置环境变量

```bash
# 创建 .env 文件
cat > .env <<EOF
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
LOG_LEVEL=INFO
EOF

# 设置权限（防止泄露）
chmod 600 .env
```

### 步骤 4：安装后端依赖

```bash
# 创建虚拟环境
python3.9 -m venv venv
source venv/bin/activate

# 安装依赖
pip install --upgrade pip
pip install -r requirements.txt
```

### 步骤 5：初始化向量数据库

```bash
# 加载知识库到 Chroma
python3 init_db.py

# 验证数据加载成功
ls -lh chroma_db/
```

### 步骤 6：构建前端

```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 验证构建产物
ls -lh dist/

cd ..
```

### 步骤 7：配置 Nginx

```bash
# 复制配置文件
sudo cp deploy/nginx.conf /etc/nginx/sites-available/langchain-agent

# 修改配置（如果有域名）
sudo vim /etc/nginx/sites-available/langchain-agent
# 将 server_name _; 改为 server_name yourdomain.com;

# 启用站点
sudo ln -sf /etc/nginx/sites-available/langchain-agent /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 步骤 8：配置 Supervisor

```bash
# 复制配置文件
sudo cp deploy/supervisor.conf /etc/supervisor/conf.d/langchain-agent.conf

# 重新加载配置
sudo supervisorctl reread
sudo supervisorctl update

# 启动服务
sudo supervisorctl start langchain-agent

# 查看状态
sudo supervisorctl status
```

## 常用运维命令

### 服务管理

```bash
# 查看服务状态
sudo supervisorctl status langchain-agent

# 启动服务
sudo supervisorctl start langchain-agent

# 停止服务
sudo supervisorctl stop langchain-agent

# 重启服务
sudo supervisorctl restart langchain-agent

# 查看实时日志
sudo supervisorctl tail -f langchain-agent
```

### 更新代码

```bash
cd /opt/langchain-react-agent

# 拉取最新代码
git pull origin main

# 更新后端依赖（如果 requirements.txt 有变化）
source venv/bin/activate
pip install -r requirements.txt

# 重新构建前端（如果前端有变化）
cd frontend
npm install
npm run build
cd ..

# 重启服务
sudo supervisorctl restart langchain-agent

# 重载 Nginx（如果配置有变化）
sudo nginx -t && sudo systemctl reload nginx
```

### 日志查看

```bash
# FastAPI 日志
sudo tail -f /var/log/supervisor/langchain-agent.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/langchain-agent-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/langchain-agent-error.log
```

## HTTPS 配置（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
sudo certbot --nginx -d yourdomain.com

# 证书会自动续期，验证自动续期任务
sudo systemctl status certbot.timer
```

## 性能优化

### 1. 启用 Gzip 压缩

编辑 `/etc/nginx/nginx.conf`，在 `http` 块中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 2. 配置 FastAPI 多进程

修改 `start_api.py`：

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,  # 根据 CPU 核心数调整
        reload=False,
    )
```

### 3. 配置 Chroma 持久化路径

确保 `config/rag.yml` 中的 `chroma_db_path` 指向持久化目录：

```yaml
chroma_db_path: /opt/langchain-react-agent/chroma_db
```

## 监控与告警

### 1. 配置系统监控

```bash
# 安装 htop
sudo apt install -y htop

# 查看资源使用
htop
```

### 2. 配置日志轮转

创建 `/etc/logrotate.d/langchain-agent`：

```
/var/log/supervisor/langchain-agent.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 www-data www-data
}
```

## 故障排查

### 问题 1：服务无法启动

```bash
# 查看详细日志
sudo supervisorctl tail langchain-agent

# 检查端口占用
sudo lsof -i :8000

# 手动启动测试
cd /opt/langchain-react-agent
source venv/bin/activate
python start_api.py
```

### 问题 2：前端无法访问

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 测试 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题 3：API 调用失败

```bash
# 检查 DashScope API Key
cat /opt/langchain-react-agent/.env

# 测试 API 连通性
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-plus","messages":[{"role":"user","content":"hi"}]}'
```

## 安全加固

1. **禁用 root SSH 登录**
   ```bash
   sudo vim /etc/ssh/sshd_config
   # 设置 PermitRootLogin no
   sudo systemctl restart sshd
   ```

2. **配置防火墙**
   ```bash
   sudo ufw status
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## 备份策略

### 备份向量数据库

```bash
# 创建备份目录
sudo mkdir -p /backup/chroma_db

# 备份
sudo tar -czf /backup/chroma_db/chroma_$(date +%Y%m%d).tar.gz \
  /opt/langchain-react-agent/chroma_db

# 定期备份（添加到 crontab）
sudo crontab -e
# 每天凌晨 2 点备份
0 2 * * * tar -czf /backup/chroma_db/chroma_$(date +\%Y\%m\%d).tar.gz /opt/langchain-react-agent/chroma_db
```

## 联系支持

如遇问题，请查看：
- 项目 GitHub Issues
- 日志文件：`/var/log/supervisor/langchain-agent.log`
