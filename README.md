# 一个简单的在线 PL/0 分词器

## 备注

1. 原本的 .cpp 文件用了 static 变量

   ts 用

   ```ts
   if (typeof cACharacter === "undefined")
   ```

   避免再次初始化

2. 关于 `a<-2` 的解析，源文件实现就有问题。不修了。
3. 为了不在本地加负担，用 html 内嵌 Vue 实现动态修改。 ts 用 tsc 转译为 js
