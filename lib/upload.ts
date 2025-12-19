
import { supabase } from './supabase';

export const uploadFile = async (file: File, path: string): Promise<{ publicUrl: string | null; error: any }> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return { publicUrl: null, error: uploadError };
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        return { publicUrl: data.publicUrl, error: null };
    } catch (error) {
        console.error('Unexpected error uploading file:', error);
        return { publicUrl: null, error };
    }
};
