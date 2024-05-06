import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url'; // Import the url module

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };

// Wrap the database connection test in an async function
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('posts').select('*');
    if (error) {
      console.error('Error fetching data:', error);
      return false;
    }
    console.log('Establishing connection to the database:', data);
    return true;
  } catch (error) {
    console.error('Error in testSupabaseConnection:', error);
    return false;
  }
}

// Call the async function and handle its result
testSupabaseConnection().then(success => {
  if (success) {
    console.log('Database connection test successful');
    // Initialize your app here if the test is successful
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.listen(3000, () => {
      console.log('Server is running on port 3000!');
    });

    app.use('/api/user', userRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/post', postRoutes);
    app.use('/api/comment', commentRoutes);

      // Use url.fileURLToPath to resolve the directory name
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      app.use(express.static(path.join(__dirname, '/client/dist')));
  
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
      });

    app.use((err, req, res, next) => {
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      res.status(statusCode).json({
        success: false,
        statusCode,
        message,
      });
    });
  } else {
    console.log('Database connection test failed');
    // Handle the failure case, e.g., exit the process or retry
  }
});
