'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AttendeeRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Check if user already exists
        const existingUser = storage.getUserByUsername(formData.email);
        if (existingUser) {
            setError('An account with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: `user-${Date.now()}`,
            username: formData.email, // Email is used as username
            password: formData.password,
            role: 'user' as const,
            name: formData.name,
            dob: formData.dob,
            createdAt: new Date().toISOString()
        };

        storage.addUser(newUser);

        // Auto-login or redirect to login
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(newUser));
        }

        router.push('/attendee');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Candidate Registration</CardTitle>
                    <CardDescription>Create an account to take the assessment</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="john@example.com"
                            />
                            <p className="text-xs text-gray-500">This will be your username for login</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                        <Button type="submit" className="w-full">Create Account</Button>

                        <div className="text-center mt-4 text-sm">
                            <span className="text-gray-600">Already have an account? </span>
                            <Link href="/attendee/login" className="text-blue-600 hover:underline">
                                Login here
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
