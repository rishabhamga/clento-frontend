'use client';

import { OrganizationProfile } from '@clerk/nextjs';

export default function OrganizationProfilePage() {
    return (
        <div className="container mx-auto py-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-xl font-bold">Organization Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1.5">Manage your organization profile, members, and settings.</p>
                </div>

                <div className="flex justify-center">
                    <OrganizationProfile
                        appearance={{
                            elements: {
                                card: 'bg-background border-border',
                                headerTitle: 'text-foreground',
                                headerSubtitle: 'text-muted-foreground',
                                formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
                                formFieldInput: 'bg-background border-border text-foreground',
                                navbar: 'bg-background',
                                navbarButton: 'text-foreground hover:bg-muted',
                                navbarButtonIcon: 'text-muted-foreground',
                            },
                        }}
                        routing="virtual"
                    />
                </div>
            </div>
        </div>
    );
}
