# 更新与部署

## 日常只需两步

本地完成修改并提交推送：

```bash
git add <修改的文件>
git commit -m "说明本次修改"
git push origin main
```

服务器进入项目目录后执行：

```bash
bash scripts/deploy.sh
```

这一个命令会 `git pull --ff-only`，等待 GitHub Actions 构建当前提交对应的 Linux/amd64 镜像，下载并校验 SHA-256，导入镜像、替换网站容器，等待健康检查。失败时会尝试恢复旧镜像；不会重建公共 Nginx。

服务器不需要 npm、不需要编译、不需要手动传镜像或修改仓库配置。仓库有未提交改动时脚本会停止，不会擅自覆盖。CI 构建失败或网络不可用时旧网站继续运行。脚本最多等待构建 15 分钟，失败后修复问题并重试同一条命令。

## GitHub 自动构建

`.github/workflows/release.yml` 在 main 推送后运行：

1. 检查公开文件和测试。
2. 构建对应提交的镜像，并进行 HTTP 冒烟测试。
3. 发布 `deploy-<完整提交 SHA>` 预发布版本，附带镜像包与校验文件。

服务器始终部署当前 checkout 的精确提交，不使用含义不确定的 latest。公开仓库的 Release 文件不需要服务器保存 GitHub Token；Actions 使用其内置临时令牌，不保存 SSH 密钥或服务器地址。部署镜像只包含公开应用代码，不含服务器环境文件及证书。

首次推送工作流后，确认仓库允许 GitHub Actions 运行。若改成私有仓库，需重新设计带认证的镜像获取方式，当前无凭据下载方案面向公开仓库。

## 哪些内容进 Git

| 纳入版本控制 | 只留服务器，仓库外 |
| --- | --- |
| 网站代码、Dockerfile、Compose | 证书与私钥 |
| 部署脚本、GitHub Actions | 真实域名、IP、运维路径等环境配置 |
| 使用 example.com 的 Nginx 示例 | 公共 Nginx 的实际站点配置 |
| `.env.example` 占位示例 | 部署状态、下载临时文件、锁文件 |

`.gitignore` 和 `.dockerignore` 排除了环境文件、证书、私钥及镜像归档。推送前可执行 `node scripts/check-public.mjs`；审计可发布分支/标签历史用 `node scripts/check-public.mjs --history`。这是明确模式的检测，不能替代人工复核，也不会把匹配到的密钥值打印到日志。

网站本身的公开作者身份、项目介绍和联系邮箱是作品集内容，保留展示。

## 服务器一次性配置

现有服务器已配置，无需每次重复。新服务器需要 Docker Engine、Compose v2（支持 --wait）、Git、Bash、curl、flock、sha256sum。首次将代码克隆到自选项目目录。

可把 `.env.example` 复制为服务器独立文件 `/etc/personal-website/deploy.env`，权限 600。可选内容：

```dotenv
INGRESS_NETWORK=jcl-ingress
STATE_DIR=/var/lib/personal-website
# RELEASE_REPOSITORY=OWNER/REPOSITORY
```

正常情况下仓库地址从 origin 自动识别。自定义配置路径使用 `DEPLOY_CONFIG=/path/to/deploy.env bash scripts/deploy.sh`。运行用户需要 Docker 权限及状态目录写权限。

首次创建网站与公共入口共用的 Docker 网络：

```bash
docker network create jcl-ingress
```

公共入口独立部署。仓库内 `deploy/gateway/` 和 `deploy/nginx/` 仅为通用模板，先复制到仓库外的网关目录，填写真实域名并安装证书后再启动。模板不能原样用于正式域名。

Nginx 统一监听 80/443，网站不公开宿主机端口，通过网络别名 `jcl-portfolio:3000` 访问。动态解析 Docker DNS，网站容器被重新创建时无需改 Nginx 配置。

## 新增项目与公共入口

每个项目使用独立目录和 Compose 项目名，按需创建独立网络，再让公共 Nginx 接入网络。新增一份域名配置及对应证书；不要覆盖已有站点配置。

更改公共入口网络首次需重新创建入口，可能短暂影响全部站点。普通网站代码更新只运行本项目的部署脚本，不动网关。

Nginx 配置变更或手动续签证书后，在仓库外的网关目录执行：

```bash
docker compose run --rm --no-deps nginx nginx -t
# 仅在上一步成功后执行
docker compose exec nginx nginx -s reload
```

手动上传的证书不会自动续期。证书有效期和真实安装路径记录在服务器私有运维信息中，不写入公开仓库。

## 状态与回退

部署状态位于外部 STATE_DIR，包含 current-revision 和 current-image。不会为了记录版本而修改仓库里的 `.env` 或 Compose。

查看网站日志时指定当前镜像：

```bash
APP_IMAGE="$(cat /var/lib/personal-website/current-image)" docker compose ps
APP_IMAGE="$(cat /var/lib/personal-website/current-image)" docker compose logs --tail=100 web
```

失败部署会尝试恢复之前运行的镜像。若回退本身失败，脚本返回错误并保留日志，需要检查 Docker 和应用状态。单副本切换可能短暂中断；共享网关和其他项目不会被本脚本更新。

本项目既有 PostCSS/sharp 依赖告警另行跟进；这次维护流程调整不包含框架主版本升级。
