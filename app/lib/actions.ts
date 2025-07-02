'use server';

import {z} from 'zod';
import {sql} from '@vercel/postgres';
import {revalidatePath} from 'next/cache';
import {redirect} from "next/navigation";
import {signIn} from '@/auth';
import {AuthError} from 'next-auth';
import {getUser} from "@/app/lib/data";
import {User} from "@/app/lib/definitions";
import * as bcrypt from 'bcrypt';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number()
    .gt(0, {message: 'Please enter an amount greater than $0.'}),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };
  // Test it out:
  // console.log(rawFormData);
  // const rawFormData = Object.fromEntries(formData.entries())
  // console.log('rawFormData', rawFormData)

  // const {customerId, amount, status} = CreateInvoice.parse({
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const {customerId, amount, status} = validatedFields.data;
  // Storing values in cents
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // clear this cache and trigger a new request
  revalidatePath('/dashboard/invoices');
  // redirect the user back to the /dashboard/invoices
  redirect('/dashboard/invoices');
}


// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function updateInvoice(id: string,
                                    prevState: State,
                                    formData: FormData,) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  // const {customerId, amount, status} = UpdateInvoice.parse({
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // });

  const {customerId, amount, status} = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId},
            amount      = ${amountInCents},
            status      = ${status}
        WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');
  try {
    await sql`DELETE
              FROM invoices
              WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return {message: 'Deleted Invoice.'};
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Invoice.',
    };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}


const RegisterFormSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const {name, email, password} = RegisterFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // 先判断是否存在
    const user = await getUser(email);
    // 判断 user 是 User 类型
    if (user) {
      return 'Email already exists.';
    }
    // 加密 password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 创建新用户
    await sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${hashedPassword})
    `;
    await authenticate(prevState, formData);
    return '';
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0].message;
    }
    throw error;
  }
}
