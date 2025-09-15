import type { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return new ChatSDKError('unauthorized:api').toResponse();
    }

    const { searchParams } = request.nextUrl;

    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('starting_after');
    const endingBefore = searchParams.get('ending_before');

    if (startingAfter && endingBefore) {
        return new ChatSDKError(
            'bad_request:api',
            'Only one of starting_after or ending_before can be provided.',
        ).toResponse();
    }

    const chats = await getChatsByUserId({
        id: userId,
        limit,
        startingAfter,
        endingBefore,
    });

    return Response.json(chats);
}
