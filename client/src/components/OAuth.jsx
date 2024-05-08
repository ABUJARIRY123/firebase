import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';


export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const { error } = await supabase.auth.signIn({
        provider: 'google',
      });

      if (error) {
        console.error('Error signing in with Google:', error.message);
        return;
      }

      // Assuming you have a backend endpoint to handle the sign-in success
      // and return the necessary user data.
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supabase.auth.user().user_metadata.full_name,
          email: supabase.auth.user().email,
          googlePhotoUrl: supabase.auth.user().user_metadata.picture,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate('/');
      }
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
    }
  };

  return (
    <Button
      type="button"
      gradientDuoTone="pinkToOrange"
      outline
      onClick={handleGoogleClick}
      style={{ width: '350px' }}
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2" />
      Continue with Google
    </Button>
  );
}
