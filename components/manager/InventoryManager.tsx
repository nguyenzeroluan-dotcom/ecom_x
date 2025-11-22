import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { updateProduct, logInventoryChange } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { ModalType } from '../../types';

import InventoryHeader from './inventory/InventoryHeader';
import InventoryOverview from './inventory/InventoryOverview';
import InventoryAuditLog from './inventory/InventoryAuditLog';
import StockAdjustmentModal from './inventory/StockAdjustmentModal';

interface InventoryManagerProps {
  products: Product[];
  onRefresh: () => void;
}

type InvView = 'overview' | 'audit';
export type InvViewMode = 'table' | 'grid' | 'list';

const InventoryManager: React.FC<InventoryManagerProps> = ({ products, onRefresh }) => {
  const { user } = useAuth();
  const { openModal } = useModal();
  
  const [view, setView] = useState<InvView>('overview');
  const [viewMode, setViewMode] = useState<InvViewMode>('table');
  const [search, setSearch] = useState('');

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const handleStockUpdate = async (
    product: Product, 
    amount: number, 
    type: 'add' | 'remove', 
    reason: string, 
    note: string
  ): Promise<boolean> => {
      const currentStock = product.stock || 0;
      const change = type === 'add' ? amount : -amount;
      const newStock = Math.max(0, currentStock + change);
      const actualChange = newStock - currentStock;

      try {
          if (actualChange !== 0) {
              await updateProduct(product.id, { stock: newStock });
              await logInventoryChange(
                  product.id,
                  product.name,
                  currentStock,
                  newStock,
                  reason,
                  user?.id,
                  note
              );
              onRefresh();
              openModal(ModalType.SUCCESS, { title: "Stock Updated", message: `Inventory for ${product.name} is now ${newStock}.` });
          }
          setShowStockModal(false);
          return true;
      } catch (err: any) {
          openModal(ModalType.CONFIRM, { title: "Error", message: err.message, isDestructive: true });
          return false;
      }
  };

  const openStockModal = (product: Product) => {
      setSelectedProduct(product);
      setShowStockModal(true);
  };
  
  const handleSkuUpdate = async (id: string | number, newSku: string) => {
      try {
          await updateProduct(id, { sku: newSku.trim() });
          onRefresh();
          return true;
      } catch(err: any) {
          openModal(ModalType.CONFIRM, { title: "SKU Update Failed", message: err.message, isDestructive: true });
          return false;
      }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search]);

  const stats = useMemo(() => ({
    totalItems: products.length,
    totalValue: products.reduce((sum, p) => sum + (Number(p.price) * (p.stock || 0)), 0),
    lowStockCount: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length,
    outOfStockCount: products.filter(p => (p.stock || 0) === 0).length,
  }), [products]);

  return (
    <div className="space-y-6">
        <InventoryHeader
            stats={stats}
            activeTab={view}
            setActiveTab={setView}
            search={search}
            setSearch={setSearch}
            viewMode={viewMode}
            setViewMode={setViewMode}
        />

        {view === 'overview' && (
            <InventoryOverview
                products={filteredProducts}
                viewMode={viewMode}
                handleSkuUpdate={handleSkuUpdate}
                openStockModal={openStockModal}
            />
        )}

        {view === 'audit' && (
            <InventoryAuditLog />
        )}

        {showStockModal && selectedProduct && (
            <StockAdjustmentModal
                isOpen={showStockModal}
                onClose={() => setShowStockModal(false)}
                product={selectedProduct}
                onConfirm={handleStockUpdate}
            />
        )}
    </div>
  );
};

export default InventoryManager;
