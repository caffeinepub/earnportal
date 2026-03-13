import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PaymentRecord {
    id: bigint;
    age: bigint;
    status: string;
    name: string;
    timestamp: bigint;
    mobile: string;
}
export interface backendInterface {
    adminLogin(password: string): Promise<boolean>;
    approvePayment(sessionId: string, approved: boolean): Promise<boolean>;
    claimPayment(sessionId: string): Promise<boolean>;
    getPaymentStatus(sessionId: string): Promise<string>;
    getPendingPayments(): Promise<Array<PaymentRecord>>;
    submitUserDetails(name: string, age: bigint, mobile: string): Promise<string>;
}
