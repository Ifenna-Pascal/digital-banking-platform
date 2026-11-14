// Shapes returned by apps/api. Keep in sync with the API's Mongoose models.

export interface AccountDetails {
  account_balance: number;
  account_number: string;
}

export interface Profile {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  has_pin?: boolean;
  account_details: AccountDetails;
  created_at: string;
}

export interface Party {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  account_details?: { account_number: string };
}

export type TransactionType =
  | "transfer"
  | "deposit"
  | "withdrawal"
  | "reversal";

export interface Transaction {
  _id: string;
  transaction_id: string;
  reference: string;
  transaction_type: TransactionType;
  direction: "credit" | "debit";
  transaction_status: "success" | "failed";
  is_reversed: boolean;
  amount_transacted: number;
  previous_balance: number;
  current_balance: number;
  transaction_narration?: string;
  from?: Party | null;
  to?: Party | null;
  user_id?: Party | string;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Summary {
  account_balance: number;
  account_number: string;
  total_credit: number;
  total_debit: number;
  transaction_count: number;
  by_day: { day: string; credit: number; debit: number }[];
}
