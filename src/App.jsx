import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lrmhkcqqylcfrxzpdeox.supabase.co";
const SUPABASE_KEY = "sb_publishable_wAZJ7sJ0Yoq5MWon9LvvZQ_MdJCNPQf";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcValor(entrada, saida, config) {
  const diffMs = saida - entrada;
  const diffMin = diffMs / 1000 / 60;
  if (config.carencia > 0 && diffMin <= config.carencia) return 0;
  if (config.modo === "bloco") {
    const horas = Math.ceil(diffMin / 60);
    return horas * config.valorHora;
  } else {
    if (diffMin <= 60) return config.valorHora;
    const extra = ((diffMin - 60) / 60) * config.valorHora;
    return config.valorHora + extra;
  }
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function formatTime(date) { return new Date(date).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}); }
function formatDate(date) { return new Date(date).toLocaleDateString("pt-BR"); }
function formatCurrency(val) { return Number(val).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

// ─── Icons ───────────────────────────────────────────────────────────────────

const Icon = {
  Car: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>),
  Plus: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{width:20,height:20}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  History: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 7 7 7"/></svg>),
  Settings: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:20,height:20}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
  Parking: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>),
  LogOut: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><polyline points="20 6 9 17 4 12"/></svg>),
  Eye: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>),
  EyeOff: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>),
};

