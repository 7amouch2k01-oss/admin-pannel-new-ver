/**
 * Shapes the console consumes.
 *
 * IDs are UUID strings. The console was written against numeric ids and in
 * three places assumed numeric ordering — see `index.ts` and `Users.tsx` for
 * how those were replaced with server-provided `isOwner` / `isCoOwner`.
 */
export type Id = string;

export type AdminUser = {
  id: Id;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive" | "banned";
  permissions: string[];
  isOwner: boolean;
  isCoOwner: boolean;
  isDeveloper: boolean;
  developerTitle: string;
  grade: number;
  gradeTitle: string;
  stylePoints: number;
  totalEarned: number;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
  isEmailVerified: boolean;
};

export type AdminBrand = {
  id: Id;
  name: string;
  logoUrl: string | null;
  country: string | null;
  category: string | null;
  description: string | null;
  website: string | null;
  isActive: boolean;
  tier: number;
  userId: Id | null;
  createdAt: string;
};

export type PendingBrand = {
  id: Id;
  brandId: Id;
  brandName: string;
  ownerName: string;
  email: string;
  phone: string;
  logoUrl: string | null;
  status: string;
  createdAt: string;
};

export type AdminShipment = {
  id: Id;
  orderId: Id;
  brandId: Id;
  brandName: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  notes: string | null;
  createdAt: string;
};

export type AdminOrder = {
  id: Id;
  customerId: Id;
  customerName: string;
  customerEmail: string | null;
  phone: string | null;
  shippingAddress: string | null;
  city: string | null;
  country: string | null;
  paymentMethod: string;
  status: string;
  statusRaw: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  itemCount: number;
  cancelReason: string | null;
  refundReason: string | null;
  shipments: AdminShipment[];
  createdAt: string;
};

export type AdminPostItem = {
  id: Id;
  name: string;
  price: number;
  image: string | null;
  brandId: Id | null;
  brandName: string | null;
};

export type AdminPost = {
  id: Id;
  image: string | null;
  caption: string;
  title: string;
  category: string | null;
  status: "active" | "hidden" | "flagged";
  hidden: boolean;
  likes: number;
  comments: number;
  unregisteredBrand: string | null;
  author: { id: Id; name: string; email: string; avatarUrl: string | null } | null;
  creator: { name: string } | null;
  itemsForSale: AdminPostItem[];
  taggedProduct: AdminPostItem | null;
  totalOrdersPassed: number;
  totalMoneyGained: number;
  creatorCommission: number;
  createdAt: string;
};

export type AdminWithdrawal = {
  id: Id;
  userId: Id;
  brandId: Id | null;
  type: "user" | "brand";
  requesterName: string;
  requesterEmail: string;
  amount: number;
  paymentMethod: string;
  status: "pending" | "approved" | "completed" | "rejected";
  paymentDetails: Record<string, string | undefined>;
  adminNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

export type DashboardMetrics = {
  totalUsers: number;
  totalPosts: number;
  totalOrders: number;
  totalBrands: number;
  totalRevenue: number;
};

export type ActivityEntry = {
  id: Id;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  createdAt: string;
};

export type FinancialSummary = {
  grossRevenue: number;
  totalRefunds: number;
  refundsCount: number;
  pendingRefunds: number;
  pendingRefundsCount: number;
  commissionsPaid: number;
  commissionsPending: number;
  netGain: number;
};

export type MonthlyPoint = {
  month: string;
  revenue: number;
  refunds: number;
  netRevenue: number;
  orders: number;
  users: number;
  newUsers: number;
};

export type Ok = { success?: boolean; message?: string } | null;
