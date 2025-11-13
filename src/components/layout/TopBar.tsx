"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function TopBar() {
    const { theme } = useTheme();
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left side - can add app logo or other elements here */}
                <div className="flex items-center gap-4">
                    {/* You can add your app logo here if needed */}
                </div>

                {/* Right side - Credits, Organization Switcher, Theme Toggle and User Profile */}
                <div className="flex items-center gap-4">
                    {/* Remaining Credits */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-md border">
                        <span className="text-warning">⭐</span>
                        <span className="text-sm font-medium">500 Remaining</span>
                        <Button variant="link" size="sm" className="p-0 h-auto text-primary text-sm">
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
                                    organizationSwitcherTrigger:
                                        "flex items-center gap-2 border border-border bg-background hover:bg-muted rounded-md px-3 py-2 text-sm min-w-[140px] justify-between text-foreground",

                                    // Organization preview inside trigger
                                    organizationPreview: "flex items-center gap-2",
                                    organizationPreviewAvatarBox: "w-6 h-6",
                                    organizationPreviewAvatarImage: "w-6 h-6 rounded-full",
                                    organizationPreviewMainIdentifier: "font-medium text-sm text-foreground",
                                    organizationPreviewSecondaryIdentifier: "text-xs text-muted-foreground",

                                    // Dropdown content
                                    organizationSwitcherPopoverCard: "bg-background border-border shadow-lg rounded-md p-1 min-w-[240px]",
                                    organizationSwitcherPopoverMain: "space-y-1",

                                    // Organization options in dropdown
                                    organizationSwitcherPopoverActionButton: "w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-sm transition-colors flex items-center gap-2 text-foreground",
                                    organizationSwitcherPopoverActionButtonText: "flex-1 text-foreground",
                                    organizationSwitcherPopoverActionButtonIcon: "w-4 h-4 text-muted-foreground",

                                    // Header in dropdown
                                    organizationSwitcherPopoverRoleBox: "px-3 py-2 border-b border-border text-foreground",

                                    // Footer buttons (Create org, Manage org)
                                    organizationSwitcherPopoverFooter: "border-t border-border pt-2 mt-2",
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
                                avatarBox: "w-10 h-10",
                                userButtonPopoverCard: "bg-background border-border",
                                userButtonPopoverActions: "bg-background",
                                userButtonPopoverActionButton: "hover:bg-muted",
                                userButtonPopoverActionButtonText: "text-foreground",
                                userButtonPopoverFooter: "hidden", // Hide Clerk branding
                            },
                        }}
                        userProfileMode="modal"
                        afterSignOutUrl="/sign-in"
                        showName={false}
                    />
                </div>
            </div>
        </header>
    )
}
