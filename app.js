// 导入依赖
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { swaggerUi, swaggerSpec } from './swagger.js';

// 创建 Express 应用
const app = express();
const port = process.env.PORT || 3000;

// 启用 CORS
app.use(cors());

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 设置路由
app.use('/', routes);

// 404 处理
app.use((req, res, next) => {
  res.status(404).send('未找到页面');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('应用错误:', err.stack);
  res.status(500).send('服务器错误');
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log(`API文档地址: http://localhost:${port}/api-docs`);
}); 