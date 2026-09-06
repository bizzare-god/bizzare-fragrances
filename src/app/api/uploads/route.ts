import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser, hasRole } from '@/lib/auth';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const isProduction = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can upload fragrance imagery.' }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Please upload a JPG, PNG, or WebP image up to 10 MB.' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const fileName = `${Date.now()}-${safeName}`;

    // If Vercel Blob Token is configured, upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`products/${user.id}/${fileName}`, file, {
          access: 'public',
          addRandomSuffix: true,
          contentType: file.type,
        });
        return NextResponse.json({ url: blob.url }, { status: 201 });
      } catch (blobErr) {
        console.error('Vercel Blob upload failed:', blobErr);
        if (isProduction) {
          return NextResponse.json(
            { error: 'Cloud image storage failed. Please verify storage permissions.' },
            { status: 502 }
          );
        }
      }
    } else if (isProduction) {
      console.error('BLOB_READ_WRITE_TOKEN is missing in production environment.');
      return NextResponse.json(
        { error: 'Image storage is not configured. BLOB_READ_WRITE_TOKEN is required in production.' },
        { status: 503 }
      );
    }

    // Local Storage Fallback ONLY in development
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await fs.mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/products/${fileName}`;
    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error) {
    console.error('Upload error in /api/uploads:', error);
    return NextResponse.json({ error: 'Unable to upload the image. Please try again.' }, { status: 500 });
  }
}
