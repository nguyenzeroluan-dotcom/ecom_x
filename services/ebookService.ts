
import { supabase } from './supabaseClient';
import { Product, EBookMetadata } from '../types';

export const getEBookMetadata = async (productId: string | number): Promise<EBookMetadata | null> => {
    const { data, error } = await supabase
        .from('ebook_metadata')
        .select('*')
        .eq('product_id', productId)
        .single();
    
    if (error) {
        return null; // Not found is fine, means not configured yet
    }
    return data as EBookMetadata;
};

export const saveEBookMetadata = async (metadata: EBookMetadata): Promise<EBookMetadata> => {
    const { data, error } = await supabase
        .from('ebook_metadata')
        .upsert({
            product_id: metadata.product_id,
            format: metadata.format,
            source_url: metadata.source_url,
            content_html: metadata.content_html,
            allow_download: metadata.allow_download,
            drm_enabled: metadata.drm_enabled,
            preview_percentage: metadata.preview_percentage,
            updated_at: new Date()
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as EBookMetadata;
};

// Helper to sanitize filename to be S3 safe
const sanitizeFileName = (name: string): string => {
    // 1. Split name and extension
    const parts = name.split('.');
    let ext = '';
    let base = name;
    
    if (parts.length > 1) {
        ext = parts.pop()?.toLowerCase() || '';
        base = parts.join('.');
    }

    // 2. Normalize (remove accents/diacritics) e.g., "thư ngỏ" -> "thu ngo"
    const cleanBase = base
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/đ/g, "d").replace(/Đ/g, "D") // Specific Vietnamese D handling
        .replace(/[^a-z0-9]/gi, '-') // Replace special chars with -
        .replace(/-+/g, '-') // Collapse dashes
        .replace(/^-|-$/g, ''); // Trim leading/trailing dashes

    // 3. Add timestamp to ensure uniqueness
    // Use random string to ensure uniqueness even if uploaded at exact same ms
    const random = Math.random().toString(36).substring(2, 7);
    return `${Date.now()}_${random}_${cleanBase}.${ext}`;
};

export const uploadPDF = async (file: File): Promise<string> => {
    // 1. Validate File Type
    if (file.type !== 'application/pdf') {
        throw new Error("Invalid file type. Only PDF files are allowed.");
    }

    // 2. Validate File Size (e.g., 50MB limit)
    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`File size too large. Maximum allowed is ${MAX_SIZE_MB}MB.`);
    }

    // 3. Sanitize Filename
    const fileName = sanitizeFileName(file.name);
    
    // 4. Upload
    const { error: uploadError } = await supabase.storage
        .from('ebook-files')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        // Detailed error message
        throw new Error(`Upload failed: ${uploadError.message}.`);
    }

    const { data } = supabase.storage.from('ebook-files').getPublicUrl(fileName);
    return data.publicUrl;
};

export const getDigitalProducts = async (): Promise<Product[]> => {
    // Get products that are marked is_digital OR have ebook metadata
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            ebook_metadata(*)
        `)
        .eq('is_digital', true)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Product[];
};
