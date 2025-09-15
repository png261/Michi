'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserButton } from '@clerk/nextjs';

export function AppSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();
    const { user } = useUser();

    const navLinks = [
        { href: '/task', label: 'Tasks' },
        { href: '/timeline', label: 'Timeline' },
    ];

    const navLinkClass = (href: string) =>
        `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === href
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted'
        }`;

    return (
        <Sidebar className="group-data-[side=left]:border-r-0 bg-background shadow-md">
            {/* Header */}
            <SidebarHeader className="flex flex-col items-center justify-center p-4 border-b border-muted/20 space-y-2">
                {user && (
                    <>
                        <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-12 h-12' } }} />
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">{user.fullName || user.username}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.emailAddresses[0]?.emailAddress}</p>
                        </div>
                    </>
                )}
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="flex flex-col space-y-4 p-4">
                {/* Navigation */}
                <nav className="flex flex-col space-y-1">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                            {link.label}
                        </Link>
                    ))}
                </nav>


                {/* Conversations */}
                <div className="mt-4">
                    <div className="flex justify-between items-center px-2 py-1 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                        {/* Label: toggle collapse */}
                        <span className="" >
                            Conversations
                        </span>

                        {/* Arrow as New Chat button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setOpenMobile(false);
                                        router.push('/chat');
                                        router.refresh();
                                    }}
                                    className="p-1"
                                >
                                    <span className="w-4 h-4">
                                        <PlusIcon />
                                    </span>

                                </Button>
                            </TooltipTrigger>
                            <TooltipContent align="end">New Chat</TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="mt-2 border-t border-muted/30 pt-2 space-y-1">
                        <SidebarHistory />
                    </div>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}
