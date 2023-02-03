import { createAuth } from '@keystone-next/auth';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { Role } from './schemas/Role';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import 'dotenv/config';
import { insertSeedData } from './seed-data/index';
import { sendPasswordResetEmail } from './lib/mail';
import { permissionsList } from './schemas/fields';

const datatbaseURL = process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long the session will work
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User', // Who logs in
  identityField: 'email', // Which field in User is responsible for log in
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: Add initial roles here
  },
  passwordResetLink: {
    async sendToken(args) {
      // Sending Reset Link to Email
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: datatbaseURL,
      async onConnect(keystone) {
        console.log('Connected to DB');
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone); // Inserts data directly to MongoDB
        }
      },
    },
    lists: createSchema({
      // Schema items
      User,
      Product,
      ProductImage,
      Role,
    }),
    ui: {
      // CShow the UI for people who pass this test
      isAccessAllowed: ({ session }) => !!session?.data, // !! turns to boolean type
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL query
      // Info that comes back with session, every time we make a request to the Backend
      User: `id name email role { ${permissionsList.join(' ')} }`,
    }),
  }),
);
