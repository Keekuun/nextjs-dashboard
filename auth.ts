import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

async function getUserOrCreate(email: string, name: string, image: string | undefined): Promise<User> {
  try {
    let user = await getUser(email);
    if (user) {
      return user;
    }

    const id = uuidv4();
    const password = await bcrypt.hash(uuidv4(), 10); // Create a random password for Google users

    const newUser = await sql<User>`
      INSERT INTO users (id, name, email, password, image_url)
      VALUES (${id}, ${name}, ${email}, ${password}, ${image})
      RETURNING *;
    `;

    return newUser.rows[0];
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Failed to get or create user.');
  }
}


export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: 'google-one-tap',
      name: 'Google One Tap',
      credentials: {
        credential: { type: 'text' },
      },
      async authorize(credentials) {
        const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        if (!credentials?.credential || typeof credentials.credential !== 'string') {
          return null;
        }
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credentials.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload?.email || !payload.name) {
            return null;
          }
          const user = await getUserOrCreate(payload.email, payload.name, payload.picture);
          return user;
        } catch (error) {
          console.error('Google One Tap verification failed:', error);
          return null;
        }
      },
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
