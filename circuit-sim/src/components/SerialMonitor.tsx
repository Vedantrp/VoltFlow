import React, { useEffect, useRef, useState } from "react";
import { Terminal, Trash2, ChevronDown, ChevronUp, Send, CornerDownLeft, ArrowDownCircle } from "lucide-react";

interface SerialMonitorProps {
  text: string;
  onClear?: () => void;
  onSendInput?: (input: string) => void;
  height?: number;
  onSplitterMouseDown?: (e: React.MouseEvent) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SerialMonitor({
  text,
  onClear,
  onSendInput,
  height = 220,
  onSplitterMouseDown,
  isCollapsed = false,
  onToggleCollapse,
}: SerialMonitorProps) {
  const boxRef = useRef<HTMLPreElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localText, setLocalText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [lineEnding, setLineEnding] = useState<"nl" | "cr" | "both" | "none">("nl");
  const [baudRate, setBaudRate] = useState<string>("9600");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  useEffect(() => {
    if (autoScroll && boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [localText, autoScroll]);

  const lines = localText.split("\n").filter(Boolean);

  const handleClear = () => {
    setLocalText("");
    onClear?.();
  };

  const handleSend = () => {
    if (!inputValue) return;
    let textToSend = inputValue;
    if (lineEnding === "nl") textToSend += "\n";
    else if (lineEnding === "cr") textToSend += "\r";
    else if (lineEnding === "both") textToSend += "\r\n";

    // Call external callback to feed into simulation CPU
    onSendInput?.(textToSend);

    // Also display user sent input in local terminal log with distinct cyan user styling
    const formattedSentLog = `> ${inputValue}\n`;
    setLocalText((prev) => prev + formattedSentLog);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: isCollapsed ? 36 : height,
        borderTop: "1px solid #1E293B",
        backgroundColor: "#09090b",
        fontFamily: "JetBrains Mono, Monaco, Consolas, monospace",
        position: "relative",
        userSelect: "none",
        transition: "height 0.05s ease-out",
      }}
    >
      {/* Interactive Splitter Resizer Bar inside Code Window */}
      <div
        onMouseDown={onSplitterMouseDown}
        style={{
          height: 8,
          backgroundColor: "#1e293b",
          cursor: "ns-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid #334155",
          borderBottom: "1px solid #0f172a",
        }}
        title="Drag up or down to resize Serial Monitor height inside code area"
      >
        <div style={{ width: 36, height: 2, backgroundColor: "#64748b", borderRadius: 2 }} />
      </div>

      {/* Serial Monitor Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 10px",
          borderBottom: "1px solid #1E293B",
          backgroundColor: "#0F172A",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#06B6D4" }}>
            <Terminal size={14} color="#06B6D4" /> Serial Monitor
          </span>
          {lines.length > 0 && (
            <span style={{ backgroundColor: "#1E293B", color: "#94A3B8", fontSize: 10, padding: "1px 6px", borderRadius: 10 }}>
              {lines.length} lines
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Baud Rate Selector */}
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(e.target.value)}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 4,
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              color: "#38bdf8",
              outline: "none",
              cursor: "pointer",
            }}
            title="Baud Rate (Speed)"
          >
            <option value="9600">9600 baud</option>
            <option value="19200">19200 baud</option>
            <option value="38400">38400 baud</option>
            <option value="57600">57600 baud</option>
            <option value="115200">115200 baud</option>
          </select>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll((prev) => !prev)}
            title={autoScroll ? "Auto-scroll Enabled" : "Auto-scroll Disabled"}
            style={{
              background: autoScroll ? "rgba(6, 182, 212, 0.15)" : "none",
              border: autoScroll ? "1px solid #0891b2" : "1px solid transparent",
              borderRadius: 4,
              cursor: "pointer",
              color: autoScroll ? "#38bdf8" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              padding: "2px 6px",
            }}
          >
            <ArrowDownCircle size={11} /> Scroll
          </button>

          {/* Clear Log */}
          <button
            onClick={handleClear}
            title="Clear serial output"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              padding: "2px 4px",
            }}
          >
            <Trash2 size={12} /> Clear
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Serial Monitor" : "Collapse Serial Monitor"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                padding: 2,
              }}
            >
              {isCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Log Output Body */}
      {!isCollapsed && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <pre
            ref={boxRef}
            style={{
              flex: 1,
              overflowY: "auto",
              margin: 0,
              padding: "8px 12px",
              fontSize: 12,
              lineHeight: 1.6,
              color: "#10b981",
              backgroundColor: "#09090b",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {lines.length === 0 ? (
              <span style={{ color: "#334155", fontStyle: "italic" }}>
                {"// Serial output window ready. Send input below or run sketch with Serial.println()."}
              </span>
            ) : (
              lines.map((line, i) => {
                const isUserInput = line.startsWith("> ");
                const isError = line.toLowerCase().includes("error") || line.toLowerCase().includes("failed");
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <span style={{ color: "#334155", minWidth: 26, textAlign: "right", userSelect: "none", fontSize: 11 }}>{i + 1}</span>
                    <span
                      style={{
                        color: isUserInput ? "#38bdf8" : isError ? "#ef4444" : "#10b981",
                        fontWeight: isUserInput ? 700 : 400,
                      }}
                    >
                      {line}
                    </span>
                  </div>
                );
              })
            )}
          </pre>

          {/* Serial Input Sending Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 8px",
              backgroundColor: "#111827",
              borderTop: "1px solid #1f2937",
            }}
          >
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type data to send to Serial..."
                style={{
                  width: "100%",
                  backgroundColor: "#030712",
                  color: "#f9fafb",
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, Monaco, monospace",
                  padding: "5px 10px",
                  paddingRight: 28,
                  borderRadius: 6,
                  border: "1px solid #374151",
                  outline: "none",
                }}
              />
              <CornerDownLeft size={13} color="#4b5563" style={{ position: "absolute", right: 8, pointerEvents: "none" }} />
            </div>

            {/* Line Ending Dropdown Selector */}
            <select
              value={lineEnding}
              onChange={(e) => setLineEnding(e.target.value as "nl" | "cr" | "both" | "none")}
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "5px 6px",
                borderRadius: 6,
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                color: "#9ca3af",
                outline: "none",
                cursor: "pointer",
              }}
              title="Line Ending Character"
            >
              <option value="nl">Newline (\n)</option>
              <option value="cr">Carriage Return (\r)</option>
              <option value="both">Both NL & CR (\r\n)</option>
              <option value="none">No line ending</option>
            </select>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 10px",
                borderRadius: 6,
                backgroundColor: inputValue.trim() ? "#2563eb" : "#1f2937",
                border: "none",
                color: inputValue.trim() ? "#ffffff" : "#4b5563",
                cursor: inputValue.trim() ? "pointer" : "not-allowed",
                transition: "all 0.15s ease",
              }}
            >
              <Send size={12} /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}