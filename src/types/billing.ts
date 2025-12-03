export interface Plan {
    id: string;
    name: string;
    seatPriceCents: number;
    description: string;
    interval: string;
    maxSeats: number;
}

export interface InitiatePaymentRequest {
    planId: string;
    seats: number;
}

export interface InitiatePaymentResponse {
    fwdUrl: string;
}
