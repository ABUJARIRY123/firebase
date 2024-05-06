import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { supabase } from '../index.js';


export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
   !username ||
   !email ||
   !password ||
    username === '' ||
    email === '' ||
    password === ''
  ) {
    next(errorHandler(400, 'All fields are required'));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  try {
    const { data, error } = await supabase
     .from('users')
     .insert([
        {
          username,
          email,
          password: hashedPassword,
        },
      ]);

    if (error) throw error;
    res.json('Signup successful');
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email ||!password || email === '' || password === '') {
    next(errorHandler(400, 'All fields are required'));
  }

  try {
    const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, is_admin, password')
    .eq('email', email)
    .single();
    console.log('Query result:', user, error); // Debugging log

    if (error || !user) {
      console.error('Error fetching user:', error); // Debugging log
      return next(errorHandler(404, 'User not found'));
    }

    console.log('User password from database:', user.password); // Debugging log

    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) { 
      return next(errorHandler(400, 'Invalid password'));
    }

    // Rest of the code...
  } catch (error) {
    next(error);
  }
};


export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const { data: user, error } = await supabase
     .from('users')
     .select('id, username, email, is_admin')
     .eq('email', email)
     .single();

    if (error ||!user) {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = await supabase
       .from('users')
       .insert([
          {
            username:
              name.toLowerCase().split(' ').join('') +
              Math.random().toString(9).slice(-4),
            email,
            password: hashedPassword,
            profile_picture: googlePhotoUrl,
          },
        ]);

      if (newUser.error) throw newUser.error;

      const token = jwt.sign(
        { id: newUser.data[0].id, is_admin: newUser.data[0].is_admin },
        process.env.JWT_SECRET
      );

      const { password,...rest } = newUser.data[0];

      res
       .status(200)
       .cookie('access_token', token, {
          httpOnly: true,
        })
       .json(rest);
    } else {
      const token = jwt.sign(
        { id: user.id, is_admin: user.is_admin },
        process.env.JWT_SECRET
      );

      const { password,...rest } = user;

      res
       .status(200)
       .cookie('access_token', token, {
          httpOnly: true,
        })
       .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
