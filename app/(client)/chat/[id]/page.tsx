import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const chat = await getChatById({ id });

    if (!chat) {
        notFound();
    }

    const messagesFromDb = await getMessagesByChatId({
        id,
    });

    const uiMessages = convertToUIMessages(messagesFromDb);

    const cookieStore = await cookies();
    const chatModelFromCookie = cookieStore.get('chat-model');

    if (!chatModelFromCookie) {
        return (
            <>
                <Chat
                    id={chat.id}
                    initialMessages={uiMessages}
                    initialChatModel={DEFAULT_CHAT_MODEL}
                    initialVisibilityType={chat.visibility}
                    autoResume={true}
                />
                <DataStreamHandler />
            </>
        );
    }

    return (
        <>
            <Chat
                id={chat.id}
                initialMessages={uiMessages}
                initialChatModel={chatModelFromCookie.value}
                initialVisibilityType={chat.visibility}
                autoResume={true}
            />
            <DataStreamHandler />
        </>
    );
}
