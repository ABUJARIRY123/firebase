import { createClient } from '@supabase/supabase-js';
import { errorHandler } from '../utils/error.js';
import { supabase } from '../index.js';

// Assuming you have a function to get the current user from the request
// This is a placeholder for your actual authentication logic
function getCurrentUser(req) {
  // Your logic to get the current user
  return { id: 'user_id', isAdmin: false }; // Example user object
}

export const createComment = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  if (!id ||id.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create this comment'));
  }
  const { content, postId, userId } = req.body;
  try {
    const { data, error } = await supabase
   .from('comments')
   .insert([
       {
        content,
        post_id: postId,
        user_id: userId,
      },
     ]);

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
   .from('comments')
   .select('*')
   .eq('post_id', req.params.postId)
   .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  try {
    const { data, error } = await supabase
   .from('comments')
   .update({
       likes: supabase.raw(`array_append(likes, ${id})`),
       number_of_likes: supabase.raw(`number_of_likes + 1`),
     })
   .match({ id: req.params.commentId });

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  try {
    const { data, error } = await supabase
   .from('comments')
   .update({
       content: req.body.content,
     })
   .match({ id: req.params.commentId });

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  const { id } = getCurrentUser(req);
  try {
    const { data, error } = await supabase
   .from('comments')
   .delete()
   .match({ id: req.params.commentId });

    if (error) throw error;
    res.status(200).json('Comment has been deleted');
  } catch (error) {
    next(error);
  }
};

export const getcomments = async (req, res, next) => {
  if (!getCurrentUser(req).isAdmin) {
    return next(errorHandler(403, 'You are not allowed to get all comments'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'desc'? -1 : 1;
    const { data, error } = await supabase
   .from('comments')
   .select('*')
   .order('created_at', { ascending: sortDirection })
   .range(startIndex, limit);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
