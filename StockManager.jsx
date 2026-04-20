import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ── CONFIG ──────────────────────────────────────────────────
const DEFAULT_SCRIPT_URL = "COLLER_VOTRE_URL_ICI";

// ── STYLES GLOBAUX ────────────────────────────────────────────
const G = {
  bg: "#0d0f1a",
  surface: "#141726",
  surfaceAlt: "#1c2035",
  border: "#252a42",
  accent: "#4f9eff",
  accentGlow: "rgba(79,158,255,0.15)",
  green: "#2dd4a0",
  greenGlow: "rgba(45,212,160,0.15)",
  red: "#ff6b8a",
  redGlow: "rgba(255,107,138,0.15)",
  yellow: "#ffc94d",
  text: "#e8eaf6",
  textMuted: "#7b82a8",
  font: "'DM Mono', 'Courier New', monospace",
  fontDisplay: "'Space Grotesk', sans-serif",
};

const css = (styles) => Object.entries(styles).map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`).join(";");

// ── API ───────────────────────────────────────────────────────
const api = async (scriptUrl, action, body = {}) => {
  const res = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({ action, ...body }),
  });
  return res.json();
};

// ── COMPOSANTS UI ─────────────────────────────────────────────
const Badge = ({ children, color = G.accent }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontFamily: G.font, letterSpacing: 1 }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, variant = "primary", small, disabled }) => {
  const colors = {
    primary: { bg: G.accent, color: "#fff", border: G.accent },
    success: { bg: G.green, color: "#0d0f1a", border: G.green },
    danger: { bg: G.red, color: "#fff", border: G.red },
    ghost: { bg: "transparent", color: G.textMuted, border: G.border },
  };
  const c = colors[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: c.bg, color: c.color, border: `1px solid ${c.border}`,
        borderRadius: 6, padding: small ? "4px 12px" : "8px 18px",
        fontSize: small ? 12 : 13, fontFamily: G.font, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "all 0.2s", letterSpacing: 0.5,
      }}
    >
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, required }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 11, color: G.textMuted, fontFamily: G.font, marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" }}>{label}{required && " *"}</div>}
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", background: G.bg, border: `1px solid ${G.border}`, borderRadius: 6,
        color: G.text, padding: "9px 12px", fontFamily: G.font, fontSize: 13,
        outline: "none", boxSizing: "border-box",
      }}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 11, color: G.textMuted, fontFamily: G.font, marginBottom: 5, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>}
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", background: G.bg, border: `1px solid ${G.border}`, borderRadius: 6,
        color: G.text, padding: "9px 12px", fontFamily: G.font, fontSize: 13, outline: "none",
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 12, padding: 28, width: 480, maxHeight: "85vh", overflowY: "auto", boxShadow: `0 0 60px rgba(0,0,0,0.8)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: G.fontDisplay, fontSize: 18, color: G.text, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: G.textMuted, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>
);

const Stat = ({ label, value, sub, color = G.accent, icon }) => (
  <Card style={{ flex: 1, minWidth: 140 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 11, color: G.textMuted, fontFamily: G.font, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 28, fontFamily: G.fontDisplay, color, fontWeight: 700 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: G.textMuted, marginTop: 4, fontFamily: G.font }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 28, opacity: 0.4 }}>{icon}</div>
    </div>
  </Card>
);

