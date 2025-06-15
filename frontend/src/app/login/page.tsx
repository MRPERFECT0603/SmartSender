'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BASE_URL } from "../../../src/config"


export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [userName, setUser] = useState('')
    const [contact, setContact] = useState('')
    const [linkedIn, setLinkedIn] = useState('')
    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${BASE_URL}/api/userlogin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userName }),
            });

            const data = await res.json();

            if (res.status === 200) {
                console.log('Login success:', data);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', userName);
                localStorage.setItem('contact', contact);
                localStorage.setItem('linkedIn', linkedIn);
                router.push(`/dashboard`);
            }
            else if (res.status === 202 && data.authUrl) {
                window.open(data.authUrl, '_blank');
            }
            else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="flex  items-center justify-center h-fit bg-custom-lightblue rounded-2xl pt-20">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6"
            >
                <h2 className="text-2xl font-semibold text-center">Login to SmartSender</h2>

                <div>
                    <label className="block text-sm font-medium">UserName</label>
                    <input
                        type="userName"
                        className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={userName}
                        onChange={e => setUser(e.target.value)}
                        required
                        placeholder='Yours [UserName]'
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder='Your Email'
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Contact No.</label>
                    <input
                        type="contact"
                        className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={contact}
                        onChange={e => setContact(e.target.value)}
                        required
                        placeholder='Your Contact No'
                    />
                </div>


                <div>
                    <label className="block text-sm font-medium">LinkedIn</label>
                    <input
                        type="linkedin"
                        className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={linkedIn}
                        onChange={e => setLinkedIn(e.target.value)}
                        required
                        placeholder='Your LinkedIn'
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-custom-blue text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Log In
                </button>
            </form>
        </div>
    )
}