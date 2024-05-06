import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import { supabase } from '../index.js';
// Assuming you have a function to get the current user from the request
// This is a placeholder for your actual authentication logic
function getCurrentUser(req) {
  // Your logic to get the current user
  return { id: 'user_id', isAdmin: false }; // Example user object
}

export const updateUser = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  if (id!== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters'));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
    }
    if (req.body.username.includes(' ')) {
      return next(errorHandler(400, 'Username cannot contain spaces'));
    }
    if (req.body.username!== req.body.username.toLowerCase()) {
      return next(errorHandler(400, 'Username must be lowercase'));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(errorHandler(400, 'Username can only contain letters and numbers'));
    }
  }
  try {
    const { data, error } = await supabase
     .from('users')
     .update({
        username: req.body.username,
        email: req.body.email,
        profile_picture: req.body.profilePicture,
        password: req.body.password,
      })
     .match({ id: req.params.userId });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  if (!id ||!id.isAdmin && id!== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this user'));
  }
  try {
    const { data, error } = await supabase
     .from('users')
     .delete()
     .match({ id: req.params.userId });

    if (error) throw error;
    res.status(200).json('User has been deleted');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  if (!id ||!id.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }
  try {
    const { data, error } = await supabase
     .from('users')
     .select('*')
     .order('created_at', { ascending: req.query.sort === 'asc'? true : false })
     .range(req.query.startIndex, req.query.limit);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
     .clearCookie('access_token')
     .status(200)
     .json('User has been signed out');
  } catch (error) {
    next(error);
  }
};


export const getUser = async (req, res, next) => {
  try {
    const { data, error } = await supabase
     .from('users')
     .select('*')
     .eq('id', req.params.userId);

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    next(error);
  }
};
