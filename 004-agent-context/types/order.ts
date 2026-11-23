export type OrderStatus = "pending" | "fulfilled" | "cancelled";

export interface Order {
  id: string;
  customerName: string;
  status: OrderStatus;
}
