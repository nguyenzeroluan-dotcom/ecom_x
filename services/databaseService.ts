
import { INITIAL_SETUP_SQL } from '../data/01_initial_setup';
import { USER_RBAC_SQL } from '../data/02_user_rbac';
import { ROLES_PERMISSIONS_SQL } from '../data/03_roles_permissions';
import { INVENTORY_ADVANCED_SQL } from '../data/04_inventory_advanced';
import { MEDIA_MANAGER_SQL } from '../data/05_media_manager';
import { PRODUCT_MEDIA_INTEGRATION_SQL } from '../data/06_product_media_integration';
import { MEDIA_COLLECTIONS_SQL } from '../data/07_media_collections';
import { EBOOKS_SETUP_SQL } from '../data/08_ebooks_setup';
import { GALLERY_VIEW_FIX_SQL } from '../data/09_gallery_view_fix';
import { VIDEO_URL_SUPPORT_SQL } from '../data/10_video_url_support';
import { EBOOKS_ADVANCED_SQL } from '../data/11_ebooks_advanced';
import { ORDER_MANAGEMENT_SQL } from '../data/12_order_management';
import { LIBRARY_SYNC_SQL } from '../data/13_library_sync';
import { ADMIN_LIBRARY_ACCESS_SQL } from '../data/14_admin_library_access';
import { DEMO_ADMIN_SUPPORT_SQL } from '../data/15_demo_admin_support';
import { LIBRARY_RLS_FIX_SQL } from '../data/16_library_rls_fix';
import { FIX_FULFILLMENT_RLS_SQL } from '../data/17_fix_fulfillment_rls';
import { ORDER_ARCHIVING_SQL } from '../data/20_order_archiving';
import { WISHLIST_SETUP_SQL } from '../data/21_wishlist_setup';

// Combined SQL for Database Setup
export const DATABASE_SETUP_SQL = 
    INITIAL_SETUP_SQL + '\n\n' + 
    USER_RBAC_SQL + '\n\n' + 
    ROLES_PERMISSIONS_SQL + '\n\n' + 
    INVENTORY_ADVANCED_SQL + '\n\n' + 
    MEDIA_MANAGER_SQL + '\n\n' + 
    PRODUCT_MEDIA_INTEGRATION_SQL + '\n\n' +
    MEDIA_COLLECTIONS_SQL + '\n\n' +
    EBOOKS_SETUP_SQL + '\n\n' +
    GALLERY_VIEW_FIX_SQL + '\n\n' +
    VIDEO_URL_SUPPORT_SQL + '\n\n' +
    EBOOKS_ADVANCED_SQL + '\n\n' +
    ORDER_MANAGEMENT_SQL + '\n\n' +
    LIBRARY_SYNC_SQL + '\n\n' +
    ADMIN_LIBRARY_ACCESS_SQL + '\n\n' +
    DEMO_ADMIN_SUPPORT_SQL + '\n\n' +
    LIBRARY_RLS_FIX_SQL + '\n\n' +
    FIX_FULFILLMENT_RLS_SQL + '\n\n' +
    ORDER_ARCHIVING_SQL + '\n\n' +
    WISHLIST_SETUP_SQL;
