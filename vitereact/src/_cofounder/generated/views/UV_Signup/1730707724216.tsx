import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch, login_user } from '@/store/main';
import axios from 'axios';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import { Eye, EyeOff } from 'lucide-react';
import zxcvbn from 'zxcvbn';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    console.log(`Initiating OAuth signup with ${provider}`);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign Up</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account and start your journey
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={handleInputChange}
                />
                {errorMessages.fullName && (
                  <p className="mt-2 text-sm text-red-600">{errorMessages.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleInputChange}
                />
                {errorMessages.email && (
                  <p className="mt-2 text-sm text-red-600">{errorMessages.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errorMessages.password && (
                  <p className="mt-2 text-sm text-red-600">{errorMessages.password}</p>
                )}
                {password && (
                  <div className="mt-2">
                    <Progress value={(passwordStrength.score + 1) * 20} className="w-full" />
                    <p className="mt-1 text-sm text-gray-600">
                      Password strength: {' '}
                      <span className={
                        passwordStrength.score === 0 ? 'text-red-500' :
                        passwordStrength.score === 1 ? 'text-orange-500' :
                        passwordStrength.score === 2 ? 'text-yellow-500' :
                        passwordStrength.score === 3 ? 'text-blue-500' : 'text-green-500'
                      }>
                        {passwordStrength.score === 0 ? 'Weak' :
                         passwordStrength.score === 1 ? 'Fair' :
                         passwordStrength.score === 2 ? 'Good' :
                         passwordStrength.score === 3 ? 'Strong' : 'Very Strong'}
                      </span>
                    </p>
                    {passwordStrength.feedback && (
                      <p className="mt-1 text-sm text-gray-600">{passwordStrength.feedback}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={handleInputChange}
                />
                {errorMessages.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errorMessages.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-900"
                >
                  I agree to the <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</Link>
                </label>
              </div>

              {errorMessages.general && (
                <p className="mt-2 text-sm text-red-600">{errorMessages.general}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign up'}
              </Button>
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
                <Button
                  variant="outline"
                  onClick={() => initiateOAuthSignup('google')}
                >
                  <FaGoogle className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => initiateOAuthSignup('facebook')}
                >
                  <FaFacebook className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => initiateOAuthSignup('apple')}
                >
                  <FaApple className="w-5 h-5" />
                </Button>
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
    </>
  );
};

export default UV_Signup;