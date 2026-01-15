# GitHub Actions 部署配置

本项目包含两个手动触发的部署工作流：

## 1. 服务端部署 (`deploy-server.yml`)

### 触发方式
**手动触发**：在 GitHub Actions 页面点击 "Run workflow" 按钮

### 部署流程
1. SSH 连接到服务器 `107.175.228.64`
2. 拉取最新代码
3. 安装生产依赖
4. 运行数据库迁移
5. 重启 PM2 应用（`stock-share-api`）

### 需要的 GitHub Secrets

在仓库的 Settings → Secrets and variables → Actions 中添加：

```
SSH_PRIVATE_KEY
```

**生成 SSH 密钥对的方法：**

```bash
# 在本地生成 SSH 密钥对
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_actions.pub root@107.175.228.64

# 将私钥内容复制到 GitHub Secrets
cat ~/.ssh/github_actions
# 复制整个输出（包括 BEGIN 和 END 行）到 GitHub Secrets 的 SSH_PRIVATE_KEY
```

## 2. 客户端部署 (`deploy-client.yml`)

### 触发方式
**手动触发**：在 GitHub Actions 页面点击 "Run workflow" 按钮

### 部署流程
1. 检出代码
2. 安装 Node.js 依赖
3. 修改 API_BASE 为生产环境 URL
4. 构建项目
5. 部署到 Cloudflare Pages

### 需要的 GitHub Secrets

在仓库的 Settings → Secrets and variables → Actions 中添加：

```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

**获取 Cloudflare 凭证的方法：**

1. **获取 API Token：**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 My Profile → API Tokens
   - 创建 Token，选择 "Edit Cloudflare Workers" 模板
   - 或者使用权限：Account - Cloudflare Pages - Edit

2. **获取 Account ID：**
   - 在 Cloudflare Dashboard 右侧可以看到
   - 或访问 Workers & Pages → 任意项目 → URL 中的 account ID

3. **创建 Cloudflare Pages 项目：**
   - 在 Cloudflare Dashboard 中创建一个名为 `stock-share` 的 Pages 项目
   - 或修改 workflow 中的 `projectName` 为你的项目名

## 手动触发部署步骤

1. 访问 GitHub 仓库：`https://github.com/oscartsui/stockshare`
2. 点击顶部的 **Actions** 标签
3. 在左侧选择要运行的工作流：
   - **Deploy Server to VPS** - 服务端部署
   - **Deploy Client to Cloudflare Pages** - 客户端部署
4. 点击右侧的 **Run workflow** 按钮
5. 可选：填写部署原因（Deployment reason）
6. 点击绿色的 **Run workflow** 按钮确认
7. 等待部署完成，查看日志

### 快速链接
- 服务端部署：`https://github.com/oscartsui/stockshare/actions/workflows/deploy-server.yml`
- 客户端部署：`https://github.com/oscartsui/stockshare/actions/workflows/deploy-client.yml`

## 注意事项

1. **服务端部署**：
   - 确保服务器已安装 Node.js、npm、git、pm2
   - 确保服务器的 `/root/stockshare/server` 目录存在
   - 确保 `.env` 文件已正确配置

2. **客户端部署**：
   - 首次部署前需在 Cloudflare 创建 Pages 项目
   - 确保生产环境 API 地址 `https://stock-share-api.piupiupiu.cc/api` 可访问
   - 构建输出目录为 `client/build`（Create React App 默认）

## 查看部署日志

手动触发部署后，在 Actions 页面可以实时查看部署进度和日志：

```
https://github.com/oscartsui/stockshare/actions
```

### 日志说明
- ✅ 绿色勾号：部署成功
- ❌ 红色叉号：部署失败
- 🟡 黄色圆点：正在部署中

点击具体的运行记录可以查看详细日志。

## 回滚

如果部署出现问题：

**服务端回滚：**
```bash
ssh root@107.175.228.64
cd /root/stockshare/server
git reset --hard <previous-commit-hash>
npm install
pm2 restart stock-share-api
```

**客户端回滚：**
- 在 Cloudflare Pages Dashboard 中选择之前的部署版本
- 点击 "Rollback to this deployment"
