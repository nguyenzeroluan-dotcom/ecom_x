
import { supabase } from './supabaseClient';
import { SUPABASE_URL } from '../constants';
import { MediaAsset, MediaCollection } from '../types';

// --- Helper Functions ---
const getImageDimensions = (file: File): Promise<{ width: number, height: number }> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve({ width: 0, height: 0 });
      return;
    }
    const img = document.createElement('img');
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
};

// --- Media Services (NEW) ---

export const getMediaAssets = async (): Promise<MediaAsset[]> => {
    const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        if (error.code === '42P01') return []; // Table doesn't exist yet
        throw new Error(error.message);
    }
    return data as MediaAsset[];
};

export const uploadMediaAsset = async (file: File, userId?: string, bucket: string = 'product-images'): Promise<MediaAsset> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  // 1. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (uploadError) {
    if (uploadError.message.includes('row-level security') || uploadError.message === 'new row violates row-level security policy') {
        throw new Error(`Storage Permission Error: ${uploadError.message}. Check SQL policies.`);
    }
    throw new Error(`Storage Upload Error: ${uploadError.message}`);
  }

  // 2. Get Public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  if (!urlData?.publicUrl) {
    throw new Error("Could not get public URL for the uploaded image. Check storage policies.");
  }

  // Get image dimensions
  const { width, height } = await getImageDimensions(file);

  // 3. Insert Metadata into DB
  const assetData = {
      file_name: file.name,
      file_path: fileName,
      public_url: urlData.publicUrl,
      mime_type: file.type,
      size: file.size,
      width: width,
      height: height,
      user_id: userId && userId !== 'demo-user-123' ? userId : undefined
  };

  const { data, error: dbError } = await supabase
      .from('media_assets')
      .insert([assetData])
      .select()
      .single();
  
  if (dbError) {
      // Attempt to clean up storage if DB insert fails
      await supabase.storage.from(bucket).remove([fileName]);
      throw new Error(`DB Error: ${dbError.message}`);
  }

  return data as MediaAsset;
};

export const deleteMediaAsset = async (asset: MediaAsset): Promise<void> => {
    // 1. Delete from Storage
    const bucket = asset.public_url.includes('/avatars/') ? 'avatars' : 'product-images';
    const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([asset.file_path]);

    if (storageError) console.warn("Storage deletion failed:", storageError.message); // non-blocking

    // 2. Delete from DB
    const { error: dbError } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', asset.id);

    if (dbError) throw new Error(dbError.message);
};

export const deleteMediaAssets = async (assets: MediaAsset[]): Promise<void> => {
    if (assets.length === 0) return;

    // Separate by bucket
    const toDelete: { [bucket: string]: string[] } = {};
    for (const asset of assets) {
        const bucket = asset.public_url.includes('/avatars/') ? 'avatars' : 'product-images';
        if (!toDelete[bucket]) toDelete[bucket] = [];
        toDelete[bucket].push(asset.file_path);
    }

    // Delete from storage
    for (const bucket in toDelete) {
        await supabase.storage.from(bucket).remove(toDelete[bucket]);
    }
    
    // Delete from DB
    const ids = assets.map(a => a.id);
    const { error } = await supabase
        .from('media_assets')
        .delete()
        .in('id', ids);
    
    if (error) throw new Error(error.message);
};

export const syncProductImagesToAssets = async (): Promise<number> => {
    // 1. Get all product image URLs
    const { data: products, error: prodError } = await supabase.from('products').select('image_url');
    if (prodError) throw new Error(prodError.message);

    // 2. Get all existing asset URLs
    const { data: assets, error: assetError } = await supabase.from('media_assets').select('public_url');
    if (assetError) throw new Error(assetError.message);
    
    const existingUrls = new Set(assets.map(a => a.public_url));
    const uniqueProductUrls = new Set(products.map(p => p.image_url).filter(url => url && url.startsWith(SUPABASE_URL)));

    // 3. Find URLs that are in products but not in media_assets
    const urlsToSync = Array.from(uniqueProductUrls).filter(url => !existingUrls.has(url));

    if (urlsToSync.length === 0) {
        return 0; // Nothing to sync
    }

    // 4. Create new asset records for them
    const newAssets = urlsToSync.map(url => {
        const pathSegments = String(url).split('/');
        const fileName = pathSegments.pop() || 'synced-image.jpg';
        return {
            file_name: fileName,
            file_path: fileName,
            public_url: url,
            mime_type: 'image/jpeg', // Best guess
            size: 0, // Unknown size
        };
    });

    const { error: insertError } = await supabase.from('media_assets').insert(newAssets);
    if (insertError) throw new Error(insertError.message);

    return newAssets.length;
};

// --- Media Collection Services (NEW) ---

export const getMediaCollections = async (): Promise<MediaCollection[]> => {
    const { data, error } = await supabase
        .from('media_collections')
        .select(`
            id, name, description,
            media_assets:collection_media_join(media_assets(public_url))
        `)
        .order('name', { ascending: true });

    if (error) {
        if (error.code === '42P01') return []; // Table doesn't exist
        throw new Error(error.message);
    }

    // Transform data to match MediaCollection type, filtering out any nulls
    const collections = data.map(c => ({
      ...c,
      media_assets: c.media_assets.map((m: any) => m.media_assets).filter(Boolean)
    }));

    return collections as MediaCollection[];
};

export const getCollectionDetails = async (collectionId: number): Promise<MediaAsset[]> => {
    const { data, error } = await supabase
        .from('collection_media_join')
        .select('media_assets(*)')
        .eq('collection_id', collectionId)
        .order('created_at', { referencedTable: 'media_assets', ascending: false });

    if (error) throw new Error(error.message);
    // The query returns objects like [{ media_assets: {...} }, { media_assets: [ ... ] }], so we need to extract and flatten.
    const assets = data.flatMap(item => item.media_assets).filter(Boolean);
    return assets as MediaAsset[];
};


export const createMediaCollection = async (collection: Omit<MediaCollection, 'id' | 'media_assets'>): Promise<MediaCollection> => {
    const { data, error } = await supabase
        .from('media_collections')
        .insert([collection])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data as MediaCollection;
};

export const updateMediaCollection = async (id: number, updates: Partial<Omit<MediaCollection, 'id'>>): Promise<MediaCollection> => {
    const { data, error } = await supabase
        .from('media_collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data as MediaCollection;
};

export const deleteMediaCollection = async (id: number): Promise<void> => {
    // RLS and "on delete cascade" on the join table handle cleanup.
    const { error } = await supabase
        .from('media_collections')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
};

export const addAssetsToCollection = async (collectionId: number, mediaIds: number[]): Promise<void> => {
    const records = mediaIds.map(media_id => ({ collection_id: collectionId, media_id }));
    const { error } = await supabase
        .from('collection_media_join')
        .upsert(records, { onConflict: 'collection_id, media_id', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
};

export const removeAssetsFromCollection = async (collectionId: number, mediaIds: number[]): Promise<void> => {
    const { error } = await supabase
        .from('collection_media_join')
        .delete()
        .eq('collection_id', collectionId)
        .in('media_id', mediaIds);
    
    if (error) throw new Error(error.message);
};
