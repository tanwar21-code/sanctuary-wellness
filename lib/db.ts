import { neon, NeonQueryFunction } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sql: NeonQueryFunction<false, false>;

if (DATABASE_URL && DATABASE_URL !== 'your_neon_connection_string_here') {
  sql = neon(DATABASE_URL);
} else {
  // Proxy that throws helpful errors when DB is not configured
  sql = new Proxy(
    (() => { throw new Error('DATABASE_URL not configured'); }) as unknown as NeonQueryFunction<false, false>,
    {
      apply: () => {
        throw new Error('DATABASE_URL is not configured. Please add your Neon connection string to .env.local');
      },
    }
  );
}

// Re-export as a simpler type so API routes can index results with [0]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default sql as (...args: any[]) => Promise<Record<string, any>[]>;
