'use client';

import { CreateOrganization } from '@clerk/nextjs';

export default function CreateOrganizationPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-xl font-bold">Create Organization</h1>
                    <p className="text-sm text-muted-foreground mt-1.5">Create an organization to get started with Clento Clay. You'll be able to invite team members and manage your outreach campaigns.</p>
                </div>

                <div className="flex justify-center">
                    <CreateOrganization
                        appearance={{
                            elements: {
                                card: 'bg-background border-border',
                                headerTitle: 'text-foreground',
                                headerSubtitle: 'text-muted-foreground',
                                formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
                                formFieldInput: 'bg-background border-border text-foreground',
                            },
                        }}
                        afterCreateOrganizationUrl="/"
                        skipInvitationScreen
                    />
                </div>
            </div>
        </div>
    );
}
