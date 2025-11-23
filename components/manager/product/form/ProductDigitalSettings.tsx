
import React from 'react';
import { FormCheckbox, FormTextArea } from '../../../common/FormElements';

interface ProductDigitalSettingsProps {
  formData: any;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProductDigitalSettings: React.FC<ProductDigitalSettingsProps> = ({
  formData,
  handleCheckboxChange,
  handleInputChange
}) => {
  return (
    <div className="space-y-4">
      <FormCheckbox 
        id="is_digital"
        name="is_digital"
        label="Digital Product / E-Book"
        checked={formData.is_digital}
        onChange={handleCheckboxChange}
      />

      {formData.is_digital && (
        <div className="animate-fade-in">
          <FormTextArea 
            label="Book Content / Digital Delivery"
            name="digital_content"
            rows={6}
            value={formData.digital_content}
            onChange={handleInputChange}
            className="font-mono text-xs"
            placeholder="# Chapter 1..."
          />
        </div>
      )}
    </div>
  );
};

export default ProductDigitalSettings;
