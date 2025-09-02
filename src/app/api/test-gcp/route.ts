// src/app/api/test-gcp/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Simple test - just verify environment
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

        if (!projectId) {
            return NextResponse.json({
                status: 'error',
                message: 'Google Cloud Project ID not configured'
            });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Google Cloud environment configured',
            projectId
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}
