import { createClient } from '@supabase/supabase-js';
import { errorHandler } from '../utils/error.js';
import { supabase } from '../index.js';
// Assuming you have a function to get the current user from the request
// This is a placeholder for your actual authentication logic
function getCurrentUser(req) {
  // Your logic to get the current user
  return { id: 'user_id', isAdmin: false }; // Example user object
}

export const create = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  if (!id ||!id.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title ||!req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
   .split(' ')
   .join('-')
   .toLowerCase()
   .replace(/[^a-zA-Z0-9-]/g, '');
  try {
    const { data, error } = await supabase
    .from('posts')
    .insert([
       {
        ...req.body,
         slug,
         user_id: id,
       },
     ]);

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  if (!id ||!id.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all posts'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc'? 1 : -1;
    const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: sortDirection })
    .range(startIndex, limit);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  if (!id ||!id.isAdmin || req.user.id!== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    const { data, error } = await supabase
    .from('posts')
    .delete()
    .match({ id: req.params.postId });

    if (error) throw error;
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  if (!id ||!id.isAdmin || req.user.id!== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }
  try {
    const { data, error } = await supabase
    .from('posts')
    .update({
       title: req.body.title,
       content: req.body.content,
       category: req.body.category,
       image: req.body.image,
     })
    .match({ id: req.params.postId });

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    next(error);
  }
};
