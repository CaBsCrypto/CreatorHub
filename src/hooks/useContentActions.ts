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
    commentsCount?: number,
    contentType?: 'video_largo' | 'video_corto' | null,
    isRepost?: boolean,
    parentId?: string | null
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
        uploaded_at: new Date().toISOString(),
        content_type: contentType || null,
        is_repost: isRepost || false,
        parent_id: parentId || null
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
      const { isMultiPlatform, multiUrls, selectedChildIds, ...mainData } = data;
      const activeCreatorId = mainData.creator_id === 'guest' ? null : (mainData.creator_id || user_id);
      const guestName = mainData.creator_id === 'guest' ? mainData.guest_name : null;
      const cleanUrl = normalizeUrl(mainData.url, mainData.platform);

      // Helper to fetch metadata in background
      const triggerMetadataFetch = async (contentId: string, urlStr: string, platformStr: string) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch('/api/fetch-metadata', { 
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ url: urlStr, platform: platformStr })
          });
          if (res.status === 429) {
            const errorData = await res.json();
            if (errorData.error === 'IG_QUOTA_EXCEEDED') {
              toastError("🚨 Límite de API agotado en RapidAPI. Revisa tus suscripciones o agrega una clave RAPIDAPI_KEY.");
              return;
            }
          }
          if (res.ok) {
            const metadata = await res.json();
            const updates: any = {};
            if (metadata.title && metadata.title !== 'Instagram Post' && metadata.title !== 'YouTube Video') {
              updates.title = metadata.title;
            }
            if (metadata.thumbnail) updates.thumbnail = metadata.thumbnail;
            if (metadata.views > 0) updates.views = metadata.views;
            if (metadata.likes > 0) updates.likes = metadata.likes;
            if (metadata.comments > 0) updates.comments = metadata.comments;

            if (Object.keys(updates).length > 0) {
              await supabase.from('content').update(updates).eq('id', contentId);
              refresh();
            }
          }
        } catch (e) {
          console.warn("Background update failed:", e);
        }
      };

      if (editingContent) {
        // Check duplicate if URL changed
        if (cleanUrl !== normalizeUrl(editingContent.url, editingContent.platform)) {
           const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', mainData.campaign_id).eq('url', cleanUrl).is('deleted_at', null).neq('id', editingContent.id).limit(1);
           if (existing && existing.length > 0) {
              toastError("¡Ese enlace ya está vinculado a esta campaña!");
              return false;
           }
        }

        const { error } = await supabase
          .from('content')
          .update({ 
            campaign_id: mainData.campaign_id, 
            platform: mainData.platform, 
            url: cleanUrl, 
            creator_id: activeCreatorId,
            guest_name: guestName,
            title: mainData.title,
            views: mainData.platform === 'discord' ? (mainData.unique_viewers || 0) : mainData.views,
            unique_viewers: mainData.unique_viewers,
            likes: mainData.likes,
            comments: mainData.comments,
            avg_duration_minutes: mainData.avg_duration_minutes,
            shares_count: mainData.shares_count,
            content_type: mainData.content_type || null,
            is_repost: mainData.is_repost || false,
            parent_id: mainData.parent_id || null
          })
          .eq('id', editingContent.id);
        
        if (error) throw error;
        success("Contenido actualizado");

        // --- Vincular / Desvincular posts secundarios ---
        if (!mainData.is_repost) {
          // Desvincular todos los hijos anteriores
          await supabase.from('content').update({ parent_id: null, is_repost: false }).eq('parent_id', editingContent.id);

          // Vincular los nuevos hijos seleccionados
          if (Array.isArray(selectedChildIds) && selectedChildIds.length > 0) {
            const { error: childErr } = await supabase
              .from('content')
              .update({ parent_id: editingContent.id, is_repost: true })
              .in('id', selectedChildIds);
            
            if (!childErr) {
              // Trigger metadata fetch for all children
              const { data: childrenData } = await supabase.from('content').select('id, url, platform').in('id', selectedChildIds);
              if (childrenData) {
                for (const child of childrenData) {
                  triggerMetadataFetch(child.id, child.url, child.platform);
                }
              }
            }
          }
        }

        // --- Audit Log: Manual metrics adjustment ---
        const changedFields: string[] = [];
        if (mainData.views !== editingContent.views) changedFields.push(`vistas: ${editingContent.views} -> ${mainData.views}`);
        if (mainData.likes !== editingContent.likes) changedFields.push(`likes: ${editingContent.likes} -> ${mainData.likes}`);
        if (mainData.comments !== editingContent.comments) changedFields.push(`coment: ${editingContent.comments} -> ${mainData.comments}`);

        if (changedFields.length > 0) {
          await supabase.from('audit_logs').insert([{
            user_id: user_id,
            action: 'METRICS_ADJUSTED',
            details: `Ajuste manual para post ${editingContent.id}. Cambios: ${changedFields.join(', ')}`,
            target_id: editingContent.id,
            metadata: { from: editingContent, to: mainData }
          }]);
        }

        // If URL changed, fetch new metadata in background
        if (cleanUrl !== normalizeUrl(editingContent.url, editingContent.platform)) {
          triggerMetadataFetch(editingContent.id, cleanUrl, mainData.platform);
        }
      } else {
        // 1. Check duplicate for new inserts
        const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', mainData.campaign_id).eq('url', cleanUrl).is('deleted_at', null).limit(1);
        if (existing && existing.length > 0) {
            toastError("¡Este contenido ya se encuentra registrado en la campaña!");
            return false;
        }

        // 2. INSERT MASTER POST IMMEDIATELY
        const { data: insertedData, error } = await supabase.from('content').insert([{
          ...mainData,
          url: cleanUrl,
          title: mainData.title || 'Cargando métricas...',
          thumbnail: '',
          views: mainData.platform === 'discord' ? (mainData.unique_viewers || 0) : (mainData.views || 0),
          unique_viewers: mainData.unique_viewers || 0,
          likes: mainData.likes || 0,
          comments: mainData.comments || 0,
          peek_viewers: mainData.peek_viewers || 0,
          average_viewers: mainData.average_viewers || 0,
          unique_chatters: mainData.unique_chatters || 0,
          followers: mainData.followers || 0,
          new_subscriptions: mainData.new_subscriptions || 0,
          duration_minutes: mainData.duration_minutes || 0,
          avg_duration_minutes: mainData.avg_duration_minutes || 0,
          shares_count: mainData.shares_count || 0,
          creator_id: activeCreatorId,
          guest_name: guestName,
          status: 'active',
          content_type: mainData.content_type || null,
          is_repost: mainData.is_repost || false,
          parent_id: mainData.parent_id || null,
          uploaded_at: new Date().toISOString()
        }]).select();
        
        if (error) throw error;

        const masterPost = insertedData?.[0];
        if (!masterPost) throw new Error("No se pudo obtener el post insertado");

        success("¡Contenido creado! Las métricas se actualizarán en breve.");

        // Fetch master metadata
        triggerMetadataFetch(masterPost.id, cleanUrl, mainData.platform);

        // Vincular hijos si se seleccionaron de la checklist en creación manual
        if (!mainData.is_repost && Array.isArray(selectedChildIds) && selectedChildIds.length > 0) {
          const { error: childErr } = await supabase
            .from('content')
            .update({ parent_id: masterPost.id, is_repost: true })
            .in('id', selectedChildIds);
          
          if (!childErr) {
            const { data: childrenData } = await supabase.from('content').select('id, url, platform').in('id', selectedChildIds);
            if (childrenData) {
              for (const child of childrenData) {
                triggerMetadataFetch(child.id, child.url, child.platform);
              }
            }
          }
        }

        // If multi-platform is enabled, insert secondary platforms as child reposts
        if (isMultiPlatform && Array.isArray(multiUrls)) {
          for (const item of multiUrls) {
            if (item.url && item.url.trim() !== '') {
              const secUrl = normalizeUrl(item.url, item.platform);
              
              // Check duplicate for secondary URL
              const { data: secExisting } = await supabase.from('content').select('id').eq('campaign_id', mainData.campaign_id).eq('url', secUrl).is('deleted_at', null).limit(1);
              if (secExisting && secExisting.length > 0) {
                console.warn(`URL ${secUrl} ya registrada, omitiendo.`);
                continue;
              }

              const { data: secInserted, error: secError } = await supabase.from('content').insert([{
                campaign_id: mainData.campaign_id,
                platform: item.platform,
                url: secUrl,
                title: 'Cargando repost...',
                thumbnail: '',
                views: 0,
                likes: 0,
                comments: 0,
                creator_id: activeCreatorId,
                guest_name: guestName,
                status: 'active',
                content_type: mainData.content_type || null,
                is_repost: true,
                parent_id: masterPost.id,
                uploaded_at: new Date().toISOString()
              }]).select();

              if (!secError && secInserted?.[0]) {
                triggerMetadataFetch(secInserted[0].id, secUrl, item.platform);
              }
            }
          }
        }
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