// ─── CSS ─────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080b12; --surface: #0e1220; --surface2: #151929; --surface3: #1c2138;
    --border: #1e2540; --border2: #252d48;
    --accent: #4f8ef7; --accent2: #7b5ea7; --accent-dim: rgba(79,142,247,0.12);
    --green: #34d399; --green-dim: rgba(52,211,153,0.1);
    --red: #f87171; --red-dim: rgba(248,113,113,0.1);
    --yellow: #fbbf24; --yellow-dim: rgba(251,191,36,0.12);
    --text: #e2e8f8; --text2: #a8b4d0; --muted: #4a5578;
    --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--sans); }

  /* ── LOGIN ── */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; position: relative; overflow: hidden;
  }
  .login-bg {
    position: fixed; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 30% 20%, rgba(79,142,247,0.12) 0%, transparent 55%),
                radial-gradient(ellipse at 70% 80%, rgba(123,94,167,0.1) 0%, transparent 50%);
  }
  .login-card {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 28px; padding: 40px 32px; width: 100%; max-width: 400px;
    position: relative;
  }
  .login-logo {
    width: 56px; height: 56px; margin: 0 auto 20px;
    background: linear-gradient(135deg, #4f8ef7 0%, #7b5ea7 100%);
    border-radius: 18px; display: flex; align-items: center; justify-content: center;
    color: white; box-shadow: 0 6px 24px rgba(79,142,247,0.4);
  }
  .login-title { text-align: center; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
  .login-sub { text-align: center; font-size: 14px; color: var(--muted); margin-bottom: 32px; }
  .login-form-group { margin-bottom: 16px; }
  .login-label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 8px; }
  .login-input-wrap { position: relative; }
  .login-input {
    width: 100%; background: var(--surface2); border: 1px solid var(--border2);
    border-radius: 14px; color: var(--text); font-family: var(--sans); font-size: 15px;
    padding: 13px 16px; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .login-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
  .login-input::placeholder { color: var(--muted); }
  .login-input.has-toggle { padding-right: 48px; }
  .login-eye {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px;
    display: flex; align-items: center;
  }
  .login-eye:hover { color: var(--text2); }
  .login-btn {
    width: 100%; margin-top: 8px; border: none; border-radius: 16px; padding: 15px;
    font-size: 15px; font-weight: 700; font-family: var(--sans); cursor: pointer;
    background: linear-gradient(135deg, #4f8ef7 0%, #7b5ea7 100%);
    color: white; box-shadow: 0 4px 16px rgba(79,142,247,0.3);
    transition: all 0.18s; letter-spacing: 0.1px;
  }
  .login-btn:hover:not(:disabled) { box-shadow: 0 6px 22px rgba(79,142,247,0.45); transform: translateY(-1px); }
  .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .login-error {
    background: var(--red-dim); border: 1px solid rgba(248,113,113,0.25);
    border-radius: 12px; color: var(--red); font-size: 13px; font-weight: 500;
    padding: 11px 16px; margin-bottom: 16px; text-align: center;
  }

  /* ── APP ── */
  .app { max-width: 430px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

  .header { padding: 24px 20px 0; position: relative; overflow: hidden; }
  .header-inner { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
  .header-glow { position: absolute; top: -40px; left: -20px; width: 200px; height: 120px; background: radial-gradient(ellipse, rgba(79,142,247,0.18) 0%, transparent 70%); pointer-events: none; }
  .header-icon { width: 46px; height: 46px; background: linear-gradient(135deg, #4f8ef7 0%, #7b5ea7 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 16px rgba(79,142,247,0.35); flex-shrink: 0; }
  .header-text h1 { font-size: 19px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(90deg, #e2e8f8, #a8b4d0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .header-text p { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .header-logout { margin-left: auto; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; color: var(--muted); cursor: pointer; padding: 8px 10px; display: flex; align-items: center; gap: 6px; font-size: 12px; font-family: var(--sans); font-weight: 600; transition: all 0.15s; }
  .header-logout:hover { color: var(--red); border-color: rgba(248,113,113,0.3); }

  .tabs { display: flex; padding: 18px 20px 0; gap: 2px; margin-bottom: 22px; position: relative; }
  .tabs::after { content: ''; position: absolute; bottom: 0; left: 20px; right: 20px; height: 1px; background: var(--border); }
  .tab { flex: 1; background: none; border: none; color: var(--muted); font-size: 12px; font-family: var(--sans); font-weight: 600; padding: 8px 4px 13px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; border-bottom: 2px solid transparent; transition: all 0.2s; letter-spacing: 0.2px; position: relative; z-index: 1; }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab:hover:not(.active) { color: var(--text2); }

  .content { flex: 1; padding: 0 16px 110px; overflow-y: auto; }

  .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 22px; }
  .stat { border-radius: 16px; padding: 14px 10px; text-align: center; position: relative; overflow: hidden; border: 1px solid var(--border); }
  .stat::before { content: ''; position: absolute; inset: 0; background: var(--surface); }
  .stat-inner { position: relative; z-index: 1; }
  .stat-value { font-size: 26px; font-weight: 800; font-family: var(--mono); line-height: 1; }
  .stat-label { font-size: 10px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600; }
  .stat.total { border-color: rgba(79,142,247,0.25); }
  .stat.total::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%,rgba(79,142,247,0.08) 0%,transparent 70%); pointer-events:none; }
  .stat.total .stat-value { color: var(--accent); }
  .stat.ocupado { border-color: rgba(248,113,113,0.2); }
  .stat.ocupado::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%,rgba(248,113,113,0.07) 0%,transparent 70%); pointer-events:none; }
  .stat.ocupado .stat-value { color: var(--red); }
  .stat.livre { border-color: rgba(52,211,153,0.2); }
  .stat.livre::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%,rgba(52,211,153,0.07) 0%,transparent 70%); pointer-events:none; }
  .stat.livre .stat-value { color: var(--green); }

  .section-title { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-left: 2px; }

  .car-list { display: flex; flex-direction: column; gap: 10px; }
  .car-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 15px 16px; display: flex; align-items: center; gap: 13px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
  .car-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, var(--accent), var(--accent2)); border-radius: 3px 0 0 3px; opacity: 0; transition: opacity 0.2s; }
  .car-card:hover { border-color: var(--border2); background: var(--surface2); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
  .car-card:hover::before { opacity: 1; }
  .car-icon { width: 40px; height: 40px; background: linear-gradient(135deg,rgba(79,142,247,0.2),rgba(123,94,167,0.2)); border: 1px solid rgba(79,142,247,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0; }
  .car-info { flex: 1; min-width: 0; }
  .car-plate { font-family: var(--mono); font-size: 15px; font-weight: 600; letter-spacing: 1.5px; color: var(--text); }
  .car-model { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .car-meta { text-align: right; }
  .car-timer { font-family: var(--mono); font-size: 13px; font-weight: 600; color: var(--yellow); background: var(--yellow-dim); border: 1px solid rgba(251,191,36,0.2); border-radius: 6px; padding: 3px 7px; display: inline-block; }
  .car-since { font-size: 11px; color: var(--muted); margin-top: 5px; }

  .empty { text-align: center; padding: 56px 20px; color: var(--muted); }
  .empty-icon { font-size: 44px; margin-bottom: 14px; opacity: 0.25; display: block; }
  .empty p { font-size: 14px; }

  .fab { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg,#4f8ef7 0%,#7b5ea7 100%); color: white; border: none; border-radius: 20px; padding: 16px 32px; font-size: 15px; font-weight: 700; font-family: var(--sans); cursor: pointer; display: flex; align-items: center; gap: 9px; box-shadow: 0 6px 28px rgba(79,142,247,0.45),0 2px 8px rgba(0,0,0,0.4); transition: transform 0.2s,box-shadow 0.2s; z-index: 50; letter-spacing: 0.1px; white-space: nowrap; }
  .fab:hover { transform: translateX(-50%) translateY(-2px); box-shadow: 0 10px 36px rgba(79,142,247,0.55),0 4px 12px rgba(0,0,0,0.4); }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-bottom: none; border-radius: 28px 28px 0 0; width: 100%; max-width: 430px; padding: 12px 22px 44px; max-height: 92vh; overflow-y: auto; }
  .modal-handle { width: 36px; height: 4px; background: var(--border2); border-radius: 2px; margin: 0 auto 22px; }
  .modal-title { font-size: 20px; font-weight: 800; letter-spacing: -0.4px; margin-bottom: 22px; }

  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px; display: block; }
  .form-input { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 14px; color: var(--text); font-family: var(--sans); font-size: 16px; padding: 13px 16px; outline: none; transition: border-color 0.15s,box-shadow 0.15s; }
  .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
  .form-input::placeholder { color: var(--muted); }

  .btn { width: 100%; border: none; border-radius: 16px; padding: 15px; font-size: 15px; font-weight: 700; font-family: var(--sans); cursor: pointer; transition: all 0.18s; letter-spacing: 0.1px; }
  .btn-primary { background: linear-gradient(135deg,#4f8ef7 0%,#7b5ea7 100%); color: white; margin-top: 10px; box-shadow: 0 4px 16px rgba(79,142,247,0.3); }
  .btn-primary:hover:not(:disabled) { box-shadow: 0 6px 22px rgba(79,142,247,0.45); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-danger { background: linear-gradient(135deg,#ef4444 0%,#dc2626 100%); color: white; box-shadow: 0 4px 16px rgba(239,68,68,0.25); }
  .btn-danger:hover { box-shadow: 0 6px 22px rgba(239,68,68,0.4); transform: translateY(-1px); }
  .btn-ghost { background: var(--surface2); border: 1px solid var(--border2); color: var(--text2); margin-top: 10px; }
  .btn-ghost:hover { background: var(--surface3); color: var(--text); }

  .saida-info { background: var(--surface2); border: 1px solid var(--border); border-radius: 16px; padding: 4px 16px; margin-bottom: 16px; }
  .saida-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; }
  .saida-row + .saida-row { border-top: 1px solid var(--border); }
  .saida-key { font-size: 13px; color: var(--muted); }
  .saida-val { font-size: 13px; font-weight: 600; color: var(--text2); }
  .saida-val.mono { font-family: var(--mono); color: var(--text); }

  .total-value { text-align: center; padding: 24px; background: linear-gradient(135deg,rgba(52,211,153,0.08) 0%,rgba(52,211,153,0.04) 100%); border: 1px solid rgba(52,211,153,0.25); border-radius: 20px; margin-bottom: 16px; position: relative; overflow: hidden; }
  .total-value::before { content:''; position:absolute; top:-30px; left:50%; transform:translateX(-50%); width:120px; height:80px; background:radial-gradient(ellipse,rgba(52,211,153,0.15) 0%,transparent 70%); pointer-events:none; }
  .total-label { font-size: 11px; color: var(--green); text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 8px; position: relative; }
  .total-amount { font-family: var(--mono); font-size: 42px; font-weight: 700; color: var(--green); letter-spacing: -1px; position: relative; text-shadow: 0 0 40px rgba(52,211,153,0.3); }

  .hist-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-btn { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; color: var(--muted); font-family: var(--sans); font-size: 12px; font-weight: 600; padding: 7px 14px; cursor: pointer; transition: all 0.15s; }
  .filter-btn.active { background: var(--accent-dim); border-color: rgba(79,142,247,0.35); color: var(--accent); }

  .hist-summary { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 18px 20px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; }
  .hist-summary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(52,211,153,0.04) 0%,transparent 60%); }
  .hist-summary-label { font-size: 13px; color: var(--text2); font-weight: 500; position: relative; }
  .hist-summary-val { font-family: var(--mono); font-size: 24px; font-weight: 700; color: var(--green); position: relative; }
  .hist-summary-count { font-size: 12px; color: var(--muted); margin-top: 3px; position: relative; }

  .hist-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 15px 16px; margin-bottom: 8px; transition: border-color 0.15s; }
  .hist-card:hover { border-color: var(--border2); }
  .hist-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .hist-plate { font-family: var(--mono); font-size: 14px; font-weight: 600; letter-spacing: 1.2px; }
  .hist-price { font-family: var(--mono); font-size: 16px; font-weight: 700; color: var(--green); }
  .hist-model { font-size: 12px; color: var(--muted); margin-top: 3px; }
  .hist-divider { height: 1px; background: var(--border); margin-bottom: 10px; }
  .hist-times { display: flex; gap: 20px; }
  .hist-time { font-size: 11px; color: var(--muted); }
  .hist-time span { color: var(--text2); font-weight: 500; display: block; margin-top: 2px; font-size: 12px; }

  .settings-group { margin-bottom: 26px; }
  .settings-group-title { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; padding-left: 2px; }
  .settings-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; }
  .settings-row { display: flex; align-items: center; justify-content: space-between; padding: 15px 18px; gap: 12px; }
  .settings-row + .settings-row { border-top: 1px solid var(--border); }
  .settings-label { font-size: 14px; font-weight: 500; color: var(--text); }
  .settings-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .settings-input { background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; color: var(--text); font-family: var(--mono); font-size: 14px; font-weight: 600; padding: 8px 12px; width: 84px; text-align: right; outline: none; transition: border-color 0.15s; }
  .settings-input:focus { border-color: var(--accent); }

  .toggle-group { display: flex; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 3px; gap: 3px; }
  .toggle-opt { flex: 1; border: none; border-radius: 8px; font-family: var(--sans); font-size: 12px; font-weight: 700; padding: 7px 12px; cursor: pointer; color: var(--muted); background: transparent; transition: all 0.18s; white-space: nowrap; }
  .toggle-opt.active { background: linear-gradient(135deg,#4f8ef7 0%,#7b5ea7 100%); color: white; box-shadow: 0 2px 8px rgba(79,142,247,0.3); }

  .save-banner { background: var(--green-dim); border: 1px solid rgba(52,211,153,0.25); border-radius: 12px; color: var(--green); font-size: 13px; font-weight: 600; padding: 11px 16px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }

  .loading-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .loading-spin { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── Default config ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG = { totalVagas: 20, valorHora: 6, modo: "bloco", carencia: 0 };

// ─── Timer hook ───────────────────────────────────────────────────────────────

function useTimer() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(id); }, []);
  return tick;
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    if (!email || !senha) return;
    setLoading(true); setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) { setErro("E-mail ou senha incorretos."); setLoading(false); }
  }

  return (
    <>
      <style>{css}</style>
      <div className="login-wrap">
        <div className="login-bg" />
        <div className="login-card">
          <div className="login-logo"><Icon.Parking /></div>
          <h1 className="login-title">ParkManager</h1>
          <p className="login-sub">Entre com sua conta para continuar</p>
          {erro && <div className="login-error">{erro}</div>}
          <div className="login-form-group">
            <label className="login-label">E-mail</label>
            <input className="login-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          <div className="login-form-group">
            <label className="login-label">Senha</label>
            <div className="login-input-wrap">
              <input className="login-input has-toggle" type={showSenha ? "text" : "password"} placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              <button className="login-eye" onClick={() => setShowSenha(s => !s)}>{showSenha ? <Icon.EyeOff /> : <Icon.Eye />}</button>
            </div>
          </div>
          <button className="login-btn" onClick={handleLogin} disabled={loading || !email || !senha}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(undefined);
  const [tab, setTab] = useState("dashboard");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [ativos, setAtivos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [modalEntrada, setModalEntrada] = useState(false);
  const [modalSaida, setModalSaida] = useState(null);
  const [form, setForm] = useState({ placa: "", modelo: "" });
  const [histFiltro, setHistFiltro] = useState("hoje");
  const [savedConfig, setSavedConfig] = useState(false);

  useTimer();

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Load data when logged in
  useEffect(() => {
    if (!session) return;
    loadConfig();
    loadAtivos();
    loadHistorico();
  }, [session]);

  async function loadConfig() {
    const { data } = await supabase.from("configs").select("*").eq("id", session.user.id).single();
    if (data) setConfig({ totalVagas: data.total_vagas, valorHora: data.valor_hora, modo: data.modo, carencia: data.carencia });
  }

  async function loadAtivos() {
    const { data } = await supabase.from("ativos").select("*").order("entrada", { ascending: true });
    if (data) setAtivos(data.map(c => ({ ...c, entrada: new Date(c.entrada) })));
  }

  async function loadHistorico() {
    const { data } = await supabase.from("historico").select("*").order("saida", { ascending: false });
    if (data) setHistorico(data.map(r => ({ ...r, entrada: new Date(r.entrada), saida: new Date(r.saida) })));
  }

  async function saveConfig(newConfig) {
    const c = newConfig || config;
    await supabase.from("configs").upsert({ id: session.user.id, total_vagas: c.totalVagas, valor_hora: c.valorHora, modo: c.modo, carencia: c.carencia });
    setSavedConfig(true);
    setTimeout(() => setSavedConfig(false), 2000);
  }

  async function registrarEntrada() {
    if (!form.placa.trim()) return;
    const { data } = await supabase.from("ativos").insert({ user_id: session.user.id, placa: form.placa.trim().toUpperCase(), modelo: form.modelo.trim() || "Não informado", entrada: new Date().toISOString() }).select().single();
    if (data) setAtivos(prev => [...prev, { ...data, entrada: new Date(data.entrada) }]);
    setForm({ placa: "", modelo: "" });
    setModalEntrada(false);
  }

  async function registrarSaida(carro) {
    const saida = new Date();
    const valor = calcValor(carro.entrada, saida, config);
    await supabase.from("ativos").delete().eq("id", carro.id);
    const { data } = await supabase.from("historico").insert({ user_id: session.user.id, placa: carro.placa, modelo: carro.modelo, entrada: carro.entrada.toISOString(), saida: saida.toISOString(), valor }).select().single();
    setAtivos(prev => prev.filter(c => c.id !== carro.id));
    if (data) setHistorico(prev => [{ ...data, entrada: new Date(data.entrada), saida: new Date(data.saida) }, ...prev]);
    setModalSaida(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Loading
  if (session === undefined) return (
    <><style>{css}</style><div className="loading-wrap"><div className="loading-spin" /></div></>
  );

  // Not logged in
  if (!session) return <LoginScreen />;

  const now = new Date();
  const vagasOcupadas = ativos.length;
  const vagasLivres = Math.max(0, config.totalVagas - vagasOcupadas);

  const histFiltrado = historico.filter(r => {
    const d = r.saida;
    if (histFiltro === "hoje") return formatDate(d) === formatDate(now);
    if (histFiltro === "semana") return (now - d) / 1000 / 60 / 60 / 24 <= 7;
    if (histFiltro === "mes") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });
  const faturamento = histFiltrado.reduce((acc, r) => acc + Number(r.valor), 0);

  const saidaValor = modalSaida ? calcValor(modalSaida.entrada, new Date(), config) : 0;
  const saidaDuracao = modalSaida ? formatDuration(new Date() - modalSaida.entrada) : "";

  return (
    <>
      <style>{css}</style>
      <div className="app">

        <div className="header">
          <div className="header-glow" />
          <div className="header-inner">
            <div className="header-icon"><Icon.Parking /></div>
            <div className="header-text">
              <h1>ParkManager</h1>
              <p>{formatDate(now)} · {formatTime(now)}</p>
            </div>
            <button className="header-logout" onClick={handleLogout}>
              <Icon.LogOut /> Sair
            </button>
          </div>
        </div>

        <div className="tabs">
          {[{id:"dashboard",label:"Vagas",I:Icon.Parking},{id:"historico",label:"Histórico",I:Icon.History},{id:"config",label:"Config",I:Icon.Settings}].map(({id,label,I}) => (
            <button key={id} className={`tab ${tab===id?"active":""}`} onClick={() => setTab(id)}><I />{label}</button>
          ))}
        </div>

        <div className="content">

          {tab === "dashboard" && <>
            <div className="stats">
              <div className="stat total"><div className="stat-inner"><div className="stat-value">{config.totalVagas}</div><div className="stat-label">Total</div></div></div>
              <div className="stat ocupado"><div className="stat-inner"><div className="stat-value">{vagasOcupadas}</div><div className="stat-label">Ocupadas</div></div></div>
              <div className="stat livre"><div className="stat-inner"><div className="stat-value">{vagasLivres}</div><div className="stat-label">Livres</div></div></div>
            </div>
            <div className="section-title">Carros estacionados</div>
            {ativos.length === 0 ? (
              <div className="empty"><span className="empty-icon">🅿️</span><p>Nenhum carro estacionado</p></div>
            ) : (
              <div className="car-list">
                {ativos.map(c => (
                  <div key={c.id} className="car-card" onClick={() => setModalSaida(c)}>
                    <div className="car-icon"><Icon.Car /></div>
                    <div className="car-info"><div className="car-plate">{c.placa}</div><div className="car-model">{c.modelo}</div></div>
                    <div className="car-meta"><div className="car-timer">{formatDuration(new Date() - c.entrada)}</div><div className="car-since">desde {formatTime(c.entrada)}</div></div>
                  </div>
                ))}
              </div>
            )}
          </>}

          {tab === "historico" && <>
            <div className="hist-filters">
              {[{id:"hoje",label:"Hoje"},{id:"semana",label:"7 dias"},{id:"mes",label:"Este mês"},{id:"tudo",label:"Tudo"}].map(f => (
                <button key={f.id} className={`filter-btn ${histFiltro===f.id?"active":""}`} onClick={() => setHistFiltro(f.id)}>{f.label}</button>
              ))}
            </div>
            <div className="hist-summary">
              <div><div className="hist-summary-label">Faturamento</div><div className="hist-summary-count">{histFiltrado.length} atendimento{histFiltrado.length!==1?"s":""}</div></div>
              <div className="hist-summary-val">{formatCurrency(faturamento)}</div>
            </div>
            {histFiltrado.length === 0 ? (
              <div className="empty"><span className="empty-icon">📋</span><p>Nenhum registro neste período</p></div>
            ) : histFiltrado.map(r => (
              <div key={r.id} className="hist-card">
                <div className="hist-header"><div><div className="hist-plate">{r.placa}</div><div className="hist-model">{r.modelo}</div></div><div className="hist-price">{formatCurrency(r.valor)}</div></div>
                <div className="hist-divider" />
                <div className="hist-times"><div className="hist-time">Entrada <span>{formatTime(r.entrada)} · {formatDate(r.entrada)}</span></div><div className="hist-time">Saída <span>{formatTime(r.saida)}</span></div></div>
              </div>
            ))}
          </>}

          {tab === "config" && <>
            {savedConfig && <div className="save-banner"><Icon.Check /> Configurações salvas</div>}
            <div className="settings-group">
              <div className="settings-group-title">Estacionamento</div>
              <div className="settings-card">
                <div className="settings-row">
                  <div><div className="settings-label">Total de vagas</div></div>
                  <input type="number" className="settings-input" value={config.totalVagas} min={1} onChange={e => setConfig(c => ({...c, totalVagas: parseInt(e.target.value)||1}))} onBlur={() => saveConfig()} />
                </div>
              </div>
            </div>
            <div className="settings-group">
              <div className="settings-group-title">Cobrança</div>
              <div className="settings-card">
                <div className="settings-row">
                  <div><div className="settings-label">Valor por hora (R$)</div><div className="settings-sub">Qualquer fração = hora cheia</div></div>
                  <input type="number" className="settings-input" value={config.valorHora} min={0} step={0.5} onChange={e => setConfig(c => ({...c, valorHora: parseFloat(e.target.value)||0}))} onBlur={() => saveConfig()} />
                </div>
                <div className="settings-row">
                  <div><div className="settings-label">Modo de cobrança</div></div>
                  <div className="toggle-group">
                    <button className={`toggle-opt ${config.modo==="bloco"?"active":""}`} onClick={() => { const nc={...config,modo:"bloco"}; setConfig(nc); saveConfig(nc); }}>Bloco</button>
                    <button className={`toggle-opt ${config.modo==="minuto"?"active":""}`} onClick={() => { const nc={...config,modo:"minuto"}; setConfig(nc); saveConfig(nc); }}>Minuto</button>
                  </div>
                </div>
                <div className="settings-row">
                  <div><div className="settings-label">Carência (minutos)</div><div className="settings-sub">0 = sem carência</div></div>
                  <input type="number" className="settings-input" value={config.carencia} min={0} onChange={e => setConfig(c => ({...c, carencia: parseInt(e.target.value)||0}))} onBlur={() => saveConfig()} />
                </div>
              </div>
            </div>
          </>}
        </div>

        {tab === "dashboard" && (
          <button className="fab" onClick={() => setModalEntrada(true)}><Icon.Plus /> Registrar entrada</button>
        )}

        {modalEntrada && (
          <div className="overlay" onClick={() => setModalEntrada(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-title">Registrar entrada</div>
              <div className="form-group"><label className="form-label">Placa do veículo</label><input className="form-input" placeholder="ABC-1234" value={form.placa} onChange={e => setForm(f => ({...f, placa: e.target.value.toUpperCase()}))} maxLength={8} autoFocus /></div>
              <div className="form-group"><label className="form-label">Modelo</label><input className="form-input" placeholder="Ex: Fiat Uno" value={form.modelo} onChange={e => setForm(f => ({...f, modelo: e.target.value}))} /></div>
              <button className="btn btn-primary" onClick={registrarEntrada} disabled={!form.placa.trim()}>✓ Confirmar entrada</button>
              <button className="btn btn-ghost" onClick={() => setModalEntrada(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {modalSaida && (
          <div className="overlay" onClick={() => setModalSaida(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-title">Registrar saída</div>
              <div className="total-value"><div className="total-label">Valor a cobrar</div><div className="total-amount">{formatCurrency(saidaValor)}</div></div>
              <div className="saida-info">
                <div className="saida-row"><span className="saida-key">Placa</span><span className="saida-val mono">{modalSaida.placa}</span></div>
                <div className="saida-row"><span className="saida-key">Modelo</span><span className="saida-val">{modalSaida.modelo}</span></div>
                <div className="saida-row"><span className="saida-key">Entrada</span><span className="saida-val">{formatTime(modalSaida.entrada)}</span></div>
                <div className="saida-row"><span className="saida-key">Tempo total</span><span className="saida-val mono">{saidaDuracao}</span></div>
                <div className="saida-row"><span className="saida-key">Modo</span><span className="saida-val">{config.modo==="bloco"?"Por hora/fração":"Por minuto"}</span></div>
              </div>
              <button className="btn btn-danger" onClick={() => registrarSaida(modalSaida)}>Confirmar saída e cobrar</button>
              <button className="btn btn-ghost" onClick={() => setModalSaida(null)}>Voltar</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
