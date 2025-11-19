'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export function TopBar() {
    const { theme } = useTheme();
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex h-14 items-center justify-between px-5">
                {/* Left side - can add app logo or other elements here */}
                <div className="flex items-center gap-3">{/* You can add your app logo here if needed */}</div>

                {/* Right side - Credits, Organization Switcher, Theme Toggle and User Profile */}
                <div className="flex items-center gap-3">
                    {/* Remaining Credits */}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-background/50 rounded-md border">
                        <span className="text-warning">⭐</span>
                        <span className="text-xs font-medium">500 Remaining</span>
                        <Button variant="link" size="sm" className="p-0 h-auto text-primary text-xs">
                            Get More +
                        </Button>
                    </div>

                    {/* Enhanced Organization Switcher */}
                    <div className="flex items-center">
                        <OrganizationSwitcher
                            appearance={{
                                theme: theme === 'dark' ? dark : undefined,
                                elements: {
                                    // Main trigger button with theme-aware text color
                                    organizationSwitcherTrigger: 'flex items-center gap-1.5 border border-border bg-background hover:bg-muted rounded-md px-2.5 py-1.5 text-xs min-w-[130px] justify-between text-foreground',

                                    // Organization preview inside trigger
                                    organizationPreview: 'flex items-center gap-1.5',
                                    organizationPreviewAvatarBox: 'w-5 h-5',
                                    organizationPreviewAvatarImage: 'w-5 h-5 rounded-full',
                                    organizationPreviewMainIdentifier: 'font-medium text-xs text-foreground',
                                    organizationPreviewSecondaryIdentifier: 'text-[10px] text-muted-foreground',

                                    // Dropdown content
                                    organizationSwitcherPopoverCard: 'bg-background border-border shadow-lg rounded-md p-0.5 min-w-[220px]',
                                    organizationSwitcherPopoverMain: 'space-y-0.5',

                                    // Organization options in dropdown
                                    organizationSwitcherPopoverActionButton: 'w-full text-left px-2.5 py-1.5 text-xs hover:bg-muted rounded-sm transition-colors flex items-center gap-1.5 text-foreground',
                                    organizationSwitcherPopoverActionButtonText: 'flex-1 text-foreground',
                                    organizationSwitcherPopoverActionButtonIcon: 'w-4 h-4 text-muted-foreground',

                                    // Header in dropdown
                                    organizationSwitcherPopoverRoleBox: 'px-2.5 py-1.5 border-b border-border text-foreground',

                                    // Footer buttons (Create org, Manage org)
                                    organizationSwitcherPopoverFooter: 'border-t border-border pt-1.5 mt-1.5',
                                },
                            }}
                            createOrganizationMode="modal"
                            organizationProfileMode="modal"
                            hidePersonal={false} // Show personal account option
                            defaultOpen={false}
                        />
                    </div>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* User Profile - Using Clerk's UserButton */}
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: 'w-9 h-9',
                                userButtonPopoverCard: 'bg-background border-border',
                                userButtonPopoverActions: 'bg-background',
                                userButtonPopoverActionButton: 'hover:bg-muted',
                                userButtonPopoverActionButtonText: 'text-foreground',
                                userButtonPopoverFooter: 'hidden', // Hide Clerk branding
                            },
                        }}
                        userProfileMode="modal"
                        afterSignOutUrl="/sign-in"
                        showName={false}
                    />
                </div>
            </div>
        </header>
    );
}
