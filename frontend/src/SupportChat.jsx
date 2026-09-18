import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

// BOTH STUDENT AND TEACHER USE THE SAME CHAT
const SHARED_CHAT_ID = "wrench-wise-shared-chat";

function SupportChat({ role }) {
  const [supportOpen, setSupportOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // ============================================
  // FETCH SHARED MESSAGES
  // ============================================

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${API_URL}/support-messages/${SHARED_CHAT_ID}`
      );

      if (!response.ok) {
        console.error("Failed to fetch messages");
        return;
      }

      const data = await response.json();

      setMessages(data);
    } catch (error) {
      console.error("Support fetch error:", error);
    }
  };

  // ============================================
  // LOAD MESSAGES
  // ============================================

  useEffect(() => {
    fetchMessages();

    // Refresh messages every 2 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage = async (e) => {
    e.preventDefault();

    const cleanMessage = input.trim();

    if (!cleanMessage) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/support-messages`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            chatId: SHARED_CHAT_ID,

            // student or teacher
            role: role,

            // Who sent this message
            sender: role,

            message: cleanMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to send message");
        return;
      }

      setInput("");

      // Immediately refresh
      fetchMessages();
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  return (
    <>
      {/* ================= CHAT WINDOW ================= */}

      {supportOpen && (
        <div className="support-chat">

          {/* HEADER */}

          <div className="support-header">

            <div className="support-header-info">

              <div className="support-avatar">
                💬
              </div>

              <div>
                <h3>Wrench Wise Support</h3>

                <p>
                  <span className="online-dot"></span>
                  {role === "student"
                    ? "Student Support"
                    : "Teacher Support"}
                </p>
              </div>

            </div>

            <button
              type="button"
              className="support-close"
              onClick={() => setSupportOpen(false)}
            >
              ×
            </button>

          </div>


          {/* ================= MESSAGES ================= */}

          <div className="support-messages">

            {messages.length === 0 && (
              <div className="message support-message">
                Start a conversation 👋
              </div>
            )}

            {messages.map((msg) => {

              // Message sent by current page
              const isMyMessage =
                msg.sender === role;

              return (
                <div
                  key={msg._id}
                  className={
                    isMyMessage
                      ? "message user-message"
                      : "message support-message"
                  }
                >

                  {/* Show who sent it */}

                  <strong>
                    {msg.sender === "student"
                      ? "Student"
                      : "Teacher"}
                  </strong>

                  <br />

                  {msg.message}

                </div>
              );
            })}

          </div>


          {/* ================= INPUT ================= */}

          <form
            className="support-input-area"
            onSubmit={sendMessage}
          >

            <input
              type="text"
              placeholder={
                role === "student"
                  ? "Ask the teacher..."
                  : "Reply to student..."
              }
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
            />

            <button type="submit">
              ➤
            </button>

          </form>

        </div>
      )}


      {/* ================= FLOATING BUTTON ================= */}

      <button
        type="button"
        className="support-button"
        onClick={() =>
          setSupportOpen((previous) => !previous)
        }
      >

        {supportOpen ? "×" : "💬"}

        {!supportOpen && (
          <span className="support-button-text">
            Support
          </span>
        )}

      </button>
    </>
  );
}

export default SupportChat;