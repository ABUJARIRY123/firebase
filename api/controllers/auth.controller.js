import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import { supabase } from '../index.js';
import dotenv from 'dotenv';


dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

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

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          next(errorHandler(400, 'That Username and or Email already exists, kindly recheck'));
        } else {
          throw error; // Or handle other errors as needed
        }
      }    res.json('Signup successful');
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

    if (error ||!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid password'));
    }

    // Generate JWT token (access token)
    const accessToken = jwt.sign({ id: user.id, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    // Generate refresh token with a longer expiration (e.g., 7 days)
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  
    // Send JWT token and refresh token in the response (HttpOnly cookie for refresh token)
    res.cookie('access_token', accessToken, { httpOnly: true })
      .cookie('refresh_token', refreshToken, { httpOnly: true, secure: true }) // Add secure flag for HTTPS transmission
      .json({ token: accessToken, is_admin: user.is_admin, username: user.username });
      console.log("Data:",  {token: accessToken, is_admin: user.is_admin, username: user.username} )
  }
   catch (error) {
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
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = await supabase
       .from('users')
       .insert([
          {
            username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
            email,
            password: hashedPassword,
            profile_picture: googlePhotoUrl,
          },
        ]);

      if (newUser.error) throw newUser.error;

      const token = jwt.sign({ id: newUser.data[0].id, is_admin: newUser.data[0].is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const { password,...rest } = newUser.data[0];

      res
       .status(200)
       .cookie('access_token', token, { httpOnly: true })
       .json(rest);
    } else {
      const token = jwt.sign({ id: user.id, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const { password,...rest } = user;

      res
       .status(200)
       .cookie('access_token', token, { httpOnly: true })
       .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
