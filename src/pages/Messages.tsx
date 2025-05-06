
import { useState, useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useMessagesView } from '@/hooks/useMessagesView';
import { useAuth } from '@/context/AuthProvider';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, format } from 'date-fns';
import { Send, User, MessageSquare, ShoppingBag, Briefcase, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    messages, 
    currentConversation, 
    loading, 
    fetchMessages, 
    sendMessage 
  } = useMessages();
  
  const {
    viewType,
    setViewType,
    filteredConversations,
    groupedByUser,
    uniqueUsers,
    selectedUserId,
    setSelectedUserId
  } = useMessagesView(conversations);
  
  const [newMessage, setNewMessage] = useState('');
  const [showMobileConversations, setShowMobileConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto focus on input when conversation changes
  useEffect(() => {
    if (currentConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentConversation]);

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Format timestamp for messages
  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return format(date, 'h:mm a');
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch (error) {
      return '';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };

  // Handle user selection in user view
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    
    // If user has conversations, select the most recent one
    const userConvs = conversations.filter(c => c.otherUserId === userId);
    if (userConvs.length > 0) {
      // Sort by date (newest first) and select the first one
      const sortedConvs = [...userConvs].sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
      fetchMessages(sortedConvs[0]);
      
      // Hide mobile conversations sidebar after selection on small screens
      setShowMobileConversations(false);
    }
  };

  // Function to get the conversation icon
  const getConversationIcon = (type: 'job' | 'marketplace') => {
    return type === 'job' ? 
      <Briefcase className="h-4 w-4 text-blue-500" /> : 
      <ShoppingBag className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-0 md:px-4 py-4 h-[calc(100vh-8rem)]">
          <div className="flex items-center justify-between mb-4 px-4">
            <h1 className="text-2xl font-bold text-ustp-darkblue">Messages</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setShowMobileConversations(!showMobileConversations)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 h-full">
            {/* Conversations List - Mobile */}
            <AnimatePresence>
              {showMobileConversations && (
                <motion.div 
                  className="fixed inset-0 z-50 bg-white md:hidden"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold">Conversations</h2>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowMobileConversations(false)}
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <ConversationsList 
                    viewType={viewType}
                    setViewType={setViewType}
                    filteredConversations={filteredConversations}
                    groupedByUser={groupedByUser}
                    currentConversation={currentConversation}
                    selectedUserId={selectedUserId}
                    loading={loading}
                    conversations={conversations}
                    fetchMessages={fetchMessages}
                    handleUserSelect={handleUserSelect}
                    formatRelativeTime={formatRelativeTime}
                    getConversationIcon={getConversationIcon}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Conversations List - Desktop */}
            <div className="hidden md:block md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <ConversationsList 
                viewType={viewType}
                setViewType={setViewType}
                filteredConversations={filteredConversations}
                groupedByUser={groupedByUser}
                currentConversation={currentConversation}
                selectedUserId={selectedUserId}
                loading={loading}
                conversations={conversations}
                fetchMessages={fetchMessages}
                handleUserSelect={handleUserSelect}
                formatRelativeTime={formatRelativeTime}
                getConversationIcon={getConversationIcon}
              />
            </div>
            
            {/* Message Thread */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full">
              {currentConversation ? (
                <>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{currentConversation.otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-semibold text-lg">{currentConversation.otherUserName}</h2>
                          <p className="text-sm text-gray-600 flex items-center">
                            {getConversationIcon(currentConversation.conversationType)}
                            <span className="ml-1">
                              {currentConversation.conversationType === 'job' ? 'Job: ' : 'Item: '}
                              {currentConversation.title}
                            </span>
                          </p>
                        </div>
                      </div>
                      {currentConversation.conversationType === 'job' && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/jobs?id=${currentConversation.jobOrItemId}`}>View Job</a>
                        </Button>
                      )}
                      {currentConversation.conversationType === 'marketplace' && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/marketplace?item=${currentConversation.jobOrItemId}`}>View Item</a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-grow overflow-auto p-4 bg-gray-50">
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <Skeleton className={`h-12 w-2/3 rounded-lg ${i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'}`} />
                          </div>
                        ))}
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-3">
                        {messages.map((message, index) => {
                          const showAvatar = index === 0 || 
                            (messages[index - 1] && messages[index - 1].senderId !== message.senderId);
                          
                          return (
                            <motion.div 
                              key={message.id} 
                              className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {!message.isSender && showAvatar && (
                                <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                                  <AvatarFallback>{message.senderEmail.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                              )}
                              {!message.isSender && !showAvatar && (
                                <div className="w-8 mr-2" />
                              )}
                              <div 
                                className={`max-w-[80%] p-3 ${
                                  message.isSender 
                                    ? 'bg-ustp-blue text-white rounded-t-lg rounded-bl-lg' 
                                    : 'bg-gray-200 text-gray-800 rounded-t-lg rounded-br-lg'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                                <div className={`text-xs mt-1 text-right ${message.isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {formatMessageTime(message.createdAt)}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                          <p className="mt-2">No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-full bg-gray-100 border-0 focus-visible:ring-1 focus-visible:ring-ustp-blue px-4"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (newMessage.trim()) {
                              handleSendMessage(e);
                            }
                          }
                        }}
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim()} 
                        className="rounded-full bg-ustp-blue hover:bg-ustp-darkblue"
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500 p-8">
                    <User className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a conversation from the list or start a new one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

// Extracted component for conversations list to avoid duplication
const ConversationsList = ({
  viewType,
  setViewType,
  filteredConversations,
  groupedByUser,
  currentConversation,
  selectedUserId,
  loading,
  conversations,
  fetchMessages,
  handleUserSelect,
  formatRelativeTime,
  getConversationIcon
}) => {
  return (
    <>
      <div className="p-3 border-b">
        <Tabs defaultValue={viewType} onValueChange={(value) => setViewType(value as 'item' | 'user')}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="item">By Item/Job</TabsTrigger>
            <TabsTrigger value="user">By User</TabsTrigger>
          </TabsList>

          <TabsContent value="item" className="m-0 mt-2">
            <div className="overflow-hidden">
              <AnimatePresence>
                {filteredConversations.map((conversation) => (
                  <motion.div 
                    key={conversation.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      currentConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => fetchMessages(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>{conversation.otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm truncate flex items-center">
                            {conversation.otherUserName}
                            {conversation.unreadCount > 0 && (
                              <Badge className="ml-2 bg-ustp-blue">{conversation.unreadCount}</Badge>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-0.5">{conversation.lastMessage}</p>
                        <div className="mt-1 flex items-center">
                          {getConversationIcon(conversation.conversationType)}
                          <Badge variant="outline" className="text-xs ml-1">
                            {conversation.title}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
          
          <TabsContent value="user" className="m-0 mt-2">
            <div>
              <AnimatePresence>
                {groupedByUser.map((userGroup) => (
                  <motion.div 
                    key={userGroup.userId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedUserId === userGroup.userId ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleUserSelect(userGroup.userId)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>{userGroup.userName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm truncate flex items-center">
                            {userGroup.userName}
                            {userGroup.unreadCount > 0 && (
                              <Badge className="ml-2 bg-ustp-blue">{userGroup.unreadCount}</Badge>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {userGroup.lastMessageTime && formatRelativeTime(userGroup.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {userGroup.conversations.length} conversation{userGroup.conversations.length !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {userGroup.conversations.slice(0, 2).map(conv => (
                            <div key={conv.id} className="flex items-center">
                              {getConversationIcon(conv.conversationType)}
                              <span className="text-xs ml-1 truncate max-w-[80px]">{conv.title}</span>
                            </div>
                          ))}
                          {userGroup.conversations.length > 2 && (
                            <span className="text-xs text-gray-500">+{userGroup.conversations.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="h-full overflow-auto">
        {loading && conversations.length === 0 ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any messages yet.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Messages;
