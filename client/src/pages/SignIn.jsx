import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  signInSuccess,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false); // State to control the visibility of the Alert

  useEffect(() => {
    if (errorMessage) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 6500); // 30 seconds
      return () => clearTimeout(timer); // Cleanup on component unmount
    }
  }, [errorMessage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return setErrorMessage('Please fill all the fields');
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      console.log('We have started signing in')
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        return setErrorMessage(data.message);
      }

      if (res.ok) {
        setLoading(false);
        dispatch(signInSuccess(data));
        navigate('/dashboard');
        console.log('Navigating to the Dashboar')
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>      
        <div className='flex-1'>
        {showAlert && (
            <Alert className='mt-20 absolute top-0 right-2' color='failure'>
            {errorMessage}
            </Alert>
          )}
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
        </div>
      </div>
    </div>
  );
}
