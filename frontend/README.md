# FHE Voting DApp Frontend

这是FHE投票DApp的前端应用，现在已完全与智能合约集成。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置合约地址

编辑 `src/config/contracts.ts` 文件，设置你的智能合约地址：

```typescript
export const CONTRACTS = {
  FHE_VOTING: "0x...", // 你的部署的合约地址
};
```

### 3. 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 启动

## 🔗 智能合约集成

### 合约服务 (ContractService)

- **位置**: `src/services/contractService.ts`
- **功能**: 处理所有与智能合约的交互
- **方法**:
  - `getAllProposals()` - 获取所有提案
  - `createProposal()` - 创建新提案
  - `castVote()` - 投加密票
  - `hasVoted()` - 检查用户是否已投票

### 钱包集成

- **位置**: `src/contexts/WalletContext.tsx`
- **功能**: 管理钱包连接和网络切换
- **特性**:
  - 自动切换到Sepolia测试网
  - 合约服务初始化
  - 网络状态监控

### FHE集成

- **位置**: `src/contexts/FHEContext.tsx`
- **功能**: 处理全同态加密操作
- **特性**:
  - 投票加密
  - 证明生成
  - 开发模式下的模拟FHE

## 📱 页面功能

### 1. 首页 (Home)

- DApp介绍
- 钱包连接
- 功能概览

### 2. 提案列表 (Proposals)

- 从区块链加载真实提案
- 实时状态显示
- 用户投票状态检查
- 刷新功能

### 3. 创建提案 (Create Proposal)

- 表单验证
- 区块链交易提交
- 交易状态跟踪
- 错误处理

### 4. 投票页面 (Vote)

- 提案详情显示
- FHE加密投票
- 投票状态管理

### 5. 投票历史 (Voting History)

- 用户投票记录
- 提案状态过滤
- 隐私保护说明

## 🔧 开发模式特性

### 模拟FHE功能

在开发模式下，FHE功能使用模拟实现：

- 加密/解密操作模拟
- 证明生成模拟
- 本地测试支持

### 错误处理

- 网络连接错误
- 合约调用失败
- 用户拒绝交易
- 余额不足

## 🚀 生产部署

### 1. 构建生产版本

```bash
npm run build
```

### 2. 部署到网络

将 `build` 文件夹部署到你的托管服务：

- Netlify
- Vercel
- AWS S3
- 其他静态托管服务

### 3. 环境配置

确保生产环境配置正确：

- 合约地址
- 网络设置
- FHE库集成

## 🔒 安全注意事项

### 开发模式

- 使用测试钱包
- 不要使用真实资金
- FHE功能为模拟实现

### 生产模式

- 使用真实FHE库
- 安全审计
- 钱包安全最佳实践

## 🐛 故障排除

### 常见问题

1. **合约服务未初始化**
   - 检查钱包连接
   - 确认网络设置
   - 重新连接钱包

2. **提案加载失败**
   - 检查合约地址
   - 确认网络连接
   - 查看控制台错误

3. **交易失败**
   - 检查Sepolia ETH余额
   - 确认网络设置
   - 查看错误消息

### 调试模式

在浏览器控制台中查看：

- 合约服务状态
- 交易详情
- 错误日志

## 📚 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Ethers.js** - 以太坊交互
- **Tailwind CSS** - 样式框架
- **Hardhat** - 智能合约开发
- **FHEVM** - 全同态加密

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

BSD-3-Clause-Clear License

---

**注意**: 这是一个演示项目。生产使用前请进行安全审计。
