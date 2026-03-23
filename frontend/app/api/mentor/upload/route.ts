import { NextRequest, NextResponse } from 'next/server';
import { HindsightClient } from '@vectorize-io/hindsight-client';

const hindsight = new HindsightClient({
  baseUrl: 'https://api.hindsight.vectorize.io',
  apiKey: process.env.HINDSIGHT_API_KEY!,
});

const BANK_ID = process.env.HINDSIGHT_BANK_ID || 'ai-mentor';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required.' },
        { status: 400 }
      );
    }

    if (typeof file === 'string') {
      return NextResponse.json(
        { error: 'Invalid file format.' },
        { status: 400 }
      );
    }

    // Call Hindsight's retainFiles API directly
    // Using cast to any since the types for retainFiles aren't fully exported in the TS definitions
    const response = await (hindsight as any).retainFiles(
      BANK_ID,
      [file],
      {
        filesMetadata: [{ tags: [userId.toString()], context: `Uploaded file for user ${userId}` }],
      }
    );

    return NextResponse.json({ success: true, response });

  } catch (error: any) {
    console.error('File upload error:', error);
    
    // Write error to disk for debugging
    const fs = require('fs');
    fs.writeFileSync('upload-error.txt', JSON.stringify({
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
      response: error?.response
    }, null, 2));

    return NextResponse.json(
      { error: error?.message || 'Internal server error during upload' },
      { status: 500 }
    );
  }
}
