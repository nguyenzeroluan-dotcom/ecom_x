
export interface Product {
  id: number | string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category?: string;
  stock?: number;
  sku?: string; // New: Stock Keeping Unit
  rating?: number;
  reviews_count?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, delta: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartTotal: number;
  itemCount: number;
}

export enum ViewState {
  HOME = 'HOME',
  CHAT = 'CHAT',
  GENERATE = 'GENERATE',
  ANALYZE = 'ANALYZE',
  THINKING = 'THINKING',
  MANAGER = 'MANAGER',
  CHECKOUT = 'CHECKOUT',
  ORDERS = 'ORDERS',
  PROFILE = 'PROFILE'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT_2_3 = "2:3",
  LANDSCAPE_3_2 = "3:2",
  PORTRAIT_3_4 = "3:4",
  LANDSCAPE_4_3 = "4:3",
  PORTRAIT_9_16 = "9:16",
  LANDSCAPE_16_9 = "16:9",
  LANDSCAPE_21_9 = "21:9"
}

export enum ModalType {
  NONE = 'NONE',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  CONFIRM = 'CONFIRM',
  SUCCESS = 'SUCCESS',
  COMPARISON = 'COMPARISON',
  AUTH = 'AUTH'
}

export interface ModalContextType {
  isOpen: boolean;
  modalType: ModalType;
  modalProps: any;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
  ai_note?: string;
  items?: OrderItem[];
  user_id?: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: string) => void;
}

export interface AIReview {
  persona: string;
  rating: number;
  text: string;
}

export interface PreferencesContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  wishlist: (string | number)[];
  toggleWishlist: (id: string | number) => void;
  isWishlistOpen: boolean;
  toggleWishlistDrawer: () => void;
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string | number) => void;
  clearCompare: () => void;
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
}

export type ManagerViewMode = 'table' | 'grid' | 'list';
export type MarketViewMode = 'grid' | 'list';

export type ManagerTab = 'PRODUCTS' | 'CATEGORIES' | 'INVENTORY' | 'FORECAST' | 'USERS' | 'ROLES' | 'DATABASE';

export interface CategoryData {
  id?: number;
  name: string;
  count: number;
  totalValue: number;
  image_url?: string;
  description?: string;
  is_db_persisted?: boolean;
}

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'newest';

export type UserRole = 'admin' | 'manager' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  ai_style_preference?: string;
  role?: UserRole;
  created_at?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  demoLogin: () => void;
  isAdmin: boolean;
}

// --- Role & Permission Types ---

export interface AppRole {
  role_name: string; // PK
  description?: string;
  permissions: string[]; // JSON array of permission codes
  created_at?: string;
}

export const SYSTEM_PERMISSIONS = [
  { id: 'product.read', label: 'View Products', group: 'Products' },
  { id: 'product.create', label: 'Create Products', group: 'Products' },
  { id: 'product.edit', label: 'Edit Products', group: 'Products' },
  { id: 'product.delete', label: 'Delete Products', group: 'Products' },
  
  { id: 'category.manage', label: 'Manage Categories', group: 'Inventory' },
  { id: 'inventory.update', label: 'Update Stock', group: 'Inventory' },
  
  { id: 'order.read', label: 'View Orders', group: 'Orders' },
  { id: 'order.manage', label: 'Process Orders', group: 'Orders' },
  
  { id: 'user.read', label: 'View Users', group: 'Users' },
  { id: 'user.manage', label: 'Manage Users & Roles', group: 'Users' },
  
  { id: 'settings.view', label: 'View Settings', group: 'System' },
  { id: 'database.manage', label: 'Manage Database', group: 'System' },
];

// --- Inventory Advanced Types ---

export interface InventoryLog {
  id: number;
  product_id?: number;
  product_name: string;
  previous_stock: number;
  new_stock: number;
  change_amount: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'damage' | 'return';
  note?: string;
  user_id?: string;
  created_at: string;
}
