import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login_user, AppDispatch } from '@/store/main';
import axios from 'axios';
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

  const validateInput = (name: string, value: string) => {
    let error = null;
    switch (name) {
      case 'fullName':
        if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters long';
        }
        break;
      case 'email':
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          error = 'Invalid email address';
        }
        break;
      case 'password':
        if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        }
        break;
      case 'confirmPassword':
        if (value !== password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    setErrorMessages(prev => ({ ...prev, [name]: error }));
  };

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
      validateInput(name, value);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessages({ fullName: null, email: null, password: null, confirmPassword: null, general: null });

    // Validate all inputs
    validateInput('fullName', fullName);
    validateInput('email', email);
    validateInput('password', password);
    validateInput('confirmPassword', confirmPassword);

    if (!termsAccepted) {
      setErrorMessages(prev => ({ ...prev, general: 'You must accept the terms and conditions' }));
      setIsLoading(false);
      return;
    }

    if (Object.values(errorMessages).some(error => error !== null)) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:1337/api/users/register', {
        email,
        password,
        first_name: fullName.split(' ')[0],
        last_name: fullName.split(' ').slice(1).join(' '),
      });

      if (response.status === 201) {
        // Registration successful, now log in the user
        const loginResult = await dispatch(login_user({ email, password }));
        if (login_user.fulfilled.match(loginResult)) {
          navigate('/dashboard');
        } else {
          throw new Error('Login failed after registration');
        }
      }
    } catch (error) {
      setErrorMessages(prev => ({
        ...prev,
        general: error.response?.data?.message || 'An error occurred during registration. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const initiateOAuthSignup = (provider: string) => {
    window.location.href = `http://localhost:1337/api/auth/${provider}`;
  };

  return (
    <>
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
                            passwordStrength.score === 3 ? 'bg-lime-500' :
                            'bg-green-500'
                          }`} 
                          style={{width: `${(passwordStrength.score + 1) * 20}%`}}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {passwordStrength.score === 0 ? 'Very Weak' :
                         passwordStrength.score === 1 ? 'Weak' :
                         passwordStrength.score === 2 ? 'Fair' :
                         passwordStrength.score === 3 ? 'Strong' :
                         'Very Strong'}
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
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => initiateOAuthSignup('facebook')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign up with Facebook</span>
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => initiateOAuthSignup('apple')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign up with Apple</span>
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default UV_Signup;