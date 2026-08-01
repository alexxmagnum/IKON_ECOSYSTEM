import type {
  CancelPaymentInput,
  CapturePaymentInput,
  CreatePaymentIntentInput,
  GetPaymentQuery,
  ListPaymentsQuery,
  PaymentIntentResult,
  PaymentResult,
  RefundPaymentInput,
  RefundResult,
  UpdatePaymentStatusInput,
} from "../contracts";

/**
 * Service contracts for the Payments Engine.
 * Implementations (persistence, gateways) arrive in later phases.
 */

export interface PaymentService {
  createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  updateStatus(input: UpdatePaymentStatusInput): Promise<PaymentResult>;
  capture(input: CapturePaymentInput): Promise<PaymentResult>;
  refund(input: RefundPaymentInput): Promise<RefundResult>;
  cancel(input: CancelPaymentInput): Promise<PaymentResult>;
  get(query: GetPaymentQuery): Promise<PaymentResult | null>;
  list(query: ListPaymentsQuery): Promise<PaymentResult[]>;
}
