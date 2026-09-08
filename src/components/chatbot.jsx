import { useState, useRef, useEffect } from "react";

/**
 * AASHA — AI-Assisted Scheme Help Agent (Yojanax floating chatbot widget).
 *
 * Self-contained: no new packages, no routing changes, no global CSS.
 * All styling is scoped via the "yjx-chatbot" class prefix and an
 * inline <style> tag so it cannot collide with the existing design
 * system in index.css. The logo is a hand-drawn inline SVG (no image
 * asset / no icon package dependency).
 *
 * Responses are simple local mock logic only — no AI API, no backend
 * calls, and no claims about specific ministries, official
 * partnerships, funding amounts, or guaranteed eligibility outcomes.
 */

const QUICK_QUESTIONS = [
  "What is PMMY?",
  "How does eligibility work?",
  "Find a nearby partner",
  "Help with education schemes",
  "Estimate my EMI",
  "What is Yojanax?",
];

function getBotResponse(rawText) {
  const text = rawText.toLowerCase();

  if (text.includes("pmmy") || text.includes("mudra")) {
    return "PMMY (Pradhan Mantri Mudra Yojana) provides loans for eligible micro and small businesses. Exact loan amounts and terms depend on the specific scheme details.";
  }
  if (text.includes("education") || text.includes("scholarship") || text.includes("student")) {
    return "Yojanax can help you explore education-related schemes, such as scholarships and coaching support programs. Browse the Schemes section to see what's available.";
  }
  if (text.includes("eligibility") || text.includes("eligible") || text.includes("qualify")) {
    return "Eligibility depends on scheme-specific criteria such as income, category, project or course details, and other conditions set by each scheme. Always check the specific scheme's requirements before applying.";
  }
  if (text.includes("partner")) {
    return "You can use \"Find Nearby Partners\" to locate available partner locations near you.";
  }
  if (text.includes("calculator") || text.includes("emi") || text.includes("loan amount")) {
    return "The calculator can help you estimate financing or EMI figures based on the numbers you enter.";
  }
  if (text.includes("housing") || text.includes("house") || text.includes("awas")) {
    return "Yojanax lists housing-related schemes that may offer support for construction or purchase. Check the Schemes section for the specific criteria of each one.";
  }
  if (text.includes("health") || text.includes("hospital") || text.includes("ayushman")) {
    return "Yojanax includes health-related schemes covering areas like hospitalization support. Details and coverage vary by scheme, so please check each one individually.";
  }
  if (text.includes("startup") || text.includes("business") || text.includes("entrepreneur")) {
    return "There are several schemes aimed at supporting entrepreneurs and small businesses. You can browse them in the Schemes section to compare what each one offers.";
  }
  if (text.includes("women")) {
    return "Some schemes have provisions specifically for women applicants. Check individual scheme pages for the exact eligibility details.";
  }
  if (text.includes("document") || text.includes("apply") || text.includes("application")) {
    return "Required documents and the application process vary by scheme. The scheme's detail page is the best place to check the exact steps.";
  }
  if (text.includes("yojanax") || text.includes("about") || text.includes("what can you do") || text.includes("help")) {
    return "Yojanax helps you discover government schemes, understand eligibility basics, locate nearby partners, and estimate financing with the calculator. Ask me about any of these!";
  }
  return "I'm still learning. Try asking me about schemes, eligibility, education, partners, or the calculator.";
}

const INITIAL_MESSAGE = {
  id: "welcome",
  sender: "bot",
  text: "Hi! I'm AASHA, your AI-Assisted Scheme Help Agent. I can help you understand government schemes, eligibility requirements, and Yojanax features.",
};

let messageIdCounter = 0;
function nextId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

function AashaLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="url(#yjxLogoGrad)" stroke="#ffffff" strokeWidth="1.5" />
      <path
        d="M24 12L30.5 30H27.2L25.9 26.3H22.1L20.8 30H17.5L24 12ZM24 17.9L22.9 23.4H25.1L24 17.9Z"
        fill="#ffffff"
      />
      <path
        d="M34 14L35.2 17.1L38 18.3L35.2 19.5L34 22.6L32.8 19.5L30 18.3L32.8 17.1L34 14Z"
        fill="#ffd166"
      />
      <defs>
        <linearGradient id="yjxLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#155a8a" />
          <stop offset="1" stopColor="#0b2f4c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = { id: nextId(), sender: "user", text: trimmed };
    const botMessage = {
      id: nextId(),
      sender: "bot",
      text: getBotResponse(trimmed),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setShowQuickQuestions(false);
    setInputValue("");
  };

  const handleSend = () => {
    sendMessage(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  return (
    <div className="yjx-chatbot-root">
      <style>{`
        .yjx-chatbot-root {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-family: inherit;
        }

        .yjx-chatbot-toggle {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: linear-gradient(135deg, #155a8a, #0b2f4c);
          color: #ffffff;
          border: none;
          box-shadow: 0 8px 20px rgba(11, 47, 76, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .yjx-chatbot-toggle:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 26px rgba(11, 47, 76, 0.5);
        }

        .yjx-chatbot-toggle:active {
          transform: translateY(-1px) scale(0.98);
        }

        .yjx-chatbot-panel {
          width: 400px;
          max-width: calc(100vw - 32px);
          height: 600px;
          max-height: calc(100vh - 110px);
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 48px rgba(11, 23, 42, 0.22);
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          animation: yjx-panel-in 0.2s ease-out;
        }

        @keyframes yjx-panel-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .yjx-chatbot-header {
          background: linear-gradient(135deg, #155a8a, #0b2f4c);
          color: #ffffff;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .yjx-chatbot-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .yjx-chatbot-logo-badge {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .yjx-chatbot-header-text h3 {
          margin: 0;
          font-size: 15.5px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .yjx-chatbot-header-text p {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #cfe0ee;
        }

        .yjx-chatbot-close {
          background: transparent;
          border: none;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 8px;
          opacity: 0.85;
          transition: background 0.15s ease, opacity 0.15s ease;
        }

        .yjx-chatbot-close:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.14);
        }

        .yjx-chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f5f8fb;
        }

        .yjx-chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .yjx-chatbot-messages::-webkit-scrollbar-thumb {
          background: #c7d3e0;
          border-radius: 999px;
        }

        .yjx-chatbot-row {
          display: flex;
          width: 100%;
          animation: yjx-msg-in 0.15s ease-out;
        }

        @keyframes yjx-msg-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .yjx-chatbot-row.bot {
          justify-content: flex-start;
        }

        .yjx-chatbot-row.user {
          justify-content: flex-end;
        }

        .yjx-chatbot-bubble {
          max-width: 80%;
          padding: 10px 13px;
          border-radius: 14px;
          font-size: 13.8px;
          line-height: 1.45;
          word-wrap: break-word;
        }

        .yjx-chatbot-bubble.bot {
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #e6ebf1;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .yjx-chatbot-bubble.user {
          background: linear-gradient(135deg, #155a8a, #0b2f4c);
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }

        .yjx-chatbot-quick-questions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 2px;
        }

        .yjx-chatbot-quick-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0b2f4c;
          font-size: 12.5px;
          font-weight: 500;
          padding: 7px 12px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
        }

        .yjx-chatbot-quick-btn:hover {
          background: #eaf1f8;
          border-color: #155a8a;
          transform: translateY(-1px);
        }

        .yjx-chatbot-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .yjx-chatbot-input {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13.8px;
          outline: none;
          color: #1e293b;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .yjx-chatbot-input:focus {
          border-color: #155a8a;
          box-shadow: 0 0 0 3px rgba(21, 90, 138, 0.12);
        }

        .yjx-chatbot-send-btn {
          background: linear-gradient(135deg, #155a8a, #0b2f4c);
          border: none;
          color: #ffffff;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          cursor: pointer;
          display: flex
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.1s ease, opacity 0.15s ease;
        }

        .yjx-chatbot-send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .yjx-chatbot-send-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .yjx-chatbot-root {
            bottom: 16px;
            right: 16px;
          }
          .yjx-chatbot-panel {
            width: calc(100vw - 24px);
            height: calc(100vh - 130px);
          }
        }
      `}</style>

      {isOpen && (
        <div className="yjx-chatbot-panel" ref={panelRef}>
          <div className="yjx-chatbot-header">
            <div className="yjx-chatbot-header-left">
              <div className="yjx-chatbot-logo-badge">
                <AashaLogo size={24} />
              </div>
              <div className="yjx-chatbot-header-text">
                <h3>AASHA | A YojanaX Initiative</h3>
                <p>AI-Assisted Scheme Help Agent</p>
              </div>
            </div>
            <button
              className="yjx-chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6L18 18M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="yjx-chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`yjx-chatbot-row ${msg.sender}`}>
                <div className={`yjx-chatbot-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {showQuickQuestions && (
              <div className="yjx-chatbot-quick-questions">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    className="yjx-chatbot-quick-btn"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="yjx-chatbot-input-row">
            <input
              type="text"
              className="yjx-chatbot-input"
              placeholder="Ask about schemes..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="yjx-chatbot-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 20L20 12L4 4V10L14 12L4 14V20Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        className="yjx-chatbot-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open AASHA chatbot"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6L18 18M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <AashaLogo size={32} />
        )}
      </button>
    </div>
  );
}