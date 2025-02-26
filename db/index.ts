import {PrismaClient} from "@prisma/client"
import {Invoices, Users} from "@prisma/client/index.d.ts"

export const prisma = new PrismaClient({
  log: ['query']
})

// 创建发票
export async function CreateInvoice(data: Omit<Invoices, 'id'>) {
  return prisma.invoices.create({
    data,
  })
}

// 更新发票
export async function UpdateInvoice(data: { id: string } & Partial<Invoices>) {
  const {id, ...rest} = data
  return prisma.invoices.update({
    where: {
      id: id,
    },
    data: rest,
  })
}

// 删除发票
export async function DeleteInvoice(id: string) {
  return prisma.invoices.delete({
    where: {
      id: id,
    },
  })
}

// 根据邮箱获取用户
export async function GetUser(email: string) {
  return prisma.users.findUnique({
    where: {
      email: email,
    },
  })
}

// 创建用户
export async function CreateUser(data: Omit<Users, 'id' | 'created_at'>) {
  return prisma.users.create({
    data,
  })
}

export async function GetCustomer() {
  return prisma.customers.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

// 获取所有收入记录
export async function GetRevenue() {
  return prisma.revenue.findMany()
}

// 获取最新的五张发票
export async function GetLatestInvoices(count: number) {
  return prisma.invoices.findMany({
    select: {
      amount: true,
      customer: {
        select: {
          name: true,
          image_url: true,
          email: true,
        },
      },
      id: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: count,
  });
}

// 获取过滤后的发票
export async function GetFilteredInvoices({limit, offset, query,}: { limit: number, offset: number, query: string, }) {
  return prisma.invoices.findMany({
    where: {
      OR: [
        {customer: {name: {contains: query}}},
        {customer: {email: {contains: query}}},
        {amount: {equals: parseInt(query, 10)}},
        {date: {contains: query}},
        {status: {contains: query}},
      ],
    },
    select: {
      amount: true,
      date: true,
      status: true,
      customer: {
        select: {
          name: true,
          image_url: true,
          email: true,
        },
      },
      id: true,
    },
    orderBy: {
      date: 'desc',
    },
    // limit offset
    skip: offset,
    take: limit,
  });
}

export async function GetInvoicesCount(query: string) {
  return prisma.invoices.count({
    where: {
      OR: [
        {customer: {name: {contains: query}}},
        {customer: {email: {contains: query}}},
        {amount: {equals: parseInt(query, 10)}},
        {date: {contains: query}},
        {status: {contains: query}},
      ],
    },
  })
}

export async function GetInvoiceById(id: string) {
  return prisma.invoices.findUnique({
    where: {
      id: id,
    },
    select: {
      amount: true,
      date: true,
      status: true,
      id: true,
    },
  });
}

// 获取发票总数
export async function GetInvoiceCount() {
  return prisma.invoices.count()
}

// 获取客户总数
export async function GetCustomerCount() {
  return prisma.customers.count()
}

// 获取待处理发票的数量
export async function GetPendingInvoiceCount() {
  return prisma.invoices.count({
    where: {
      status: 'pending',
    }
  })
}

// 获取已支付发票的数量
export async function GetPaidInvoiceCount() {
  return prisma.invoices.count({
    where: {
      status: 'paid',
    }
  })
}
