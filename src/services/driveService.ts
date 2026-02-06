
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (if not already exported globally, but usually safe to recreate or import from lib)
// Importing from lib/supabase if available is better, but to be safe and self-contained here:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface DriveFile {
    id: string;
    name: string;
    size: string;
    mimeType: string;
    webViewLink: string;
    thumbnailLink?: string;
    createdTime?: string;
}

export const driveService = {
    // List Files
    listFiles: async (): Promise<DriveFile[]> => {
        const { data, error } = await supabase.functions.invoke('drive-proxy', {
            body: { action: 'list' }
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        return data.files || [];
    },

    // Upload File
    uploadFile: async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64 = (reader.result as string).split(',')[1];
                    const { data, error } = await supabase.functions.invoke('drive-proxy', {
                        body: {
                            action: 'upload',
                            payload: {
                                name: file.name,
                                mimeType: file.type,
                                base64: base64
                            }
                        }
                    });
                    if (error) {
                        console.error('Supabase Invoke Error:', error);
                        throw new Error(error.message || 'Supabase function failed');
                    }
                    if (data.error) throw new Error(data.error);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = (error) => reject(error);
        });
    },

    // Delete File
    deleteFile: async (fileId: string): Promise<void> => {
        const { data, error } = await supabase.functions.invoke('drive-proxy', {
            body: {
                action: 'delete',
                payload: { fileId }
            }
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
    },

    // Get Storage Quota
    getQuota: async (): Promise<{ storageQuota: { limit: string, usage: string, usageInDrive: string } }> => {
        const { data, error } = await supabase.functions.invoke('drive-proxy', {
            body: { action: 'quota' }
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        return data; // returns object with storageQuota
    }
};
