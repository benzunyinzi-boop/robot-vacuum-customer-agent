# 部署检查清单

在部署到生产环境前，请确保完成以下检查项。

## 部署前检查

### 1. 服务器准备
- [ ] ECS 实例已创建（推荐配置：4核8G，40GB 磁盘）
- [ ] 操作系统已更新到最新版本
- [ ] 已获取公网 IP 地址
- [ ] 安全组已配置（开放 22、80、443 端口）
- [ ] 已配置 SSH 密钥登录（推荐）

### 2. 域名与 DNS（可选但推荐）
- [ ] 域名已备案（中国大陆必需）
- [ ] DNS A 记录已指向 ECS 公网 IP
- [ ] DNS 解析已生效（可用 `nslookup` 验证）

### 3. API 密钥
- [ ] 已申请 DashScope API Key
- [ ] API Key 已充值（确保有足够余额）
- [ ] 已测试 API Key 可用性

### 4. 代码准备
- [ ] 代码已推送到 Git 仓库
- [ ] 仓库地址已更新到部署脚本中
- [ ] `.env.example` 文件已创建（不包含真实密钥）
- [ ] `.gitignore` 已配置（排除 `.env`、`chroma_db/`、`logs/`）

## 部署步骤检查

### 方式 A：Docker 部署（推荐）

- [ ] Docker 已安装并运行
- [ ] Docker Compose 已安装
- [ ] 项目已克隆到 `/opt/langchain-react-agent`
- [ ] `.env` 文件已配置（包含真实 API Key）
- [ ] 向量数据库已初始化（`docker-compose run --rm app python init_db.py`）
- [ ] 服务已启动（`docker-compose up -d`）
- [ ] 容器状态正常（`docker-compose ps` 显示 Up）

### 方式 B：传统部署

- [ ] Python 3.9+ 已安装
- [ ] Node.js 18+ 已安装
- [ ] Nginx 已安装并运行
- [ ] Supervisor 已安装并运行
- [ ] Python 依赖已安装（`pip install -r requirements.txt`）
- [ ] 前端已构建（`npm run build`）
- [ ] Nginx 配置已部署
- [ ] Supervisor 配置已部署
- [ ] 服务已启动（`supervisorctl status`）

## 部署后验证

### 1. 基础功能测试
- [ ] 健康检查接口正常：`curl http://YOUR_IP/api/v1/health`
- [ ] 前端页面可访问：`http://YOUR_IP`
- [ ] 前端静态资源加载正常（无 404 错误）
- [ ] API 文档可访问：`http://YOUR_IP/api/docs`（如果启用）

### 2. 核心功能测试
- [ ] 可以创建新对话
- [ ] 可以发送消息并收到回复
- [ ] 流式输出正常（逐字显示）
- [ ] 工具调用正常（如 RAG 检索）
- [ ] 多轮对话记忆正常
- [ ] Markdown 渲染正常
- [ ] 代码高亮正常

### 3. 性能测试
- [ ] 首次响应时间 < 3 秒
- [ ] 流式输出延迟 < 500ms
- [ ] 并发 10 个请求无异常
- [ ] 内存使用稳定（< 2GB）
- [ ] CPU 使用正常（< 80%）

### 4. 日志检查
- [ ] 应用日志正常输出
- [ ] 无严重错误（ERROR/CRITICAL）
- [ ] 日志轮转配置正常
- [ ] 日志文件大小可控

## 安全加固检查

### 1. 系统安全
- [ ] 已禁用 root SSH 登录
- [ ] 已配置 SSH 密钥认证
- [ ] 已禁用密码登录
- [ ] 防火墙已启用（ufw/firewalld）
- [ ] 只开放必要端口（22、80、443）
- [ ] 已配置 fail2ban（可选）

### 2. 应用安全
- [ ] `.env` 文件权限为 600
- [ ] API Key 未硬编码在代码中
- [ ] 敏感文件已添加到 `.gitignore`
- [ ] CORS 配置正确（只允许前端域名）
- [ ] 已配置请求速率限制（可选）

### 3. HTTPS 配置（强烈推荐）
- [ ] SSL 证书已申请（Let's Encrypt）
- [ ] Nginx HTTPS 配置已启用
- [ ] HTTP 自动重定向到 HTTPS
- [ ] SSL 证书自动续期已配置
- [ ] SSL Labs 测试评分 A+（可选）

## 监控与运维

### 1. 监控配置
- [ ] 已配置服务健康检查
- [ ] 已配置磁盘空间监控
- [ ] 已配置内存使用监控
- [ ] 已配置 CPU 使用监控
- [ ] 已配置日志告警（可选）

### 2. 备份策略
- [ ] 向量数据库定期备份（建议每天）
- [ ] 备份脚本已配置到 crontab
- [ ] 备份文件已测试可恢复
- [ ] 备份保留策略已确定（如保留 7 天）

### 3. 文档准备
- [ ] 部署文档已更新
- [ ] 运维手册已准备
- [ ] 故障排查指南已准备
- [ ] 联系方式已记录

## 性能优化（可选）

- [ ] 已启用 Gzip 压缩
- [ ] 已配置静态资源缓存
- [ ] 已配置 CDN（可选）
- [ ] 已优化 Docker 镜像大小
- [ ] 已配置 FastAPI 多进程
- [ ] 已配置数据库连接池

## 上线前最终检查

- [ ] 所有测试用例通过
- [ ] 性能指标达标
- [ ] 安全扫描无高危漏洞
- [ ] 备份恢复流程已验证
- [ ] 回滚方案已准备
- [ ] 团队成员已培训
- [ ] 监控告警已配置
- [ ] 文档已更新

## 上线后观察（前 24 小时）

- [ ] 服务稳定运行
- [ ] 无异常错误日志
- [ ] 响应时间正常
- [ ] 内存/CPU 使用正常
- [ ] 用户反馈正常
- [ ] 备份任务正常执行

---

## 快速命令参考

### Docker 部署
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 重启服务
docker-compose restart

# 更新代码
git pull && docker-compose up -d --build
```

### 传统部署
```bash
# 查看服务状态
sudo supervisorctl status

# 查看日志
sudo supervisorctl tail -f langchain-agent

# 重启服务
sudo supervisorctl restart langchain-agent

# 更新代码
git pull && sudo supervisorctl restart langchain-agent
```

### 健康检查
```bash
# API 健康检查
curl http://localhost/api/v1/health

# 测试流式接口
curl -N -X POST http://localhost/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"你好"}'
```

---

**完成所有检查项后，即可正式上线！** 🚀
