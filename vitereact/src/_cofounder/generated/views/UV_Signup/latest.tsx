import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch, login_user } from '@/store/main';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { debounce } from 'lodash';

const UV_Signup: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const calculatePasswordStrength = (password: string) => {
    // This is a simple implementation. Consider using a library like zxcvbn for more accurate results.
    const strength = {
      score: 0,
      feedback: 'Password is too weak',
    };

    if (password.length >= 8) strength.score++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength.score++;
    if (password.match(/\d/)) strength.score++;
    if (password.match(/[^a-zA-Z\d]/)) strength.score++;

    if (strength.score === 4) strength.feedback = 'Password is strong';
    else if (strength.score === 3) strength.feedback = 'Password is good';
    else if (strength.score === 2) strength.feedback = 'Password is fair';

    return strength;
  };

  const validateInput = useCallback(
    debounce((name: string, value: string) => {
      let error = '';
      switch (name) {
        case 'fullName':
          if (value.length < 2) error = 'Full name must be at least 2 characters long';
          break;
        case 'email':
          if (!validateEmail(value)) error = 'Please enter a valid email address';
          break;
        case 'password':
          if (value.length < 8) error = 'Password must be at least 8 characters long';
          break;
        case 'confirmPassword':
          if (value !== formData.password) error = 'Passwords do not match';
          break;
      }
      setErrorMessages((prev) => ({ ...prev, [name]: error }));
    }, 300),
    [formData]
  );

  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: inputValue }));
    if (type !== 'checkbox') validateInput(name, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessages({ fullName: '', email: '', password: '', confirmPassword: '', general: '' });

    if (!formData.termsAccepted) {
      setErrorMessages((prev) => ({ ...prev, general: 'You must accept the terms and conditions' }));
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:1337/api/users/register', {
        first_name: formData.fullName.split(' ')[0],
        last_name: formData.fullName.split(' ').slice(1).join(' '),
        email: formData.email,
        password: formData.password,
      });

      if (response.data && response.data.token) {
        await dispatch(login_user({ email: formData.email, password: formData.password }));
        navigate('/dashboard');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessages((prev) => ({ ...prev, general: error.response?.data.message || 'An error occurred during registration' }));
      } else {
        setErrorMessages((prev) => ({ ...prev, general: 'An unexpected error occurred' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = (provider: string) => {
    // Placeholder for OAuth signup
    console.log(`Initiating ${provider} OAuth signup`);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                {errorMessages.fullName && <p className="mt-2 text-sm text-red-600">{errorMessages.fullName}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errorMessages.email && <p className="mt-2 text-sm text-red-600">{errorMessages.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {errorMessages.password && <p className="mt-2 text-sm text-red-600">{errorMessages.password}</p>}
                <p className={`mt-2 text-sm ${passwordStrength.score > 2 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {passwordStrength.feedback}
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                {errorMessages.confirmPassword && <p className="mt-2 text-sm text-red-600">{errorMessages.confirmPassword}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Terms and Conditions
                    </a>
                  </label>
                </div>
              </div>

              {errorMessages.general && <p className="mt-2 text-sm text-red-600">{errorMessages.general}</p>}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing up...' : 'Sign up'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div>
                  <button
                    onClick={() => handleOAuthSignup('Google')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign up with Google</span>
                    <FaGoogle className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => handleOAuthSignup('Facebook')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign up with Facebook</span>
                    <FaFacebook className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => handleOAuthSignup('Apple')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign up with Apple</span>
                    <FaApple className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Signup;