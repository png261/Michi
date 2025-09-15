import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DataStreamProvider } from '@/components/data-stream-provider';
import { cookies } from 'next/headers';
import { ChatHeader } from '@/components/chat-header';


export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [cookieStore] = await Promise.all([cookies()]);
    const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

    return (
        <DataStreamProvider>
            <SidebarProvider defaultOpen={!isCollapsed}>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex flex-col min-w-0 h-dvh bg-background">
                        <ChatHeader />

                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </DataStreamProvider>
    );
}

