import React from 'react';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import Form from './Form';

export default function Create({ auth }: PageProps) {
    return <Form auth={auth} />;
} 