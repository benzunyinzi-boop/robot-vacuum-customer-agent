# Docker 部署指南（推荐）

Docker 部署方式更简单、更可靠，推荐用于生产环境。

## 前置要求

1. **阿里云 ECS**
   - 操作系统：Ubuntu 20.04+ / CentOS 8+
   - 配置：2核4G 起步（推荐 4核8G）
   - 已开放 80、443、22 端口

2. **安装 Docker 和 Docker Compose**

## 快速部署（5 分钟）

### 1. 在 ECS 上安装 Docker

```bash
# 连接到 ECS
ssh root@YOUR_ECS_IP

# 安装 Docker（Ubuntu）
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 克隆项目

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/LangChain-ReAct-Agent.git
cd LangChain-ReAct-Agent
```

### 3. 配置环境变量

```bash
# 创建 .env 文件
cat > .env <<EOF
DASHSCOPE_API_KEY=sk-your-api-key-here
LOG_LEVEL=INFO
EOF

# 设置权限
chmod 600 .env
```

### 4. 初始化向量数据库

```bash
# 首次部署需要初始化知识库
docker-compose run --rm app python init_db.py
```

### 5. 启动服务

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 6. 验证部署

```bash
# 测试 API
curl http://localhost/api/v1/health

# 浏览器访问
# http://YOUR_ECS_IP
```

## 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f app

# 查看服务状态
docker-compose ps
```

### 更新代码

```bash
cd /opt/LangChain-ReAct-Agent

# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像（可选）
docker image prune -f
```

### 数据备份

```bash
# 备份向量数据库
tar -czf chroma_backup_$(date +%Y%m%d).tar.gz chroma_db/

# 恢复
tar -xzf chroma_backup_20260510.tar.gz
```

## 配置 HTTPS（Let's Encrypt）

### 方式 1：使用 Certbot（推荐）

```bash
# 安装 Certbot
sudo apt install -y certbot

# 停止 Nginx 容器
docker-compose stop nginx

# 申请证书
sudo certbot certonly --standalone -d yourdomain.com

# 修改 docker-compose.yml，取消注释 SSL 卷挂载
# volumes:
#   - /etc/letsencrypt:/etc/nginx/ssl:ro

# 修改 nginx-docker.conf，启用 HTTPS 配置

# 重启服务
docker-compose up -d
```

### 方式 2：使用 Nginx Proxy Manager（更简单）

使用 Nginx Proxy Manager 容器自动管理 SSL 证书：

```bash
# 下载配置
wget https://raw.githubusercontent.com/YOUR_USERNAME/LangChain-ReAct-Agent/main/deploy/docker-compose-with-npm.yml

# 启动
docker-compose -f docker-compose-with-npm.yml up -d

# 访问 Nginx Proxy Manager 管理界面
# http://YOUR_ECS_IP:81
# 默认账号：admin@example.com / changeme
```

## 性能优化

### 1. 限制容器资源

编辑 `docker-compose.yml`：

```yaml
services:
  app:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### 2. 配置日志轮转

编辑 `docker-compose.yml`：

```yaml
services:
  app:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 监控

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看容器详细信息
docker-compose ps
docker inspect langchain-agent
```

### 健康检查

```bash
# 查看健康状态
docker-compose ps

# 手动触发健康检查
docker exec langchain-agent curl -f http://localhost:8000/api/v1/health
```

## 故障排查

### 问题 1：容器无法启动

```bash
# 查看日志
docker-compose logs app

# 检查配置
docker-compose config

# 重新构建
docker-compose build --no-cache app
docker-compose up -d
```

### 问题 2：API 调用失败

```bash
# 进入容器调试
docker-compose exec app bash

# 检查环境变量
docker-compose exec app env | grep DASHSCOPE

# 测试 API
docker-compose exec app curl http://localhost:8000/api/v1/health
```

### 问题 3：前端无法访问

```bash
# 检查 Nginx 配置
docker-compose exec nginx nginx -t

# 查看 Nginx 日志
docker-compose logs nginx

# 重启 Nginx
docker-compose restart nginx
```

## 卸载

```bash
# 停止并删除容器
docker-compose down

# 删除镜像
docker-compose down --rmi all

# 删除数据卷（谨慎！会删除向量数据库）
docker-compose down -v

# 删除项目目录
cd /opt
rm -rf LangChain-ReAct-Agent
```

## 与传统部署对比

| 特性 | Docker 部署 | 传统部署 |
|------|------------|---------|
| 部署难度 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 环境隔离 | ✅ 完全隔离 | ❌ 可能冲突 |
| 依赖管理 | ✅ 自动处理 | ❌ 手动安装 |
| 版本回滚 | ✅ 一键回滚 | ❌ 需要手动 |
| 资源限制 | ✅ 精确控制 | ❌ 难以控制 |
| 迁移成本 | ✅ 低 | ❌ 高 |

**推荐使用 Docker 部署！**
