import { Content } from '../supabase';

export interface DeliverableTargets {
  video_largo: number;
  video_corto: number;
  stream: number;
  game_night: number;
  post: number;
}

export function parseCampaignDeliverables(description: string | null | undefined): {
  cleanDescription: string;
  targets: DeliverableTargets;
} {
  const defaultTargets: DeliverableTargets = {
    video_largo: 0,
    video_corto: 0,
    stream: 0,
    game_night: 0,
    post: 0
  };

  if (!description) {
    return { cleanDescription: '', targets: defaultTargets };
  }

  const marker = '[deliverables]:';
  const index = description.indexOf(marker);
  if (index === -1) {
    return { cleanDescription: description, targets: defaultTargets };
  }

  const cleanDescription = description.substring(0, index).trim();
  const jsonStr = description.substring(index + marker.length).trim();
  try {
    const parsed = JSON.parse(jsonStr);
    const targets: DeliverableTargets = {
      video_largo: Number(parsed.video_largo) || 0,
      video_corto: Number(parsed.video_corto) || 0,
      stream: Number(parsed.stream) || 0,
      game_night: Number(parsed.game_night) || 0,
      post: Number(parsed.post) || 0
    };
    return { cleanDescription, targets };
  } catch (e) {
    return { cleanDescription: description, targets: defaultTargets };
  }
}

export function serializeCampaignDeliverables(description: string, targets: DeliverableTargets): string {
  // Strip any existing deliverables block first
  const cleanDescription = description.replace(/\[deliverables\]:.*$/s, '').trim();
  const jsonStr = JSON.stringify(targets);
  return `${cleanDescription}\n\n[deliverables]: ${jsonStr}`;
}

export function getDeliverableStats(contentItems: Content[], targets: DeliverableTargets) {
  const completed: DeliverableTargets = {
    video_largo: 0,
    video_corto: 0,
    stream: 0,
    game_night: 0,
    post: 0
  };

  contentItems.forEach(item => {
    // Only count active content and non-reposts
    if (item.status === 'archived' || item.is_repost) return;

    // Use content_type if explicitly set
    if (item.content_type === 'video_largo') {
      completed.video_largo++;
    } else if (item.content_type === 'video_corto') {
      completed.video_corto++;
    } else {
      const platform = item.platform?.toLowerCase();
      // Classify based on platform and characteristics
      if (platform === 'twitch') {
        completed.stream++;
      } else if (platform === 'discord') {
        completed.game_night++;
      } else if (platform === 'youtube') {
        // If it's on youtube and not explicitly marked, assume video_largo
        completed.video_largo++;
      } else if (platform === 'tiktok' || platform === 'instagram_story') {
        completed.video_corto++;
      } else if (platform === 'instagram') {
        // Instagram can be posts/carousel or video_corto (Reels).
        completed.post++;
      } else {
        completed.post++;
      }
    }
  });

  return { completed, targets };
}

export function aggregateContentItems(filteredItems: Content[], allItems: Content[]): Content[] {
  const allGroups = new Map<string, Content[]>();
  allItems.forEach(item => {
    const groupId = item.parent_id || item.id;
    if (!allGroups.has(groupId)) {
      allGroups.set(groupId, []);
    }
    allGroups.get(groupId)!.push(item);
  });

  const matchedGroupIds = new Set<string>();
  filteredItems.forEach(item => {
    const groupId = item.parent_id || item.id;
    matchedGroupIds.add(groupId);
  });

  const result: Content[] = [];
  
  matchedGroupIds.forEach(groupId => {
    const groupMembers = allGroups.get(groupId) || [];
    const filteredGroupMembers = groupMembers.filter(m => filteredItems.some(f => f.id === m.id));
    if (filteredGroupMembers.length === 0) return;
    
    const masterInFiltered = filteredGroupMembers.find(m => m.id === groupId);
    const representative = masterInFiltered || filteredGroupMembers[0];
    
    const totalViews = groupMembers.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = groupMembers.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalComments = groupMembers.reduce((acc, curr) => acc + (curr.comments || 0), 0);
    const totalUniqueViewers = groupMembers.reduce((acc, curr) => acc + (curr.unique_viewers || 0), 0);
    const totalPeekViewers = groupMembers.reduce((acc, curr) => acc + (curr.peek_viewers || 0), 0);
    const totalSharesCount = groupMembers.reduce((acc, curr) => acc + (curr.shares_count || 0), 0);
    const totalFollowers = groupMembers.reduce((acc, curr) => acc + (curr.followers || 0), 0);
    const totalNewSubscriptions = groupMembers.reduce((acc, curr) => acc + (curr.new_subscriptions || 0), 0);
    
    const allPlatforms = groupMembers.map(m => m.platform);
    const uniqueGroupPlatforms = [...new Set(allPlatforms)];

    result.push({
      ...representative,
      is_repost: false,
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      unique_viewers: totalUniqueViewers,
      peek_viewers: totalPeekViewers,
      shares_count: totalSharesCount,
      followers: totalFollowers,
      new_subscriptions: totalNewSubscriptions,
      coupledPlatforms: uniqueGroupPlatforms,
      coupledPosts: groupMembers
    } as any);
  });

  return result.sort((a, b) => (b.views || 0) - (a.views || 0));
}
