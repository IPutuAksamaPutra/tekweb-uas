'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('Sedang memverifikasi...');

    useEffect(() => {
        const verify = async () => {
            const { id, hash } = params;
            // Ambil signature dan expires dari URL
            const query = searchParams.toString();

            try {
                // Tembak balik ke Laravel (Port 8000)
                const res = await fetch(`https://tekweb-uas-production.up.railway.app/api/verify-email/${id}/${hash}?${query}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                const data = await res.json();

                if (res.ok) {
                    setMessage('✅ Email berhasil diverifikasi! Mengalihkan ke login...');
                    setTimeout(() => router.push('/auth/login'), 3000);
                } else {
                    setMessage('❌ Verifikasi Gagal: ' + data.message);
                }
            } catch (err) {
                setMessage('❌ Gagal terhubung ke server backend.');
            }
        };

        if (params.id && params.hash) {
            verify();
        }
    }, [params, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-lg">
                <h1 className="text-xl font-semibold text-gray-800">{message}</h1>
            </div>
        </div>
    );
}