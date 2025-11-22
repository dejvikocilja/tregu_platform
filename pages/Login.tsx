import React, { useState } from 'react';
import { DISPOSABLE_DOMAINS } from '../constants';
import { loginUserMock, saveUser } from '../services/storage';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Button, Input, Card } from '../components/DesignSystem';

interface LoginProps {
  onLogin: (user: User) => void;
  initialView: 'LOGIN' | 'REGISTER';
}

const Login: React.FC<LoginProps> = ({ onLogin, initialView }) => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (view === 'LOGIN') {
        const user = loginUserMock(email);
        if (user) {
            onLogin(user);
        } else {
            setError('Identity not found in registry.');
        }
    } else {
        const domain = email.split('@')[1];
        if (DISPOSABLE_DOMAINS.includes(domain)) {
            setError('Disposable domains restricted.');
            return;
        }

        const newUser: User = {
            id: uuidv4(),
            email,
            name: name || 'User',
            joinedDate: new Date().toISOString(),
            listingCount: 0,
            isVerified: true,
            role: 'user'
        };
        saveUser(newUser);
        loginUserMock(email);
        onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <Card className="w-full max-w-md p-12 border border-border">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-light uppercase tracking-tight mb-2">
                    {view === 'LOGIN' ? 'Authenticate' : 'Initialize'}
                </h2>
                <p className="font-mono text-xs text-secondary uppercase tracking-widest">Tregu Secure Access</p>
            </div>
            
            {error && <div className="bg-red-900/20 text-red-400 p-3 text-xs font-mono border border-red-900/50 mb-8">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {view === 'REGISTER' && (
                    <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Designation (Name)</label>
                        <Input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                )}
                <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-secondary mb-2">Email Protocol</label>
                    <Input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <Button className="w-full">
                    {view === 'LOGIN' ? 'Enter' : 'Register'}
                </Button>
            </form>

            <div className="mt-8 text-center">
                {view === 'LOGIN' ? (
                    <button onClick={() => setView('REGISTER')} className="text-[10px] font-mono uppercase text-secondary hover:text-white tracking-widest">Create New Identity</button>
                ) : (
                    <button onClick={() => setView('LOGIN')} className="text-[10px] font-mono uppercase text-secondary hover:text-white tracking-widest">Return to Login</button>
                )}
            </div>
        </Card>
    </div>
  );
};

export default Login;