import React from 'react'
import { Link } from 'react-router-dom'
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import axios from 'axios';

function RegisterForm() {
    const base_url = import.meta.env.VITE_BASE_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const role = formData.get('role');

        const endpoint = role === 'admin' ? 'users/createAdmin' : 'users/signup';

        const payload = {
            name: email.split('@')[0],
            email,
            password,
            passwordConfirm: password
        };

        try {
            const response = await axios.post(`${base_url}/${endpoint}`, payload);
            alert('Registration successful!');
            console.log(response.data);
        } catch (err) {
            console.error(err);
            alert('Registration failed');
        }
    };

    return (
        <div className="min-h-screen max-w-screen flex items-center justify-center">
            <div className="relative w-[420px] shadow-lg rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex">
                    <div className="w-1/2 bg-white"></div>
                    <div className="w-1/2 bg-sky-200"></div>
                </div>
                <form className="relative z-10 p-8" onSubmit={handleSubmit}>
                    <h2 className="text-3xl font-bold text-center mb-8 text-red-800">Register</h2>
                    <div className="flex flex-col gap-6">
                        <label className="flex flex-col items-start gap-2">
                            <span className="text-lg font-medium text-blue-300">Email</span>
                            <input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                className="p-4 backdrop-blur-2xl border border-gray-500 rounded-md focus:outline-none w-full"
                                required
                            />
                        </label>
                        <label className="flex flex-col items-start gap-2">
                            <span className="text-lg font-medium text-blue-300">Password</span>
                            <input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                className="p-4 backdrop-blur-2xl border border-gray-500 rounded-md focus:outline-none w-full"
                                required
                            />
                        </label>
                        <RadioGroup
                            name="role"
                            defaultValue="user"
                            orientation="horizontal"
                            sx={{ justifyContent: 'space-between', px: 4, display: 'flex' }}
                        >
                            <label htmlFor="admin" className="flex items-center gap-3">
                                <Radio id="admin" value="admin" size="lg" variant="soft" />
                                <span>Admin</span>
                            </label>
                            <label htmlFor="user" className="flex items-center gap-3">
                                <Radio id="user" value="user" size="lg" variant="soft" />
                                <span>User</span>
                            </label>
                        </RadioGroup>
                        <button
                            type="submit"
                            className="mt-4 py-3 px-6 bg-gradient-to-r from-blue-400 via-pink-400 to-red-400 text-white font-semibold rounded-md shadow hover:bg-red-600 transition"
                        >
                            Register
                        </button>
                        <div>
                            <h1>Already a User?</h1>
                            <Link to="/login">Login</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterForm;