// ── APP PRINCIPALE ────────────────────────────────────────────
export default function App() {
  const [scriptUrl, setScriptUrl] = useState(() => localStorage.getItem("stockScriptUrl") || DEFAULT_SCRIPT_URL);
  const [urlInput, setUrlInput] = useState(scriptUrl);
  const [configured, setConfigured] = useState(scriptUrl !== DEFAULT_SCRIPT_URL && scriptUrl !== "");
  const [tab, setTab] = useState("dashboard");
  const [stocks, setStocks] = useState([]);
  const [produits, setProduits] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [recap, setRecap] = useState(null);
  const [recapPeriode, setRecapPeriode] = useState("jour");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modales
  const [modalProduit, setModalProduit] = useState(false);
  const [modalMouvement, setModalMouvement] = useState(false);
  const [editProduit, setEditProduit] = useState(null);

  // Formulaires
  const emptyProduit = { nom: "", categorie: "", unite: "unité", stockInitial: 0, seuilAlerte: 10, description: "", operateur: "" };
  const [formProduit, setFormProduit] = useState(emptyProduit);
  const emptyMouv = { produitId: "", type: "ENTREE", quantite: 1, motif: "", operateur: "" };
  const [formMouv, setFormMouv] = useState(emptyMouv);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const call = useCallback(async (action, body = {}) => {
    if (!configured) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api(scriptUrl, action, body);
      if (data.error) throw new Error(data.error);
      return data;
    } catch (e) {
      setError("Erreur : " + e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [scriptUrl, configured]);

  const refresh = useCallback(async () => {
    if (!configured) return;
    try {
      const [s, p, m, r] = await Promise.all([
        call("getStock"),
        call("getProduits"),
        call("getMouvements", {}),
        call("getRecap", { periode: recapPeriode }),
      ]);
      if (s) setStocks(s.stocks || []);
      if (p) setProduits(p.produits || []);
      if (m) setMouvements((m.mouvements || []).slice(0, 50));
      if (r) setRecap(r);
    } catch (_) {}
  }, [call, recapPeriode, configured]);

  useEffect(() => { refresh(); }, [refresh]);

  const configurer = () => {
    if (!urlInput.includes("script.google.com")) {
      setError("URL invalide. Elle doit provenir de script.google.com");
      return;
    }
    localStorage.setItem("stockScriptUrl", urlInput);
    setScriptUrl(urlInput);
    setConfigured(true);
    setError(null);
  };

  const saveProduit = async () => {
    if (!formProduit.nom) return;
    if (editProduit) {
      await call("updateProduit", { ...formProduit, id: editProduit["ID"] });
      showToast("Produit mis à jour");
    } else {
      await call("addProduit", formProduit);
      showToast("Produit ajouté ✓");
    }
    setModalProduit(false);
    setEditProduit(null);
    setFormProduit(emptyProduit);
    refresh();
  };

  const saveMouvement = async () => {
    if (!formMouv.produitId || !formMouv.quantite) return;
    const p = produits.find(x => x["ID"] === formMouv.produitId);
    await call("addMouvement", {
      ...formMouv,
      produitNom: p ? p["Nom"] : "?",
      quantite: Number(formMouv.quantite),
    });
    showToast(formMouv.type === "ENTREE" ? "Entrée enregistrée ✓" : "Sortie enregistrée ✓");
    setModalMouvement(false);
    setFormMouv(emptyMouv);
    refresh();
  };

  const deleteProduit = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await call("deleteProduit", { id });
    showToast("Produit supprimé");
    refresh();
  };

  // ── ÉCRAN DE CONFIG ─────────────────────────────────────────
  if (!configured) {
    return (
      <div style={{ minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: G.font }}>
        <div style={{ width: 520, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontFamily: G.fontDisplay, fontSize: 32, color: G.text, fontWeight: 700, marginBottom: 8 }}>Stock Manager</div>
          <div style={{ color: G.textMuted, marginBottom: 32, fontSize: 14 }}>Connecté à Google Sheets</div>
          <Card>
            <div style={{ textAlign: "left", marginBottom: 20, padding: "14px 16px", background: G.bg, borderRadius: 8, border: `1px solid ${G.border}`, fontSize: 12, color: G.textMuted, lineHeight: 1.7 }}>
              <strong style={{ color: G.accent }}>📋 Configuration en 3 étapes :</strong><br />
              1. Ouvre <strong style={{ color: G.text }}>Google Sheets</strong> → Extensions → Apps Script<br />
              2. Colle le fichier <strong style={{ color: G.text }}>GoogleAppsScript_StockManager.js</strong> et sauvegarde<br />
              3. Déployer → Nouvelle déploiement → Web App → Accès : <strong style={{ color: G.green }}>Tout le monde</strong><br />
              4. Copie l'URL de déploiement ci-dessous ↓
            </div>
            <Input
              label="URL du déploiement Google Apps Script"
              value={urlInput}
              onChange={setUrlInput}
              placeholder="https://script.google.com/macros/s/.../exec"
            />
            {error && <div style={{ color: G.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <Btn onClick={configurer}>Connecter →</Btn>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => { setConfigured(true); setScriptUrl("DEMO"); }} style={{ background: "none", border: "none", color: G.textMuted, cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
                Mode démo (sans Google Sheets)
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── DONNÉES DEMO ─────────────────────────────────────────────
  const isDemoMode = scriptUrl === "DEMO";
  const displayStocks = isDemoMode ? [
    { id: "P1", nom: "Farine T55", categorie: "Épicerie", unite: "kg", stock: 150, seuilAlerte: 50 },
    { id: "P2", nom: "Sucre Blanc", categorie: "Épicerie", unite: "kg", stock: 8, seuilAlerte: 20 },
    { id: "P3", nom: "Huile Tournesol", categorie: "Épicerie", unite: "L", stock: 45, seuilAlerte: 10 },
    { id: "P4", nom: "Sel Fin", categorie: "Condiments", unite: "kg", stock: 0, seuilAlerte: 5 },
    { id: "P5", nom: "Levure", categorie: "Épicerie", unite: "g", stock: 2500, seuilAlerte: 500 },
  ] : stocks;

  const displayMouvements = isDemoMode ? [
    { "Date/Heure": new Date().toISOString(), "Produit Nom": "Farine T55", "Type": "ENTREE", "Quantité": 50, "Motif": "Réapprovisionnement", "Opérateur": "Alice", "Stock Après": 150 },
    { "Date/Heure": new Date(Date.now() - 3600000).toISOString(), "Produit Nom": "Sucre Blanc", "Type": "SORTIE", "Quantité": 12, "Motif": "Production", "Opérateur": "Bob", "Stock Après": 8 },
    { "Date/Heure": new Date(Date.now() - 7200000).toISOString(), "Produit Nom": "Huile Tournesol", "Type": "ENTREE", "Quantité": 20, "Motif": "Commande fournisseur", "Opérateur": "Alice", "Stock Après": 45 },
  ] : mouvements;

  const chartData = isDemoMode
    ? [{ jour: "Lun", entrees: 80, sorties: 30 }, { jour: "Mar", entrees: 50, sorties: 60 }, { jour: "Mer", entrees: 120, sorties: 45 }, { jour: "Jeu", entrees: 30, sorties: 80 }, { jour: "Ven", entrees: 90, sorties: 50 }]
    : recap ? Object.entries(recap.parJour || {}).map(([j, d]) => ({ jour: j.slice(5), ...d })) : [];

  const alertes = displayStocks.filter(s => s.stock <= s.seuilAlerte);
  const ruptures = displayStocks.filter(s => s.stock === 0);

  // ── NAVIGATION ───────────────────────────────────────────────
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "stock", label: "Stock", icon: "▤" },
    { id: "mouvements", label: "Mouvements", icon: "⇅" },
    { id: "recap", label: "Récapitulatif", icon: "◎" },
    { id: "produits", label: "Produits", icon: "⊕" },
  ];

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.font, color: G.text }}>
      {/* BARRE DE NAVIGATION */}
      <div style={{ background: G.surface, borderBottom: `1px solid ${G.border}`, padding: "0 24px", display: "flex", alignItems: "center", height: 58, gap: 0, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: G.fontDisplay, fontWeight: 700, fontSize: 17, color: G.accent, marginRight: 32, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📦</span> STOCKFLOW
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", color: tab === t.id ? G.accent : G.textMuted,
            borderBottom: tab === t.id ? `2px solid ${G.accent}` : "2px solid transparent",
            padding: "18px 16px", cursor: "pointer", fontSize: 13, fontFamily: G.font,
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {alertes.length > 0 && <Badge color={G.yellow}>⚠ {alertes.length} alertes</Badge>}
          {isDemoMode && <Badge color={G.yellow}>MODE DÉMO</Badge>}
          {loading && <div style={{ color: G.textMuted, fontSize: 12 }}>⟳ sync…</div>}
          <Btn small variant="ghost" onClick={refresh}>↻</Btn>
          <Btn small variant="success" onClick={() => { setModalMouvement(true); setFormMouv({ ...emptyMouv, type: "ENTREE" }); }}>+ Entrée</Btn>
          <Btn small variant="danger" onClick={() => { setModalMouvement(true); setFormMouv({ ...emptyMouv, type: "SORTIE" }); }}>− Sortie</Btn>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
        {error && (
          <div style={{ background: G.redGlow, border: `1px solid ${G.red}44`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: G.red, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div style={{ fontFamily: G.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 20, color: G.text }}>
              Vue d'ensemble
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <Stat label="Produits" value={displayStocks.length} icon="▤" color={G.accent} sub="références actives" />
              <Stat label="Alertes stock" value={alertes.length} icon="⚠" color={G.yellow} sub="sous le seuil" />
              <Stat label="Ruptures" value={ruptures.length} icon="⊗" color={G.red} sub="stock à zéro" />
              <Stat label="Mouvements" value={displayMouvements.length} icon="⇅" color={G.green} sub="enregistrés" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {/* Graphique */}
              <Card>
                <div style={{ fontSize: 13, color: G.textMuted, marginBottom: 14, letterSpacing: 1 }}>▸ FLUX DE LA SEMAINE</div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={G.border} />
                      <XAxis dataKey="jour" tick={{ fill: G.textMuted, fontSize: 11 }} />
                      <YAxis tick={{ fill: G.textMuted, fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: G.surfaceAlt, border: `1px solid ${G.border}`, borderRadius: 6 }} />
                      <Legend />
                      <Bar dataKey="entrees" fill={G.green} name="Entrées" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="sorties" fill={G.red} name="Sorties" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div style={{ color: G.textMuted, fontSize: 12, textAlign: "center", paddingTop: 60 }}>Aucune donnée</div>}
              </Card>

              {/* Alertes */}
              <Card>
                <div style={{ fontSize: 13, color: G.textMuted, marginBottom: 14, letterSpacing: 1 }}>▸ ALERTES STOCK</div>
                {alertes.length === 0
                  ? <div style={{ color: G.green, fontSize: 13, paddingTop: 20 }}>✓ Tous les stocks sont OK</div>
                  : alertes.map(s => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${G.border}` }}>
                      <div>
                        <div style={{ fontSize: 13, color: G.text }}>{s.nom}</div>
                        <div style={{ fontSize: 11, color: G.textMuted }}>seuil : {s.seuilAlerte} {s.unite}</div>
                      </div>
                      <Badge color={s.stock === 0 ? G.red : G.yellow}>
                        {s.stock === 0 ? "RUPTURE" : `${s.stock} ${s.unite}`}
                      </Badge>
                    </div>
                  ))
                }
              </Card>
            </div>

            {/* Derniers mouvements */}
            <Card>
              <div style={{ fontSize: 13, color: G.textMuted, marginBottom: 14, letterSpacing: 1 }}>▸ DERNIERS MOUVEMENTS</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: G.textMuted, fontSize: 11 }}>
                    {["Date/Heure", "Produit", "Type", "Quantité", "Motif", "Opérateur", "Stock après"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 10px", borderBottom: `1px solid ${G.border}`, letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayMouvements.slice(0, 8).map((m, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${G.border}22` }}>
                      <td style={{ padding: "9px 10px", fontSize: 12, color: G.textMuted }}>{fmtDate(m["Date/Heure"])}</td>
                      <td style={{ padding: "9px 10px", fontSize: 13 }}>{m["Produit Nom"]}</td>
                      <td style={{ padding: "9px 10px" }}><Badge color={m["Type"] === "ENTREE" ? G.green : G.red}>{m["Type"]}</Badge></td>
                      <td style={{ padding: "9px 10px", fontSize: 13, color: m["Type"] === "ENTREE" ? G.green : G.red }}>
                        {m["Type"] === "ENTREE" ? "+" : "−"}{m["Quantité"]}
                      </td>
                      <td style={{ padding: "9px 10px", fontSize: 12, color: G.textMuted }}>{m["Motif"]}</td>
                      <td style={{ padding: "9px 10px", fontSize: 12, color: G.textMuted }}>{m["Opérateur"]}</td>
                      <td style={{ padding: "9px 10px", fontSize: 13, fontWeight: 600 }}>{m["Stock Après"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ── STOCK ── */}
        {tab === "stock" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: G.fontDisplay, fontSize: 22, fontWeight: 700 }}>Stock en temps réel</div>
              <Btn small onClick={refresh}>↻ Actualiser</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {displayStocks.map(s => {
                const isRupture = s.stock === 0;
                const isAlerte = s.stock > 0 && s.stock <= s.seuilAlerte;
                const statusColor = isRupture ? G.red : isAlerte ? G.yellow : G.green;
                const pct = s.seuilAlerte > 0 ? Math.min(100, (s.stock / (s.seuilAlerte * 3)) * 100) : 100;
                return (
                  <Card key={s.id} style={{ position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: statusColor }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: G.text, marginBottom: 3 }}>{s.nom}</div>
                        <div style={{ fontSize: 11, color: G.textMuted }}>{s.categorie}</div>
                      </div>
                      <Badge color={statusColor}>{isRupture ? "RUPTURE" : isAlerte ? "ALERTE" : "OK"}</Badge>
                    </div>
                    <div style={{ fontSize: 32, fontFamily: G.fontDisplay, fontWeight: 700, color: statusColor }}>
                      {s.stock}
                      <span style={{ fontSize: 14, fontWeight: 400, color: G.textMuted, marginLeft: 6 }}>{s.unite}</span>
                    </div>
                    <div style={{ marginTop: 12, background: G.bg, borderRadius: 4, height: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: statusColor, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: G.textMuted, marginTop: 6 }}>Seuil : {s.seuilAlerte} {s.unite}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MOUVEMENTS ── */}
        {tab === "mouvements" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: G.fontDisplay, fontSize: 22, fontWeight: 700 }}>Historique des mouvements</div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn small variant="success" onClick={() => { setModalMouvement(true); setFormMouv({ ...emptyMouv, type: "ENTREE" }); }}>+ Entrée</Btn>
                <Btn small variant="danger" onClick={() => { setModalMouvement(true); setFormMouv({ ...emptyMouv, type: "SORTIE" }); }}>− Sortie</Btn>
              </div>
            </div>
            <Card>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: G.textMuted, fontSize: 11 }}>
                    {["⏱ Date/Heure", "Produit", "Type", "Quantité", "Motif", "Opérateur", "Stock avant", "Stock après"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${G.border}`, letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayMouvements.map((m, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${G.border}22`, transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = G.surfaceAlt}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: G.textMuted, whiteSpace: "nowrap" }}>{fmtDate(m["Date/Heure"])}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500 }}>{m["Produit Nom"]}</td>
                      <td style={{ padding: "10px 12px" }}><Badge color={m["Type"] === "ENTREE" ? G.green : G.red}>{m["Type"]}</Badge></td>
                      <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700, color: m["Type"] === "ENTREE" ? G.green : G.red }}>
                        {m["Type"] === "ENTREE" ? "▲ +" : "▼ −"}{m["Quantité"]}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: G.textMuted }}>{m["Motif"] || "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: G.textMuted }}>{m["Opérateur"] || "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: G.textMuted }}>{m["Stock Avant"] ?? "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700 }}>{m["Stock Après"]}</td>
                    </tr>
                  ))}
                  {displayMouvements.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: G.textMuted }}>Aucun mouvement enregistré</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ── RÉCAPITULATIF ── */}
        {tab === "recap" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: G.fontDisplay, fontSize: 22, fontWeight: 700 }}>Récapitulatif</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["jour", "semaine", "mois"].map(p => (
                  <Btn key={p} small variant={recapPeriode === p ? "primary" : "ghost"} onClick={() => setRecapPeriode(p)}>
                    {p === "jour" ? "Aujourd'hui" : p === "semaine" ? "Cette semaine" : "Ce mois"}
                  </Btn>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <Stat label="Total mouvements" value={recap?.totalMouvements ?? (isDemoMode ? 42 : "–")} icon="⇅" color={G.accent} />
              <Stat label="Total entrées" value={recap?.totalEntrees ?? (isDemoMode ? 320 : "–")} icon="▲" color={G.green} />
              <Stat label="Total sorties" value={recap?.totalSorties ?? (isDemoMode ? 185 : "–")} icon="▼" color={G.red} />
            </div>

            {/* Graphique entrées/sorties */}
            <Card style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: G.textMuted, marginBottom: 14, letterSpacing: 1 }}>▸ FLUX PAR JOUR</div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={G.border} />
                    <XAxis dataKey="jour" tick={{ fill: G.textMuted, fontSize: 11 }} />
                    <YAxis tick={{ fill: G.textMuted, fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: G.surfaceAlt, border: `1px solid ${G.border}`, borderRadius: 6 }} />
                    <Legend />
                    <Line type="monotone" dataKey="entrees" stroke={G.green} name="Entrées" strokeWidth={2} dot={{ fill: G.green }} />
                    <Line type="monotone" dataKey="sorties" stroke={G.red} name="Sorties" strokeWidth={2} dot={{ fill: G.red }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={[{ jour: "Lun", entrees: 80, sorties: 30 }, { jour: "Mar", entrees: 50, sorties: 60 }, { jour: "Mer", entrees: 120, sorties: 45 }, { jour: "Jeu", entrees: 30, sorties: 80 }, { jour: "Ven", entrees: 90, sorties: 50 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={G.border} />
                    <XAxis dataKey="jour" tick={{ fill: G.textMuted, fontSize: 11 }} />
                    <YAxis tick={{ fill: G.textMuted, fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: G.surfaceAlt, border: `1px solid ${G.border}`, borderRadius: 6 }} />
                    <Legend />
                    <Line type="monotone" dataKey="entrees" stroke={G.green} name="Entrées" strokeWidth={2} dot={{ fill: G.green }} />
                    <Line type="monotone" dataKey="sorties" stroke={G.red} name="Sorties" strokeWidth={2} dot={{ fill: G.red }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Par produit */}
            <Card>
              <div style={{ fontSize: 13, color: G.textMuted, marginBottom: 14, letterSpacing: 1 }}>▸ PAR PRODUIT</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: G.textMuted, fontSize: 11 }}>
                    {["Produit", "Mouvements", "Entrées", "Sorties", "Balance"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 12px", borderBottom: `1px solid ${G.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(recap?.parProduit ?? (isDemoMode ? { "Farine T55": { mouvements: 15, entrees: 200, sorties: 80 }, "Sucre Blanc": { mouvements: 10, entrees: 50, sorties: 62 }, "Huile Tournesol": { mouvements: 8, entrees: 70, sorties: 43 } } : {})).map(([nom, d]) => (
                    <tr key={nom} style={{ borderBottom: `1px solid ${G.border}22` }}>
                      <td style={{ padding: "10px 12px", fontWeight: 500 }}>{nom}</td>
                      <td style={{ padding: "10px 12px", color: G.textMuted }}>{d.mouvements}</td>
                      <td style={{ padding: "10px 12px", color: G.green }}>+{d.entrees}</td>
                      <td style={{ padding: "10px 12px", color: G.red }}>−{d.sorties}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: d.entrees - d.sorties >= 0 ? G.green : G.red }}>
                        {d.entrees - d.sorties >= 0 ? "+" : ""}{d.entrees - d.sorties}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ── PRODUITS ── */}
        {tab === "produits" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: G.fontDisplay, fontSize: 22, fontWeight: 700 }}>Gestion des produits</div>
              <Btn onClick={() => { setFormProduit(emptyProduit); setEditProduit(null); setModalProduit(true); }}>+ Nouveau produit</Btn>
            </div>
            <Card>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: G.textMuted, fontSize: 11 }}>
                    {["Nom", "Catégorie", "Unité", "Stock actuel", "Seuil alerte", "Description", "Actions"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${G.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(isDemoMode ? produits.length === 0 ? [
                    { "ID": "P1", "Nom": "Farine T55", "Catégorie": "Épicerie", "Unité": "kg", "Stock Initial": 100, "Seuil Alerte": 20, "Description": "Farine de blé" },
                    { "ID": "P2", "Nom": "Sucre Blanc", "Catégorie": "Épicerie", "Unité": "kg", "Stock Initial": 50, "Seuil Alerte": 15, "Description": "" },
                  ] : produits : produits).map((p, i) => {
                    const s = displayStocks.find(x => x.id === p["ID"]);
                    const stockActuel = s ? s.stock : p["Stock Initial"];
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${G.border}22` }}>
                        <td style={{ padding: "10px 12px", fontWeight: 500 }}>{p["Nom"]}</td>
                        <td style={{ padding: "10px 12px" }}><Badge>{p["Catégorie"]}</Badge></td>
                        <td style={{ padding: "10px 12px", color: G.textMuted }}>{p["Unité"]}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: stockActuel === 0 ? G.red : stockActuel <= p["Seuil Alerte"] ? G.yellow : G.green }}>
                          {stockActuel}
                        </td>
                        <td style={{ padding: "10px 12px", color: G.textMuted }}>{p["Seuil Alerte"]}</td>
                        <td style={{ padding: "10px 12px", color: G.textMuted, fontSize: 12 }}>{p["Description"] || "—"}</td>
                        <td style={{ padding: "10px 12px", display: "flex", gap: 6 }}>
                          <Btn small variant="ghost" onClick={() => { setFormProduit({ nom: p["Nom"], categorie: p["Catégorie"], unite: p["Unité"], stockInitial: p["Stock Initial"], seuilAlerte: p["Seuil Alerte"], description: p["Description"] || "" }); setEditProduit(p); setModalProduit(true); }}>✎</Btn>
                          <Btn small variant="danger" onClick={() => deleteProduit(p["ID"])}>✕</Btn>
                        </td>
                      </tr>
                    );
                  })}
                  {produits.length === 0 && !isDemoMode && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: G.textMuted }}>Aucun produit. Commencez par en créer un.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>

      {/* ── MODAL PRODUIT ── */}
      <Modal open={modalProduit} onClose={() => setModalProduit(false)} title={editProduit ? "Modifier le produit" : "Nouveau produit"}>
        <Input label="Nom du produit" value={formProduit.nom} onChange={v => setFormProduit(f => ({ ...f, nom: v }))} required placeholder="ex: Farine T55" />
        <Input label="Catégorie" value={formProduit.categorie} onChange={v => setFormProduit(f => ({ ...f, categorie: v }))} placeholder="ex: Épicerie, Boissons…" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Unité" value={formProduit.unite} onChange={v => setFormProduit(f => ({ ...f, unite: v }))} placeholder="kg, L, unité…" />
          <Input label="Stock initial" type="number" value={formProduit.stockInitial} onChange={v => setFormProduit(f => ({ ...f, stockInitial: Number(v) }))} />
        </div>
        <Input label="Seuil d'alerte" type="number" value={formProduit.seuilAlerte} onChange={v => setFormProduit(f => ({ ...f, seuilAlerte: Number(v) }))} />
        <Input label="Description" value={formProduit.description} onChange={v => setFormProduit(f => ({ ...f, description: v }))} placeholder="Optionnel" />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setModalProduit(false)}>Annuler</Btn>
          <Btn onClick={saveProduit} disabled={!formProduit.nom}>{editProduit ? "Mettre à jour" : "Créer"}</Btn>
        </div>
      </Modal>

      {/* ── MODAL MOUVEMENT ── */}
      <Modal open={modalMouvement} onClose={() => setModalMouvement(false)} title={formMouv.type === "ENTREE" ? "📥 Nouvelle entrée" : "📤 Nouvelle sortie"}>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {["ENTREE", "SORTIE"].map(t => (
            <button key={t} onClick={() => setFormMouv(f => ({ ...f, type: t }))} style={{
              flex: 1, padding: "10px 0", border: `1px solid ${formMouv.type === t ? (t === "ENTREE" ? G.green : G.red) : G.border}`,
              background: formMouv.type === t ? (t === "ENTREE" ? G.greenGlow : G.redGlow) : "transparent",
              color: formMouv.type === t ? (t === "ENTREE" ? G.green : G.red) : G.textMuted,
              borderRadius: 8, cursor: "pointer", fontFamily: G.font, fontSize: 13, fontWeight: 600,
            }}>
              {t === "ENTREE" ? "▲ ENTRÉE" : "▼ SORTIE"}
            </button>
          ))}
        </div>
        <Select
          label="Produit"
          value={formMouv.produitId}
          onChange={v => setFormMouv(f => ({ ...f, produitId: v }))}
          options={[
            { value: "", label: "— Sélectionner un produit —" },
            ...(isDemoMode
              ? [{ value: "P1", label: "Farine T55" }, { value: "P2", label: "Sucre Blanc" }, { value: "P3", label: "Huile Tournesol" }]
              : produits.map(p => ({ value: p["ID"], label: p["Nom"] })))
          ]}
        />
        <Input label="Quantité" type="number" value={formMouv.quantite} onChange={v => setFormMouv(f => ({ ...f, quantite: v }))} />
        <Input label="Motif" value={formMouv.motif} onChange={v => setFormMouv(f => ({ ...f, motif: v }))} placeholder="Réapprovisionnement, Production, Perte…" />
        <Input label="Opérateur" value={formMouv.operateur} onChange={v => setFormMouv(f => ({ ...f, operateur: v }))} placeholder="Votre nom" />
        <div style={{ fontSize: 11, color: G.textMuted, marginBottom: 16 }}>
          ⏱ Horodatage automatique : {new Date().toLocaleString("fr-FR")}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setModalMouvement(false)}>Annuler</Btn>
          <Btn variant={formMouv.type === "ENTREE" ? "success" : "danger"} onClick={saveMouvement} disabled={!formMouv.produitId || !formMouv.quantite}>
            {formMouv.type === "ENTREE" ? "Enregistrer l'entrée" : "Enregistrer la sortie"}
          </Btn>
        </div>
      </Modal>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: G.surface, border: `1px solid ${G.green}`,
          borderRadius: 8, padding: "12px 20px", color: G.green, fontSize: 13, fontFamily: G.font,
          boxShadow: `0 4px 20px ${G.greenGlow}`, animation: "fadeIn 0.2s", zIndex: 9999,
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${G.bg}; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${G.bg}; } ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 3px; }
        input:focus, select:focus { border-color: ${G.accent} !important; box-shadow: 0 0 0 3px ${G.accentGlow}; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
