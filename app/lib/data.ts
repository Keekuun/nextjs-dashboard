import {formatCurrency} from './utils';

import {unstable_noStore as noStore} from "next/cache";
import * as db from "@/db";

export async function fetchRevenue() {
  // Add noStore() here prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore()

  try {
    // Artificially delay a reponse for demo purposes.
    // Don't do this in real life :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    // const data = await sql<Revenue>`SELECT * FROM revenue`;

    const data = db.GetRevenue()

    // console.log('Data fetch complete after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noStore()

  try {
    const data = await db.GetLatestInvoices(5)

    return data.map((invoice) => ({
      ...invoice,
      ...invoice.customer,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore()

  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = db.GetInvoiceCount();
    const customerCountPromise = db.GetCustomerCount();
    const invoicePaidStatusPromise = db.GetPendingInvoiceSumAmount();
    const invoicePendingStatusPromise = db.GetPaidInvoiceSumAmount();
    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoicePaidStatusPromise,
      invoicePendingStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0] ?? '0');
    const numberOfCustomers = Number(data[1] ?? '0');
    const totalPaidInvoices = formatCurrency(data[2] ?? '0');
    const totalPendingInvoices = formatCurrency(data[3] ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to card data.');
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  noStore()

  try {
    const invoices = await db.GetFilteredInvoices({
      limit: ITEMS_PER_PAGE,
      offset,
      query,
    })
    return invoices.map(invoice => ({
      ...invoice,
      ...invoice.customer,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore()

  try {
    const count = await db.GetInvoicesCount(query)

    return Math.ceil(Number(count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  noStore()

  try {
    const data = await db.GetInvoiceById(id)
    // console.log(invoice); // Invoice is an empty array []
    return data;
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchCustomers() {
  noStore()

  try {
    const customers = await db.GetCustomer();
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

// export async function fetchFilteredCustomers(query: string) {
//   noStore()
//
//   try {
//     const data = await sql<CustomersTable>`
//         SELECT customers.id,
//                customers.name,
//                customers.email,
//                customers.image_url,
//                COUNT(invoices.id)                                                         AS total_invoices,
//                SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
//                SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END)    AS total_paid
//         FROM customers
//                  LEFT JOIN invoices ON customers.id = invoices.customer_id
//         WHERE customers.name ILIKE ${`%${query}%`}
//            OR
//             customers.email ILIKE ${`%${query}%`}
//         GROUP BY customers.id, customers.name, customers.email, customers.image_url
//         ORDER BY customers.name ASC
//     `;
//
//     const customers = data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));
//
//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }

export async function getUser(email: string) {
  noStore()

  try {
    const user = await db.GetUser(email)
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
