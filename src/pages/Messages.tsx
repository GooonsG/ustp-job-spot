
import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
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
import { formatDistanceToNow } from 'date-fns';
import { Send, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [newMessage, setNewMessage] = useState('');

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-ustp-lightgray">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-ustp-darkblue mb-6">Messages</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Conversations</h2>
              </div>
              
              <ScrollArea className="h-[calc(80vh-10rem)]">
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
                ) : conversations.length > 0 ? (
                  <div>
                    {conversations.map((conversation) => (
                      <div 
                        key={conversation.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                          currentConversation?.id === conversation.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => fetchMessages(conversation)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{conversation.otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-sm truncate">
                                {conversation.otherUserName}
                                {conversation.unreadCount > 0 && (
                                  <Badge className="ml-2 bg-blue-500">{conversation.unreadCount}</Badge>
                                )}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(conversation.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {conversation.conversationType === 'job' ? 'Job' : 'Marketplace'}: {conversation.title}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any messages yet.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Message Thread */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[80vh]">
              {currentConversation ? (
                <>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-lg">{currentConversation.otherUserName}</h2>
                        <p className="text-sm text-gray-600">
                          {currentConversation.conversationType === 'job' ? 'Job Application: ' : 'Item: '}
                          {currentConversation.title}
                        </p>
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
                  
                  <ScrollArea className="flex-grow p-4">
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <Skeleton className={`h-12 w-2/3 rounded-lg ${i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'}`} />
                          </div>
                        ))}
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                          >
                            {!message.isSender && (
                              <Avatar className="h-8 w-8 mr-2 mt-1">
                                <AvatarFallback>{message.senderEmail.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            )}
                            <div 
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.isSender 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <div className={`text-xs mt-1 ${message.isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatRelativeTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500 p-8">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
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

export default Messages;
