import { useState, useCallback } from 'react';
import { supabase, Content, Campaign } from '../supabase';
import { useToast } from './useToast';
import { normalizeUrl } from '../utils/urlParser';

export function useContentActions(refresh: () => void) {
  const { success, error: toastError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTwitchUpload = useCallback(async (
    file: File, 
    user_id: string,
    creator_id: string | null, 
    editingContent: Content | null,
    campaigns: Campaign[],
    dCount?: number, 
    aCount?: number, 
    pCount?: number, 
    uvCount?: number, 
    uChatters?: number, 
    vCount?: number, 
    fCount?: number, 
    sCount?: number,
    shCount?: number,
    title?: string,
    campaign_id?: string,
    platform?: 'twitch' | 'tiktok' | 'discord' | 'baseapp' | 'instagram_story',
    likesCount?: number,
    commentsCount?: number
  ) => {
    setIsProcessing(true);
    try {
      const activeCreatorId = creator_id || user_id;
      const fileName = `${activeCreatorId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content-attachments')
        .getPublicUrl(fileName);

      const finalCampaignId = campaign_id || editingContent?.campaign_id || campaigns[0]?.id || '';
      const finalPlatform = platform || 'twitch';
      const defaultUrl = finalPlatform === 'instagram_story' 
        ? `https://instagram.com/story-stats-${Date.now()}` 
        : finalPlatform === 'discord' 
        ? `https://discord.com/stats-${Date.now()}`
        : finalPlatform === 'baseapp'
        ? `https://baseapp.com/stats-${Date.now()}`
        : `https://twitch.tv/stats-${Date.now()}`;

      const { error: dbError } = await supabase.from('content').insert([{
        campaign_id: finalCampaignId,
        platform: finalPlatform,
        url: defaultUrl,
        title: title || null,
        thumbnail: publicUrl,
        creator_id: activeCreatorId,
        status: 'active',
        views: finalPlatform === 'discord' ? (uvCount || 0) : (vCount || 0),
        unique_viewers: uvCount || 0,
        peek_viewers: pCount || 0,
        average_viewers: aCount || 0,
        unique_chatters: uChatters || 0,
        followers: fCount || 0,
        new_subscriptions: sCount || 0,
        duration_minutes: dCount || 0,
        shares_count: shCount || 0,
        likes: likesCount || 0,
        comments: commentsCount || 0,
        uploaded_at: new Date().toISOString()
      }]);

      if (dbError) throw dbError;

      const platformNames: Record<string, string> = {
        twitch: 'Twitch',
        tiktok: 'TikTok',
        discord: 'Discord',
        baseapp: 'BaseApp',
        instagram_story: 'Historia IG'
      };
      success(`Captura de ${platformNames[finalPlatform] || finalPlatform} guardada`);
      refresh();
      return true;
    } catch (err: any) {
      toastError("Error al subir captura: " + err.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [refresh, success, toastError]);

  const handleContentSubmit = useCallback(async (
    data: any, 
    user_id: string,
    editingContent: Content | null,
    onClose: () => void
  ) => {
    setIsProcessing(true);
    try {
      const activeCreatorId = data.creator_id === 'guest' ? null : (data.creator_id || user_id);
      const guestName = data.creator_id === 'guest' ? data.guest_name : null;
      const cleanUrl = normalizeUrl(data.url, data.platform);

      if (editingContent) {
        // Check duplicate if URL changed
        if (cleanUrl !== normalizeUrl(editingContent.url, editingContent.platform)) {
           const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', data.campaign_id).eq('url', cleanUrl).is('deleted_at', null).neq('id', editingContent.id).limit(1);
           if (existing && existing.length > 0) {
              toastError("¡Ese enlace ya está vinculado a esta campaña!");
              return false;
           }
        }

        const { error } = await supabase
          .from('content')
          .update({ 
            campaign_id: data.campaign_id, 
            platform: data.platform, 
            url: cleanUrl, 
            creator_id: activeCreatorId,
            guest_name: guestName,
            title: data.title,
            views: data.platform === 'discord' ? (data.unique_viewers || 0) : data.views,
            unique_viewers: data.unique_viewers,
            likes: data.likes,
            comments: data.comments,
            avg_duration_minutes: data.avg_duration_minutes,
            shares_count: data.shares_count
          })
          .eq('id', editingContent.id);
        
        if (error) throw error;
        success("Contenido actualizado");

        // --- Audit Log: Manual metrics adjustment ---
        const changedFields: string[] = [];
        if (data.views !== editingContent.views) changedFields.push(`vistas: ${editingContent.views} -> ${data.views}`);
        if (data.likes !== editingContent.likes) changedFields.push(`likes: ${editingContent.likes} -> ${data.likes}`);
        if (data.comments !== editingContent.comments) changedFields.push(`coment: ${editingContent.comments} -> ${data.comments}`);

        if (changedFields.length > 0) {
          await supabase.from('audit_logs').insert([{
            user_id: user_id,
            action: 'METRICS_ADJUSTED',
            details: `Ajuste manual para post ${editingContent.id}. Cambios: ${changedFields.join(', ')}`,
            target_id: editingContent.id,
            metadata: { from: editingContent, to: data }
          }]);
        }

        // If URL changed, fetch new metadata in background
        if (cleanUrl !== normalizeUrl(editingContent.url, editingContent.platform)) {
          const { data: { session } } = await supabase.auth.getSession();
          fetch('/api/fetch-metadata', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ url: cleanUrl, platform: data.platform })
          }).then(async (res) => {
            if (res.ok) {
              const metadata = await res.json();
              // Only update if scraper found real data to avoid overwriting manual edits with 0
              const updates: any = {};
              if (metadata.title && metadata.title !== 'Instagram Post') updates.title = metadata.title;
              if (metadata.thumbnail) updates.thumbnail = metadata.thumbnail;
              if (metadata.views > 0) updates.views = metadata.views;
              if (metadata.likes > 0) updates.likes = metadata.likes;
              if (metadata.comments > 0) updates.comments = metadata.comments;

              if (Object.keys(updates).length > 0) {
                await supabase.from('content').update(updates).eq('id', editingContent.id);
                refresh();
              }
            }
          }).catch(e => console.warn("Background update after edit failed:", e));
        }
      } else {
        // 1. Check duplicate for new inserts
        const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', data.campaign_id).eq('url', cleanUrl).is('deleted_at', null).limit(1);
        if (existing && existing.length > 0) {
            toastError("¡Este contenido ya se encuentra registrado en la campaña!");
            return false;
        }

        // 2. INSERT IMMEDIATELY (FAST)
        const { data: insertedData, error } = await supabase.from('content').insert([{
          ...data,
          url: cleanUrl,
          title: 'Cargando métricas...',
          thumbnail: '',
          views: data.platform === 'discord' ? (data.unique_viewers || 0) : (data.views || 0),
          unique_viewers: data.unique_viewers || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          peek_viewers: data.peek_viewers || 0,
          average_viewers: data.average_viewers || 0,
          unique_chatters: data.unique_chatters || 0,
          followers: data.followers || 0,
          new_subscriptions: data.new_subscriptions || 0,
          duration_minutes: data.duration_minutes || 0,
          avg_duration_minutes: data.avg_duration_minutes || 0,
          shares_count: data.shares_count || 0,
          creator_id: activeCreatorId,
          guest_name: guestName,
          status: 'active',
          uploaded_at: new Date().toISOString()
        }]).select();
        
        if (error) throw error;

        success("¡Contenido creado! Las métricas se actualizarán en breve.");

        // 3. FETCH METADATA IN BACKGROUND
        const { data: { session } } = await supabase.auth.getSession();
        fetch('/api/fetch-metadata', { 
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ url: cleanUrl, platform: data.platform })
        }).then(async (res) => {
          if (res.status === 429) {
            const errorData = await res.json();
            if (errorData.error === 'IG_QUOTA_EXCEEDED') {
              toastError("🚨 Límite de API agotado en RapidAPI. Revisa tus suscripciones o agrega una nueva clave (RAPIDAPI_KEY_3) para reactivar los scrapers.");
              return;
            }
          }
          if (res.ok && insertedData?.[0]) {
            const metadata = await res.json();
            // ... (rest of update logic)
            // Only update if scraper found real data to avoid overwriting manual values with 0
            const updates: any = {};
            if (metadata.title && metadata.title !== 'Instagram Post' && metadata.title !== 'YouTube Video') {
              updates.title = metadata.title;
            }
            if (metadata.thumbnail) updates.thumbnail = metadata.thumbnail;
            
            // Only update metrics if they are > 0 to avoid overwriting manual data with scraper failures
            if (metadata.views > 0) updates.views = metadata.views;
            if (metadata.likes > 0) updates.likes = metadata.likes;
            if (metadata.comments > 0) updates.comments = metadata.comments;

            if (Object.keys(updates).length > 0) {
              await supabase.from('content').update(updates).eq('id', insertedData[0].id);
              refresh();
            }
          }
        }).catch(e => console.warn("Admin background update failed:", e));
      }
      onClose();
      refresh();
      return true;
    } catch (err: any) {
      toastError("Error al procesar contenido: " + err.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [refresh, success, toastError]);

  return {
    isProcessing,
    handleTwitchUpload,
    handleContentSubmit
  };
}
