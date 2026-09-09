# SSL 部署说明已合并

根据一台服务器部署多个项目的需求，当前方案改为 **宿主机统一 Nginx + 各项目独立 Docker Compose**。

请按 [DEPLOY.md](./DEPLOY.md) 上线，包含现有 Nginx 版证书安装、域名跳转、新增项目及旧 Caddy 迁移说明。

旧 compose.cert.yaml、.env.cert.example 及 Caddy 配置已移除，不再使用旧启动命令。
