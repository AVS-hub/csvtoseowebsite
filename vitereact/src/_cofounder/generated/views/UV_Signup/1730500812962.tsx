import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login_user, AppDispatch } from '@/store/main';
import axios from 'axios';
import zxcvbn from 'zxcvbn';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

const UV_Signup: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign Up</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {errorMessages.general && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{errorMessages.general}</p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <p className="text-sm text-gray-500">Enter your first and last name</p>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                {errorMessages.fullName && (
                  <p className="mt-2 text-sm text-red-600">{errorMessages.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <p className="text-sm text-gray-500">We'll send a verification link to this email</p>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                {errorMessages.email && (
                  <p className="mt-2 text-sm text-red-600">{errorMessages.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <p className="text-sm text-gray-500">Must be at least 8 characters long</p>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errorMessages.password && (
                  <p className="mt-2 text-sm text-red-600">{errorMessages.password}</p>
                )}
                {password && (
                  <div className="mt-2">
                    <Progress value={(passwordStrength.score + 1) * 20} className="w-full" />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">
                        {passwordStrength.score === 0 ? 'Very Weak' :
                         passwordStrength.score === 1 ? 'Weak' :
                         passwordStrength.score === 2 ? 'Fair' :
                         passwordStrength.score === 3 ? 'Strong' :
                         'Very Strong'}
                      </span>
                      {passwordStrength.feedback && (
                        <span className="text-sm text-gray-600">{passwordStrength.feedback}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <p className="text-sm text-gray-500">Re-enter your password</p>
                <div className="mt-1 relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errorMessages.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errorMessages.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Signing up...' : 'Sign up'}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Button
                  onClick={() => initiateOAuthSignup('google')}
                  variant="outline"
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Google
                </Button>

                <Button
                  onClick={() => initiateOAuthSignup('facebook')}
                  variant="outline"
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  Facebook
                </Button>

                <Button
                  onClick={() => initiateOAuthSignup('apple')}
                  variant="outline"
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Apple
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
};

export default UV_Signup;