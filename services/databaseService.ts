
import { INITIAL_SETUP_SQL } from '../data/01_initial_setup';
import { USER_RBAC_SQL } from '../data/02_user_rbac';
import { ROLES_PERMISSIONS_SQL } from '../data/03_roles_permissions';
import { INVENTORY_ADVANCED_SQL } from '../data/04_inventory_advanced';
import { MEDIA_MANAGER_SQL } from '../data/05_media_manager';
import { PRODUCT_MEDIA_INTEGRATION_SQL } from '../data/06_product_media_integration';
import { MEDIA_COLLECTIONS_SQL } from '../data/07_media_collections';
import { EBOOKS_SETUP_SQL } from '../data/08_ebooks_setup';

// Combined SQL for Database Setup
export const DATABASE_SETUP_SQL = 
    INITIAL_SETUP_SQL + '\n\n' + 
    USER_RBAC_SQL + '\n\n' + 
    ROLES_PERMISSIONS_SQL + '\n\n' + 
    INVENTORY_ADVANCED_SQL + '\n\n' + 
    MEDIA_MANAGER_SQL + '\n\n' + 
    PRODUCT_MEDIA_INTEGRATION_SQL + '\n\n' +
    MEDIA_COLLECTIONS_SQL + '\n\n' +
    EBOOKS_SETUP_SQL;
