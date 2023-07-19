import type { ChatRequest, FunctionCallHandler } from 'ai';
import { nanoid } from 'ai';
import { useChat } from 'ai/react';
import { useRef } from 'react';

import { ComponentWrapperPage } from '@/components/near-org/ComponentWrapperPage';
import { useBosComponents } from '@/hooks/useBosComponents';
import { useDefaultLayout, useSimpleLayout } from '@/hooks/useLayout';
import { useAuthStore } from '@/stores/auth';
import type { NextPageWithLayout } from '@/utils/types';

const ChatPage: NextPageWithLayout = () => {
  const components = useBosComponents();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const accountId = useAuthStore((store) => store.accountId);

  const functionCallHandler: FunctionCallHandler = async (chatMessages, functionCall) => {
    if (functionCall.name === 'submit-query') {
      if (functionCall.arguments) {
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);

        const { query, variables, network } = parsedFunctionCallArguments;

        const submitQuery = async (query: any, variables: any, network = 'testnet') => {
          try {
            const request = await fetch(`https://graph.mintbase.xyz/${network}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'mb-api-key': 'anon' },
              body: JSON.stringify({
                query,
                variables,
                network,
              }),
            });

            const res = await request.json();

            return { data: res, error: null };
          } catch (error) {
            return { data: null, error: error };
          }
        };

        const result = await submitQuery(query, variables, network);

        const functionResponse: ChatRequest = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'submit-query',
              role: 'function' as const,
              content: JSON.stringify({
                result: result.data,
              }),
            },
          ],
        };
        return functionResponse;
      }
    } else if (functionCall.name === 'generate-transaction') {
      if (functionCall.arguments) {
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);

        const { methodName, args, gas, deposit, signer, contractName } = parsedFunctionCallArguments;

        const functionResponse: ChatRequest = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'generate-transaction',
              role: 'function' as const,
              content: JSON.stringify({
                methodName,
                args,
                gas,
                deposit,
                signer,
                contractName,
              }),
            },
          ],
        };
        return functionResponse;
      }
    } else if (functionCall.name === 'generate-bos-widget') {
      if (functionCall.arguments) {
        const functionResponse: ChatRequest = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'generate-bos-widget',
              role: 'function' as const,
              content: functionCall.arguments,
            },
          ],
        };
        return functionResponse;
      }
    } else if (functionCall.name === 'account-details') {
      if (functionCall.arguments) {
        const functionResponse: ChatRequest = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'account-details',
              role: 'function' as const,
              content: JSON.stringify({
                accountId: accountId,
              }),
            },
          ],
        };
        return functionResponse;
      }
    }
  };

  const { messages, input, handleSubmit, append, isLoading } = useChat({
    api: '/api/chat-with-functions',
    experimental_onFunctionCall: functionCallHandler,
  });

  const onNewMessage = (newMessage: any) => {
    append(newMessage);
  };

  return (
    <div>
      <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'none' }}>
        <input ref={inputRef} value={input} type="text"></input>
      </form>

      <ComponentWrapperPage
        src={components.chatPage}
        componentProps={{
          messages: messages,
          onNewMessage: onNewMessage,
          isLoading: isLoading,
          renderTabs: true,
          renderInput: true,
        }}
        meta={{ title: 'Chat AI', description: 'Do anything on the BOS' }}
      />
    </div>
  );
};

ChatPage.getLayout = useDefaultLayout;

export default ChatPage;
