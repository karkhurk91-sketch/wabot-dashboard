import React, { Suspense } from 'react';
import { ChatProvider } from '../context/ChatContext';
import ErrorBoundary from '../components/Common/ErrorBoundary';

const ChatShell = React.lazy(() => import('../components/chat/ChatShell'));

const Conversations = () => (
  <ErrorBoundary>
    <ChatProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-300">Loading chat...</div>}>
        <ChatShell />
      </Suspense>
    </ChatProvider>
  </ErrorBoundary>
);

export default Conversations;
