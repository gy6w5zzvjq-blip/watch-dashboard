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
    const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${POLYGON_KEY}`);
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
        <div key={i} style={{ height: i === 0 ? "24px" : "14px", width: `${w}%`, background: "#1e293b", borderRadius: "4px", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function Card({ ticker, data, loading }) {
  const color = GROUP_COLORS[ticker.group] || "#94a3b8";
  const chg = data?.change ?? null;
  const chgCol = chg === null ? "#475569" : chg >= 0 ? "#4ade80" : "#f87171";
  return (
    <div style={{ background: "#0d1526", border: "1px solid #1e293b", borderTop: `2px solid ${color}`, borderRadius: "10px", padding: "14px 15px", transition: "border-top-color 0.2s", cursor: "default" }} onMouseEnter={e => e.currentTarget.style.borderTopColor = color + "cc"} onMouseLeave={e => e.currentTarget.style.borderTopColor = color}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color, fontWeight: 600, letterSpacing: "0.05em" }}>{ticker.symbol}</div>
          <div style={{ fontSize: "10px", color: "#475569", marginTop: "1px", lineHeight: 1.3 }}>{ticker.name}</div>
        </div>
        <span style={{ fontSize: "8px", fontFamily: "'DM Mono', monospace", background: color + "18", color, padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.05em" }}>{ticker.group.toUpperCase()}</span>
      </div>
      {loading ? <Skeleton /> : (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", color: "#f1f5f9", fontWeight: 700, letterSpacing: "-0.02em" }}>{data?.price != null ? `$${data.price.toFixed(2)}` : "—"}</div>
          <div style={{ marginTop: "4px" }}><span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: chgCol }}>{chg !== null ? `${chg >= 0 ? "▲" : "▼"} ${Math.abs(chg).toFixed(2)}%` : "—"}</span></div>
          {data?.high != null && data?.low != null && (<div style={{ marginTop: "6px", display: "flex", gap: "8px" }}><span style={{ fontSize: "9px", color: "#1e3a5f", fontFamily: "'DM Mono', monospace" }}>H ${data.high.toFixed(2)}</span><span style={{ fontSize: "9px", color: "#1e3a5f", fontFamily: "'DM Mono', monospace" }}>L ${data.low.toFixed(2)}</span></div>)}
        </div>
      )}
    </div>
  );
}

export default function StockTracker() {
  const [quotes, setQuotes] = useState({});
  const [priceLoading, setPL] = useState(true);
  const [lastUpdated, setLU] = useState(null);
  const [activeGroup, setAG] = useState("All");

  const loadPrices = useCallback(async () => {
    setPL(true);
    const results = await Promise.all(TICKERS.map(t => fetchQuote(t.symbol)));
    const map = {};
    TICKERS.forEach((t, i) => { map[t.symbol] = results[i]; });
    setQuotes(map);
    setPL(false);
    setLU(new Date());
  }, []);

  useEffect(() => { loadPrices(); }, [loadPrices]);

  const refresh = () => { loadPrices(); };
  const groups = ["All", "Tech", "Energy", "Retail", "ETF", "Pharma"];
  const visible = activeGroup === "All" ? TICKERS : TICKERS.filter(t => t.group === activeGroup);
  const ranked = TICKERS.filter(t => quotes[t.symbol]?.change != null).sort((a, b) => (quotes[b.symbol]?.change ?? 0) - (quotes[a.symbol]?.change ?? 0));
  const gainers = ranked.slice(0, 3);
  const losers = [...ranked].reverse().slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: "#020817", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');@keyframes pulse{0%,100%{opacity:.3}50%{opacity:.7}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#020817}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}`}</style>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#020817f0", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e293b", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", fontWeight: 600, letterSpacing: "0.08em", color: "#38bdf8" }}>MARKET WATCH</div>
          <div style={{ fontSize: "10px", color: "#334155", fontFamily: "'DM Mono', monospace", marginTop: "2px" }}>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : priceLoading ? "Loading..." : "—"}</div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={refresh} disabled={priceLoading} style={{ background: "transparent", border: "1px solid #1e293b", color: "#475569", padding: "7px 13px", borderRadius: "6px", cursor: priceLoading ? "not-allowed" : "pointer", fontFamily: "'DM Mono', monospace", fontSize: "12px", opacity: priceLoading ? 0.5 : 1, transition: "all 0.15s" }} onMouseEnter={e => { if (!priceLoading) { e.currentTarget.style.color = "#38bdf8"; e.currentTarget.style.borderColor = "#38bdf8"; }}} onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#1e293b"; }}>↻</button>
        </div>
      </div>
      <div style={{ padding: "20px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        {!priceLoading && ranked.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "#052e1660", border: "1px solid #166534", borderRadius: "8px", padding: "12px 16px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "#4ade80", letterSpacing: "0.12em", marginBottom: "10px" }}>▲ TOP GAINERS</div>
              {gainers.map(t => (<div key={t.symbol} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}><span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>{t.symbol}</span><span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#4ade80", fontWeight: 600 }}>+{quotes[t.symbol]?.change?.toFixed(2)}%</span></div>))}
            </div>
            <div style={{ background: "#2d0a0a60", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "12px 16px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "#f87171", letterSpacing: "0.12em", marginBottom: "10px" }}>▼ TOP LOSERS</div>
              {losers.map(t => (<div key={t.symbol} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}><span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#94a3b8" }}>{t.symbol}</span><span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#f87171", fontWeight: 600 }}>{quotes[t.symbol]?.change?.toFixed(2)}%</span></div>))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
          {groups.map(g => { const active = activeGroup === g; const col = GROUP_COLORS[g] || "#38bdf8"; return (<button key={g} onClick={() => setAG(g)} style={{ background: active ? col + "20" : "transparent", border: `1px solid ${active ? col : "#1e293b"}`, color: active ? col : "#475569", padding: "5px 13px", borderRadius: "20px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.07em", transition: "all 0.15s" }}>{g.toUpperCase()}</button>); })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(162px, 1fr))", gap: "10px", marginBottom: "28px" }}>
          {visible.map(t => (<Card key={t.symbol} ticker={t} data={quotes[t.symbol]} loading={priceLoading} />))}
        </div>
        <div style={{ marginTop: "20px", textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "#1e293b" }}>VIRTUALIS LIVE · PRICES: POLYGON.IO · NOT FINANCIAL ADVICE</div>
      </div>
    </div>
  );
}
