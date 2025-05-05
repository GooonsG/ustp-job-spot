
import { useState } from 'react';
import { Conversation } from '@/hooks/useMessages';

type ViewType = 'item' | 'user';

export function useMessagesView(conversations: Conversation[]) {
  const [viewType, setViewType] = useState<ViewType>('item');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Get unique users from all conversations
  const uniqueUsers = conversations.reduce<{id: string, name: string}[]>((acc, conv) => {
    if (!acc.some(u => u.id === conv.otherUserId)) {
      acc.push({
        id: conv.otherUserId,
        name: conv.otherUserName
      });
    }
    return acc;
  }, []);
  
  // Filter conversations based on current view
  const filteredConversations = viewType === 'user' && selectedUserId 
    ? conversations.filter(conv => conv.otherUserId === selectedUserId)
    : conversations;
  
  // Group conversations by user when in user view
  const groupedByUser = uniqueUsers.map(user => {
    const userConversations = conversations.filter(conv => conv.otherUserId === user.id);
    const totalUnread = userConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const lastMessageTime = userConversations.length > 0 
      ? userConversations.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        )[0].lastMessageTime
      : '';
      
    return {
      userId: user.id,
      userName: user.name,
      conversations: userConversations,
      unreadCount: totalUnread,
      lastMessageTime
    };
  }).sort((a, b) => {
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });
  
  return {
    viewType,
    setViewType,
    filteredConversations,
    groupedByUser,
    uniqueUsers,
    selectedUserId,
    setSelectedUserId
  };
}
