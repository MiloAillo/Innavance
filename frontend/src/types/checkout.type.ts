export interface CheckoutResponse {
    message: string;
    status: "checked_out" | "checking_out";
    grace_period: number;
}
