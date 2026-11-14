// Dashboard sidebar entries. `adminOnly` items are hidden from customers.
export interface NavItem {
  name: string;
  icon: string; // Font Awesome class
  to: string;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Overview", icon: "fa-home", to: "/dashboard" },
  { name: "Transfer", icon: "fa-paper-plane", to: "/dashboard/transfer" },
  { name: "Deposit", icon: "fa-arrow-down", to: "/dashboard/deposit" },
  { name: "Withdraw", icon: "fa-arrow-up", to: "/dashboard/withdraw" },
  { name: "Transactions", icon: "fa-list", to: "/dashboard/transactions" },
  { name: "Settings", icon: "fa-cog", to: "/dashboard/settings" },
  {
    name: "Admin",
    icon: "fa-user-shield",
    to: "/dashboard/admin",
    adminOnly: true,
  },
];
