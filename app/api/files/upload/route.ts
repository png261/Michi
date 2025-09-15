import { NextResponse } from 'next/server';
import { z } from 'zod';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ENDPOINT_URL = process.env.R2_ENDPOINT_URL!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_REGION = process.env.R2_REGION || 'auto';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const S3_BASE_URL = process.env.S3_BASE_URL!;

if (!R2_ENDPOINT_URL || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !S3_BASE_URL) {
    throw new Error('Missing required R2/S3 environment variables.');
}

const s3Client = new S3Client({
    region: R2_REGION,
    endpoint: R2_ENDPOINT_URL,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const FileSchema = z.object({
    file: z
        .instanceof(Blob)
        .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: 'File size should be less than 5MB',
        })
        .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
            message: 'File type should be JPEG or PNG',
        }),
});

export async function POST(request: Request) {
    if (!request.body) {
        return new Response('Request body is empty', { status: 400 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const validatedFile = FileSchema.safeParse({ file });
        if (!validatedFile.success) {
            const errorMessage = validatedFile.error.errors.map((e) => e.message).join(', ');
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const filename = (formData.get('file') as File).name;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        await s3Client.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: filename,
                Body: fileBuffer,
                ContentType: file.type,
            })
        );

        const fileUrl = `${S3_BASE_URL.replace(/\/$/, '')}/${filename}`;

        return NextResponse.json({
            url: fileUrl,
            pathname: filename,
            contentType: file.type,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

