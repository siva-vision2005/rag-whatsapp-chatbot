type Conversation = {
    messages: string[];
};

const conversations = new Map<string, Conversation>();

export function addMessage(userId: string, message: string) {

    if (!conversations.has(userId)) {

        conversations.set(userId, {
            messages: [],
        });

    }

    const conversation = conversations.get(userId)!;

    conversation.messages.push(message);

    // Keep only last 10 messages
    if (conversation.messages.length > 10) {
        conversation.messages.shift();
    }

}

export function getConversation(userId: string): string {

    const conversation = conversations.get(userId);

    if (!conversation) {
        return "";
    }

    return conversation.messages.join("\n");

}

export function clearConversation(userId: string) {

    conversations.delete(userId);

}