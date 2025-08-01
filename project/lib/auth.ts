  import { NextAuthOptions } from 'next-auth';
  import CredentialsProvider from 'next-auth/providers/credentials';
  import GoogleProvider from 'next-auth/providers/google';
  import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
  import { MongoClient } from 'mongodb';
  import bcrypt from 'bcryptjs';
  import connectToDatabase from './mongodb';
  import { User } from './models';

  const client = new MongoClient(process.env.MONGODB_URI!);

  export const authOptions: NextAuthOptions = {
    // adapter: MongoDBAdapter(client),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
          name: { label: 'Name', type: 'text' },
          role: { label: 'Role', type: 'text' },
          isSignUp: { label: 'Is Sign Up', type: 'text' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          await connectToDatabase();

          if (credentials.isSignUp === 'true') {
            // Sign up
            const existingUser = await User.findOne({ email: credentials.email });
            if (existingUser) {
              throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(credentials.password, 12);
            const user = await User.create({
              name: credentials.name,
              email: credentials.email,
              password: hashedPassword,
              role: credentials.role || 'student',
            });

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          } else {
            // Sign in
            const user = await User.findOne({ email: credentials.email });
            if (!user || !user.password) {
              return null;
            }

            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (!isValid) {
              return null;
            }

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.sub!;
          session.user.role = token.role as string;
        }
        return session;
      },
    },
    pages: {
      signIn: '/auth/signin',
      // signUp: '/auth/signup',
    },
    session: {
      strategy: 'jwt',
    },
  };

  // lib/auth.ts
// import { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import { MongoDBAdapter } from '@next-auth/mongodb-adapter'; // fixed import
// import clientPromise from './mongodb'; // native MongoDB client
// import bcrypt from 'bcryptjs';
// import connectToDatabase from './mongoose'; // your old Mongoose connection
// import { User } from './models'; // your Mongoose User model

// export const authOptions: NextAuthOptions = {
//   adapter: MongoDBAdapter(clientPromise), // ✅ final adapter line

//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//         name: { label: 'Name', type: 'text' },
//         role: { label: 'Role', type: 'text' },
//         isSignUp: { label: 'Is Sign Up', type: 'text' },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         await connectToDatabase(); // using Mongoose for custom login/signup

//         if (credentials.isSignUp === 'true') {
//           const existingUser = await User.findOne({ email: credentials.email });
//           if (existingUser) throw new Error('User already exists');

//           const hashedPassword = await bcrypt.hash(credentials.password, 12);
//           const user = await User.create({
//             name: credentials.name,
//             email: credentials.email,
//             password: hashedPassword,
//             role: credentials.role || 'student',
//           });

//           return {
//             id: user._id.toString(),
//             email: user.email,
//             name: user.name,
//             role: user.role,
//           };
//         } else {
//           const user = await User.findOne({ email: credentials.email });
//           if (!user || !user.password) return null;

//           const isValid = await bcrypt.compare(credentials.password, user.password);
//           if (!isValid) return null;

//           return {
//             id: user._id.toString(),
//             email: user.email,
//             name: user.name,
//             role: user.role,
//           };
//         }
//       },
//     }),

//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = (user as any).role || 'student';
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.sub!;
//         session.user.role = token.role as string;
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: '/auth/signin',
//     signUp: '/auth/signup',
//   },

//   session: {
//     strategy: 'jwt',
//   },

//   secret: process.env.NEXTAUTH_SECRET!,
// };
