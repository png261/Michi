"use client";

import { SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function IndexPage() {
    const { isSignedIn } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isSignedIn) {
            router.push("/chat");
        }
    }, [isSignedIn, router]);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight">
                Michi
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
                Michi is your AI-powered task manager. Organize, track, and complete your tasks effortlessly.
                With a clean minimalist UI.
            </p>


            <SignedOut>
                <SignInButton mode="redirect">
                    <Button size="lg" className="mt-4">Get Started</Button>
                </SignInButton>
            </SignedOut>

            <SignedOut>
                <UserButton afterSignOutUrl="/" />
            </SignedOut>
        </main>
    );
}
