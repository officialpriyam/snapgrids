import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:3006/api').replace(/\/$/, '');
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

async function proxyRequest(req: NextRequest, pathParts: string[]) {
    const path = pathParts.join('/');
    const url = `${BACKEND_URL}/${path}${req.nextUrl.search}`;

    const headers = new Headers();
    const contentType = req.headers.get('content-type');
    if (contentType) {
        headers.set('content-type', contentType);
    }
    if (ADMIN_API_KEY) {
        headers.set('x-admin-api-key', ADMIN_API_KEY);
    }

    const init: RequestInit = {
        method: req.method,
        headers,
        cache: 'no-store',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        init.body = await req.text();
    }

    const response = await fetch(url, init);
    const body = await response.text();

    return new NextResponse(body, {
        status: response.status,
        headers: {
            'content-type': response.headers.get('content-type') || 'application/json',
        },
    });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}
