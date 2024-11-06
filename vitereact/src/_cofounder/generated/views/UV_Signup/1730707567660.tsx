import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch, login_user } from '@/store/main';
import axios from 'axios';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import zxcvbn from 'zxcvbn';

const UV_Signup: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    fullName: null,
    email: null,
    password: null,
    confirmPassword: null,
    general: null,
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setTermsAccepted(checked);
    } else {
      switch (name) {
        case 'fullName':
          setFullName(value);
          break;
        case 'email':
          setEmail(value);
          break;
        case 'password':
          setPassword(value);
          break;
        case 'confirmPassword':
          setConfirmPassword(value);
          break;
      }
    }
  };

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength({
        score: result.score,
        feedback: result.feedback.warning || result.feedback.suggestions[0] || '',
      });
    }
  }, [password]);

  const validateInput = () => {
    let isValid = true;
    const newErrorMessages = { ...errorMessages };

    if (!fullName.trim()) {
      newErrorMessages.fullName = 'Full name is required';
      isValid = false;
    } else {
      newErrorMessages.fullName = null;
    }

    if (!email.trim()) {
      newErrorMessages.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrorMessages.email = 'Invalid email format';
      isValid = false;
    } else {
      newErrorMessages.email = null;
    }

    if (!password) {
      newErrorMessages.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrorMessages.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else {
      newErrorMessages.password = null;
    }

    if (password !== confirmPassword) {
      newErrorMessages.confirmPassword = 'Passwords do not match';
      isValid = false;
    } else {
      newErrorMessages.confirmPassword = null;
    }

    if (!termsAccepted) {
      newErrorMessages.general = 'You must accept the terms and conditions';
      isValid = false;
    } else {
      newErrorMessages.general = null;
    }

    setErrorMessages(newErrorMessages);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:1337/api/users/register', {
        full_name: fullName,
        email,
        password,
      });

      if (response.data && response.data.user_id) {
        const loginResult = await dispatch(login_user({ email, password }));
        if (login_user.fulfilled.match(loginResult)) {
          navigate('/dashboard');
        } else {
          throw new Error('Login failed after successful registration');
        }
      }
    } catch (error) {
      setErrorMessages({
        ...errorMessages,
        general: error.response?.data?.message || 'An error occurred during registration',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initiateOAuthSignup = (provider: string) => {
    // This function would typically redirect to the OAuth provider's authorization page
    // For demonstration purposes, we'll just log the action
    console.log(`Initiating OAuth signup with ${provider}`);
    // In a real implementation, you would redirect to the OAuth provider here
    // window.location.href = `http://localhost:1337/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
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
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={fullName}
                  onChange={handleInputChange}
                />
              </div>
              {errorMessages.fullName && (
                <p className="mt-2 text-sm text-red-600">{errorMessages.fullName}</p>
              )}
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
                  value={email}
                  onChange={handleInputChange}
                />
              </div>
              {errorMessages.email && (
                <p className="mt-2 text-sm text-red-600">{errorMessages.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={password}
                  onChange={handleInputChange}
                />
              </div>
              {errorMessages.password && (
                <p className="mt-2 text-sm text-red-600">{errorMessages.password}</p>
              )}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          passwordStrength.score === 0 ? 'bg-red-500' :
                          passwordStrength.score === 1 ? 'bg-orange-500' :
                          passwordStrength.score === 2 ? 'bg-yellow-500' :
                          passwordStrength.score === 3 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {passwordStrength.score === 0 ? 'Weak' :
                       passwordStrength.score === 1 ? 'Fair' :
                       passwordStrength.score === 2 ? 'Good' :
                       passwordStrength.score === 3 ? 'Strong' : 'Very Strong'}
                    </span>
                  </div>
                  {passwordStrength.feedback && (
                    <p className="mt-1 text-sm text-gray-600">{passwordStrength.feedback}</p>
                  )}
                </div>
              )}
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
                  value={confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              {errorMessages.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errorMessages.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={termsAccepted}
                onChange={handleInputChange}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
              </label>
            </div>

            {errorMessages.general && (
              <p className="mt-2 text-sm text-red-600">{errorMessages.general}</p>
            )}

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
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <button
                  onClick={() => initiateOAuthSignup('google')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign up with Google</span>
                  <FaGoogle className="w-5 h-5" />
                </button>
              </div>

              <div>
                <button
                  onClick={() => initiateOAuthSignup('facebook')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign up with Facebook</span>
                  <FaFacebook className="w-5 h-5" />
                </button>
              </div>

              <div>
                <button
                  onClick={() => initiateOAuthSignup('apple')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign up with Apple</span>
                  <FaApple className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UV_Signup;