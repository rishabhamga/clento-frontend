export type SubscriptionType = 'PLAN' | 'ADDON';

export interface Plan {
    id: string;
    name: string;
    description: string;
    interval: string;
    seatPriceCents: number;
    maxSeats: number;
    purchasable: boolean;
    type: SubscriptionType;
}

export interface Subscription {
    hasPlans: boolean;
    hasAddons: boolean;
    totalSeats: number;
}

export interface BillingResponse {
    plans: Plan[];
    subscription: Subscription;
    selectedPlan: string | undefined;
}

export interface InitiatePaymentRequest {
    planId: string;
    seats: number;
}

export interface InitiatePaymentResponse {
    fwdUrl: string;
}
