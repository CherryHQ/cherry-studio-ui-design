// 静态资源模块声明 —— 包内引用 png（如品牌 logo）时给编辑器一个类型
declare module '*.png' {
  const src: string;
  export default src;
}
