// 设置测试超时时间
jest.setTimeout(10000);

// 清除所有模拟
afterEach(() => {
  jest.clearAllMocks();
});

// 添加一个测试用例以避免错误
describe('Jest Setup', () => {
  it('should be properly configured', () => {
    expect(true).toBeTruthy();
  });
}); 