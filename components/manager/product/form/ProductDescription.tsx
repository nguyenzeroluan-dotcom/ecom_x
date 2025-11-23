
import React from 'react';
import { FormTextArea } from '../../../common/FormElements';

interface ProductDescriptionProps {
  description: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleGenerateDescription: () => void;
  isGeneratingDesc: boolean;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  handleInputChange,
  handleGenerateDescription,
  isGeneratingDesc
}) => {
  return (
    <FormTextArea 
      label="Description"
      name="description"
      rows={3}
      value={description}
      onChange={handleInputChange}
      placeholder="Product details..."
      headerAction={
        <button 
          type="button" 
          onClick={handleGenerateDescription} 
          disabled={isGeneratingDesc} 
          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
        >
          {isGeneratingDesc ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
          Auto-generate
        </button>
      }
    />
  );
};

export default ProductDescription;
