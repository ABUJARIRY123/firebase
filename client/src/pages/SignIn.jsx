import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const {error: errorMessage } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill all the fields'));
    }
    try {
      setLoading(true);
      console.log('We have started signing in')
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        dispatch(signInFailure(data.message));
        console.log('It has failed', data.message)
      }

      if (res.ok) {
        setLoading(false);
        dispatch(signInSuccess(data));
        navigate('/dashboard');
        console.log('Navigating to the Dashboar')
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
      setLoading(false);
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>      
        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div >
              <Label className='flex items-center justify-center' value='Your email' />
              <TextInput
                type='email'
                placeholder='examplemail@test.com'
                id='email'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className='flex items-center justify-center' value='Your password' />
              <TextInput
                type='password'
                placeholder='**********'
                id='password'
                onChange={handleChange}

              />
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Loading...</span>
                </>
              ) : (
                'Sign In'
              )}
              
            </Button>
            <OAuth />
          </form>
          <div className='flex gap-2 text-sm mt-5 items-center justify-center'>
            <span>Dont Have an account?</span>
            <Link to='/sign-up' className='text-blue-500'>
              Sign Up
            </Link>
          </div>
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
