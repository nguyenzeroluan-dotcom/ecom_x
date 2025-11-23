
import React from 'react';
import { FormInput, FormSelect } from '../../../common/FormElements';

interface ProductBasicInfoProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  generateSku: () => void;
  categories: string[];
  isCustomCategory: boolean;
  setIsCustomCategory: (val: boolean) => void;
}

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  formData,
  handleInputChange,
  generateSku,
  categories,
  isCustomCategory,
  setIsCustomCategory
}) => {
  return (
    <div className="space-y-4">
      <FormInput 
        label="Product Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
        placeholder="e.g. Modern Lamp"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput 
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleInputChange}
          placeholder="e.g. LMP-001"
          rightElement={
            <button 
              type="button"
              onClick={generateSku}
              className="text-slate-400 hover:text-primary transition-colors"
              title="Generate SKU"
            >
              <i className="fas fa-random"></i>
            </button>
          }
        />
        <FormInput 
          label="Price ($)"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleInputChange}
          required
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          {isCustomCategory ? (
            <div className="flex gap-2">
              <input 
                type="text" 
                name="category" 
                required
                autoFocus 
                value={formData.category} 
                onChange={handleInputChange} 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white" 
                placeholder="New Category Name"
              />
              <button type="button" onClick={() => setIsCustomCategory(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded hover:bg-slate-300 transition-colors"><i className="fas fa-times"></i></button>
            </div>
          ) : (
            <FormSelect 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categories}
              customOptionLabel="+ Add New Category"
            />
          )}
        </div>
        
        <FormInput 
          label="Stock Quantity"
          name="stock"
          type="number"
          step="1"
          value={formData.stock}
          onChange={handleInputChange}
          required
          placeholder="10"
        />
      </div>
    </div>
  );
};

export default ProductBasicInfo;
