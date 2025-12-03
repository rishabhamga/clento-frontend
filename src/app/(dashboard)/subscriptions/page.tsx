'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Download, Loader2 } from 'lucide-react';
import { useBillingPlans, useInitiatePayment } from '@/hooks/useBillingPlans';
import { Plan } from '@/types/billing';

const features = ['Unlimited campaigns across 7+ channels', 'LinkedIn Sales Navigator integration', 'AI-powered lead quality analyzer', 'Team collaboration tools', 'Multi-channel sender management', 'Priority support', 'Unified inbox for all conversations', 'Cloud-based software', 'CSV import & export leads', 'Personalized outreach & engagement', 'LinkedIn Recruiter integration', 'Smart drip campaign flows'];

// Helper function to format amount (assuming amount is in cents)
const formatAmount = (amount: number): string => {
    return `$${(amount / 100).toFixed(2)}`;
};

// Helper function to format interval
const formatInterval = (interval: string): string => {
    return interval.charAt(0).toUpperCase() + interval.slice(1);
};

export default function SubscriptionsPage() {
    const { data: plans, isLoading, error } = useBillingPlans();
    const initiatePayment = useInitiatePayment();
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
    const [seatsPerPlan, setSeatsPerPlan] = useState<Record<string, number>>({});

    const handleSeatsChange = (planId: string, value: string, maxSeats: number) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
            setSeatsPerPlan((prev) => ({ ...prev, [planId]: 1 }));
            return;
        }
        if (numValue > maxSeats) {
            setSeatsPerPlan((prev) => ({ ...prev, [planId]: maxSeats }));
            return;
        }
        setSeatsPerPlan((prev) => ({ ...prev, [planId]: numValue }));
    };

    const handleGetPlan = async (plan: Plan) => {
        const seats = seatsPerPlan[plan.id] || 1;
        setProcessingPlanId(plan.id);
        try {
            const response = await initiatePayment.mutateAsync({ planId: plan.id, seats });
            if (response.fwdUrl) {
                window.open(response.fwdUrl, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setProcessingPlanId(null);
        }
    };

    const calculateTotalPrice = (plan: Plan): number => {
        const seats = seatsPerPlan[plan.id] || 1;
        return plan.seatPriceCents * seats;
    };

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Subscription Management</h1>
                    <p className="text-sm text-muted-foreground">Manage your subscription, billing details, and plan features</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-sm">
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    Manage Billing
                </Button>
            </div>

            {/* Subscription Details */}
            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <CreditCard className="w-7 h-7 text-primary" />
                            <div>
                                <CardTitle className="text-base">Syndie Subscription</CardTitle>
                                <p className="text-xs text-muted-foreground">Complete LinkedIn outreach solution for your team</p>
                            </div>
                            <Badge className="bg-warning text-black text-xs">trialing</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs">
                            <span className="text-base">+</span>
                            <span className="ml-1">Add More Seats</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Plan Details */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">PLAN DETAILS</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Team Seats</span>
                                    <span className="text-sm font-medium">7</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Billing Period</span>
                                    <span className="text-sm font-medium">Monthly</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Price per Seat</span>
                                    <span className="text-sm font-medium">$0.00/month</span>
                                </div>
                            </div>
                        </div>

                        {/* Billing */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">BILLING</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Cost</span>
                                    <span className="text-sm font-medium">$0.00/month</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Renews on</span>
                                    <span className="text-sm font-medium">September 15, 2025</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Payment Method</span>
                                    <span className="text-sm font-medium">•••• 9007</span>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">STATUS</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Subscription</span>
                                    <Badge className="bg-warning text-black text-xs">trialing</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Days Until Renewal</span>
                                    <span className="text-sm font-medium">3 days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <h4 className="text-sm font-medium text-muted-foreground mb-4">QUICK ACTIONS</h4>
                        <div className="flex gap-4">
                            <Button variant="outline" className="bg-background">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Update Payment Method
                            </Button>
                            <Button variant="outline" className="bg-background">
                                <Download className="w-4 h-4 mr-2" />
                                Download Latest Invoice
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Available Plans */}
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Available Plans
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Choose a plan that fits your needs</p>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-destructive">Failed to load plans. Please try again later.</p>
                        </div>
                    ) : plans && plans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plans.map((plan) => (
                                <Card key={plan.id} className="bg-card border-border/50 hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                                            </div>
                                            {/* Space for selected plan badge - to be added later */}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold">{formatAmount(plan.seatPriceCents)}</span>
                                                    <span className="text-sm text-muted-foreground">/seat/{formatInterval(plan.interval)}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`seats-${plan.id}`} className="text-sm">
                                                        Number of Seats
                                                    </Label>
                                                    <Input
                                                        id={`seats-${plan.id}`}
                                                        type="number"
                                                        min="1"
                                                        max={plan.maxSeats}
                                                        value={seatsPerPlan[plan.id] || 1}
                                                        onChange={(e) => handleSeatsChange(plan.id, e.target.value, plan.maxSeats)}
                                                        className="w-full"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Maximum {plan.maxSeats} seats
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-border">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-sm text-muted-foreground">Total</span>
                                                    <span className="text-lg font-bold">{formatAmount(calculateTotalPrice(plan))}</span>
                                                </div>
                                                <Button
                                                    className="w-full bg-primary hover:bg-primary/90"
                                                    onClick={() => handleGetPlan(plan)}
                                                    disabled={processingPlanId === plan.id || initiatePayment.isPending}
                                                >
                                                    {processingPlanId === plan.id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        'Get Plan'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No plans available at the moment.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Subscription Features */}
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        Your Syndie Subscription Features
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Complete LinkedIn outreach solution for your team</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                                <span className="text-sm text-foreground">{feature}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
