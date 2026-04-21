'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AttendeeLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = storage.getUserByUsername(username);

        if (!user || user.password !== password) {
            setError('Invalid username or password');
            return;
        }

        if (user.role === 'admin') {
            setError('Admin cannot take the quiz here. Go to /admin');
            return;
        }

        // Set current user session
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(user));
        }

        router.push('/attendee');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Quiz Login</CardTitle>
                    <CardDescription>Enter your credentials to start the assessment</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                        <Button type="submit" className="w-full">Login</Button>
                        <div className="text-center mt-4 text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link href="/attendee/register" className="text-blue-600 hover:underline">
                                Register here
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
