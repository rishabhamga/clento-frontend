'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full space-y-8 text-center">
                {/* Logo and branding */}
                <div>
                    <h1 className="text-3xl font-bold text-purple-700 mb-2">Clento Clay</h1>
                    <p className="text-md text-muted-foreground font-medium">AI-powered LinkedIn and Email Outreach Automation</p>
                </div>

                {/* Clerk Sign-up component */}
                <div className="flex justify-center">
                    <SignUp
                        appearance={{
                            elements: {
                                formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
                                card: 'bg-card border-border shadow-xl',
                                headerTitle: 'text-foreground',
                                headerSubtitle: 'text-muted-foreground',
                                socialButtonsBlockButton: 'border-border bg-background hover:bg-muted',
                                socialButtonsBlockButtonText: 'text-foreground',
                                formFieldInput: 'bg-background border-border text-foreground',
                                footerActionLink: 'text-purple-600 hover:text-purple-700',
                            },
                        }}
                        redirectUrl="/"
                        signInUrl="/sign-in"
                    />
                </div>
            </div>
        </div>
    );
}
