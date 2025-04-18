import { createApp } from './app';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = createApp(port);

app.listen(port, () => {
  console.log(`服务器已启动: http://localhost:${port}`);
}); 