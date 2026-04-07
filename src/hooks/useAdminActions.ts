import React, { useState } from 'react';
import { supabase, UserRole, UserProfile, Campaign } from '../supabase';
import { useToast } from './useToast';

export function useAdminActions(refresh: () => Promise<void>, currentUser: UserProfile | { id: string } | null) {
  const { success, error: toastError } = useToast();

  // Modal & Form States
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isTwitchModalOpen, setIsTwitchModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({ 
    name: '', 
    description: '', 
    client_id: '',
    twitter_url: '', 
    contact_info: '', 
    budget: 0,
    slug: '',
    notes: '',
    assigned_creator_ids: [] as string[]
  });

  const [newUser, setNewUser] = useState<{ email: string; role: UserRole; linked_campaign_id?: string }>({ 
    email: '', 
    role: 'creator' 
  });

  const [newPayment, setNewPayment] = useState({ 
    creator_id: '', 
    guest_name: '', 
    amount: '', 
    currency: 'USDT', 
    concept: '', 
    campaign_id: '', 
    paid_at: new Date().toISOString().split('T')[0] 
  });

  const [twitchStats, setTwitchStats] = useState<Record<string, unknown> | null>(null);
  const [twitchPreview, setTwitchPreview] = useState<string | null>(null);

  // Campaign Handlers
  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta campaña?')) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) {
      toastError("Error al eliminar campaña: " + error.message);
    } else {
      success("Campaña eliminada");
      refresh();
    }
  };

  const generateSecureSlug = (name: string) => {
    const base = name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${base}-${randomSuffix}`;
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = newCampaign.slug || generateSecureSlug(newCampaign.name);
    
    const { data: campData, error } = await supabase.from('campaigns').insert([{ 
      name: newCampaign.name,
      description: newCampaign.description,
      client_id: newCampaign.client_id || null,
      twitter_url: newCampaign.twitter_url || null,
      contact_info: newCampaign.contact_info || null,
      budget: newCampaign.budget || 0,
      slug: finalSlug,
      notes: newCampaign.notes || null,
      status: 'active', 
      created_by: currentUser?.id 
    }]).select();

    if (error) {
      toastError("Error al crear campaña: " + error.message);
    } else if (campData && campData[0]) {
      // Save creator assignments
      const creatorIds = (newCampaign as any).assigned_creator_ids || [];
      if (creatorIds.length > 0) {
        const assignments = creatorIds.map((cid: string) => ({
          campaign_id: campData[0].id,
          creator_id: cid
        }));
        await supabase.from('campaign_creators').insert(assignments);
      }

      success("Campaña creada con éxito");
      setIsCreatingCampaign(false);
      setNewCampaign({ name: '', description: '', client_id: '', twitter_url: '', contact_info: '', budget: 0, slug: '', notes: '', assigned_creator_ids: [] });
      refresh();
    }
  };

  const handleEditCampaign = async (campaign: Campaign) => {
    setEditingCampaignId(campaign.id);
    
    // Fetch current assignments
    const { data: assignments } = await supabase
      .from('campaign_creators')
      .select('creator_id')
      .eq('campaign_id', campaign.id);
    
    const assignedIds = assignments?.map(a => a.creator_id) || [];

    setNewCampaign({
      name: campaign.name,
      description: campaign.description || '',
      client_id: campaign.client_id || '',
      twitter_url: campaign.twitter_url || '',
      contact_info: campaign.contact_info || '',
      budget: campaign.budget || 0,
      slug: campaign.slug || '',
      notes: campaign.notes || '',
      assigned_creator_ids: assignedIds as any
    });
    setIsEditingCampaign(true);
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaignId) return;

    const { error } = await supabase
      .from('campaigns')
      .update({ 
        name: newCampaign.name,
        description: newCampaign.description,
        client_id: newCampaign.client_id || null,
        twitter_url: newCampaign.twitter_url || null,
        contact_info: newCampaign.contact_info || null,
        budget: newCampaign.budget || 0,
        slug: newCampaign.slug || null,
        notes: newCampaign.notes || null
      })
      .eq('id', editingCampaignId);

    if (error) {
      toastError("Error al actualizar campaña: " + error.message);
    } else {
      // Update creator assignments: Delete old, add new
      await supabase.from('campaign_creators').delete().eq('campaign_id', editingCampaignId);
      
      const creatorIds = (newCampaign as any).assigned_creator_ids || [];
      if (creatorIds.length > 0) {
        const assignments = creatorIds.map((cid: string) => ({
          campaign_id: editingCampaignId,
          creator_id: cid
        }));
        await supabase.from('campaign_creators').insert(assignments);
      }

      success("Campaña actualizada con éxito");
      setIsEditingCampaign(false);
      setEditingCampaignId(null);
      setNewCampaign({ name: '', description: '', client_id: '', twitter_url: '', contact_info: '', budget: 0, slug: '', notes: '', assigned_creator_ids: [] });
      refresh();
    }
  };

  // User Handlers
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: newUser.email,
          role: newUser.role,
          display_name: newUser.email.split('@')[0]
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al crear usuario en el servidor');
      }

      success("Usuario añadido con éxito");

      if (newUser.role === 'client' && newUser.linked_campaign_id && data.user?.id) {
        await supabase.from('campaigns').update({ client_id: data.user.id }).eq('id', newUser.linked_campaign_id);
      }

      if (newUser.role === 'client') {
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            to: [newUser.email, 'cabscryptocontacto@gmail.com'],
            subject: '🎁 Invitación a Umbra Creator Hub',
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f3f4f6; border-radius: 20px;">
              <h2 style="color: #4f46e5; margin-bottom: 20px;">¡Bienvenido a Umbra!</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.5;">Has sido invitado como <strong>Cliente</strong> para colaborar y ver las métricas de tu campaña en tiempo real.</p>
              <div style="margin: 30px 0;">
                <a href="${window.location.origin}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Acceder a mi panel</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Inicia sesión usando Google con tu correo asociado a esta cuenta (${newUser.email}).</p>
              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">El equipo de Umbra</p>
            </div>`
          })
        });
        if (emailRes.ok) success("Invitación enviada por correo");
      }

      setIsAddingUser(false);
      setNewUser({ email: '', role: 'creator' });
      refresh();
    } catch (err: any) {
      toastError("Error al añadir usuario: " + err.message);
    }
  };

  const handleUpdateUserRole = async (managingUser: UserProfile | null, newRole: UserRole, setManagingUser: (u: UserProfile | null) => void) => {
    if (!managingUser) return;
    const { data: updatedData, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', managingUser.id)
      .select();
    
    if (error || !updatedData?.length) {
      toastError("Error al actualizar rol: Permisos insuficientes (RLS).");
    } else {
      success("Rol actualizado correctamente");
      setManagingUser({ ...managingUser, role: newRole });
      refresh();
    }
  };

  const handleRemoveUser = async (managingUser: UserProfile | null, setManagingUser: (u: UserProfile | null) => void, setDeletedUserIds: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (!managingUser) return;
    const confirmMsg = `¿Estás seguro de que quieres eliminar a ${managingUser.display_name || managingUser.email}? Esta acción también eliminará todo su contenido vinculado.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await supabase.from('content').delete().eq('creator_id', managingUser.id);
      const { error: campaignError } = await supabase.from('campaigns').delete().eq('created_by', managingUser.id);
      
      if (campaignError && currentUser?.id) {
        await supabase.from('campaigns').update({ created_by: currentUser.id }).eq('created_by', managingUser.id);
      }

      const { error: userError } = await supabase.from('users').delete().eq('id', managingUser.id);
      if (userError) throw userError;
      
      setDeletedUserIds((prev) => [...prev, managingUser.id]);
      success("Miembro eliminado correctamente");
      setManagingUser(null);
      await refresh();
    } catch (err: any) {
      toastError("Error al eliminar: " + (err.message || "Verifica dependencias."));
    }
  };

  const handleSaveTwitch = async () => {
    if (!twitchStats) return;
    const { error } = await supabase.from('content').insert([{
      platform: 'twitch',
      url: 'https://twitch.tv/' + (twitchStats.title || 'stream'),
      title: twitchStats.title,
      views: twitchStats.views,
      peek_viewers: twitchStats.peek_viewers,
      thumbnail: twitchPreview,
      uploaded_at: new Date().toISOString(),
      creator_id: currentUser?.id || ''
    }]);
    if (error) {
       toastError("Error al guardar estadísticas de Twitch: " + error.message);
    } else {
      success("Estadísticas de Twitch guardadas");
      setIsTwitchModalOpen(false);
    }
  };
  
  const handleUpdateUserPayment = async (userId: string, data: Partial<UserProfile>) => {
    const { error } = await supabase
      .from('users')
      .update({
        payment_method: data.payment_method,
        binance_id: data.binance_id,
        wallet_address: data.wallet_address,
        wallet_network: data.wallet_network
      })
      .eq('id', userId);
      
    if (error) {
      toastError("Error al actualizar información de pago: " + error.message);
      return false;
    } else {
      success("Información de pago actualizada");
      refresh();
      return true;
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const isGuest = newPayment.creator_id === 'guest';
    
    if (isGuest && !newPayment.guest_name.trim()) {
      toastError('Debes ingresar el nombre del o la invitada');
      return;
    }

    const { error } = await supabase.from('payments').insert([{
      creator_id: isGuest ? null : newPayment.creator_id,
      guest_name: isGuest ? newPayment.guest_name.trim() : null,
      amount: parseFloat(newPayment.amount),
      currency: newPayment.currency,
      concept: newPayment.concept,
      campaign_id: newPayment.campaign_id || null,
      paid_at: newPayment.paid_at
    }]);

    if (error) {
      toastError("Error al registrar pago: " + error.message);
    } else {
      success("Pago registrado correctamente");
      setIsAddingPayment(false);
      setNewPayment({ 
        creator_id: '', 
        guest_name: '', 
        amount: '', 
        currency: 'USDT', 
        concept: '', 
        campaign_id: '', 
        paid_at: new Date().toISOString().split('T')[0] 
      });
      refresh();
    }
  };

  return {
    // States
    isCreatingCampaign, setIsCreatingCampaign,
    isEditingCampaign, setIsEditingCampaign,
    setEditingCampaignId,
    isAddingUser, setIsAddingUser,
    isTwitchModalOpen, setIsTwitchModalOpen,
    isContentModalOpen, setIsContentModalOpen,
    isAddingPayment, setIsAddingPayment,
    newCampaign, setNewCampaign,
    newUser, setNewUser,
    newPayment, setNewPayment,
    twitchStats, setTwitchStats,
    twitchPreview, setTwitchPreview,
    
    // Handlers
    handleDeleteCampaign,
    handleCreateCampaign,
    handleEditCampaign,
    handleUpdateCampaign,
    handleAddUser,
    handleUpdateUserRole,
    handleRemoveUser,
    handleSaveTwitch,
    handleUpdateUserPayment,
    handleCreatePayment
  };
}
