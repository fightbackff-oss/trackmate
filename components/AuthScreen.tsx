import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Mail, Lock, User, ArrowLeft, Shield, AlertCircle, Eye, EyeOff, ArrowRight, Check, AtSign } from 'lucide-react';
import { supabase } from '../supabaseClient';

type AuthView = 'WELCOME' | 'LOGIN' | 'SIGNUP' | 'VERIFY_OTP';

interface AuthScreenProps {
  onLogin: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26c.01-.19.01-.38.01-.58z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const InputField = ({ 
  icon: Icon, 
  type, 
  placeholder, 
  value, 
  onChange,
  isPassword = false
}: any) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="relative mb-4 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-400 dark:text-gray-500 group-focus-within:text-[#65a30d] dark:group-focus-within:text-[#a3e635] transition-colors" />
      </div>
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        className="w-full bg-slate-50 dark:bg-[#0c1214] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 text-sm font-medium rounded-[18px] py-4 pl-12 pr-12 focus:outline-none focus:border-[#65a30d] dark:focus:border-[#a3e635] focus:bg-white dark:focus:bg-[#0c1214] transition-all"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

const ScreenWrapper = ({ children }: { children?: React.ReactNode }) => (
  <div className="h-[100dvh] w-full bg-[#f0f9ff] dark:bg-[#05080a] text-slate-900 dark:text-white flex flex-col p-6 relative overflow-hidden font-sans transition-colors duration-300">
    {/* Ambient Glows */}
    <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[40%] bg-[#e0f7fa] dark:bg-[#0f2e2e] rounded-full blur-[100px] pointer-events-none opacity-60 dark:opacity-40 transition-colors duration-500"></div>
    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[30%] bg-[#a3e635] rounded-full blur-[120px] pointer-events-none opacity-20 dark:opacity-5 transition-colors duration-500"></div>
    {children}
  </div>
);

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('WELCOME');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (view === 'VERIFY_OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      // Note: OAuth redirects, so we don't manually call onLogin() here usually, 
      // but if it were a popup flow we might. Standard flow redirects away.
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session) onLogin();
    } catch (err: any) { setError(err.message || 'Login failed'); } finally { setIsLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (username.length < 3) { setError("Username must be at least 3 characters"); return; }
    
    const finalUsername = username.toLowerCase(); // Enforce lowercase

    setIsLoading(true);
    setError(null);
    try {
      // Check username availability first (optional check, main check is DB constraint)
      const { data: existingUser } = await supabase.from('users').select('id').eq('username', finalUsername).single();
      if (existingUser) {
          throw new Error("Username already taken");
      }

      const { data, error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { 
              data: { 
                  name: fullName,
                  username: finalUsername 
              } 
          } 
      });
      if (error) throw error;

      // Explicitly insert into users table to ensure searchability
      if (data.user) {
         const { error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            email: email,
            username: finalUsername, // Store as lowercase
            name: fullName,
            is_tracking_enabled: true
         });
         
         if (insertError) {
             // Ignore duplicate key error (23505) if user was already created by a trigger
             if (insertError.code !== '23505') {
                 console.error("Failed to create user profile:", insertError);
             }
         }
      }

      if (data.session) onLogin();
      else { setTimer(59); setOtp(['', '', '', '', '', '']); setView('VERIFY_OTP'); }
    } catch (err: any) { setError(err.message || 'Signup failed'); } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length !== 6) { setError('Please enter a valid 6-digit code'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
      if (error) throw error;
      if (data.session) onLogin();
      else { setView('LOGIN'); setError('Verification successful. Please log in.'); }
    } catch (err: any) { setError(err.message || 'Invalid code'); } finally { setIsLoading(false); }
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;
    const newOtp = [...otp]; newOtp[index] = element.value; setOtp(newOtp);
    if (element.value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputRefs.current[index - 1]?.focus();
  };

  if (view === 'WELCOME') {
    return (
      <ScreenWrapper>
        <div className="flex items-center space-x-3 pt-4 relative z-10">
          <div className="bg-[#a3e635] p-1.5 rounded-lg text-black">
            <Shield size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TrackMate</span>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center relative z-10 min-h-0">
          <div className="relative w-[280px] aspect-square flex items-center justify-center mb-10">
            <div className="absolute inset-0 bg-[#a3e635]/10 dark:bg-[#a3e635]/5 rounded-full animate-pulse"></div>
            <div className="absolute inset-10 bg-[#a3e635]/20 dark:bg-[#a3e635]/10 rounded-full border border-[#a3e635]/10"></div>
            
            <div className="relative bg-white dark:bg-[#0c1214] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-[#a3e635]/10">
               <Shield size={64} className="text-[#65a30d] dark:text-[#a3e635]" fill="currentColor" fillOpacity={0.1} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-center mb-4 leading-tight text-slate-900 dark:text-white">
            Arctic<br />
            <span className="text-[#65a30d] dark:text-[#a3e635]">Aurora</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-center text-sm max-w-[260px] leading-relaxed font-medium">
            Next-generation location tracking. Precision, privacy, and peace of mind.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8 relative z-10">
          <button 
            onClick={() => setView('SIGNUP')}
            className="w-full bg-[#a3e635] hover:bg-[#bef264] text-black font-bold py-4 rounded-[20px] flex items-center justify-center group transition-all active:scale-95 text-sm uppercase tracking-wider shadow-lg shadow-[#a3e635]/20"
          >
            Get Started
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-gray-500 font-medium">
            Existing user?{' '}
            <button onClick={() => setView('LOGIN')} className="text-slate-900 dark:text-white hover:text-[#65a30d] dark:hover:text-[#a3e635] transition-colors">
              Log In
            </button>
          </p>
        </div>
      </ScreenWrapper>
    );
  }

  if (view === 'SIGNUP' || view === 'LOGIN') {
    return (
      <ScreenWrapper>
        <div className="flex items-center mb-6 pt-2">
          <button onClick={() => setView('WELCOME')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 active:scale-90 transition-all">
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{view === 'SIGNUP' ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-slate-500 dark:text-gray-400">{view === 'SIGNUP' ? 'Join the secure network.' : 'Enter your credentials.'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-200 rounded-[18px] flex items-center text-xs font-medium">
            <AlertCircle size={16} className="mr-3 flex-shrink-0 text-red-500" />
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white dark:bg-[#0c1214] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold py-4 rounded-[20px] flex items-center justify-center mb-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm active:scale-95"
        >
          <GoogleIcon />
          <span className="ml-3 text-sm">Continue with Google</span>
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
          <span className="px-4 text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Or with Email</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
        </div>

        <form onSubmit={view === 'SIGNUP' ? handleSignup : handleLogin} className="flex-1 flex flex-col">
          {view === 'SIGNUP' && (
             <>
              <InputField icon={User} type="text" placeholder="Full Name" value={fullName} onChange={setFullName} />
              <InputField icon={AtSign} type="text" placeholder="Username" value={username} onChange={setUsername} />
             </>
          )}
          <InputField icon={Mail} type="email" placeholder="Email Address" value={email} onChange={setEmail} />
          <InputField icon={Lock} type="password" placeholder="Password" isPassword={true} value={password} onChange={setPassword} />
          {view === 'SIGNUP' && (
              <InputField icon={Shield} type="password" placeholder="Confirm Password" isPassword={true} value={confirmPassword} onChange={setConfirmPassword} />
          )}

          <div className="mt-auto pt-6">
             <button type="submit" disabled={isLoading} className="w-full bg-[#a3e635] hover:bg-[#bef264] disabled:opacity-50 text-black font-bold py-4 rounded-[20px] flex items-center justify-center active:scale-95 transition-transform text-sm uppercase tracking-wider shadow-lg shadow-[#a3e635]/20">
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div> : (view === 'SIGNUP' ? 'Create Account' : 'Sign In')}
            </button>
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-gray-500 font-medium">
                {view === 'SIGNUP' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button type="button" onClick={() => setView(view === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')} className="text-slate-900 dark:text-white hover:text-[#65a30d] dark:hover:text-[#a3e635] transition-colors ml-1">
                   {view === 'SIGNUP' ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </form>
      </ScreenWrapper>
    );
  }

  // Verify OTP View
  return (
    <ScreenWrapper>
         <div className="flex items-center mb-8 pt-2">
          <button onClick={() => setView('SIGNUP')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft size={20} />
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Verify Identity</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">Check your email for the code.</p>
        
        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-200 rounded-[18px] text-xs">{error}</div>}

        <div className="flex gap-3 mb-10 justify-center">
            {otp.map((digit, index) => (
            <input key={index} ref={(el) => { otpInputRefs.current[index] = el; }} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(e.target, index)} onKeyDown={(e) => handleOtpKeyDown(e, index)} className="w-12 h-14 bg-slate-50 dark:bg-[#0c1214] border border-slate-200 dark:border-white/10 rounded-[16px] text-center text-xl font-bold text-slate-900 dark:text-white focus:border-[#65a30d] dark:focus:border-[#a3e635] focus:outline-none transition-all" />
            ))}
        </div>
        <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full bg-[#a3e635] text-black font-bold py-4 rounded-[20px] mb-4 text-sm uppercase tracking-wider">{isLoading ? 'Verifying...' : 'Verify Code'}</button>
    </ScreenWrapper>
  );
};

export default AuthScreen;
