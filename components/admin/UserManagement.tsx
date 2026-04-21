'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage, User } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', name: '' });
    const [loading, setLoading] = useState(true);

    const fetchUsers = () => {
        const allUsers = storage.getUsers();
        setUsers(allUsers);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password || !newUser.name) return;

        if (storage.getUserByUsername(newUser.username)) {
            alert('Username already exists');
            return;
        }

        const user: User = {
            id: crypto.randomUUID(),
            username: newUser.username,
            password: newUser.password,
            name: newUser.name,
            role: 'user',
            createdAt: new Date().toISOString(),
        };

        storage.addUser(user);
        setNewUser({ username: '', password: '', name: '' });
        fetchUsers();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search/Add User Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New User</CardTitle>
                    <CardDescription>Create credentials for quiz attendees</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                placeholder="johndoe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="••••••"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Create User</Button>
                    </form>
                </CardContent>
            </Card>

            {/* User List */}
            <Card>
                <CardHeader>
                    <CardTitle>Registered Users ({users.filter(u => u.role !== 'admin').length})</CardTitle>
                    <CardDescription>List of users who can take the quiz</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[400px] overflow-y-auto space-y-3">
                        {users.filter(u => u.role !== 'admin').length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No users found. Add one to get started.</p>
                        ) : (
                            users
                                .filter(u => u.role !== 'admin')
                                .map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-xs text-gray-500">@{user.username}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">User</Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm(`Delete user ${user.name}?`)) {
                                                        storage.removeUser(user.id);
                                                        fetchUsers();
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
