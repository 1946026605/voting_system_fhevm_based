# RPC配置说明

## 什么是RPC？

RPC (Remote Procedure Call) 是前端与区块链网络通信的桥梁。前端需要通过RPC节点来：

- 读取区块链数据
- 发送交易
- 与智能合约交互

## 如何获取RPC URL？

### 1. Infura (推荐)

1. 访问 [Infura](https://infura.io/)
2. 注册账户并创建项目
3. 获取Sepolia测试网的API密钥
4. RPC URL格式：`https://sepolia.infura.io/v3/YOUR_API_KEY`

### 2. Alchemy

1. 访问 [Alchemy](https://www.alchemy.com/)
2. 注册账户并创建应用
3. 获取Sepolia测试网的API密钥
4. RPC URL格式：`https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### 3. 公共RPC节点

- `https://rpc.sepolia.org`
- `https://rpc2.sepolia.org`

## 配置步骤

### 方法1：修改配置文件

1. 打开 `frontend/src/config/contracts.ts`
2. 找到 `SEPOLIA` 网络配置
3. 将 `YOUR_INFURA_API_KEY` 替换为你的实际API密钥

```typescript
SEPOLIA: {
  chainId: 11155111,
  name: "Sepolia Testnet",
  rpcUrls: [
    "https://sepolia.infura.io/v3/YOUR_ACTUAL_API_KEY", // 替换这里
    "https://rpc.sepolia.org",
    "https://rpc2.sepolia.org"
  ],
  defaultRpcUrl: "https://sepolia.infura.io/v3/YOUR_ACTUAL_API_KEY", // 替换这里
  // ... 其他配置
}
```

### 方法2：使用环境变量（推荐）

1. 在 `frontend/` 目录下创建 `.env.local` 文件
2. 添加以下内容：

```bash
REACT_APP_INFURA_API_KEY=your_actual_api_key_here
REACT_APP_CONTRACT_ADDRESS=0xa339CfC9361f0211C916CB6A95EA421094F3ac45
```

3. 重启前端应用

## 注意事项

1. **API密钥安全**：不要将API密钥提交到Git仓库
2. **速率限制**：免费账户有API调用次数限制
3. **网络选择**：确保连接到Sepolia测试网，不是主网
4. **备份RPC**：建议配置多个RPC提供商作为备份

## 测试连接

配置完成后，可以通过以下方式测试：

1. 连接MetaMask钱包
2. 切换到Sepolia网络
3. 尝试创建提案或投票
4. 查看控制台是否有网络连接错误

## 常见问题

### Q: 为什么需要RPC？

A: 前端无法直接与区块链通信，需要通过RPC节点作为中介。

### Q: 可以使用主网的RPC吗？

A: 不建议，因为这是测试应用，应该使用Sepolia测试网。

### Q: 免费RPC有使用限制吗？

A: 是的，免费账户通常有API调用次数和速率限制。

### Q: 如何知道RPC是否工作？

A: 如果前端能正常加载提案列表，说明RPC连接正常。
