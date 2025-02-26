## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## use sqlite + prisma

+ 初始化
```bash
# install primsa
pnpm i -D primsa

# init prisma and create sqlite db
npx prisma init --datasource-provider sqlite
```
+ 定义 model
```prisma
 generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

+ 迁移并生成db
```bash 
npx prisma migrate dev --name init
```
1. 它在此迁移的 prisma/migrations 目录中创建了一个新的 SQL 迁移文件。
2. 它针对数据库执行了 SQL 迁移文件。
3. 它在后台运行了 prisma generate（这安装了 @prisma/client 包并基于您的模型生成了定制的 Prisma Client API）。
