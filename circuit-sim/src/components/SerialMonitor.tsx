import React, { useEffect, useRef, useState } from "react";
import { Terminal, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface SerialMonitorProps {
  text: string;
  onClear?: () => void;
  height?: number;
  onSplitterMouseDown?: (e: React.MouseEvent) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SerialMonitor({
  text,
  onClear,
  height = 200,
  onSplitterMouseDown,
  isCollapsed = false,
  onToggleCollapse,
}: SerialMonitorProps) {
  const boxRef = useRef<HTMLPreElement | null>(null);
  const [localText, setLocalText] = useState("");

  useEffect(() => { setLocalText(text); }, [text]);
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [localText]);

  const lines = localText.split("\n").filter(Boolean);

  const handleClear = () => {
    setLocalText("");
    onClear?.();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: isCollapsed ? 36 : height,
        borderTop: "1px solid #1E293B",
        backgroundColor: "#09090b",
        fontFamily: "JetBrains Mono, monospace",
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
          padding: "4px 14px",
          borderBottom: "1px solid #1E293B",
          backgroundColor: "#0F172A",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#06B6D4" }}>
          <Terminal size={13} color="#06B6D4" /> Serial Monitor
          {lines.length > 0 && (
            <span style={{ backgroundColor: "#1E293B", color: "#94A3B8", fontSize: 10, padding: "1px 6px", borderRadius: 10 }}>
              {lines.length} lines
            </span>
          )}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleClear}
            title="Clear serial output"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
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
        <pre
          ref={boxRef}
          style={{
            flex: 1,
            overflowY: "auto",
            margin: 0,
            padding: "8px 14px",
            fontSize: 12,
            lineHeight: 1.7,
            color: "#10b981",
            backgroundColor: "#09090b",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {lines.length === 0 ? (
            <span style={{ color: "#334155", fontStyle: "italic" }}>
              {"// No output yet. Add Serial.begin(9600) and Serial.println() to your sketch, then click Run."}
            </span>
          ) : (
            lines.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span style={{ color: "#334155", minWidth: 30, textAlign: "right", userSelect: "none" }}>{i + 1}</span>
                <span style={{ color: line.toLowerCase().includes("error") ? "#ef4444" : "#10b981" }}>{line}</span>
              </div>
            ))
          )}
        </pre>
      )}
    </div>
  );
}