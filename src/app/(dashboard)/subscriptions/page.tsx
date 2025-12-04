'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Download, Loader2, Sparkles, Zap, Shield, Users, TrendingUp, Star } from 'lucide-react';
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
    const { data: billingData, isLoading, error } = useBillingPlans();
    const initiatePayment = useInitiatePayment();
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
    const [seatsPerPlan, setSeatsPerPlan] = useState<Record<string, number>>({});

    const plans = billingData?.plans.filter((plan) => plan.type === 'PLAN') || [];
    const addons = billingData?.plans.filter((plan) => plan.type === 'ADDON') || [];
    const selectedPlan = billingData?.selectedPlan;
    const subscription = billingData?.subscription;
    const hasActivePlan = subscription?.hasPlans || false;

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
                    <p className="text-sm text-muted-foreground">Choose a plan that fits your needs</p>
                </div>
                {selectedPlan && (
                    <Button variant="outline" className="bg-background hover:bg-muted text-sm">
                        <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                        Manage Billing
                    </Button>
                )}
            </div>

            {/* Current Subscription */}
            {selectedPlan && subscription && (
                <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-primary/10 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold">Current Subscription</CardTitle>
                                    <p className="text-xs text-muted-foreground">Your active subscription plan</p>
                                </div>
                            </div>
                            <Badge className="bg-success text-white text-xs">Active</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2.5 p-3 bg-background/50 rounded-lg">
                                <Users className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Team Seats</p>
                                    <p className="text-sm font-medium">{subscription.totalSeats}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-3 bg-background/50 rounded-lg">
                                <Zap className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Current Plan</p>
                                    <p className="text-sm font-medium">
                                        {plans.find((p) => p.id === selectedPlan)?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-3 bg-background/50 rounded-lg">
                                <Shield className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <p className="text-sm font-medium text-success">Protected</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                        {plans.map((plan, index) => {
                            const isSelected = plan.id === selectedPlan;
                            const isPopular = index === 1 && plans.length > 2; // Middle plan as popular
                            return (
                                <Card
                                    key={plan.id}
                                    className={`relative bg-card border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                        isSelected
                                            ? 'border-primary shadow-lg ring-2 ring-primary/20'
                                            : isPopular
                                            ? 'border-primary/50 shadow-md'
                                            : 'border-border/50 hover:border-primary/50'
                                    }`}
                                >
                                    {isPopular && !isSelected && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-primary text-white px-3 py-1 text-xs font-semibold flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-white" />
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    {isSelected && (
                                        <div className="absolute -top-3 right-4">
                                            <Badge className="bg-success text-white px-3 py-1 text-xs font-semibold">
                                                Current Plan
                                            </Badge>
                                            </div>
                                    )}
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold">{formatAmount(plan.seatPriceCents)}</span>
                                                    <span className="text-sm text-muted-foreground">/seat/{formatInterval(plan.interval)}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`seats-${plan.id}`} className="text-sm">
                                                    Number of Seats
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => {
                                                            const current = seatsPerPlan[plan.id] || 1;
                                                            if (current > 1) {
                                                                handleSeatsChange(plan.id, String(current - 1), plan.maxSeats);
                                                            }
                                                        }}
                                                        disabled={isSelected || (seatsPerPlan[plan.id] || 1) <= 1}
                                                    >
                                                        -
                                                    </Button>
                                                    <Input
                                                        id={`seats-${plan.id}`}
                                                        type="number"
                                                        min="1"
                                                        max={plan.maxSeats}
                                                        value={seatsPerPlan[plan.id] || 1}
                                                        onChange={(e) => handleSeatsChange(plan.id, e.target.value, plan.maxSeats)}
                                                        className="text-center font-semibold h-8"
                                                        disabled={isSelected}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => {
                                                            const current = seatsPerPlan[plan.id] || 1;
                                                            if (current < plan.maxSeats) {
                                                                handleSeatsChange(plan.id, String(current + 1), plan.maxSeats);
                                                            }
                                                        }}
                                                        disabled={isSelected || (seatsPerPlan[plan.id] || 1) >= plan.maxSeats}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
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
                                                disabled={processingPlanId === plan.id || initiatePayment.isPending || isSelected || !plan.purchasable}
                                            >
                                                {processingPlanId === plan.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : isSelected ? (
                                                    'Current Plan'
                                                ) : (
                                                    'Get Plan'
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No plans available at the moment.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Addons */}
            {addons.length > 0 && (
                <Card className="bg-card border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            Addons
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Enhance your subscription with additional features</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {addons.map((addon) => {
                            const isDisabled = !hasActivePlan;
                            return (
                                <Card
                                    key={addon.id}
                                    className={`relative bg-card border-2 transition-all duration-300 ${
                                        isDisabled
                                            ? 'opacity-60 cursor-not-allowed border-border/30'
                                            : 'border-border/50 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
                                    }`}
                                >
                                    {isDisabled && (
                                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                                            <div className="text-center p-4">
                                                <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Active plan required
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{addon.name}</CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">{addon.description}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-bold">{formatAmount(addon.seatPriceCents)}</span>
                                                    <span className="text-sm text-muted-foreground">/seat/{formatInterval(addon.interval)}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`seats-addon-${addon.id}`} className="text-sm">
                                                        Number of Seats
                                                    </Label>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                const current = seatsPerPlan[addon.id] || 1;
                                                                if (current > 1) {
                                                                    handleSeatsChange(addon.id, String(current - 1), addon.maxSeats);
                                                                }
                                                            }}
                                                            disabled={isDisabled || (seatsPerPlan[addon.id] || 1) <= 1}
                                                        >
                                                            -
                                                        </Button>
                                                        <Input
                                                            id={`seats-addon-${addon.id}`}
                                                            type="number"
                                                            min="1"
                                                            max={addon.maxSeats}
                                                            value={seatsPerPlan[addon.id] || 1}
                                                            onChange={(e) => handleSeatsChange(addon.id, e.target.value, addon.maxSeats)}
                                                            className="text-center font-semibold h-8"
                                                            disabled={isDisabled}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                const current = seatsPerPlan[addon.id] || 1;
                                                                if (current < addon.maxSeats) {
                                                                    handleSeatsChange(addon.id, String(current + 1), addon.maxSeats);
                                                                }
                                                            }}
                                                            disabled={isDisabled || (seatsPerPlan[addon.id] || 1) >= addon.maxSeats}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Maximum {addon.maxSeats} seats
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-border">
                                            {isDisabled && (
                                                <div className="mb-3 p-2 bg-muted rounded-md">
                                                    <p className="text-xs text-muted-foreground text-center">
                                                        You need an active plan to get an addon
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm text-muted-foreground">Total</span>
                                                <span className="text-lg font-bold">{formatAmount(calculateTotalPrice(addon))}</span>
                                            </div>
                                            <Button
                                                className="w-full bg-primary hover:bg-primary/90"
                                                onClick={() => handleGetPlan(addon)}
                                                disabled={processingPlanId === addon.id || initiatePayment.isPending || isDisabled || !addon.purchasable}
                                            >
                                                {processingPlanId === addon.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Get Addon'
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Subscription Features */}
            {hasActivePlan && (
                <Card className="bg-card border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            Your Subscription Features
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Complete outreach solution for your team</p>
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
            )}
        </div>
    );
}
