import { useTheme } from "@/hook/ThemeContext";
import React, { useCallback, useEffect, useMemo } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  ConversationHeader,
  MessageGroup,
} from "@chatscope/chat-ui-kit-react";

import { Message as MessageEntity, useChatroom } from "@/hook/useChatroom";
import useSessionUser from "@/hook/useSessionUser";

type NewChatWindowProps = {
  visible: boolean;
  chatUser: string;
  messages: MessageEntity[];
  chatroomId: string;
};

const NewChatWindow: React.FC<NewChatWindowProps> = ({
  visible,
  chatUser,
  chatroomId,
}) => {
  const opacity = "opacity-100";
  const zIndex = "z-20";
  const { isDarkMode } = useTheme();
  const chatTheme = isDarkMode ? "dark-chat" : "";
  const { sessionUser } = useSessionUser();
  const { messages } = useChatroom(chatroomId, sessionUser.id);

  //   const handleChange = (value: string) => {
  //     // Send typing indicator to the active conversation
  //     // You can call this method on each onChange event
  //     // because sendTyping method can throttle sending this event
  //     // So typing event will not be send to often to the server
  //     setCurrentMessage(value);
  //   };

  //   const handleSend = (text: string) => {
  //     const message = new ChatMessage({
  //       id: "", // Id will be generated by storage generator, so here you can pass an empty string
  //       content: text as unknown as MessageContent<TextContent>,
  //       contentType: MessageContentType.TextHtml,
  //       senderId: chatUser,
  //       direction: MessageDirection.Outgoing,
  //       status: MessageStatus.Sent,
  //     });

  //     if (activeConversation) {
  //       sendMessage({
  //         message,
  //         conversationId: activeConversation.id,
  //         senderId: chatUser,
  //       });
  //       console.log("conversations", conversations);
  //     }
  //   };

  if (!visible) {
    return <></>;
  }

  return (
    <div className={`chatWindow ${zIndex} ${opacity} ${chatTheme}`}>
      <div style={{ position: "relative", height: "500px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList>
              {messages.map((message) => (
                <Message
                  model={{
                    message: message.content,
                    sender: message.id,
                    direction: 1,
                    position: 1,
                  }}
                />
              ))}
            </MessageList>
            <MessageInput
              //   onChange={handleChange}
              placeholder="Type message here"
            />
          </ChatContainer>
        </MainContainer>
      </div>
      ;
    </div>
  );
};
export default NewChatWindow;