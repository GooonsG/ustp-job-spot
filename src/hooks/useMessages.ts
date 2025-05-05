
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { toast } from '@/hooks/use-toast';

export type Conversation = {
  id: string;
  conversationId: string;
  conversationType: 'job' | 'marketplace';
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  title: string;
  jobOrItemId: string;
};

export type Message = {
  id: string;
  senderId: string;
  senderEmail: string;
  message: string;
  createdAt: string;
  isSender: boolean;
};

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all conversations for the current user
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_messages', { p_user_id: user.id });

        if (error) throw error;

        if (data) {
          const formattedConversations = data.map((conv: any) => ({
            id: conv.id,
            conversationId: conv.conversation_id,
            conversationType: conv.conversation_type as 'job' | 'marketplace',
            otherUserId: conv.other_user_id,
            otherUserName: conv.other_user_name,
            lastMessage: conv.last_message,
            lastMessageTime: conv.last_message_time,
            unreadCount: conv.unread_count,
            title: conv.title,
            jobOrItemId: conv.job_or_item_id
          }));

          setConversations(formattedConversations);
        }
      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        setError('Failed to fetch your conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to realtime updates
    const channel = supabase.channel('messages-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketplace_messages'
      }, payload => {
        console.log('Marketplace message change received!', payload);
        fetchConversations();
        
        // If the message belongs to the current conversation, fetch new messages
        if (currentConversation && 
            currentConversation.conversationType === 'marketplace' && 
            payload.new && 
            typeof payload.new === 'object' && 
            'product_id' in payload.new && 
            payload.new.product_id === currentConversation.conversationId) {
          fetchMessages(currentConversation);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_messages'
      }, payload => {
        console.log('Job message change received!', payload);
        fetchConversations();
        
        // If the message belongs to the current conversation, fetch new messages
        if (currentConversation && 
            currentConversation.conversationType === 'job' && 
            payload.new && 
            typeof payload.new === 'object' && 
            'application_id' in payload.new && 
            payload.new.application_id === currentConversation.conversationId) {
          fetchMessages(currentConversation);
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversation]);

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversation: Conversation) => {
    if (!user) return;
    
    setCurrentConversation(conversation);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .rpc('get_conversation_messages', {
          p_user_id: user.id,
          p_conversation_id: conversation.conversationId,
          p_conversation_type: conversation.conversationType
        });

      if (error) throw error;

      if (data) {
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderEmail: msg.sender_email,
          message: msg.message,
          createdAt: msg.created_at,
          isSender: msg.is_sender
        }));

        setMessages(formattedMessages);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages for this conversation');
    } finally {
      setLoading(false);
    }
  };

  // Send a message in the current conversation
  const sendMessage = async (message: string) => {
    if (!user || !currentConversation) {
      toast({
        title: "Cannot send message",
        description: "Please select a conversation first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .rpc('send_message', {
          p_sender_id: user.id,
          p_conversation_id: currentConversation.conversationId,
          p_conversation_type: currentConversation.conversationType,
          p_message: message
        });

      if (error) throw error;

      // The message will be added via the realtime subscription
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast({
        title: "Failed to send message",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Start a new conversation (for marketplace items)
  const startMarketplaceConversation = async (itemId: string, sellerId: string, message: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive",
      });
      return;
    }

    try {
      // For marketplace items, create a conversation by sending the first message
      const { error } = await supabase
        .from('marketplace_messages')
        .insert({
          product_id: itemId,
          sender_id: user.id,
          receiver_id: sellerId,
          message: message
        });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
      
      // Fetch updated conversations
      const { data, error: fetchError } = await supabase
        .rpc('get_user_messages', { p_user_id: user.id });
        
      if (fetchError) throw fetchError;
      
      if (data) {
        const formattedConversations = data.map((conv: any) => ({
          id: conv.id,
          conversationId: conv.conversation_id,
          conversationType: conv.conversation_type as 'job' | 'marketplace',
          otherUserId: conv.other_user_id,
          otherUserName: conv.other_user_name,
          lastMessage: conv.last_message,
          lastMessageTime: conv.last_message_time,
          unreadCount: conv.unread_count,
          title: conv.title,
          jobOrItemId: conv.job_or_item_id
        }));

        setConversations(formattedConversations);
        
        // Find the newly created conversation
        const newConversation = formattedConversations.find(
          c => c.conversationType === 'marketplace' && c.jobOrItemId === itemId
        );
        
        if (newConversation) {
          fetchMessages(newConversation);
        }
      }
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      toast({
        title: "Failed to send message",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return { 
    conversations, 
    messages, 
    currentConversation,
    loading, 
    error, 
    fetchMessages, 
    sendMessage,
    startMarketplaceConversation
  };
}
