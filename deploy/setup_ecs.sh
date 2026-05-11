#!/bin/bash
# ECS 初始化脚本 - 在阿里云 ECS 上执行
# 系统要求：Ubuntu 20.04+ / CentOS 8+

set -e

echo "=== 1. 更新系统 ==="
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# sudo yum update -y  # CentOS/RHEL

echo "=== 2. 安装基础依赖 ==="
sudo apt install -y git curl wget vim build-essential  # Ubuntu
# sudo yum install -y git curl wget vim gcc gcc-c++ make  # CentOS

echo "=== 3. 安装 Python 3.9+ ==="
sudo apt install -y python3.9 python3.9-venv python3.9-dev python3-pip  # Ubuntu
# 或者从源码编译最新版 Python

echo "=== 4. 安装 Node.js 18+ (用于前端构建) ==="
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== 5. 安装 Nginx ==="
sudo apt install -y nginx

echo "=== 6. 安装 Supervisor (进程管理) ==="
sudo apt install -y supervisor

echo "=== 7. 配置防火墙 ==="
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

echo "=== 环境准备完成 ==="
python3.9 --version
node --version
nginx -v
