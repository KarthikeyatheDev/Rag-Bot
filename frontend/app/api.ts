declare const process: {
  env: {
    NEXT_PUBLIC_API_URL: string;
  };
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// const BASE_URL = "http://localhost:8000";
export async function fetchMessages(
  conversationId: number
) {

  const response = await fetch(
    `${BASE_URL}/messages/${conversationId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch messages"
    );
  }

  return response.json();
}

export async function fetchConversations() {
  const response = await fetch(
    `${BASE_URL}/conversations`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch conversations"
    );
  }
  return response.json();
}

export async function createConversation() {
  const response = await fetch(
    `${BASE_URL}/conversations`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create conversation"
    );
  }

  return response.json();
}

export async function sendMessage(
  conversationId: number,
  content: string
) {

  const response = await fetch(
    `${BASE_URL}/chat/${conversationId}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to send message"
    );
  }

  return response.json();
}
export async function uploadFile(
  conversationId: number,
  file: File
) {

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${BASE_URL}/upload/${conversationId}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to upload file"
    );
  }

  return response.json();
}

export async function deleteConversation(conversationId: number) {
  const response = await fetch(
    `${BASE_URL}/conversations/${conversationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete conversation"
    );
  }

  return response.json();
}