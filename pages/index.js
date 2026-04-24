import { useState, useEffect, useCallback } from "react";

const POLYGON_KEY = process.env.POLYGON_API_KEY || "siPcDO0kzxGCqpxEzu1aDnxap_leAYy4";

const TICKERS = [
  { symbol: "IREN",  name: "Iris Energy",            group: "Tech"   },
  { symbol: "STX",   name: "Seagate",                group: "Tech"   },
  { symbol: "CVX",   name: "Chevron",                group: "Energy" },
  { symbol: "WMT",   name: "Walmart",                group: "Retail" },
  { symbol: "PLTR",  name: "Palantir",               group: "Tech"   },
  { symbol: "WQTM",  name: "WisdomTree Quantum",     group: "ETF"    },
  { symbol: "ARKK",  name: "ARK Innovation",         group: "ETF"    },
  { symbol: "TMGT",  name: "T. Rowe Price Tech",     group: "ETF"    },
  { symbol: "ARKG",  name: "ARK Genomic Revolution", group: "ETF"    },
  { symbol: "CHAT",  name: "Roundhill Gen AI",       group: "ETF"    },
  { symbol: "LLY",   name: "Eli Lilly",              group: "Pharma" },
  { symbol: "NVO",   name: "Novo Nordisk",           group: "Pharma" },
  { symbol: "AZN",   name: "AstraZeneca",            group: "Pharma" },
  { symbol: "AMGN",  name: "Amgen",                  group: "Pharma" },
  { symbol: "SNY",   name: "Sanofi",                 group: "Pharma" },
  { symbol: "PFE",   name: "Pfizer",                 group: "Pharma" },
  { symbol: "TEVA",  name: "Teva",                   group: "Pharma" },
  { symbol: "VKTX",  name: "Viking Therapeutics",    group: "Pharma" },
];

const GROUP_COLORS = {
  Tech:   "#38bdf8",
  Energy: "#fb923c",
  Retail: "#a78bfa",
  ETF:    "#34d399",
  Pharma: "#f472b6",
};

async function fetchQuote(symbol) {
  try {
    const res = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_KEY}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "OK" || !data.results?.[0]) return null;
    
    const result = data.results[0];
    const close = result.c;
    const open = result.o;
    const high = result.h;
    const low = result.l;
    const change = open ? ((close - open) / open) * 100 : null;
    
    return { price: close, change, high, low, open };
  } catch {
    return null;
  }
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
      {[80, 50].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? "24px" : "14px",
          width: `${w}%`,
          background: "#1e293b",
          borderRadius: "4px",
          animation: "pulse 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  );
}

function Card({ ticker, data, loading }) {
  const color  = GROUP_COLORS[ticker.group] || "#94a3b8";
  const chg    = data?.change ?? null;
  const chgCol = chg === null ? "#475569" : chg >= 0 ? "#4ade80" : "#f87171";

  return (
    <div style={{
      background: "#0d1526",
      border: "1px solid #1e293b",
      borderTop: `2px solid ${color}`,
      borderRadius: "10px",
      padding: "14px 15px",
      transition: "border-top-color 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.borderTopColor = color + "cc"}
      onMouseLeave={e => e.currentTarget.style.borderTopColor = color}
    >
      <div style={{ display: "flex"
