export type ServiceSource = "live" | "derived" | "unavailable";

export type ServiceError = {
  code: string;
  message: string;
  status?: number;
};

export type ServiceResult<T> = {
  data: T | null;
  error?: ServiceError;
  warning?: string;
  meta?: {
    service: string;
    source: ServiceSource;
    endpoint?: string;
  };
};

export type ActionResult = {
  success: boolean;
  error?: ServiceError;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type DashboardStats = {
  buyers: number;
  sellers: number;
  products: number;
  orders: number;
  shipments: number;
  payments: number;
};

export type BuyerUser = {
  id: string;
  clerkUserId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status?: string | null;
  createdAt?: string | null;
  ordersCount: number;
};

export type Seller = {
  id: string;
  clerkUserId?: string | null;
  storeName: string;
  dni?: string | null;
  ownerName?: string | null;
  email?: string | null;
  phone?: string | null;
  active: boolean;
  status: string;
  productsCount?: number | null;
  createdAt?: string | null;
};

export type Product = {
  id: string;
  title: string;
  sellerId: string;
  sellerIds?: string[];
  sellerName?: string | null;
  categoryId?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  brand?: string | null;
  size?: string | null;
  gender?: string | null;
  condition?: string | null;
  status: string;
  price: number;
  stock?: number | null;
  createdAt: string;
};

export type Order = {
  id: string;
  buyerId: string;
  buyerName?: string | null;
  sellerId?: string | null;
  sellerName?: string | null;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt?: string | null;
  shippingAddress?: string | null;
  itemCount: number;
};

export type Shipment = {
  id: string;
  orderId: string;
  carrier: string;
  trackingCode: string;
  status: string;
  updatedAt?: string | null;
};

export type Payment = {
  id: string;
  orderId: string;
  buyerId?: string | null;
  buyerName?: string | null;
  sellerId?: string | null;
  provider: string;
  status: string;
  amount: number;
  productAmount?: number | null;
  shippingAmount?: number | null;
  commission?: number | null;
  netAmount?: number | null;
  currency: string;
  createdAt?: string | null;
  settled?: boolean;
  source: string;
};

export type OrderCheckout = {
  orderId: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  sellerId: string;
  productAmount: number;
  shippingAmount: number;
  totalAmount: number;
};

export type ConsolidatedOrder = {
  order: Order | null;
  buyer: BuyerUser | null;
  seller: Seller | null;
  payment: Payment | null;
  shipment: Shipment | null;
  errors: ServiceError[];
};

export type ControlPlaneConfiguration = {
  service: string;
  envKeys: string[];
  configured: boolean;
  baseUrl?: string;
  apiKeyEnv: string;
  apiKeyConfigured: boolean;
};

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type OperationalAlert = {
  id: string;
  severity: AlertSeverity;
  category: "payment" | "shipping" | "order" | "catalog" | "seller";
  title: string;
  description: string;
  recommendation: string;
  entityType: "order" | "product" | "seller";
  entityId: string;
  href: string;
};

export type OperationalSnapshot = {
  generatedAt: string;
  orders: Order[];
  products: Product[];
  sellers: Seller[];
  buyers: BuyerUser[];
  payments: Payment[];
  alerts: OperationalAlert[];
  warnings: string[];
};

export type CopilotReference = {
  label: string;
  href: string;
};

export type CopilotAnswer = {
  answer: string;
  references: CopilotReference[];
};
