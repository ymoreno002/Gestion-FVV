import React, { useState, useMemo, createContext, useContext } from "react";
import {
  Waves, FileText, Users, Wallet, ClipboardList, Calendar,
  CheckCircle2, XCircle, Clock, AlertTriangle, Wrench, ChevronRight,
  Search, Plus, LogOut, Menu, X, Ship, Award, GraduationCap, Send,
  Download, Filter, MapPin, Euro, ArrowLeft, ArrowRight, Bell,
  HandCoins, FileSignature, Link2, Copy, Upload,
} from "lucide-react";

/* ============================================================
   FVV · Sistema de Gestión — Prototipo navegable
   Perfiles: Técnico (back) · Club (externo) · Juez (externo)
   Módulos: Neumáticas · Liquidaciones · Nombramientos ·
            Expedientes de jueces · Regatas · Formación
   Datos de ejemplo tomados de los PDF reales aportados.
   ============================================================ */

// ---------- Design tokens ----------
const C = {
  navy: "#0A2C5E",       // azul marino corporativo FVV (orla del escudo)
  navy2: "#123A63",
  hull: "#1B5FA8",       // azul vela / enlaces
  sail: "#F4F7FB",       // vela blanca
  foam: "#E7EEF6",
  line: "#D2DEEC",
  ink: "#0A1929",
  slate: "#5A6B7B",
  buoy: "#2E7BC4",       // acento azul luminoso (antes naranja boya)
  buoySoft: "#E1EDF9",
  green: "#1E7A54",
  greenSoft: "#E1F0E9",
  amber: "#B7791F",
  amberSoft: "#FBF0DC",
  red: "#C0392B",
  redSoft: "#FBE7E4",
  gray: "#8A99A8",
  graySoft: "#EEF2F6",
};

const font = {
  display: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  body: '"Inter", ui-sans-serif, system-ui, sans-serif',
};

// ---------- Estado / helpers ----------
const STATUS = {
  concedida:   { label: "Concedida",   bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  firmada:     { label: "Firmada",     bg: C.greenSoft, fg: C.green, icon: FileSignature },
  pagada:      { label: "Pagada",      bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  aprobada:    { label: "Aprobada",    bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  pendiente:   { label: "Pendiente",   bg: C.amberSoft, fg: C.amber, icon: Clock },
  denegada:    { label: "Denegada",    bg: C.redSoft,   fg: C.red,   icon: XCircle },
  mantenimiento:{label: "Mantenimiento",bg: C.graySoft, fg: C.slate, icon: Wrench },
  fueraservicio:{label:"Fuera de servicio",bg:C.graySoft,fg:C.slate, icon: AlertTriangle },
  borrador:    { label: "Borrador",    bg: C.foam,      fg: C.slate, icon: FileText },
  enviada:     { label: "Enviada",     bg: C.buoySoft,  fg: C.buoy,  icon: Send },
  disponible:  { label: "Disponible",  bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  nodisponible:{ label: "No disponible",bg: C.redSoft,  fg: C.red,   icon: XCircle },
  // Regata
  provisional: { label: "Provisional", bg: C.amberSoft, fg: C.amber, icon: Clock },
  ready:       { label: "Ready",       bg: C.buoySoft,  fg: C.buoy,  icon: CheckCircle2 },
  realizado:   { label: "Realizado",   bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  // AR / IR
  revision:    { label: "En revisión", bg: C.buoySoft,  fg: C.buoy,  icon: Clock },
  revisado:    { label: "Revisado",    bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  // Liquidación dos pasos
  aprob1:      { label: "Aprob. Colegio",bg: C.buoySoft, fg: C.buoy, icon: CheckCircle2 },
  procesando:  { label: "Procesando pago",bg: C.buoySoft,fg: C.buoy, icon: Clock },
  // Nombramiento (valores reales de la lista)
  norealizado: { label: "No Realizado", bg: C.graySoft,  fg: C.slate, icon: Clock },
  enviado:     { label: "Enviado",      bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  // Formación (valores reales de la lista)
  programada:  { label: "Programada",   bg: C.buoySoft,  fg: C.buoy,  icon: Calendar },
  recordada:   { label: "Recordada",    bg: C.amberSoft, fg: C.amber, icon: Bell },
  realizada:   { label: "Realizada",    bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
};

function Badge({ status }) {
  const s = STATUS[status] || STATUS.borrador;
  const Ic = s.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.fg, fontWeight: 600, fontSize: 12,
      padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
      fontFamily: font.body,
    }}>
      <Ic size={13} strokeWidth={2.4} /> {s.label}
    </span>
  );
}

const PAGADOR_COLORS = {
  Club: C.hull, FVV: C.navy, FGV: "#7A3E9D", FAV: "#1E7A54", Voluntario: C.slate,
};
function PagadorTag({ pagador }) {
  const color = PAGADOR_COLORS[pagador] || C.slate;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
      color, background: color + "16", padding: "2px 8px", borderRadius: 6, fontFamily: font.body,
    }}>
      <Euro size={11} strokeWidth={2.6} />{pagador === "Voluntario" ? "Voluntario" : pagador}
    </span>
  );
}

// Chip de estado revisado/enviado (AR, IR, Nombramiento) con icono
function EstadoChip({ ok, label, title, okText = "Revisado", koText = "Pendiente" }) {
  const color = ok ? C.green : C.gray;
  return (
    <span title={title} style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
      color, background: (ok ? C.green : C.slate) + "14", padding: "4px 10px", borderRadius: 7, fontFamily: font.body,
    }}>
      {ok ? <CheckCircle2 size={13} strokeWidth={2.4} /> : <Clock size={13} strokeWidth={2.4} />}
      <strong style={{ color: ok ? C.green : C.slate }}>{label}</strong> · {ok ? okText : koText}
    </span>
  );
}

// Flujo de documento AR/IR: pendiente(club) → revision(colegio) → revisado(club sube PDF publicado)
function DocFlujo({ label, titulo, estado, setEstado, esClub, esColegio, puedeGenerar, onGenerar, doc, revision = [], onRevisar, onEditar }) {
  const generar = puedeGenerar !== undefined ? puedeGenerar : esClub;
  const [comentario, setComentario] = useState("");
  const añadirComentario = () => {
    if (!comentario.trim()) return;
    onRevisar && onRevisar({ tipo: "comentario", texto: comentario.trim(), autor: "Colegio de Jueces", fecha: new Date().toISOString().slice(0, 10) });
    setComentario("");
  };
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{label}</div>
          <div style={{ fontSize: 11.5, color: C.gray }}>{titulo}</div>
        </div>
        <Badge status={estado} />
      </div>

      {estado === "pendiente" && generar && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Btn size="sm" variant="soft" icon={FileSignature} onClick={onGenerar}>Generar en la app</Btn>
            <Btn size="sm" variant="ghost" icon={Upload} onClick={() => setEstado("revision")}>Subir Word</Btn>
          </div>
          <div style={{ fontSize: 11.5, color: C.gray, marginTop: 6 }}>Al generar o subir el documento, pasa a revisión del Colegio de Jueces.</div>
        </div>
      )}
      {estado === "pendiente" && !generar && (
        <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>Pendiente de que el club genere o suba el documento (v0).</div>
      )}

      {estado === "revision" && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: C.foam, borderRadius: 8, marginBottom: 8 }}>
            <FileText size={16} color={C.hull} />
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{label}_v0_{new Date().getFullYear()}.{doc ? "pdf" : "docx"}</span>
            {doc && <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>guardado</span>}
            <button style={{ background: "none", border: "none", color: C.hull, cursor: "pointer", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Download size={14} /> Ver</button>
          </div>

          {/* Histórico de revisión (comentarios y cambios) */}
          {revision.length > 0 && (
            <div style={{ marginBottom: 8, border: `1px solid ${C.graySoft}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.slate, padding: "6px 10px", background: C.foam }}>Registro de revisión</div>
              {revision.map((rv, i) => (
                <div key={i} style={{ padding: "7px 10px", borderTop: `1px solid ${C.graySoft}`, fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: rv.tipo === "cambio" ? C.buoy : C.hull }}>{rv.tipo === "cambio" ? "✎ Cambio" : "💬 Comentario"}</span>
                  <span style={{ color: C.gray }}> · {rv.autor} · {rv.fecha}</span>
                  <div style={{ color: C.ink, marginTop: 2 }}>{rv.texto}</div>
                </div>
              ))}
            </div>
          )}

          {esColegio ? (
            <>
              <div style={{ fontSize: 12, color: C.slate, marginBottom: 6 }}>Revisa el documento: modifica los datos, añade comentarios en el PDF y registra los cambios.</div>
              {/* Añadir comentario */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Comentario de revisión…" style={{ ...inp, fontSize: 12.5 }} />
                <Btn size="sm" variant="ghost" icon={Send} onClick={añadirComentario}>Añadir</Btn>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {doc && <Btn size="sm" variant="ghost" icon={FileSignature} onClick={onEditar}>Modificar datos</Btn>}
                <Btn size="sm" variant="primary" icon={Upload} onClick={() => setEstado("revisado")}>Subir v1 revisada</Btn>
              </div>
            </>
          ) : <div style={{ fontSize: 12, color: C.buoy }}>En revisión por el Colegio de Jueces.{revision.length > 0 ? " Hay observaciones registradas." : ""}</div>}
        </div>
      )}

      {estado === "revisado" && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: C.foam, borderRadius: 8, marginBottom: 8 }}>
            <FileText size={16} color={C.green} />
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{label}_v1_revisado.pdf</span>
            <button style={{ background: "none", border: "none", color: C.hull, cursor: "pointer", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Download size={14} /> Ver</button>
          </div>
          {revision.length > 0 && (
            <div style={{ fontSize: 11.5, color: C.slate, marginBottom: 6 }}>{revision.length} observación(es) registrada(s) en la revisión.</div>
          )}
          <div style={{ fontSize: 12, color: C.green, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={13} /> Revisado. {esClub ? "Sube el PDF publicado." : "Pendiente de PDF publicado del club."}</div>
          {esClub && <Btn size="sm" variant="ghost" icon={Upload}>Subir PDF publicado</Btn>}
        </div>
      )}
    </div>
  );
}

// Generador de AR/IR integrado en la app. Al guardar, el documento queda
// almacenado en la regata (persiste en el estado del prototipo).
function GeneradorARIR({ tipo, regata, onGuardar, onClose }) {
  const clubCat = CLUBES.find((c) => mismaEntidad(regata.club, c.name)) || {};
  const esAR = tipo === "AR";
  const [tab, setTab] = useState("form"); // 'form' | 'preview'
  const [d, setD] = useState(regata[tipo === "AR" ? "arData" : "irData"] || {
    idioma: "es", // 'es' | 'eu' | 'both'
    // Identificación
    nombre: regata.nombre, tipo: regata.ambito, club: regata.club, clubEu: clubCat.nameEu || "",
    fed: "Federación Vasca de Vela", lugar: "", nif: clubCat.nif || "", dir: clubCat.dir || "",
    // Fechas
    fini: regata.fecha, ffin: regata.fechaFin, fpub: "", finsc: "", fsenal: "",
    url: regata.link || "", urlinsc: "",
    // Inscripción y contacto
    precio: "", precioUnidad: "por embarcación", pago: "Transferencia", iban: "",
    precioPorClase: "", email: clubCat.email || regata.mails || "", tel: clubCat.tel || "",
    // Clases y elegibilidad
    clases: regata.clases.join(", "), elegibilidad: "", publicidad: "",
    // Programa
    programa: "", registroDesde: "", registroHasta: "", primeraSenal: "",
    // Recorrido y puntuación
    recorrido: "", puntuacion: "Sistema de Puntuación Baja (Apéndice A del RRV)", descartes: "",
    // Comité (IR)
    comite: "", canal: "", tiempoLimite: "", tiempoLimitePrimero: "",
    // Alojamiento y manutención
    alojamiento: "", falojamiento: "", manutencion: "",
    // Premios, seguridad, responsabilidad
    premios: "", seguridad: "", responsabilidad: "", seguro: "",
    // Federaciones colaboradoras
    fedes: ["fvv"],
    // Texto adicional (bilingüe)
    obs: "", obsEu: "",
  });
  const set = (k, v) => setD({ ...d, [k]: v });
  const toggleFede = (id) => set("fedes", d.fedes.includes(id) ? d.fedes.filter((x) => x !== id) : [...d.fedes, id]);
  const bi = d.idioma === "both", eu = d.idioma === "eu";

  const sec = (icon, txt) => (
    <div style={{ fontSize: 11.5, fontWeight: 800, color: C.hull, textTransform: "uppercase", letterSpacing: ".05em", marginTop: 10, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>{icon}{txt}</div>
  );

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={onClose} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={FileSignature}>Generar {esAR ? "Anuncio de Regata (AR)" : "Instrucciones de Regata (IR)"}</SectionTitle>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        {/* Selector de idioma: castellano / euskera / bilingüe */}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => set("idioma", "es")} style={toggle(d.idioma === "es", C.hull)}>Castellano</button>
          <button onClick={() => set("idioma", "eu")} style={toggle(d.idioma === "eu", C.hull)}>Euskera</button>
          <button onClick={() => set("idioma", "both")} style={toggle(d.idioma === "both", C.buoy)}>Bilingüe</button>
        </div>
        {/* Pestañas formulario / vista previa */}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setTab("form")} style={toggle(tab === "form", C.navy)}>Formulario</button>
          <button onClick={() => setTab("preview")} style={toggle(tab === "preview", C.navy)}>Vista previa</button>
        </div>
      </div>

      {tab === "form" ? (
        <Card style={{ padding: 24, maxWidth: 760 }}>
          <div style={{ display: "grid", gap: 12 }}>
            {sec("🏆", "Identificación")}
            <div><label style={lbl}>Nombre de la regata *</label><input value={d.nombre} onChange={(e) => set("nombre", e.target.value)} style={inp} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Tipo / Liga</label><input value={d.tipo} onChange={(e) => set("tipo", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Lugar / Aguas</label><input value={d.lugar} onChange={(e) => set("lugar", e.target.value)} placeholder="Bahía de Txingudi" style={inp} /></div>
            </div>
            <div><label style={lbl}>Club organizador *</label>
              <select value={d.club} onChange={(e) => { const c = CLUBES.find((x) => x.name === e.target.value) || {}; setD({ ...d, club: e.target.value, clubEu: c.nameEu || "", nif: c.nif || d.nif, dir: c.dir || d.dir, email: c.email || d.email, tel: c.tel || d.tel }); }} style={inp}>
                {CLUBES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            {(bi || eu) && <div><label style={lbl}>Club (euskera)</label><input value={d.clubEu} onChange={(e) => set("clubEu", e.target.value)} style={inp} /></div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>NIF del club</label><input value={d.nif} onChange={(e) => set("nif", e.target.value)} placeholder="G-00000000" style={inp} /></div>
              <div><label style={lbl}>Federación colaboradora</label><input value={d.fed} onChange={(e) => set("fed", e.target.value)} style={inp} /></div>
            </div>
            <div><label style={lbl}>Dirección del club</label><input value={d.dir} onChange={(e) => set("dir", e.target.value)} style={inp} /></div>

            {sec("📅", "Fechas clave")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Fecha inicio</label><input type="date" value={d.fini} onChange={(e) => set("fini", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Fecha fin</label><input type="date" value={d.ffin} onChange={(e) => set("ffin", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Publicación IR</label><input type="date" value={d.fpub} onChange={(e) => set("fpub", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Cierre inscripción</label><input type="date" value={d.finsc} onChange={(e) => set("finsc", e.target.value)} style={inp} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>URL de la regata</label><input value={d.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" style={inp} /></div>
              <div><label style={lbl}>URL formulario inscripción</label><input value={d.urlinsc} onChange={(e) => set("urlinsc", e.target.value)} placeholder="https://…" style={inp} /></div>
            </div>

            {sec("💰", "Inscripción y contacto")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Derechos (€)</label><input value={d.precio} onChange={(e) => set("precio", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Forma de pago</label><input value={d.pago} onChange={(e) => set("pago", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>IBAN</label><input value={d.iban} onChange={(e) => set("iban", e.target.value)} style={inp} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Email contacto</label><input value={d.email} onChange={(e) => set("email", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Teléfono contacto</label><input value={d.tel} onChange={(e) => set("tel", e.target.value)} style={inp} /></div>
            </div>

            {sec("⛵", "Clases y elegibilidad")}
            <div><label style={lbl}>Clases disponibles</label><input value={d.clases} onChange={(e) => set("clases", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Elegibilidad de los participantes</label><textarea value={d.elegibilidad} onChange={(e) => set("elegibilidad", e.target.value)} rows={2} placeholder="Requisitos de licencia, edad…" style={{ ...inp, resize: "vertical" }} /></div>
            <div><label style={lbl}>Publicidad</label><input value={d.publicidad} onChange={(e) => set("publicidad", e.target.value)} placeholder="Reglas de publicidad (World Sailing)" style={inp} /></div>

            {sec("💶", "Detalle de inscripción")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>El precio es</label><select value={d.precioUnidad} onChange={(e) => set("precioUnidad", e.target.value)} style={inp}>{["por embarcación", "por tripulante", "por clase"].map((u) => <option key={u}>{u}</option>)}</select></div>
              <div><label style={lbl}>Precios por clase</label><input value={d.precioPorClase} onChange={(e) => set("precioPorClase", e.target.value)} placeholder="ILCA 40€, Optimist 30€…" style={inp} /></div>
            </div>

            {sec("📋", "Programa")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Registro de participantes desde</label><input value={d.registroDesde} onChange={(e) => set("registroDesde", e.target.value)} placeholder="09:00" style={inp} /></div>
              <div><label style={lbl}>Registro hasta</label><input value={d.registroHasta} onChange={(e) => set("registroHasta", e.target.value)} placeholder="10:30" style={inp} /></div>
            </div>
            <div><label style={lbl}>Hora primera señal de atención</label><input value={d.primeraSenal} onChange={(e) => set("primeraSenal", e.target.value)} placeholder="12:00" style={inp} /></div>
            <div><label style={lbl}>Programa / número de pruebas</label><textarea value={d.programa} onChange={(e) => set("programa", e.target.value)} rows={2} placeholder="Nº de pruebas por día, orden de salidas…" style={{ ...inp, resize: "vertical" }} /></div>

            {sec("🏁", "Recorrido y puntuación")}
            <div><label style={lbl}>Recorrido</label><input value={d.recorrido} onChange={(e) => set("recorrido", e.target.value)} placeholder="Barlovento-sotavento…" style={inp} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Sistema de puntuación</label><input value={d.puntuacion} onChange={(e) => set("puntuacion", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Descartes</label><input value={d.descartes} onChange={(e) => set("descartes", e.target.value)} placeholder="1 a partir de 4 pruebas" style={inp} /></div>
            </div>

            {!esAR && (<>
              {sec("📻", "Comité y comunicación")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={lbl}>Oficial principal</label><input value={d.comite} onChange={(e) => set("comite", e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Canal VHF</label><input value={d.canal} onChange={(e) => set("canal", e.target.value)} placeholder="Canal 72" style={inp} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={lbl}>Tiempo límite</label><input value={d.tiempoLimite} onChange={(e) => set("tiempoLimite", e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Tiempo límite del primero</label><input value={d.tiempoLimitePrimero} onChange={(e) => set("tiempoLimitePrimero", e.target.value)} style={inp} /></div>
              </div>
            </>)}

            {sec("🛏", "Alojamiento y manutención")}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Información de alojamiento</label><input value={d.alojamiento} onChange={(e) => set("alojamiento", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Fecha límite reserva</label><input type="date" value={d.falojamiento} onChange={(e) => set("falojamiento", e.target.value)} style={inp} /></div>
            </div>
            <div><label style={lbl}>Manutención</label><input value={d.manutencion} onChange={(e) => set("manutencion", e.target.value)} placeholder="Comidas incluidas, catering…" style={inp} /></div>

            {sec("🏆", "Premios, seguridad y responsabilidad")}
            <div><label style={lbl}>Premios</label><textarea value={d.premios} onChange={(e) => set("premios", e.target.value)} rows={2} placeholder="Trofeos por clase y categoría…" style={{ ...inp, resize: "vertical" }} /></div>
            <div><label style={lbl}>Medidas de seguridad</label><input value={d.seguridad} onChange={(e) => set("seguridad", e.target.value)} style={inp} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Descargo de responsabilidad</label><input value={d.responsabilidad} onChange={(e) => set("responsabilidad", e.target.value)} placeholder="Regla 3 del RRV" style={inp} /></div>
              <div><label style={lbl}>Seguro exigido</label><input value={d.seguro} onChange={(e) => set("seguro", e.target.value)} placeholder="RC mínima…" style={inp} /></div>
            </div>

            {sec("🤝", "Federaciones colaboradoras")}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FEDES.map((fe) => (
                <button key={fe.id} onClick={() => toggleFede(fe.id)} style={toggle(d.fedes.includes(fe.id), C.buoy)} title={fe.name}>{fe.id.toUpperCase()}</button>
              ))}
            </div>

            {sec("📝", "Texto adicional")}
            <div><label style={lbl}>Observaciones{bi ? " (castellano)" : ""}</label><textarea value={d.obs} onChange={(e) => set("obs", e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} /></div>
            {(bi || eu) && <div><label style={lbl}>Observaciones (euskera)</label><textarea value={d.obsEu} onChange={(e) => set("obsEu", e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} /></div>}

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.graySoft}`, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: C.slate }}>Idioma del documento: <strong>{d.idioma === "es" ? "Castellano" : d.idioma === "eu" ? "Euskera" : "Bilingüe (es/eu)"}</strong></span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="ghost" onClick={() => setTab("preview")}>Ver previa</Btn>
                <Btn variant="primary" icon={CheckCircle2} onClick={() => onGuardar(d)}>Guardar y enviar a revisión</Btn>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <VistaPreviaDoc tipo={tipo} d={d} onVolver={() => setTab("form")} onGuardar={() => onGuardar(d)} />
      )}
    </div>
  );
}

// Vista previa del documento AR/IR, con soporte de idioma (es/eu/both)
function VistaPreviaDoc({ tipo, d, onVolver, onGuardar }) {
  const esAR = tipo === "AR";
  const bi = d.idioma === "both", eu = d.idioma === "eu";
  const T = (es, euskera) => bi ? `${es}  ·  ${euskera}` : eu ? euskera : es;

  // Fila de dato (para la ficha de cabecera)
  const dato = (labelEs, labelEu, val) => val ? (
    <div style={{ display: "flex", gap: 10, padding: "4px 0", borderBottom: `1px solid ${C.graySoft}`, fontSize: 12 }}>
      <span style={{ minWidth: 150, color: C.hull, fontWeight: 700 }}>{T(labelEs, labelEu)}</span>
      <span style={{ color: C.ink }}>{val}</span>
    </div>
  ) : null;

  // Artículo numerado con texto bilingüe
  let n = 0;
  const art = (labelEs, labelEu, textoEs, textoEu) => {
    if (!textoEs && !textoEu) return null;
    n += 1;
    return (
      <div style={{ marginBottom: 11 }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: 12.5, marginBottom: 3 }}>{n}. {T(labelEs, labelEu)}</div>
        {!eu && textoEs && <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5, textAlign: "justify" }}>{textoEs}</div>}
        {(bi || eu) && textoEu && <div style={{ fontSize: 12, color: C.slate, fontStyle: bi ? "italic" : "normal", lineHeight: 1.5, textAlign: "justify", marginTop: bi ? 3 : 0 }}>{textoEu}</div>}
      </div>
    );
  };

  return (
    <div>
      {/* Lienzo gris con hoja de documento centrada */}
      <div style={{ background: "#5b6472", borderRadius: 12, padding: "24px 16px", maxWidth: 800, margin: "0 auto", maxHeight: 640, overflowY: "auto" }}>
        <div style={{ background: "#fff", width: "100%", maxWidth: 620, margin: "0 auto", boxShadow: "0 8px 30px rgba(0,0,0,.3)", borderRadius: 2, overflow: "hidden" }}>
          {/* Cabecera del documento */}
          <div style={{ background: C.navy, color: "#fff", padding: "18px 30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: ".08em", opacity: .85, textTransform: "uppercase" }}>
                {esAR ? T("Anuncio de Regata", "Regataren Iragarkia") : T("Instrucciones de Regata", "Regataren Jarraibideak")}
              </div>
              <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, marginTop: 3 }}>
                {esAR ? T("ANUNCIO DE REGATA", "REGATAREN IRAGARKIA") : T("INSTRUCCIONES", "JARRAIBIDEAK")}
              </div>
              <div style={{ fontSize: 12.5, marginTop: 5, fontWeight: 500 }}>{d.nombre}</div>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.buoy, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 800 }}>FVV</span>
            </div>
          </div>

          {/* Federaciones */}
          <div style={{ padding: "8px 30px", background: C.foam, fontSize: 10, color: C.hull, fontWeight: 700 }}>
            {T("Con la colaboración de:", "Laguntzarekin:")} {d.fedes.map((id) => FEDES.find((f) => f.id === id)?.id.toUpperCase()).join(" · ")}
          </div>

          {/* Cuerpo del documento */}
          <div style={{ padding: "20px 30px 30px" }}>
            {/* Encabezado descriptivo */}
            <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5, textAlign: "justify", marginBottom: 4 }}>
              {(!eu) && `${d.club || "El club organizador"}, por delegación de la Federación Vasca de Vela, organiza ${d.nombre}${d.lugar ? `, que se celebrará en ${d.lugar}` : ""}${d.fini ? ` los días ${fecha(d.fini)} — ${fecha(d.ffin)}` : ""}.`}
            </div>
            {(bi || eu) && <div style={{ fontSize: 12, color: C.slate, fontStyle: bi ? "italic" : "normal", lineHeight: 1.5, textAlign: "justify", marginBottom: 4 }}>
              {`${d.clubEu || d.club}, Euskadiko Bela Federazioaren eskuordetzaz, ${d.nombre} antolatzen du.`}
            </div>}

            {/* Ficha de datos */}
            <div style={{ margin: "14px 0", padding: "10px 12px", background: C.foam, borderRadius: 6 }}>
              {dato("Autoridad organizadora", "Antolatzailea", bi && d.clubEu ? `${d.club} / ${d.clubEu}` : eu && d.clubEu ? d.clubEu : d.club)}
              {dato("NIF", "IFZ", d.nif)}
              {dato("Lugar", "Lekua", d.lugar)}
              {dato("Fechas", "Datak", d.fini && `${fecha(d.fini)} — ${fecha(d.ffin)}`)}
              {dato("Clases", "Klaseak", d.clases)}
              {dato("Tipo", "Mota", d.tipo)}
            </div>

            {/* Articulado */}
            {art("Reglas", "Arauak", d.obs, d.obsEu)}
            {art("Elegibilidad", "Baldintzak", d.elegibilidad)}
            {art("Publicidad", "Publizitatea", d.publicidad)}
            {art("Inscripciones", "Izen-ematea",
              [d.precio && `Derechos de inscripción: ${d.precio} € (${d.precioUnidad}).`, d.precioPorClase && `Por clase: ${d.precioPorClase}.`, d.finsc && `Cierre: ${fecha(d.finsc)}.`, d.iban && `IBAN: ${d.iban}.`].filter(Boolean).join(" "))}
            {art("Programa", "Programa",
              [d.registroDesde && `Registro de ${d.registroDesde} a ${d.registroHasta}.`, d.primeraSenal && `Primera señal de atención: ${d.primeraSenal}.`, d.programa].filter(Boolean).join(" "))}
            {art("Recorrido", "Ibilbidea", d.recorrido)}
            {art("Puntuación", "Puntuazioa", [d.puntuacion, d.descartes && `Descartes: ${d.descartes}.`].filter(Boolean).join(" "))}
            {!esAR && art("Comité de regata", "Erregata batzordea", [d.comite && `Oficial principal: ${d.comite}.`, d.canal && `Canal VHF: ${d.canal}.`, d.tiempoLimite && `Tiempo límite: ${d.tiempoLimite}.`].filter(Boolean).join(" "))}
            {art("Alojamiento y manutención", "Ostatua eta mantenua", [d.alojamiento, d.manutencion].filter(Boolean).join(" · "))}
            {art("Premios", "Sariak", d.premios)}
            {art("Seguridad", "Segurtasuna", d.seguridad)}
            {art("Responsabilidad", "Erantzukizuna", d.responsabilidad)}
            {art("Seguro", "Asegurua", d.seguro)}

            {/* Contacto */}
            {(d.email || d.tel || d.url) && (
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${C.graySoft}`, fontSize: 11.5, color: C.slate }}>
                <strong style={{ color: C.hull }}>{T("Contacto", "Kontaktua")}:</strong> {[d.email, d.tel, d.url].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>

          <div style={{ padding: "8px 30px", borderTop: `1px solid ${C.graySoft}`, fontSize: 9.5, color: C.gray, textAlign: "center" }}>
            {T("Federación Vasca de Vela — documento de trabajo", "Euskadiko Bela Federazioa — lan dokumentua")}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, maxWidth: 800, margin: "14px auto 0", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.slate }}>Vista previa maquetada. El PDF final con paginación lo genera el sistema al publicar.</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" icon={ArrowLeft} onClick={onVolver}>Editar</Btn>
          <Btn variant="primary" icon={CheckCircle2} onClick={onGuardar}>Guardar y enviar a revisión</Btn>
        </div>
      </div>
    </div>
  );
}

// ---------- Datos de ejemplo ----------
// ORIGEN EN PRODUCCIÓN (sitio SharePoint cvj-Nombramientos):
//   JUECES   → lista 57de38fb-b83c-4e90-9e8e-778ae03da138  (query.iqy)
//   REGATAS  → lista 0cdd6b8c-b1b7-4685-9987-ad82757bbcb9  (query.iqy_2 / Nombramientos)
// El backend leerá estas listas vía Graph; aquí van datos de ejemplo de los PDF.
const NEUMATICAS = [
  { id: "N1", nombre: "Zodiac Amarilla", alias: "PEKACHILLA", motor: "Yamaha 40cv", estado: "operativa" },
  { id: "N2", nombre: "Zodiac Gris", alias: "ITSASO", motor: "Suzuki 30cv", estado: "operativa" },
  { id: "N3", nombre: "Narwhal Roja", alias: "GORRIA", motor: "Honda 50cv", estado: "mantenimiento" },
];

const RESERVAS = [
  {
    id: "R-2026-5", neumatica: "N1", club: "Real Club Marítimo del Abra - Real Sporting Club",
    representante: "Jorge Angulo Batista", dni: "44700718B", mail: "regatas@rcmarsc.es",
    patron: "Jorge Angulo Batista", titulacion: "TD3", movil: "682671025",
    evento: "Campeonato de Euskadi de J80 · Cto España J80 · Cto Europa J80",
    recogida: "2026-06-08", devolucion: "2026-06-30", estado: "concedida",
    presentada: "2026-05-22", aprobadaPor: "Naiara Lazcanotegui Elicegui",
    incidenciaRecogida: null, incidenciaDevolucion: null,
  },
  {
    id: "R-2026-6", neumatica: "N2", club: "Club Náutico de Hondarribia",
    representante: "Aitor Larrañaga", dni: "72888120X", mail: "regatas@cnhondarribia.eus",
    patron: "Aitor Larrañaga", titulacion: "TD2", movil: "600112233",
    evento: "Ama Guadalupekoa Optimist",
    recogida: "2026-09-17", devolucion: "2026-09-20", estado: "pendiente",
    presentada: "2026-07-30", aprobadaPor: null,
    incidenciaRecogida: null, incidenciaDevolucion: null,
  },
  {
    id: "R-2026-7", neumatica: "N1", club: "Real Club Náutico de San Sebastián",
    representante: "Leire Etxeberria", dni: "15998877K", mail: "regatas@rcnss.eus",
    patron: "Leire Etxeberria", titulacion: "TD3", movil: "655443322",
    evento: "Trofeo RCN de San Sebastián 2026",
    recogida: "2026-06-20", devolucion: "2026-06-22", estado: "denegada",
    presentada: "2026-06-01", aprobadaPor: null, motivoDenegacion: "Solapa con R-2026-5",
    incidenciaRecogida: null, incidenciaDevolucion: null,
  },
];

const JUECES = [
  {
    id: "J1", licencia: "YML104", nombre: "Yerai Moreno Lafuente", dni: "44566069G",
    nacimiento: "1996-10-07", movil: "688608234", mail: "ymoreno@ikmail.com",
    genero: "Hombre", iban: "ES29 **** **** **** 8911",
    direccion: "Porcelanas Bidasoa 15 2ºC, 20303 Irún — Guipúzcoa",
    estamento: "Juez/a Nacional, Oficial Nacional", federacion: "EUS",
    club: "Club Náutico de Hondarribia", externo: false,
    titulaciones: ["Oficial: NRO (Habilitado)", "Juez: RJ", "Técnico: TD1"],
    activo: true,
  },
  {
    id: "J2", licencia: "MRB201", nombre: "Miguel Reboreda", dni: "33221100M",
    nacimiento: "1985-03-15", movil: "699001122", mail: "mreboreda@ikmail.com",
    genero: "Hombre", iban: "ES44 **** **** **** 1201",
    direccion: "Muelle 3, Bilbao — Bizkaia",
    estamento: "Juez/a Nacional", federacion: "EUS",
    club: "Externo (FGV)", externo: true,
    titulaciones: ["Juez: RJ", "Medidor Vela Ligera"],
    activo: true,
  },
];

const REGATAS = [
  {
    id: "RG1", nombre: "Trofeo Azqueta 2026", anyo: 2026, fecha: "2026-04-11", fechaFin: "2026-04-12",
    club: "Club Náutico de Hondarribia", clases: ["ILCA", "420"], ambito: "Liga Vasca",
    estado: "realizado",
    ar: { estado: "revisado" }, ir: { estado: "revisado" }, link: "https://competiciones.euskalbela.es/rg1",
    mails: "regatas@cnhondarribia.eus", nombramientoEnviado: true,
    nombramientos: [{ juez: "J1", rol: "Oficial Principal", pagador: "FVV" }],
  },
  {
    id: "RG2", nombre: "Trofeo San Prudencio 2026", anyo: 2026, fecha: "2026-05-09", fechaFin: "2026-05-09",
    club: "Real Club Náutico de San Sebastián", clases: ["Optimist", "ILCA", "420"], ambito: "Liga Vasca",
    estado: "ready",
    ar: { estado: "revision" }, ir: { estado: "pendiente" }, link: "https://competiciones.euskalbela.es/rg2",
    mails: "regatas@rcnss.eus", nombramientoEnviado: false,
    nombramientos: [{ juez: "J1", rol: "Presidente Comité de Protestas", pagador: "Club" }],
  },
  {
    id: "RG3", nombre: "Trofeo RCN de San Sebastián 2026", anyo: 2026, fecha: "2026-10-10", fechaFin: "2026-10-11",
    club: "Real Club Náutico de San Sebastián", clases: ["ILCA 4", "ILCA 6", "420", "RS Feva"], ambito: "Liga Vasca",
    estado: "pendiente",
    ar: { estado: "pendiente" }, ir: { estado: "pendiente" }, link: "https://competiciones.euskalbela.es/rg3",
    mails: "", nombramientoEnviado: false,
    nombramientos: [],
  },
  {
    id: "RG4", nombre: "Trofeo Aldayeta 2026", anyo: 2026, fecha: "2026-06-06", fechaFin: "2026-06-07",
    club: "C.N. Álava", clases: ["Optimist", "420", "ILCA"], ambito: "Liga Vasca",
    estado: "provisional",
    ar: { estado: "revisado" }, ir: { estado: "revisado" }, link: "https://competiciones.euskalbela.es/rg4",
    mails: "juntacna.aldayeta@gmail.com;joseb@…", nombramientoEnviado: false,
    nombramientos: [
      { juez: "J1", rol: "Oficial Principal", pagador: "FVV" },
      { juez: "J2", rol: "Presidente Comité de Protestas", pagador: "FVV" },
    ],
  },
  {
    id: "RG5", nombre: "Regata J80 Abra 2026", anyo: 2026, fecha: "2026-06-06", fechaFin: "2026-06-07",
    club: "Real Club Marítimo del Abra - Real Sporting Club", clases: ["J80"], ambito: "Liga Vasca",
    estado: "provisional",
    ar: { estado: "revision" }, ir: { estado: "pendiente" }, link: "https://competiciones.euskalbela.es/rg5",
    mails: "regatas@rcmarsc.es", nombramientoEnviado: false,
    nombramientos: [{ juez: "J2", rol: "Oficial Principal", pagador: "Club" }],
  },
];

const LIQUIDACIONES = [
  {
    id: "LQ-2026-9", juez: "J1", regata: "RG1", motivo: "Actuación de oficial de regata",
    salida: "2026-04-11", regreso: "2026-04-12",
    gastos: [
      { concepto: "Dietas", detalle: "2 días", total: 206 },
      { concepto: "Kilometraje", detalle: "Irún–Getxo 124 km / Getxo–Irún 124 km", total: 74.4 },
      { concepto: "Autopista", detalle: "Peajes", total: 27.62 },
    ],
    total: 308.02, iban: "ES08 0182 0319 8602 0152 6960",
    estado: "pagada", presentada: "2026-04-14", pagadaPor: "Naiara Lazcanotegui Elicegui",
  },
  {
    id: "LQ-2026-12", juez: "J1", regata: "RG2", motivo: "Presidente Comité de Protestas",
    salida: "2026-05-09", regreso: "2026-05-09",
    gastos: [
      { concepto: "Dietas", detalle: "1 día", total: 103 },
      { concepto: "Kilometraje", detalle: "Irún–Donostia 40 km / vuelta 40 km", total: 24 },
    ],
    total: 283.4, iban: "ES08 0182 0319 8602 0152 6960",
    estado: "enviada", presentada: "2026-05-11", pagadaPor: null,
  },
];

const DISPONIBILIDAD = [
  { juez: "J1", regata: "Ama Guadalupekoa Optimist", fecha: "2026-09-19", disp: true, clases: "Optimist" },
  { juez: "J1", regata: "Trofeo RCN De San Sebastián 2026", fecha: "2026-10-10", disp: true, clases: "ILCA 4/6/7, 420, RS Feva" },
  { juez: "J1", regata: "Trofeo Virgen Blanca IOM", fecha: "2026-07-25", disp: false, clases: "IOM" },
  { juez: "J1", regata: "31ª Bakarkako Estropada", fecha: "2026-07-31", disp: false, clases: "Osiris" },
];

const FORMACION = [
  { id: "F1", titulo: "Gestión de Regatas en Escora", fecha: "2026-02-25", horas: 2, docente: "Miguel Reboreda", inscritos: 18 },
  { id: "F2", titulo: "Casos Participativos", fecha: "2026-04-24", horas: 2, docente: "Yerai Moreno", inscritos: 22 },
  { id: "F3", titulo: "Políticas de Actuación Comité de Regatas", fecha: "2026-05-27", horas: 2, docente: "César Sans y José María Mier", inscritos: 15 },
];

// ---------- Baremos estándar por entidad (los fija la FVV) ----------
// En uso personal el juez elige entidad y se aplican SUS baremos.
// Baremos reales por tipo de persona y entidad (€/día regata, €/día viaje, €/km).
// Si la FVV nombra, el club paga la tarifa FVV. En uso personal, el juez elige FVV o RFEV.
const BAREMOS_ENTIDAD = {
  "Juez · FVV":     { diaRegata: 103, diaViaje: 51.5, km: 0.30 },
  "Juez · RFEV":    { diaRegata: 103, diaViaje: 51.5, km: 0.26 },
  "Técnico · FVV":  { diaRegata: 150, diaViaje: 150,  km: 0.30 },
};
// Baremo por defecto (juez FVV) para no romper referencias
const BAREMOS = BAREMOS_ENTIDAD["Juez · FVV"];

// ---------- Federados (base para seleccionar convocados) ----------
// En producción se importa/actualiza desde Excel o desde la lista de licencias.
const FEDERADOS = [
  { nombre: "June Olazabal", dni: "45123987L", club: "CN Hondarribia", licencia: "OPT-0912" },
  { nombre: "Diego Bermejo", dni: "44998877P", club: "RCN San Sebastián", licencia: "OPT-1033" },
  { nombre: "Álvaro Aguirre", dni: "78112233D", club: "RCN San Sebastián", licencia: "ILC-0211" },
  { nombre: "Ane Lazaro", dni: "45667788M", club: "CN Hondarribia", licencia: "ILC-0455" },
  { nombre: "Paul Ganuza", dni: "44223311S", club: "RCN San Sebastián", licencia: "420-0087" },
  { nombre: "Nora Iribarren", dni: "72334455V", club: "RC Marítimo del Abra", licencia: "OPT-1120" },
  { nombre: "Unai Salaberria", dni: "15887766J", club: "RC Marítimo del Abra", licencia: "ILC-0388" },
  { nombre: "Maddi Zabaleta", dni: "44778899T", club: "CN Hondarribia", licencia: "RSF-0044" },
];

// ---------- Subvenciones ----------
const TIPOS_SUBVENCION = ["Desplazamiento a campeonato", "Material deportivo", "Tecnificación", "Alto rendimiento", "Ayuda a club"];

const CONVOCATORIAS = [
  {
    id: "SUB-2026-01", titulo: "Ayudas desplazamiento Cto. España Optimist 2026",
    tipo: "cerrada", estado: "abierta",
    descripcion: "Convocatoria cerrada a los deportistas seleccionados para el Campeonato de España de Optimist.",
    apertura: "2026-06-01", cierre: "2026-06-20", finFirma: "2026-06-30",
    convocados: [
      { nombre: "June Olazabal", dni: "45123987L", club: "CN Hondarribia", cantidad: 350, estado: "firmada" },
      { nombre: "Diego Bermejo", dni: "44998877P", club: "RCN San Sebastián", cantidad: 350, estado: "enviada" },
      { nombre: "Álvaro Aguirre", dni: "78112233D", club: "RCN San Sebastián", cantidad: 350, estado: "enviada" },
    ],
  },
  {
    id: "SUB-2026-02", titulo: "Ayudas material vela ligera 2026",
    tipo: "abierta", estado: "abierta",
    descripcion: "Convocatoria abierta. Cualquier deportista con licencia puede solicitar ayuda para material.",
    apertura: "2026-07-01", cierre: "2026-09-30", finFirma: "2026-10-15",
    solicitudes: [
      { nombre: "Ane Lazaro", dni: "45667788M", club: "CN Hondarribia", tipo: "Material deportivo", motivo: "Renovación de vela ILCA 6", estado: "pendiente", importe: 620, nfacturas: 2 },
      { nombre: "Paul Ganuza", dni: "44223311S", club: "RCN San Sebastián", tipo: "Material deportivo", motivo: "Compra de traje de neopreno", estado: "concedida", importe: 240, nfacturas: 1 },
    ],
  },
];

// ---------- Directorio de usuarios (identidad) ----------
// En producción esto lo resuelve Entra ID (internos) y Entra External ID (externos).
// El perfil NO lo elige la persona: se deduce de su cuenta.
// ---------- Catálogo de clubes / autoridades organizadoras ----------
// Origen: clubes.js del generador de AR/IR (fuente única para usuarios y logos).
const CLUBES = [
  { id: "ca-ss", abbr: "C.A. San Sebastián", name: "Club Atlético de San Sebastián", nameEu: "Donostiako Klub Atletikoa", email: "", tel: "", nif: "", dir: "", logo: "logos/clubs/ca-ss.png" },
  { id: "rcn-ss", abbr: "R.C.N. San Sebastián", name: "Real Club Náutico de San Sebastián", nameEu: "Donostiako Errege Klub Nautikoa", email: "vela@rcnss.com", tel: "670801883", nif: "G-20037610", dir: "Ijentea 9, San Sebastián 20003", logo: "logos/clubs/rcn-ss.png" },
  { id: "cn-hond", abbr: "C.N. Hondarribia", name: "Club Náutico Hondarribia", nameEu: "Hondarribiako Itsaskari Baita", email: "oficina@cnh-hib.org", tel: "688619948", nif: "G-20111258", dir: "Minatera Kalea 4 Bajo, Hondarribia", logo: "logos/clubs/cn-hond.png" },
  { id: "rcma-rsc", abbr: "R.C.M.A.-R.S.C.", name: "Real Club Marítimo del Abra-Real Sporting Club", nameEu: "Real Club Marítimo del Abra-Real Sporting Club", email: "regatas@rcma-rsc.es", tel: "610030735", nif: "G-48069603", dir: "Zugazarte 11, Las Arenas, Getxo 48930", logo: "logos/clubs/rcma-rsc.png" },
  { id: "cn-vitoria", abbr: "C.N. Vitoria", name: "Club Náutico Vitoria", nameEu: "Gasteizko Klub Nautikoa", email: "deportes@cnvitoria.com", tel: "659930278", nif: "G-01007533", dir: "Barrio Txoisa 4, Ctra. Bergara s/n", logo: "logos/clubs/cn-vitoria.png" },
  { id: "cn-alava", abbr: "C.N. Álava", name: "Club Náutico Álava - Aldayeta", nameEu: "Arabako Klub Nautikoa", email: "juntacna.aldayeta@gmail.com", tel: "609440396", nif: "G-01008739", dir: "Ctra. Nanclares de Ganboa S/N, Arratsua-Ubarrundia 01520", logo: "" },
  { id: "cn-zumaia", abbr: "C.N. Zumaia", name: "Club Náutico Zumaia", nameEu: "Zumaiako Klub Nautikoa", email: "", tel: "", nif: "", dir: "", logo: "logos/clubs/cn-zumaia.png" },
  { id: "orza", abbr: "Orza", name: "Orza", nameEu: "Orza", email: "orzabela@gmail.com", tel: "", nif: "", dir: "", logo: "logos/clubs/orza.png" },
  { id: "cvn", abbr: "C.V. Navarra", name: "Club Vela Navarra", nameEu: "Nafarroako Bela Kluba", email: "", tel: "", nif: "", dir: "", logo: "logos/clubs/cv-navarra.png" },
  { id: "env", abbr: "E.N.V.", name: "Escuela Navarra de Vela", nameEu: "Nafar Bela Eskola", email: "", tel: "", nif: "", dir: "", logo: "logos/clubs/cd-env.png" },
  { id: "rcnl", abbr: "R.C.N. Laredo", name: "Real Club Náutico de Laredo", nameEu: "Laredoko Errege Klub Nautikoa", email: "", tel: "", nif: "", dir: "", logo: "logos/clubs/cn-laredo.png" },
];

// ---------- Catálogo de federaciones ----------
const FEDES = [
  { id: "fvv", name: "Federación Vasca de Vela", nameEu: "Euskal Bela Federazioa", logo: "logos/fedes/fvv.png" },
  { id: "fgv", name: "Federación Guipuzcoana de Vela", nameEu: "Gipuzkoako Bela Federazioa", logo: "logos/fedes/fgv.png" },
  { id: "fav", name: "Federación Alavesa de Vela", nameEu: "Arabako Bela Federazioa", logo: "logos/fedes/fav.png" },
  { id: "fbv", name: "Federación de Vela de Vizcaya", nameEu: "Bizkaitar Belaren Federazioa", logo: "logos/fedes/fbv.jpg" },
  { id: "rfcv", name: "Real Federación Cántabra de Vela", nameEu: "Kantabriako Bela Errege Federazioa", logo: "logos/fedes/rfcv.png" },
  { id: "fnv", name: "Federación Navarra de Vela", nameEu: "Nafarroako Bela Federazioa", logo: "logos/fedes/fnv.png" },
  { id: "rfev", name: "Real Federación Española de Vela", nameEu: "Espainiako Bela Errege Federazioa", logo: "logos/fedes/rfev.png" },
];

// URL del generador de AR/IR (app PWA independiente). Ajustar al desplegar.
const GENERADOR_URL = "https://competiciones.euskalbela.es/generador/";

const USUARIOS = [
  // Técnicos FVV (internos)
  { email: "info@euskalbela.es", nombre: "Secretaría FVV", rol: "secretaria", org: "Federación Vasca de Vela" },
  { email: "jueces@euskalbela.es", nombre: "Colegio de Jueces", rol: "colegio", org: "Colegio de Jueces FVV" },
  // Clubes (externos) — generados desde el catálogo CLUBES
  ...CLUBES.map((c) => ({
    email: c.email || `${c.id}@euskalbela.es`,
    nombre: c.abbr,
    rol: "club",
    org: c.name,
    clubMatch: c.name,
    clubId: c.id,
  })),
  // Jueces — todos los jueces tienen usuario de juez por defecto (generados desde JUECES)
  ...JUECES.map((j) => ({
    email: j.mail,
    nombre: j.nombre,
    rol: "juez",
    org: j.externo ? "Colegio de Jueces (externo)" : "Colegio de Jueces",
    juezId: j.id,
  })),
];

const jueza = (id) => JUECES.find((j) => j.id === id);
const regataDe = (id) => REGATAS.find((r) => r.id === id);
const esFVV = (role) => role === "tecnico" || role === "colegio" || role === "secretaria";
// Casa el nombre de club de una regata con el club del usuario, de forma flexible
// (los nombres varían: "C.N. Álava" vs "Club Náutico Álava - Aldayeta").
const mismaEntidad = (clubRegata = "", clubUsuario = "") => {
  const limpiar = (s) => s.toLowerCase().replace(/c\.?n\.?|club|náutico|nautico|real|marítimo|maritimo|de|del|la|sporting|-|\./g, " ").split(/\s+/).filter((w) => w.length > 3);
  const a = limpiar(clubRegata), b = limpiar(clubUsuario);
  return a.some((w) => b.includes(w));
};
const neumaticaDe = (id) => NEUMATICAS.find((n) => n.id === id);
const eur = (n) => n.toLocaleString("es-ES", { minimumFractionDigits: 2 }) + " €";
const fecha = (s) => s ? new Date(s + "T00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ---------- Contexto de perfil ----------
const AppCtx = createContext(null);

// ---------- Componentes UI base ----------
function Card({ children, style, onClick, hover }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14,
        boxShadow: h && (hover || onClick) ? "0 8px 24px -12px rgba(11,42,74,.28)" : "0 1px 2px rgba(11,42,74,.04)",
        transition: "box-shadow .2s, transform .2s", cursor: onClick ? "pointer" : "default",
        transform: h && (hover || onClick) ? "translateY(-2px)" : "none",
        ...style,
      }}
    >{children}</div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", icon: Ic, style }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    fontFamily: font.body, fontWeight: 600, border: "none", cursor: "pointer",
    borderRadius: 10, transition: "filter .15s, background .15s",
    padding: size === "sm" ? "6px 12px" : "10px 18px",
    fontSize: size === "sm" ? 13 : 14,
  };
  const variants = {
    primary: { background: C.hull, color: "#fff" },
    dark: { background: C.navy, color: "#fff" },
    buoy: { background: C.buoy, color: "#fff" },
    ghost: { background: "transparent", color: C.hull, border: `1px solid ${C.line}` },
    soft: { background: C.foam, color: C.navy },
    danger: { background: C.redSoft, color: C.red },
  };
  return (
    <button onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(.94)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
      style={{ ...base, ...variants[variant], ...style }}>
      {Ic && <Ic size={size === "sm" ? 15 : 17} strokeWidth={2.3} />} {children}
    </button>
  );
}

function Field({ label, value, wide }) {
  return (
    <div style={{ gridColumn: wide ? "1 / -1" : "auto" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: C.gray, fontWeight: 700, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: C.ink, fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}

function SectionTitle({ icon: Ic, children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Ic && <div style={{ width: 34, height: 34, borderRadius: 9, background: C.foam, display: "grid", placeItems: "center", color: C.hull }}><Ic size={18} strokeWidth={2.2} /></div>}
        <h2 style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: C.navy, margin: 0, letterSpacing: "-.01em" }}>{children}</h2>
      </div>
      {action}
    </div>
  );
}

// ---------- Escudo FVV (fiel al logo circular: velero blanco + orla) ----------
function Escudo({ size = 30 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ flexShrink: 0 }} aria-label="Federación Vasca de Vela">
      <circle cx="50" cy="50" r="49" fill={C.navy} />
      <circle cx="50" cy="50" r="47" fill="none" stroke="#fff" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
      {/* orla textual */}
      <path id="fvv-arc-top" d="M 20 50 A 30 30 0 0 1 80 50" fill="none" />
      <path id="fvv-arc-bot" d="M 80 50 A 30 30 0 0 1 20 50" fill="none" />
      <text fill="#fff" style={{ fontSize: 6.4, fontWeight: 700, letterSpacing: 1.1 }} fontFamily="sans-serif">
        <textPath href="#fvv-arc-top" startOffset="50%" textAnchor="middle">EUSKADIKO BELA FEDERAKUNTZA</textPath>
      </text>
      <text fill="#fff" style={{ fontSize: 6.4, fontWeight: 700, letterSpacing: 1.1 }} fontFamily="sans-serif">
        <textPath href="#fvv-arc-bot" startOffset="50%" textAnchor="middle">FEDERACIÓN VASCA DE VELA</textPath>
      </text>
      {/* velero: velas blancas + olas */}
      <path d="M50 26 L50 62 L34 62 Z" fill="#fff" />
      <path d="M53 30 L53 62 L67 62 Z" fill="#fff" />
      <rect x="49" y="24" width="2" height="40" fill="#fff" />
      <path d="M30 66 q6 4 12 0 t12 0 t12 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 72 q6 4 12 0 t12 0 t12 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Logo({ size = 30 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Escudo size={size} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: C.navy, letterSpacing: "-.01em" }}>Federación Vasca de Vela</div>
        <div style={{ fontSize: 10.5, color: C.gray, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase" }}>Euskadiko Bela · Gestión</div>
      </div>
    </div>
  );
}

/* ============================================================
   PANTALLA: Acceso (el perfil se DEDUCE del usuario)
   ============================================================ */
function Login({ onPick }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  const entrar = (mail) => {
    const u = USUARIOS.find((x) => x.email.toLowerCase() === mail.trim().toLowerCase());
    if (!u) { setError(true); return; }
    onPick(u);
  };

  const roleTag = {
    tecnico: ["Técnico FVV", C.navy], colegio: ["Colegio Jueces", C.navy], secretaria: ["Secretaría", C.navy],
    club: ["Club", C.hull], juez: ["Juez / Oficial", C.buoy],
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.navy} 0%, ${C.hull} 100%)`, display: "grid", placeItems: "center", padding: 20, fontFamily: font.body }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28, color: "#fff" }}>
          <div style={{ margin: "0 auto 16px", width: 72, height: 72 }}><Escudo size={72} /></div>
          <h1 style={{ fontFamily: font.display, fontSize: 26, fontWeight: 600, margin: "0 0 8px", letterSpacing: "-.02em" }}>Sistema de Gestión FVV</h1>
          <p style={{ opacity: .8, fontSize: 14, margin: 0 }}>Accede con tu cuenta. Tu perfil se asigna automáticamente.</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
          <label style={lbl}>Correo electrónico</label>
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && entrar(email)}
            placeholder="tu.correo@ejemplo.com"
            style={{ ...inp, marginBottom: error ? 6 : 14 }}
          />
          {error && <div style={{ color: C.red, fontSize: 12.5, marginBottom: 12 }}>No encontramos esa cuenta. Prueba con un acceso de ejemplo de abajo.</div>}
          <Btn variant="primary" onClick={() => entrar(email)} style={{ width: "100%", justifyContent: "center" }} icon={ArrowRight}>Entrar</Btn>

          <div style={{ textAlign: "center", margin: "18px 0 12px", fontSize: 11.5, color: C.gray, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>Accesos de ejemplo</div>
          <div style={{ display: "grid", gap: 7 }}>
            {USUARIOS.map((u) => {
              const [tag, color] = roleTag[u.rol];
              return (
                <button key={u.email} onClick={() => onPick(u)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.foam)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", border: `1px solid ${C.line}`, borderRadius: 10, background: "#fff", cursor: "pointer", textAlign: "left", transition: "background .15s", width: "100%" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: color, color: "#fff", display: "grid", placeItems: "center", fontFamily: font.display, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    {u.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{u.nombre}</div>
                    <div style={{ fontSize: 11.5, color: C.slate, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color, background: color + "15", padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 20 }}>
          Prototipo · En producción: Entra ID (internos) y Entra External ID (externos)
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Layout con sidebar
   ============================================================ */
const NOTIFS = {
  tecnico: [
    { titulo: "Reserva pendiente de aprobar", desc: "R-2026-6 · CN Hondarribia", ruta: "neumaticas", icon: Waves, color: C.amber },
    { titulo: "Liquidación por pagar", desc: "LQ-2026-12 · 283,40 €", ruta: "liquidaciones", icon: Wallet, color: C.buoy },
    { titulo: "Regata sin nombramientos", desc: "Trofeo RCN San Sebastián 2026", ruta: "regatas", icon: Calendar, color: C.hull },
  ],
  club: [
    { titulo: "Reserva concedida", desc: "R-2026-5 · Zodiac Amarilla", ruta: "neumaticas", icon: CheckCircle2, color: C.green },
    { titulo: "Recuerda registrar la devolución", desc: "Antes del 30 de junio", ruta: "neumaticas", icon: Ship, color: C.buoy },
  ],
  juez: [
    { titulo: "Nueva convocatoria de disponibilidad", desc: "Trofeo RCN San Sebastián · octubre", ruta: "disponibilidad", icon: Calendar, color: C.hull },
    { titulo: "Liquidación enviada", desc: "LQ-2026-12 · pendiente de pago", ruta: "liquidaciones", icon: Wallet, color: C.buoy },
  ],
  colegio: [
    { titulo: "AR pendiente de revisión", desc: "Trofeo San Prudencio 2026", ruta: "regatas", icon: FileText, color: C.amber },
    { titulo: "Liquidación para 1ª aprobación", desc: "LQ-2026-12 · 283,40 €", ruta: "liquidaciones", icon: Wallet, color: C.buoy },
  ],
  secretaria: [
    { titulo: "Liquidación para pago (2º paso)", desc: "Aprobada por Colegio de Jueces", ruta: "liquidaciones", icon: Wallet, color: C.buoy },
  ],
};

const NAV = {
  tecnico: [
    { id: "inicio", label: "Panel", icon: ClipboardList },
    { id: "neumaticas", label: "Neumáticas", icon: Waves },
    { id: "liquidaciones", label: "Liquidaciones", icon: Wallet },
    { id: "regatas", label: "Regatas y nombramientos", icon: Calendar },
    { id: "jueces", label: "Jueces y expedientes", icon: Award },
    { id: "subvenciones", label: "Subvenciones", icon: HandCoins },
    { id: "baremos", label: "Baremos de dietas", icon: Euro },
    { id: "formacion", label: "Formación continua", icon: GraduationCap },
  ],
  colegio: [
    { id: "inicio", label: "Panel", icon: ClipboardList },
    { id: "liquidaciones", label: "Liquidaciones", icon: Wallet },
    { id: "regatas", label: "Regatas y AR/IR", icon: Calendar },
    { id: "jueces", label: "Jueces y expedientes", icon: Award },
    { id: "federados", label: "Federados", icon: Users },
    { id: "formacion", label: "Formación continua", icon: GraduationCap },
    { id: "usuarios", label: "Usuarios", icon: Users },
  ],
  secretaria: [
    { id: "inicio", label: "Panel", icon: ClipboardList },
    { id: "neumaticas", label: "Neumáticas", icon: Waves },
    { id: "liquidaciones", label: "Liquidaciones", icon: Wallet },
    { id: "regatas", label: "Regatas y nombramientos", icon: Calendar },
    { id: "jueces", label: "Jueces y expedientes", icon: Award },
    { id: "federados", label: "Federados", icon: Users },
    { id: "subvenciones", label: "Subvenciones", icon: HandCoins },
    { id: "baremos", label: "Baremos de dietas", icon: Euro },
    { id: "usuarios", label: "Usuarios", icon: Users },
  ],
  club: [
    { id: "inicio", label: "Panel", icon: ClipboardList },
    { id: "neumaticas", label: "Mis reservas", icon: Waves },
    { id: "regatas", label: "Mis regatas", icon: Calendar },
    { id: "liquidaciones", label: "Liquidaciones", icon: Wallet },
    { id: "instrucciones", label: "Instrucciones", icon: FileText },
  ],
  juez: [
    { id: "inicio", label: "Panel", icon: ClipboardList },
    { id: "disponibilidad", label: "Disponibilidad", icon: Calendar },
    { id: "liquidaciones", label: "Mis liquidaciones", icon: Wallet },
    { id: "expediente", label: "Mi expediente", icon: Award },
    { id: "formacion", label: "Formación", icon: GraduationCap },
  ],
};

function Shell({ user, onLogout }) {
  const role = user.rol;
  const [route, setRoute] = useState("inicio");
  const [detail, setDetail] = useState(null); // {tipo, id}
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const nav = NAV[role];
  const roleLabel = { tecnico: "Técnico FVV", colegio: "Colegio de Jueces", secretaria: "Secretaría", club: "Club", juez: "Juez / Oficial" }[role];
  const persona = user.nombre;

  const go = (r) => { setRoute(r); setDetail(null); setOpen(false); };

  return (
    <AppCtx.Provider value={{ role, user, go, openDetail: setDetail }}>
      <div style={{ minHeight: "100vh", background: C.sail, fontFamily: font.body, display: "flex" }}>
        {/* Sidebar desktop */}
        <aside style={{
          width: 250, background: C.navy, color: "#fff", flexShrink: 0,
          position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column",
          padding: "22px 14px",
        }} className="fvv-side">
          <div style={{ padding: "0 8px 20px", borderBottom: "1px solid rgba(255,255,255,.1)", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Escudo size={34} />
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 14 }}>FVV Gestión</div>
                <div style={{ fontSize: 10, opacity: .6, letterSpacing: ".1em", textTransform: "uppercase" }}>{roleLabel}</div>
              </div>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {nav.map((n) => {
              const active = route === n.id;
              return (
                <button key={n.id} onClick={() => go(n.id)} style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "10px 12px",
                  background: active ? "rgba(255,255,255,.14)" : "transparent",
                  border: "none", borderRadius: 9, color: active ? "#fff" : "rgba(255,255,255,.72)",
                  fontFamily: font.body, fontSize: 13.5, fontWeight: active ? 600 : 500, cursor: "pointer",
                  textAlign: "left", transition: "background .15s",
                }}>
                  <n.icon size={17} strokeWidth={2.1} /> {n.label}
                </button>
              );
            })}
          </nav>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.buoy, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>{persona[0]}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600 }}>{persona}</div>
                <div style={{ opacity: .55, fontSize: 11 }}>{roleLabel}</div>
              </div>
            </div>
            <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "transparent", border: "none", color: "rgba(255,255,255,.6)", fontFamily: font.body, fontSize: 13, cursor: "pointer", width: "100%" }}>
              <LogOut size={15} /> Cambiar de perfil
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 40 }} className="fvv-overlay">
            <aside onClick={(e) => e.stopPropagation()} style={{ width: 250, height: "100%", background: C.navy, color: "#fff", padding: "22px 14px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontFamily: font.display, fontWeight: 700 }}>FVV Gestión</span>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#fff" }}><X size={20} /></button>
              </div>
              {nav.map((n) => (
                <button key={n.id} onClick={() => go(n.id)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", background: route === n.id ? "rgba(255,255,255,.14)" : "transparent", border: "none", borderRadius: 9, color: "#fff", fontFamily: font.body, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
                  <n.icon size={17} /> {n.label}
                </button>
              ))}
              <button onClick={onLogout} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "transparent", border: "none", color: "rgba(255,255,255,.6)", fontSize: 13, cursor: "pointer" }}><LogOut size={15} /> Cambiar de perfil</button>
            </aside>
          </div>
        )}

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: `1px solid ${C.line}`, background: "#fff", position: "sticky", top: 0, zIndex: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setOpen(true)} className="fvv-burger" style={{ background: "none", border: "none", color: C.navy, cursor: "pointer", display: "none" }}><Menu size={22} /></button>
              <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 16, color: C.navy }}>
                {nav.find((n) => n.id === route)?.label}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative" }}>
                <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: "relative", background: "none", border: "none", color: C.slate, cursor: "pointer", padding: 4, display: "grid", placeItems: "center" }}>
                  <Bell size={19} />
                  {NOTIFS[role].length > 0 && <span style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: C.buoy, border: "2px solid #fff" }} />}
                </button>
                {notifOpen && (
                  <>
                    <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
                    <div style={{ position: "absolute", right: 0, top: 34, width: 300, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: "0 12px 32px -12px rgba(11,42,74,.3)", zIndex: 31, overflow: "hidden" }}>
                      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.graySoft}`, fontFamily: font.display, fontWeight: 600, fontSize: 14, color: C.navy }}>Notificaciones</div>
                      {NOTIFS[role].length === 0 && <div style={{ padding: 16, fontSize: 13, color: C.slate }}>No tienes notificaciones.</div>}
                      {NOTIFS[role].map((n, i) => (
                        <button key={i} onClick={() => { go(n.ruta); setNotifOpen(false); }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.foam)} onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                          style={{ display: "flex", gap: 10, alignItems: "flex-start", width: "100%", padding: "11px 14px", background: "#fff", border: "none", borderBottom: `1px solid ${C.graySoft}`, cursor: "pointer", textAlign: "left", fontFamily: font.body }}>
                          <span style={{ width: 30, height: 30, borderRadius: 8, background: n.color + "18", color: n.color, display: "grid", placeItems: "center", flexShrink: 0 }}><n.icon size={15} /></span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 13, color: C.ink, fontWeight: 500 }}>{n.titulo}</span>
                            <span style={{ display: "block", fontSize: 12, color: C.slate }}>{n.desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <div style={{ padding: "24px", maxWidth: 1120, margin: "0 auto" }}>
            {detail
              ? <Detail detail={detail} back={() => setDetail(null)} />
              : <Router route={route} role={role} />}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .fvv-side { display: none !important; }
          .fvv-burger { display: block !important; }
        }
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid ${C.buoy}; outline-offset: 2px; }
      `}</style>
    </AppCtx.Provider>
  );
}

/* ============================================================
   Router de pantallas
   ============================================================ */
function Router({ route, role }) {
  if (route === "inicio") return <Inicio role={role} />;
  if (route === "neumaticas") return <Neumaticas role={role} />;
  if (route === "liquidaciones") return <Liquidaciones role={role} />;
  if (route === "regatas") return <Regatas />;
  if (route === "jueces") return <JuecesList />;
  if (route === "disponibilidad") return <Disponibilidad />;
  if (route === "expediente") return <Expediente juezId="J1" />;
  if (route === "formacion") return <Formacion role={role} />;
  if (route === "subvenciones") return <Subvenciones />;
  if (route === "baremos") return <Baremos />;
  if (route === "usuarios") return <Usuarios />;
  if (route === "federados") return <Federados />;
  if (route === "instrucciones") return <Instrucciones />;
  return null;
}

/* ============================================================
   PANEL de inicio (por rol)
   ============================================================ */
function Stat({ icon: Ic, label, value, tone = C.hull, sub, onClick }) {
  return (
    <Card style={{ padding: 18 }} onClick={onClick} hover={!!onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: tone + "18", color: tone, display: "grid", placeItems: "center" }}>
          <Ic size={20} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 12.5, color: C.slate, marginTop: 3 }}>{label}</div>
        </div>
      </div>
      {sub && <div style={{ fontSize: 12, color: C.gray, marginTop: 10 }}>{sub}</div>}
    </Card>
  );
}

function Inicio({ role }) {
  const { go, openDetail } = useContext(AppCtx);
  if (esFVV(role)) {
    const pendientes = RESERVAS.filter((r) => r.estado === "pendiente");
    const porPagar = LIQUIDACIONES.filter((l) => l.estado === "enviada");
    return (
      <div>
        <SectionTitle icon={ClipboardList}>Panel del técnico</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 26 }}>
          <Stat icon={Waves} label="Reservas pendientes" value={pendientes.length} tone={C.amber} onClick={() => go("neumaticas")} />
          <Stat icon={Wallet} label="Liquidaciones por pagar" value={porPagar.length} tone={C.buoy} onClick={() => go("liquidaciones")} />
          <Stat icon={Calendar} label="Regatas activas" value={REGATAS.length} tone={C.hull} onClick={() => go("regatas")} />
          <Stat icon={Award} label="Jueces en colegio" value={JUECES.length} tone={C.green} onClick={() => go("jueces")} />
        </div>

        <Card style={{ padding: 20, marginBottom: 18 }}>
          <SectionTitle icon={AlertTriangle}>Requiere tu acción</SectionTitle>
          {pendientes.map((r) => (
            <Row key={r.id} onClick={() => openDetail({ tipo: "reserva", id: r.id })}
              left={<><strong>{r.id}</strong> · {r.club}</>}
              mid={`Neumática ${neumaticaDe(r.neumatica)?.nombre} · ${fecha(r.recogida)}`}
              right={<Badge status="pendiente" />} />
          ))}
          {porPagar.map((l) => (
            <Row key={l.id} onClick={() => openDetail({ tipo: "liquidacion", id: l.id })}
              left={<><strong>{l.id}</strong> · {jueza(l.juez)?.nombre}</>}
              mid={`${regataDe(l.regata)?.nombre} · ${eur(l.total)}`}
              right={<Badge status="enviada" />} />
          ))}
        </Card>
      </div>
    );
  }
  if (role === "club") {
    const mis = RESERVAS.filter((r) => r.club.includes("Abra"));
    return (
      <div>
        <SectionTitle icon={ClipboardList}>Panel del club</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 26 }}>
          <Stat icon={Waves} label="Reservas activas" value={mis.length} tone={C.hull} onClick={() => go("neumaticas")} />
          <Stat icon={CheckCircle2} label="Concedidas" value={mis.filter(r=>r.estado==="concedida").length} tone={C.green} onClick={() => go("neumaticas")} />
          <Stat icon={FileText} label="Instrucciones" value="12" tone={C.buoy} sub="Guías para clubes" onClick={() => go("instrucciones")} />
        </div>
        <Card style={{ padding: 20 }}>
          <SectionTitle icon={Waves} action={<Btn size="sm" icon={Plus} onClick={() => go("neumaticas")}>Nueva reserva</Btn>}>Tus reservas</SectionTitle>
          {mis.map((r) => (
            <Row key={r.id} onClick={() => openDetail({ tipo: "reserva", id: r.id })}
              left={<><strong>{r.id}</strong> · {r.evento}</>}
              mid={`${fecha(r.recogida)} → ${fecha(r.devolucion)}`}
              right={<Badge status={r.estado} />} />
          ))}
        </Card>
      </div>
    );
  }
  // juez
  const j = jueza("J1");
  const misLiq = LIQUIDACIONES.filter((l) => l.juez === "J1");
  return (
    <div>
      <SectionTitle icon={ClipboardList}>Hola, {j.nombre.split(" ")[0]}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 26 }}>
        <Stat icon={Calendar} label="Regatas asignadas" value={REGATAS.filter(r=>r.nombramientos.some(n=>n.juez==="J1")).length} tone={C.hull} onClick={() => go("expediente")} />
        <Stat icon={Wallet} label="Liquidaciones" value={misLiq.length} tone={C.buoy} sub={`${misLiq.filter(l=>l.estado==="pagada").length} pagadas`} onClick={() => go("liquidaciones")} />
        <Stat icon={CheckCircle2} label="Disponibilidades" value={DISPONIBILIDAD.filter(d=>d.disp).length} tone={C.green} onClick={() => go("disponibilidad")} />
        <Stat icon={GraduationCap} label="Formación 2026" value="7 h" tone={C.amber} onClick={() => go("formacion")} />
      </div>
      <Card style={{ padding: 20 }}>
        <SectionTitle icon={Bell}>Novedades</SectionTitle>
        <Row onClick={() => go("disponibilidad")} left={<strong>Nueva convocatoria de disponibilidad</strong>} mid="Trofeo RCN San Sebastián · octubre" right={<Badge status="pendiente" />} />
        <Row onClick={() => go("liquidaciones")} left={<strong>LQ-2026-12 enviada</strong>} mid={`${eur(283.4)} · pendiente de pago`} right={<Badge status="enviada" />} />
      </Card>
    </div>
  );
}

function Row({ left, mid, right, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        padding: "12px 10px", borderRadius: 10, cursor: onClick ? "pointer" : "default",
        background: h && onClick ? C.foam : "transparent", transition: "background .15s",
        borderBottom: `1px solid ${C.graySoft}` }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{left}</div>
        {mid && <div style={{ fontSize: 12.5, color: C.slate, marginTop: 2 }}>{mid}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {right}
        {onClick && <ChevronRight size={16} color={C.gray} />}
      </div>
    </div>
  );
}

/* ============================================================
   NEUMÁTICAS
   ============================================================ */
function Neumaticas({ role }) {
  const { openDetail } = useContext(AppCtx);
  const [tab, setTab] = useState(role === "club" ? "reservas" : "flota");
  const [nueva, setNueva] = useState(false);

  const reservas = role === "club" ? RESERVAS.filter((r) => r.club.includes("Abra")) : RESERVAS;

  if (nueva) return <NuevaReserva onClose={() => setNueva(false)} />;

  const tabs = role === "club" ? [] : [["flota", "Flota"], ["reservas", "Reservas"], ["calendario", "Calendario"]];

  return (
    <div>
      <SectionTitle icon={Waves} action={role === "club" && <Btn icon={Plus} onClick={() => setNueva(true)}>Solicitar neumática</Btn>}>
        {role === "club" ? "Reserva de neumáticas" : "Neumáticas"}
      </SectionTitle>

      {role !== "club" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {tabs.map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 16px", borderRadius: 9, border: `1px solid ${tab === t ? C.hull : C.line}`,
              background: tab === t ? C.hull : "#fff", color: tab === t ? "#fff" : C.slate,
              fontFamily: font.body, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>
      )}

      {tab === "flota" && role !== "club" && <Flota role={role} />}

      {tab === "calendario" && role !== "club" && <CalendarioOcupacion />}

      {(tab === "reservas" || role === "club") && (
        <Card style={{ padding: 8 }}>
          {reservas.map((r) => (
            <Row key={r.id} onClick={() => openDetail({ tipo: "reserva", id: r.id })}
              left={<><strong>{r.id}</strong> · {neumaticaDe(r.neumatica)?.nombre}</>}
              mid={`${r.club} · ${fecha(r.recogida)} → ${fecha(r.devolucion)}`}
              right={<Badge status={r.estado} />} />
          ))}
        </Card>
      )}
    </div>
  );
}

function Flota({ role }) {
  const [flota, setFlota] = useState(NEUMATICAS);
  const cambiarEstado = (id, estado) => setFlota(flota.map((n) => n.id === id ? { ...n, estado } : n));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
      {flota.map((n) => {
        const usos = RESERVAS.filter((r) => r.neumatica === n.id && r.estado === "concedida").length;
        const estadoBadge = n.estado === "mantenimiento" ? "mantenimiento" : n.estado === "fueraservicio" ? "fueraservicio" : "disponible";
        return (
          <Card key={n.id} style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: C.foam, display: "grid", placeItems: "center", color: C.hull }}><Ship size={22} /></div>
              <Badge status={estadoBadge} />
            </div>
            <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 16, color: C.navy, marginTop: 12 }}>{n.nombre}</div>
            <div style={{ fontSize: 12.5, color: C.slate }}>“{n.alias}” · {n.motor}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.graySoft}`, fontSize: 12.5, color: C.slate }}>
              <span>{usos} usos concedidos</span>
            </div>
            {esFVV(role) && (
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={() => cambiarEstado(n.id, "operativa")} style={miniBtn(n.estado === "operativa", C.green)}>Operativa</button>
                <button onClick={() => cambiarEstado(n.id, "mantenimiento")} style={miniBtn(n.estado === "mantenimiento", C.amber)}>Mantenimiento</button>
                <button onClick={() => cambiarEstado(n.id, "fueraservicio")} style={miniBtn(n.estado === "fueraservicio", C.slate)}>Fuera de servicio</button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
const miniBtn = (active, color) => ({
  fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: 7, cursor: "pointer",
  border: `1px solid ${active ? color : C.line}`, background: active ? color : "#fff",
  color: active ? "#fff" : C.slate, fontFamily: font.body,
});

// Calendario de ocupación: muestra solapes por embarcación en una rejilla de días
function CalendarioOcupacion() {
  // Rango visible: junio–octubre 2026 en semanas
  const meses = [
    { m: "Jun", dias: 30, y: 2026, mm: 6 },
    { m: "Jul", dias: 31, y: 2026, mm: 7 },
    { m: "Sep", dias: 30, y: 2026, mm: 9 },
    { m: "Oct", dias: 31, y: 2026, mm: 10 },
  ];
  const dentro = (r, y, mm, d) => {
    const day = `${y}-${String(mm).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return day >= r.recogida && day <= r.devolucion;
  };
  const colorEstado = { concedida: C.green, pendiente: C.amber, denegada: C.line };

  return (
    <Card style={{ padding: 18, overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: 12, color: C.slate, flexWrap: "wrap" }}>
        <Leyenda color={C.green} txt="Concedida" />
        <Leyenda color={C.amber} txt="Pendiente" />
        <Leyenda color={C.foam} txt="Mantenimiento" border />
      </div>
      {NEUMATICAS.map((n) => (
        <div key={n.id} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: C.navy, fontSize: 13.5, marginBottom: 6 }}>
            {n.nombre} <span style={{ color: C.gray, fontWeight: 400 }}>“{n.alias}”</span>
            {n.estado === "mantenimiento" && <span style={{ fontSize: 11, color: C.amber, marginLeft: 8 }}>· en mantenimiento</span>}
          </div>
          {meses.map((mes) => (
            <div key={mes.m} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ width: 30, fontSize: 11, color: C.gray, flexShrink: 0 }}>{mes.m}</span>
              <div style={{ display: "flex", gap: 1 }}>
                {Array.from({ length: mes.dias }, (_, i) => i + 1).map((d) => {
                  const res = RESERVAS.find((r) => r.neumatica === n.id && r.estado !== "denegada" && dentro(r, mes.y, mes.mm, d));
                  const mant = n.estado === "mantenimiento";
                  const bg = res ? colorEstado[res.estado] : mant ? C.foam : "#fff";
                  return (
                    <div key={d} title={res ? `${res.id} · ${res.club}` : `${d} ${mes.m}`}
                      style={{ width: 9, height: 18, background: bg, border: `1px solid ${res ? bg : C.graySoft}`, borderRadius: 2, cursor: res ? "pointer" : "default" }} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
      <div style={{ fontSize: 12, color: C.slate, marginTop: 8 }}>
        Cada celda es un día. Dos bloques del mismo color sobre una misma embarcación = solape: el sistema deniega la segunda solicitud automáticamente.
      </div>
    </Card>
  );
}
function Leyenda({ color, txt, border }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 12, height: 12, background: color, borderRadius: 3, border: border ? `1px solid ${C.line}` : "none" }} /> {txt}
    </span>
  );
}

function NuevaReserva({ onClose }) {
  const [n, setN] = useState("N1");
  const [rec, setRec] = useState("");
  const [dev, setDev] = useState("");
  const [result, setResult] = useState(null);

  // Regla: choque de fechas -> denegada; mantenimiento -> bloqueada; libre -> pendiente
  const evaluar = () => {
    const neu = neumaticaDe(n);
    if (neu.estado === "mantenimiento") return setResult({ estado: "mantenimiento", msg: "Esta neumática está en mantenimiento en esas fechas. Elige otra unidad." });
    const solapa = RESERVAS.some((r) => r.neumatica === n && r.estado === "concedida" &&
      !(dev < r.recogida || rec > r.devolucion) && rec && dev);
    if (!rec || !dev) return setResult({ estado: "error", msg: "Indica fecha de recogida y devolución." });
    if (solapa) return setResult({ estado: "denegada", msg: "Ya existe una reserva concedida que solapa con esas fechas. La solicitud queda denegada automáticamente." });
    setResult({ estado: "pendiente", msg: "Fechas libres. La solicitud se registra y queda pendiente de aprobación de la federación." });
  };

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={onClose} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={Plus}>Nueva solicitud de neumática</SectionTitle>
      <Card style={{ padding: 24, maxWidth: 640 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={lbl}>Neumática</label>
            <select value={n} onChange={(e) => { setN(e.target.value); setResult(null); }} style={inp}>
              {NEUMATICAS.map((x) => <option key={x.id} value={x.id}>{x.nombre} — “{x.alias}” {x.estado === "mantenimiento" ? "(en mantenimiento)" : ""}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={lbl}>Fecha de recogida</label><input type="date" value={rec} onChange={(e) => { setRec(e.target.value); setResult(null); }} style={inp} /></div>
            <div><label style={lbl}>Fecha de devolución</label><input type="date" value={dev} onChange={(e) => { setDev(e.target.value); setResult(null); }} style={inp} /></div>
          </div>
          <div><label style={lbl}>Evento</label><input placeholder="Campeonato de Euskadi de J80…" style={inp} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={lbl}>Patrón</label><input placeholder="Nombre y apellidos" style={inp} /></div>
            <div><label style={lbl}>Titulación</label><input placeholder="TD3" style={inp} /></div>
          </div>

          {result && (
            <div style={{ background: STATUS[result.estado === "error" ? "denegada" : result.estado]?.bg || C.redSoft, borderRadius: 10, padding: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
              {result.estado === "pendiente" ? <Clock size={18} color={C.amber} /> : result.estado === "mantenimiento" ? <Wrench size={18} color={C.slate} /> : <XCircle size={18} color={C.red} />}
              <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{result.msg}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            {result?.estado === "pendiente"
              ? <Btn variant="primary" icon={Send} onClick={onClose}>Enviar solicitud</Btn>
              : <Btn variant="dark" onClick={evaluar}>Comprobar disponibilidad</Btn>}
          </div>
        </div>
      </Card>
    </div>
  );
}

const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em" };
const inp = { width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${C.line}`, fontFamily: font.body, fontSize: 14, color: C.ink, background: "#fff" };

/* ============================================================
   LIQUIDACIONES
   ============================================================ */
function Liquidaciones({ role }) {
  const { openDetail, user } = useContext(AppCtx);
  const [nueva, setNueva] = useState(false);
  const puedeCrear = role === "juez" || esFVV(role);

  if (nueva) return <NuevaLiquidacion juezId={role === "juez" ? (user?.juezId || "J1") : null} modoTecnico={esFVV(role)} onClose={() => setNueva(false)} />;

  // Vista del club: liquidaciones de SUS regatas
  if (role === "club") {
    const misRegatas = REGATAS.filter((r) => mismaEntidad(r.club, user?.clubMatch || ""));
    const ids = misRegatas.map((r) => r.id);
    const deMisRegatas = LIQUIDACIONES.filter((l) => ids.includes(l.regata));
    const pagaClub = deMisRegatas.filter((l) => {
      const nm = regataDe(l.regata)?.nombramientos.find((n) => n.juez === l.juez);
      return nm?.pagador === "Club";
    });
    const otras = deMisRegatas.filter((l) => !pagaClub.includes(l));
    const totalOtras = otras.reduce((a, l) => a + l.total, 0);

    return (
      <div>
        <SectionTitle icon={Wallet}>Liquidaciones de mis regatas</SectionTitle>
        <Card style={{ padding: 16, marginBottom: 16, background: C.foam, border: "none" }}>
          <div style={{ fontSize: 13.5, color: C.navy, display: "flex", gap: 10, alignItems: "center" }}>
            <Wallet size={17} color={C.hull} /> Validas las liquidaciones que paga tu club. Las financiadas por la federación se muestran solo como total agregado.
          </div>
        </Card>

        <div style={{ ...sub }}>A cargo del club — para validar</div>
        <Card style={{ padding: 8, marginBottom: 20 }}>
          {pagaClub.length === 0 && <div style={{ padding: 16, fontSize: 13, color: C.slate }}>No hay liquidaciones a cargo del club.</div>}
          {pagaClub.map((l) => (
            <Row key={l.id} onClick={() => openDetail({ tipo: "liquidacion", id: l.id })}
              left={<><strong>{l.id}</strong> · {jueza(l.juez)?.nombre}</>}
              mid={`${regataDe(l.regata)?.nombre} · ${l.motivo}`}
              right={<span style={{ display: "flex", alignItems: "center", gap: 12 }}><strong style={{ fontFamily: font.display, color: C.navy }}>{eur(l.total)}</strong><Badge status={l.estado} /></span>} />
          ))}
        </Card>

        <div style={{ ...sub }}>Financiadas por la federación</div>
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.slate, fontSize: 14 }}>
              <Users size={18} color={C.buoy} /> {otras.length} {otras.length === 1 ? "oficial financiado" : "oficiales financiados"} por la FVV / otras federaciones
            </div>
            <strong style={{ fontFamily: font.display, color: C.navy, fontSize: 17 }}>{eur(totalOtras)}</strong>
          </div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 10 }}>Sin desglose por persona: estas dietas no las abona el club.</div>
        </Card>
      </div>
    );
  }

  const lista = role === "juez" ? LIQUIDACIONES.filter((l) => l.juez === (user?.juezId || "J1")) : LIQUIDACIONES;

  return (
    <div>
      <SectionTitle icon={Wallet} action={puedeCrear && <Btn icon={Plus} onClick={() => setNueva(true)}>Nueva liquidación</Btn>}>
        {role === "juez" ? "Mis liquidaciones" : "Liquidaciones y dietas"}
      </SectionTitle>
      {role === "juez" && (
        <Card style={{ padding: 16, marginBottom: 16, background: C.foam, border: "none" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13.5, color: C.navy }}>
            <Send size={17} color={C.hull} />
            El formulario te llega semirrelleno con tus datos de la federación (nombre, DNI, IBAN). Solo añades gastos y justificantes.
          </div>
        </Card>
      )}
      <Card style={{ padding: 8 }}>
        {lista.map((l) => (
          <Row key={l.id} onClick={() => openDetail({ tipo: "liquidacion", id: l.id })}
            left={<><strong>{l.id}</strong> · {regataDe(l.regata)?.nombre || l.motivo}</>}
            mid={`${jueza(l.juez)?.nombre || "—"} · ${l.motivo}`}
            right={<span style={{ display: "flex", alignItems: "center", gap: 12 }}><strong style={{ fontFamily: font.display, color: C.navy }}>{eur(l.total)}</strong><Badge status={l.estado} /></span>} />
        ))}
      </Card>
    </div>
  );
}

function NuevaLiquidacion({ juezId, modoTecnico, onClose }) {
  const [juezSel, setJuezSel] = useState(juezId || "");
  const juezActivo = juezSel || juezId;
  const j = jueza(juezActivo);
  const regatasElegibles = REGATAS.filter((r) => r.nombramientos.some((n) => n.juez === juezActivo && n.pagador !== "Voluntario"));

  const [modo, setModo] = useState("regata"); // 'regata' | 'personal' | 'otros'
  const [regataSel, setRegataSel] = useState(regatasElegibles[0]?.id || "");
  const [motivoPersonal, setMotivoPersonal] = useState("");
  const [entidadPersonal, setEntidadPersonal] = useState("Juez · FVV");
  const [beneficiarioOtros, setBeneficiarioOtros] = useState("");
  const [diasRegata, setDiasRegata] = useState(1);
  const [diasViaje, setDiasViaje] = useState(0);
  const [km, setKm] = useState(0);
  const [gastos, setGastos] = useState([]);
  const [enviado, setEnviado] = useState(false);

  const nombramiento = modo === "regata" ? regataDe(regataSel)?.nombramientos.find((n) => n.juez === juezActivo) : null;
  const pagador = modo === "personal" ? "Personal" : modo === "otros" ? "FVV" : (nombramiento?.pagador || "FVV");
  const baremo = modo === "personal" ? BAREMOS_ENTIDAD[entidadPersonal] : BAREMOS_ENTIDAD["Juez · FVV"];

  const subBaremos = diasRegata * baremo.diaRegata + diasViaje * baremo.diaViaje + km * baremo.km;
  const subGastos = gastos.reduce((a, g) => a + (parseFloat(g.total) || 0), 0);
  const total = subBaremos + subGastos;

  const setG = (i, campo, val) => setGastos(gastos.map((g, idx) => idx === i ? { ...g, [campo]: val } : g));
  const addG = () => setGastos([...gastos, { concepto: "Manutención", total: "", justif: false }]);
  const delG = (i) => setGastos(gastos.filter((_, idx) => idx !== i));

  const destino = pagador === "Club" ? `directamente al club (${regataDe(regataSel)?.club})`
    : pagador === "Personal" ? `según baremo ${entidadPersonal} (uso personal)`
    : modo === "otros" ? "a la federación (liquidación creada por la FVV)"
    : "a la federación para su aprobación";

  if (enviado) return (
    <Card style={{ padding: 36, maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenSoft, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><CheckCircle2 size={30} color={C.green} /></div>
      <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: C.navy }}>Liquidación registrada</div>
      <div style={{ fontSize: 13.5, color: C.slate, marginTop: 8, lineHeight: 1.5 }}>Por {eur(total)}. Se envía {destino}.</div>
      <Btn variant="primary" onClick={onClose} style={{ marginTop: 20 }}>Volver</Btn>
    </Card>
  );

  const numInp = { ...miniInp, textAlign: "center", width: 70 };

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={onClose} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={Wallet}>Nueva liquidación de dietas</SectionTitle>
      <Card style={{ padding: 24, maxWidth: 680 }}>
        {modoTecnico && (
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Beneficiario (juez)</label>
            <select value={juezSel} onChange={(e) => { setJuezSel(e.target.value); setRegataSel(""); }} style={inp}>
              <option value="">— Selecciona un juez —</option>
              {JUECES.map((jj) => <option key={jj.id} value={jj.id}>{jj.nombre}</option>)}
            </select>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>O usa el tipo «Otros» para un beneficiario no listado.</div>
          </div>
        )}

        {j && (
          <div style={{ background: C.foam, borderRadius: 10, padding: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.hull, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Datos del beneficiario</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
              <Field label="Nombre" value={j.nombre} />
              <Field label="DNI" value={j.dni} />
              <Field label="IBAN" value={j.iban} />
            </div>
          </div>
        )}

        {/* Tipo de liquidación */}
        <label style={lbl}>Tipo de liquidación</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setModo("regata")} style={toggle(modo === "regata", C.hull)}><Award size={15} /> Por actuación en regata</button>
          <button onClick={() => setModo("personal")} style={toggle(modo === "personal", C.buoy)}><Wallet size={15} /> Uso personal</button>
          {modoTecnico && <button onClick={() => setModo("otros")} style={toggle(modo === "otros", C.navy)}><FileSignature size={15} /> Otros</button>}
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {modo === "otros" ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div><label style={lbl}>Beneficiario / concepto</label><input value={beneficiarioOtros} onChange={(e) => setBeneficiarioOtros(e.target.value)} placeholder="Nombre o concepto" style={inp} /></div>
              <div><label style={lbl}>Motivo</label><input value={motivoPersonal} onChange={(e) => setMotivoPersonal(e.target.value)} placeholder="Describe el motivo" style={inp} /></div>
            </div>
          ) : modo === "regata" ? (
            <div>
              <label style={lbl}>Regata / actuación</label>
              <select value={regataSel} onChange={(e) => setRegataSel(e.target.value)} style={inp}>
                {regatasElegibles.length === 0 && <option value="">No tienes actuaciones pendientes de liquidar</option>}
                {regatasElegibles.map((r) => <option key={r.id} value={r.id}>{r.nombre} — {fecha(r.fecha)}</option>)}
              </select>
              {nombramiento && (
                <div style={{ fontSize: 12.5, color: C.slate, marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  {nombramiento.rol} · paga: <PagadorTag pagador={nombramiento.pagador} />
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={lbl}>Baremo aplicable</label>
                <select value={entidadPersonal} onChange={(e) => setEntidadPersonal(e.target.value)} style={inp}>
                  <option value="Juez · FVV">Juez — FVV (103 / 51,5 / 0,30)</option>
                  <option value="Juez · RFEV">Juez — RFEV (103 / 51,5 / 0,26)</option>
                </select>
                <div style={{ fontSize: 12.5, color: C.slate, marginTop: 6 }}>En uso personal eliges tú entre baremo FVV o RFEV.</div>
              </div>
              <div>
                <label style={lbl}>Motivo</label>
                <input value={motivoPersonal} onChange={(e) => setMotivoPersonal(e.target.value)} placeholder="Describe el motivo de la liquidación" style={inp} />
              </div>
            </div>
          )}

          {/* Baremos: el juez pone cantidades, el importe es estándar */}
          <div>
            <label style={lbl}>Dietas y kilometraje (baremo {modo === "personal" ? entidadPersonal : "FVV"})</label>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
              <BaremoRow label="Días de regata" precio={`${eur(baremo.diaRegata)}/día`} value={diasRegata} onChange={setDiasRegata} subtotal={diasRegata * baremo.diaRegata} inputStyle={numInp} />
              <BaremoRow label="Días de viaje" precio={`${eur(baremo.diaViaje)}/día`} value={diasViaje} onChange={setDiasViaje} subtotal={diasViaje * baremo.diaViaje} inputStyle={numInp} />
              <BaremoRow label="Kilómetros" precio={`${baremo.km.toFixed(2)} €/km`} value={km} onChange={setKm} subtotal={km * baremo.km} inputStyle={numInp} step />
            </div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>Los importes unitarios los fija la federación. Tú solo indicas las cantidades.</div>
          </div>

          {/* Otros gastos con justificante */}
          <div>
            <label style={lbl}>Manutención, peajes y otros (con justificante)</label>
            {gastos.length > 0 && (
              <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 90px 1fr 32px", background: C.navy, color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "8px 10px", gap: 8 }}>
                  <span>Concepto</span><span>Importe €</span><span>Justificante</span><span />
                </div>
                {gastos.map((g, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 90px 1fr 32px", gap: 8, padding: "8px 10px", borderTop: `1px solid ${C.graySoft}`, alignItems: "center" }}>
                    <input value={g.concepto} onChange={(e) => setG(i, "concepto", e.target.value)} placeholder="Manutención" style={miniInp} />
                    <input value={g.total} onChange={(e) => setG(i, "total", e.target.value)} placeholder="0" inputMode="decimal" style={{ ...miniInp, textAlign: "right" }} />
                    <button onClick={() => setG(i, "justif", !g.justif)} style={{ ...miniInp, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, justifyContent: "center", color: g.justif ? C.green : C.slate, borderColor: g.justif ? C.green : C.line }}>
                      {g.justif ? <><CheckCircle2 size={14} /> Adjuntado</> : <><Upload size={14} /> Adjuntar</>}
                    </button>
                    <button onClick={() => delG(i)} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer" }}><X size={15} /></button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={addG} style={{ background: "none", border: "none", color: C.hull, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: font.body }}>
              <Plus size={15} /> Añadir gasto con justificante
            </button>
          </div>

          {/* Total desglosado */}
          <div style={{ background: C.foam, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.slate, marginBottom: 4 }}><span>Dietas y km (baremo)</span><span>{eur(subBaremos)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.slate, marginBottom: 8 }}><span>Otros gastos justificados</span><span>{eur(subGastos)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${C.line}`, fontFamily: font.display }}>
              <strong style={{ color: C.navy }}>TOTAL</strong><strong style={{ color: C.hull, fontSize: 18 }}>{eur(total)}</strong>
            </div>
          </div>

          {/* Aviso de destino según pagador */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: pagador === "Club" ? C.buoySoft : C.graySoft, borderRadius: 10, padding: 12, fontSize: 13, color: C.ink }}>
            {pagador === "Club" ? <Ship size={17} color={C.buoy} style={{ flexShrink: 0, marginTop: 1 }} /> : <Send size={17} color={C.slate} style={{ flexShrink: 0, marginTop: 1 }} />}
            <span>Al firmar, esta liquidación se enviará {destino}.</span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            {(() => {
              const valido = total > 0 && (
                modo === "personal" ? motivoPersonal :
                modo === "otros" ? (beneficiarioOtros && motivoPersonal) :
                (regataSel && (j))
              );
              return (
                <Btn variant="primary" icon={Send} onClick={() => setEnviado(true)}
                  style={{ opacity: valido ? 1 : .5, pointerEvents: valido ? "auto" : "none" }}>
                  {modoTecnico ? "Crear liquidación" : "Firmar y enviar"}
                </Btn>
              );
            })()}
          </div>
        </div>
      </Card>
    </div>
  );
}

function BaremoRow({ label, precio, value, onChange, subtotal, inputStyle, step }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 80px 90px", gap: 10, alignItems: "center", padding: "9px 12px", borderTop: `1px solid ${C.graySoft}` }}>
      <span style={{ fontSize: 13.5, color: C.ink, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: C.gray }}>{precio}</span>
      <input type="number" min="0" step={step ? "1" : "1"} value={value}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))} style={inputStyle} />
      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.navy, textAlign: "right" }}>{eur(subtotal)}</span>
    </div>
  );
}
const miniInp = { padding: "7px 9px", borderRadius: 7, border: `1px solid ${C.line}`, fontFamily: font.body, fontSize: 13, color: C.ink, width: "100%", background: "#fff" };

/* ============================================================
   REGATAS y NOMBRAMIENTOS
   ============================================================ */
function NuevaRegata({ onClose, onCrear }) {
  const [f, setF] = useState({ nombre: "", club: "", fecha: "", fechaFin: "", ambito: "Liga Vasca", clases: "", mails: "" });
  const set = (k, v) => setF({ ...f, [k]: v });
  const crear = () => {
    onCrear({
      id: "RG" + Math.floor(Math.random() * 9000 + 1000), nombre: f.nombre, anyo: 2026,
      fecha: f.fecha, fechaFin: f.fechaFin || f.fecha, club: f.club,
      clases: f.clases.split(",").map((c) => c.trim()).filter(Boolean), ambito: f.ambito,
      estado: "pendiente", ar: { estado: "pendiente" }, ir: { estado: "pendiente" },
      link: "", mails: f.mails, nombramientoEnviado: false, nombramientos: [],
    });
  };
  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={onClose} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={Plus}>Nueva regata</SectionTitle>
      <Card style={{ padding: 24, maxWidth: 640 }}>
        <div style={{ display: "grid", gap: 14 }}>
          <div><label style={lbl}>Nombre de la regata</label><input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Trofeo…" style={inp} /></div>
          <div><label style={lbl}>Autoridad organizadora (club)</label>
            <select value={f.club} onChange={(e) => set("club", e.target.value)} style={inp}>
              <option value="">— Selecciona club —</option>
              {CLUBES.map((c) => <option key={c.id} value={c.name}>{c.abbr} — {c.name}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Fecha inicio</label><input type="date" value={f.fecha} onChange={(e) => set("fecha", e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Fecha fin</label><input type="date" value={f.fechaFin} onChange={(e) => set("fechaFin", e.target.value)} style={inp} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Ámbito</label><select value={f.ambito} onChange={(e) => set("ambito", e.target.value)} style={inp}>{["Local", "Territorial", "Liga Vasca", "Campeonato de Euskadi", "Nacional", "Internacional"].map((a) => <option key={a}>{a}</option>)}</select></div>
            <div><label style={lbl}>Clases (separadas por comas)</label><input value={f.clases} onChange={(e) => set("clases", e.target.value)} placeholder="Optimist, ILCA, 420" style={inp} /></div>
          </div>
          <div><label style={lbl}>Correos del evento</label><input value={f.mails} onChange={(e) => set("mails", e.target.value)} placeholder="correo@club.es" style={inp} /></div>
          <div style={{ fontSize: 12, color: C.slate }}>La regata se crea en estado «Pendiente», con AR e IR pendientes del club.</div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn variant="primary" icon={CheckCircle2} onClick={crear} style={{ opacity: f.nombre && f.club && f.fecha ? 1 : .5, pointerEvents: f.nombre && f.club && f.fecha ? "auto" : "none" }}>Crear regata</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Regatas() {
  const { openDetail, role, user } = useContext(AppCtx);
  const esClub = role === "club";
  const [creando, setCreando] = useState(false);
  const [extra, setExtra] = useState([]);
  const lista = esClub && user?.clubMatch
    ? REGATAS.filter((r) => mismaEntidad(r.club, user.clubMatch))
    : [...extra, ...REGATAS];

  if (creando) return <NuevaRegata onClose={() => setCreando(false)} onCrear={(r) => { setExtra([r, ...extra]); setCreando(false); }} />;

  return (
    <div>
      <SectionTitle icon={Calendar} action={!esClub && <Btn icon={Plus} onClick={() => setCreando(true)}>Nueva regata</Btn>}>
        {esClub ? "Mis regatas" : "Regatas y nombramientos"}
      </SectionTitle>
      <div style={{ display: "grid", gap: 12 }}>
        {lista.length === 0 && <Card style={{ padding: 24, textAlign: "center", color: C.slate, fontSize: 13.5 }}>No tienes regatas registradas como organizador.</Card>}
        {lista.map((r) => (
          <Card key={r.id} style={{ padding: 18 }} onClick={() => openDetail({ tipo: "regata", id: r.id })} hover>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 16, color: C.navy }}>{r.nombre}</div>
                <div style={{ fontSize: 13, color: C.slate, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={13} /> {r.club}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: C.slate }}>
                <div style={{ fontWeight: 600, color: C.ink }}>{fecha(r.fecha)}</div>
                <div style={{ fontSize: 12 }}>{r.ambito}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {r.clases.map((c) => <span key={c} style={{ fontSize: 11.5, fontWeight: 600, background: C.foam, color: C.navy, padding: "3px 9px", borderRadius: 6 }}>{c}</span>)}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.graySoft}`, fontSize: 13 }}>
              {r.nombramientos.length ? r.nombramientos.map((nm, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: C.slate }}>
                  <Award size={14} color={C.buoy} /> <strong style={{ color: C.ink }}>{jueza(nm.juez)?.nombre}</strong> · {nm.rol}
                  {!esClub && nm.pagador && <span style={{ marginLeft: 6 }}><PagadorTag pagador={nm.pagador} /></span>}
                </div>
              )) : <span style={{ color: C.amber, fontWeight: 600, fontSize: 12.5 }}>⚠ Sin nombramientos asignados</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   JUECES (lista) — perfil técnico
   ============================================================ */
function JuecesList() {
  const { openDetail } = useContext(AppCtx);
  const [q, setQ] = useState("");
  const lista = JUECES.filter((j) => j.nombre.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <SectionTitle icon={Award} action={
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" icon={Plus}>Alta de juez</Btn>
        </div>
      }>Colegio de jueces</SectionTitle>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Search size={16} color={C.gray} style={{ position: "absolute", left: 12, top: 12 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre…" style={{ ...inp, paddingLeft: 36 }} />
        </div>
        <div style={{ fontSize: 12, color: C.slate }}>Última importación de licencias: <strong style={{ color: C.navy }}>{fecha("2026-06-14")}</strong></div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {lista.map((j) => (
          <Card key={j.id} style={{ padding: 16 }} onClick={() => openDetail({ tipo: "juez", id: j.id })} hover>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: j.externo ? C.buoy : C.hull, color: "#fff", display: "grid", placeItems: "center", fontFamily: font.display, fontWeight: 700 }}>
                {j.nombre.split(" ").map(w=>w[0]).slice(0,2).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: C.navy, fontSize: 15 }}>{j.nombre}</div>
                <div style={{ fontSize: 12.5, color: C.slate }}>Lic. {j.licencia} · {j.estamento}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {j.externo && <span style={{ fontSize: 11, fontWeight: 700, color: C.buoy, background: C.buoySoft, padding: "3px 8px", borderRadius: 6 }}>Externo</span>}
                {j.activo && <Badge status="disponible" />}
                <ChevronRight size={16} color={C.gray} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Importación del Excel de licencias: la app deduplica por DNI y asigna roles
// Base de federados: personas con sus roles (juez, deportista, técnico). Importación de licencias.
function Federados() {
  const [q, setQ] = useState("");
  const [importar, setImportar] = useState(false);
  const [filtro, setFiltro] = useState("todos"); // todos | vigentes | historico
  const [temporada, setTemporada] = useState("todas");

  const ULTIMA_IMPORTACION = "2026-06-14";
  const TEMPORADA_ACTUAL = 2026;

  // Base de ejemplo con temporada de última licencia y estado.
  // vigente = vino en la última importación de la temporada actual.
  const PERSONAS = [
    { id: "P001", nombre: "Yerai Moreno Lafuente", dni: "44566069G", club: "C.N. Hondarribia", roles: ["Juez", "Deportista", "Técnico Deportivo N1"], temporada: 2026, vigente: true },
    { id: "P002", nombre: "Silvia Conde Orio", dni: "72827752T", club: "C.N. de Vitoria", roles: ["Juez", "Deportista", "Técnico Deportivo N2"], temporada: 2026, vigente: true },
    { id: "P003", nombre: "Sigfrid Rovira Rubiella", dni: "47971394H", club: "C.N. Hondarribia", roles: ["Técnico Deportivo N2"], temporada: 2026, vigente: true },
    { id: "P004", nombre: "Ane Lazaro", dni: "45667788M", club: "C.N. Hondarribia", roles: ["Deportista"], temporada: 2026, vigente: true },
    { id: "P005", nombre: "Paul Ganuza", dni: "44223311S", club: "RCN San Sebastián", roles: ["Deportista"], temporada: 2025, vigente: false },
    { id: "P006", nombre: "Iñaki Zubeldia", dni: "15332211R", club: "RC Marítimo del Abra", roles: ["Juez"], temporada: 2024, vigente: false },
  ];
  const temporadas = [...new Set(PERSONAS.map((p) => p.temporada))].sort((a, b) => b - a);

  const lista = PERSONAS.filter((p) => {
    const coincide = p.nombre.toLowerCase().includes(q.toLowerCase()) || p.dni.includes(q);
    const porEstado = filtro === "todos" || (filtro === "vigentes" && p.vigente) || (filtro === "historico" && !p.vigente);
    const porTemporada = temporada === "todas" || p.temporada === Number(temporada);
    return coincide && porEstado && porTemporada;
  });
  const colRol = (r) => r === "Juez" ? C.buoy : r.includes("Deportista") ? C.green : C.navy;
  const nVigentes = PERSONAS.filter((p) => p.vigente).length;

  if (importar) return <ImportarLicencias onClose={() => setImportar(false)} />;

  return (
    <div>
      <SectionTitle icon={Users} action={<Btn size="sm" icon={Upload} onClick={() => setImportar(true)}>Importar licencias</Btn>}>Base de federados</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16, background: C.foam, border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontSize: 13.5, color: C.navy, display: "flex", gap: 10, alignItems: "center" }}>
            <Users size={17} color={C.hull} /> {nVigentes} con licencia vigente ({TEMPORADA_ACTUAL}) · {PERSONAS.length} en total con histórico
          </div>
          <div style={{ fontSize: 12, color: C.slate }}>Última importación: <strong style={{ color: C.navy }}>{fecha(ULTIMA_IMPORTACION)}</strong></div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} color={C.gray} style={{ position: "absolute", left: 12, top: 12 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o DNI…" style={{ ...inp, paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["todos", "Todos"], ["vigentes", "Vigentes"], ["historico", "Histórico"]].map(([k, l]) => (
            <button key={k} onClick={() => setFiltro(k)} style={toggle(filtro === k, k === "historico" ? C.slate : C.hull)}>{l}</button>
          ))}
        </div>
        <select value={temporada} onChange={(e) => setTemporada(e.target.value)} style={{ ...inp, width: "auto" }}>
          <option value="todas">Todas las temporadas</option>
          {temporadas.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {lista.length === 0 && <Card style={{ padding: 20, textAlign: "center", color: C.slate, fontSize: 13.5 }}>Sin resultados con estos filtros.</Card>}
        {lista.map((p) => (
          <Card key={p.id} style={{ padding: 14, opacity: p.vigente ? 1 : 0.72 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: p.vigente ? C.hull : C.slate, color: "#fff", display: "grid", placeItems: "center", fontFamily: font.display, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {p.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: C.navy, fontSize: 14.5, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {p.nombre}
                  {p.vigente
                    ? <span style={{ fontSize: 10.5, fontWeight: 700, color: C.green, background: C.greenSoft, padding: "2px 7px", borderRadius: 5 }}>VIGENTE</span>
                    : <span style={{ fontSize: 10.5, fontWeight: 700, color: C.slate, background: C.graySoft, padding: "2px 7px", borderRadius: 5 }}>HISTÓRICO · {p.temporada}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: C.slate }}>{p.dni} · {p.club}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {p.roles.map((r) => <span key={r} style={{ fontSize: 11, fontWeight: 700, color: colRol(r), background: colRol(r) + "16", padding: "3px 9px", borderRadius: 6 }}>{r}</span>)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Base de federados: personas con sus roles (juez, deportista, técnico). Importación de licencias.
function ImportarLicencias({ onClose }) {
  const [fase, setFase] = useState("subir"); // subir → previsualizar → hecho
  // Simulación de lo que la app extraería del Excel (varias filas = misma persona)
  const filasExcel = [
    { nombre: "YERAI MORENO LAFUENTE", dni: "44566069G", tipo: "Técnico Deportivo N1", club: "C.N. Hondarribia" },
    { nombre: "YERAI MORENO LAFUENTE", dni: "44566069G", tipo: "Juez", club: "C.N. Hondarribia" },
    { nombre: "YERAI MORENO LAFUENTE", dni: "44566069G", tipo: "Deportista Senior", club: "C.N. Hondarribia" },
    { nombre: "SILVIA CONDE ORIO", dni: "72827752T", tipo: "Juez", club: "C.N. de Vitoria" },
    { nombre: "SILVIA CONDE ORIO", dni: "72827752T", tipo: "Técnico Deportivo N2", club: "C.N. de Vitoria" },
    { nombre: "SILVIA CONDE ORIO", dni: "72827752T", tipo: "Deportista Senior", club: "C.N. de Vitoria" },
    { nombre: "SIGFRID ROVIRA RUBIELLA", dni: "47971394H", tipo: "Técnico Deportivo N2", club: "C.N. Hondarribia" },
    { nombre: "SILVIA MARCE ERAZO", dni: "16103446L", tipo: "Deportista Senior", club: "R.C.M. del Abra" },
  ];
  // Deducción: agrupar por DNI
  const personas = Object.values(filasExcel.reduce((acc, f) => {
    (acc[f.dni] = acc[f.dni] || { nombre: f.nombre, dni: f.dni, club: f.club, roles: [] }).roles.push(f.tipo);
    return acc;
  }, {}));

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={onClose} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={Upload}>Importar licencias (Escora)</SectionTitle>

      {fase === "subir" && (
        <Card style={{ padding: 24, maxWidth: 620 }}>
          <div style={{ border: `1.5px dashed ${C.line}`, borderRadius: 12, padding: 28, textAlign: "center", color: C.slate }}>
            <Upload size={26} />
            <div style={{ marginTop: 10, fontSize: 14 }}>Sube el Excel tal cual te lo da el sistema de licencias</div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>No hay que modificar nada del fichero. La app deduplica y asigna roles.</div>
          </div>
          <div style={{ textAlign: "right", marginTop: 18 }}>
            <Btn variant="primary" icon={ArrowRight} onClick={() => setFase("previsualizar")}>Simular importación</Btn>
          </div>
        </Card>
      )}

      {fase === "previsualizar" && (
        <div>
          <Card style={{ padding: 16, marginBottom: 14, background: C.foam, border: "none" }}>
            <div style={{ fontSize: 13.5, color: C.navy, marginBottom: 10 }}>
              <strong>{filasExcel.length} filas</strong> en el Excel → <strong>{personas.length} personas</strong> únicas (deduplicadas por DNI).
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.green, background: C.greenSoft, padding: "4px 10px", borderRadius: 6 }}>+ 2 nuevos</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.buoy, background: C.buoySoft, padding: "4px 10px", borderRadius: 6 }}>↻ 2 actualizados</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.slate, background: C.graySoft, padding: "4px 10px", borderRadius: 6 }}>= sin cambios / a histórico: no se borran</span>
            </div>
          </Card>
          <Card style={{ padding: 16, marginBottom: 14, border: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 12.5, color: C.slate, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertTriangle size={16} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
              Los federados que ya existen se actualizan (nombre, club, email…) y se marcan vigentes. Los que no aparezcan en este Excel <strong>no se borran</strong>: pasan a histórico conservando su temporada.
            </div>
          </Card>
          <Card style={{ padding: 8, marginBottom: 16 }}>
            {personas.map((p, idx) => {
              const accion = idx < 2 ? "nuevo" : "actualizado";
              const col = accion === "nuevo" ? C.green : C.buoy;
              return (
                <div key={p.dni} style={{ padding: "12px 10px", borderBottom: `1px solid ${C.graySoft}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 14, color: C.ink, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                        {p.nombre}
                        <span style={{ fontSize: 10, fontWeight: 700, color: col, background: col + "16", padding: "2px 7px", borderRadius: 5 }}>{accion === "nuevo" ? "NUEVO" : "ACTUALIZA"}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: C.slate }}>{p.dni} · {p.club}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {p.roles.map((r, i) => {
                        const c = r === "Juez" ? C.buoy : r.includes("Deportista") ? C.green : C.navy;
                        return <span key={i} style={{ fontSize: 11, fontWeight: 700, color: c, background: c + "16", padding: "3px 9px", borderRadius: 6 }}>{r}</span>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn variant="primary" icon={CheckCircle2} onClick={() => setFase("hecho")}>Confirmar importación</Btn>
          </div>
        </div>
      )}

      {fase === "hecho" && (
        <Card style={{ padding: 36, maxWidth: 520, margin: "20px auto", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenSoft, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><CheckCircle2 size={30} color={C.green} /></div>
          <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: C.navy }}>Importación completada</div>
          <div style={{ fontSize: 13.5, color: C.slate, marginTop: 8 }}>Base actualizada: nuevos añadidos, existentes actualizados por DNI (sin duplicar), y los ausentes conservados en histórico. Fecha de importación registrada.</div>
          <Btn variant="primary" onClick={onClose} style={{ marginTop: 20 }}>Volver</Btn>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   DISPONIBILIDAD — perfil juez
   ============================================================ */
function Disponibilidad() {
  const [estado, setEstado] = useState(() => {
    const o = {}; DISPONIBILIDAD.forEach((d, i) => (o[i] = d.disp)); return o;
  });
  return (
    <div>
      <SectionTitle icon={Calendar}>Disponibilidad para nombramientos</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16, background: C.foam, border: "none" }}>
        <div style={{ fontSize: 13.5, color: C.navy, display: "flex", gap: 10, alignItems: "center" }}>
          <Bell size={17} color={C.hull} /> Marca en qué regatas estás disponible. La federación usa esto para los nombramientos.
        </div>
      </Card>
      <div style={{ display: "grid", gap: 10 }}>
        {DISPONIBILIDAD.map((d, i) => (
          <Card key={i} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600, color: C.navy, fontSize: 14.5 }}>{d.regata}</div>
                <div style={{ fontSize: 12.5, color: C.slate, marginTop: 2 }}>{fecha(d.fecha)} · {d.clases}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEstado({ ...estado, [i]: true })} style={toggle(estado[i] === true, C.green)}>
                  <CheckCircle2 size={15} /> Disponible
                </button>
                <button onClick={() => setEstado({ ...estado, [i]: false })} style={toggle(estado[i] === false, C.red)}>
                  <XCircle size={15} /> No
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 18, textAlign: "right" }}>
        <Btn variant="primary" icon={Send}>Guardar disponibilidad</Btn>
      </div>
    </div>
  );
}
const toggle = (active, color) => ({
  display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9,
  border: `1px solid ${active ? color : C.line}`, background: active ? color : "#fff",
  color: active ? "#fff" : C.slate, fontFamily: font.body, fontWeight: 600, fontSize: 13, cursor: "pointer",
});

/* ============================================================
   EXPEDIENTE del juez
   ============================================================ */
function Expediente({ juezId }) {
  const { role } = useContext(AppCtx);
  const j = jueza(juezId);
  const regatasJuez = REGATAS.filter((r) => r.nombramientos.some((n) => n.juez === juezId));
  const liq = LIQUIDACIONES.filter((l) => l.juez === juezId);
  const puedeEditar = esFVV(role);

  const [editando, setEditando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [datos, setDatos] = useState({ iban: j.iban, estamento: j.estamento, club: j.club, movil: j.movil, mail: j.mail, titulaciones: j.titulaciones.join(", ") });
  const set = (k, v) => { setDatos({ ...datos, [k]: v }); setGuardado(false); };
  const guardar = () => { setEditando(false); setGuardado(true); };

  return (
    <div>
      <SectionTitle icon={Award} action={
        <div style={{ display: "flex", gap: 8 }}>
          {puedeEditar && !editando && <Btn size="sm" variant="ghost" icon={FileSignature} onClick={() => setEditando(true)}>Editar</Btn>}
          <Btn variant="ghost" size="sm" icon={Download}>Generar expediente PDF</Btn>
        </div>
      }>Expediente · {j.nombre}</SectionTitle>

      {guardado && <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8, color: C.green, fontSize: 13.5, fontWeight: 600 }}><CheckCircle2 size={16} /> Cambios guardados en SharePoint.</div>}

      <Card style={{ padding: 22, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.hull, color: "#fff", display: "grid", placeItems: "center", fontFamily: font.display, fontWeight: 700, fontSize: 20 }}>
            {j.nombre.split(" ").map(w=>w[0]).slice(0,2).join("")}
          </div>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 18, color: C.navy }}>{j.nombre}</div>
            <div style={{ fontSize: 13, color: C.slate }}>Licencia {j.licencia} · {editando ? datos.estamento : j.estamento}</div>
          </div>
        </div>

        {editando ? (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
              <div><label style={lbl}>Estamento</label><input value={datos.estamento} onChange={(e) => set("estamento", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>IBAN</label><input value={datos.iban} onChange={(e) => set("iban", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Club</label><input value={datos.club} onChange={(e) => set("club", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Móvil</label><input value={datos.movil} onChange={(e) => set("movil", e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Email</label><input value={datos.mail} onChange={(e) => set("mail", e.target.value)} style={inp} /></div>
            </div>
            <div><label style={lbl}>Titulaciones (separadas por comas)</label><input value={datos.titulaciones} onChange={(e) => set("titulaciones", e.target.value)} style={inp} /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setEditando(false)}>Cancelar</Btn>
              <Btn variant="primary" icon={CheckCircle2} onClick={guardar}>Guardar en SharePoint</Btn>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
              <Field label="DNI" value={j.dni} />
              <Field label="Nacimiento" value={j.nacimiento} />
              <Field label="Móvil" value={datos.movil} />
              <Field label="Email" value={datos.mail} />
              <Field label="IBAN" value={datos.iban} />
              <Field label="Club" value={datos.club} />
              <Field label="Dirección" value={j.direccion} wide />
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.graySoft}` }}>
              <div style={lbl}>Titulaciones</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {datos.titulaciones.split(",").map((t) => t.trim()).filter(Boolean).map((t) => <span key={t} style={{ fontSize: 12.5, fontWeight: 600, background: C.foam, color: C.navy, padding: "5px 11px", borderRadius: 7 }}>{t}</span>)}
              </div>
            </div>
          </>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="fvv-exp-grid">
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Calendar size={17} color={C.hull} /><strong style={{ color: C.navy, fontFamily: font.display }}>Regatas realizadas</strong></div>
          {regatasJuez.map((r) => {
            const nm = r.nombramientos.find((n) => n.juez === juezId);
            return <Row key={r.id} left={<>{r.nombre}</>} mid={`${fecha(r.fecha)} · ${nm.rol}`} />;
          })}
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Wallet size={17} color={C.buoy} /><strong style={{ color: C.navy, fontFamily: font.display }}>Liquidaciones</strong></div>
          {liq.map((l) => <Row key={l.id} left={<>{regataDe(l.regata)?.nombre}</>} mid={eur(l.total)} right={<Badge status={l.estado} />} />)}
        </Card>
      </div>

      <style>{`@media(max-width:720px){.fvv-exp-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}

/* ============================================================
   FORMACIÓN CONTINUA
   ============================================================ */
function Formacion({ role }) {
  const [abierta, setAbierta] = useState(null);
  return (
    <div>
      <SectionTitle icon={GraduationCap} action={esFVV(role) && <Btn icon={Plus}>Nueva sesión</Btn>}>Formación continua</SectionTitle>
      {esFVV(role) && (
        <Card style={{ padding: 16, marginBottom: 16, background: C.foam, border: "none" }}>
          <div style={{ fontSize: 13.5, color: C.navy, display: "flex", gap: 10, alignItems: "center" }}>
            <Send size={17} color={C.hull} /> Las sesiones se envían a toda la lista de formación, incluidos jueces externos a la federación.
          </div>
        </Card>
      )}
      <div style={{ display: "grid", gap: 12 }}>
        {FORMACION.map((f) => {
          const open = abierta === f.id;
          return (
            <Card key={f.id} style={{ padding: 16 }}>
              <div onClick={() => setAbierta(open ? null : f.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.navy, fontSize: 14.5 }}>{f.titulo}</div>
                  <div style={{ fontSize: 12.5, color: C.slate, marginTop: 2 }}>{fecha(f.fecha)} · {f.horas} h · {f.docente}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {esFVV(role)
                    ? <span style={{ fontSize: 12.5, color: C.slate }}><strong style={{ color: C.navy }}>{f.inscritos}</strong> inscritos</span>
                    : <Badge status="disponible" />}
                  <ChevronRight size={17} color={C.gray} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
                </div>
              </div>

              {open && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.graySoft}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 14 }}>
                    <Field label="Fecha" value={fecha(f.fecha)} />
                    <Field label="Duración" value={`${f.horas} horas`} />
                    <Field label="Docente" value={f.docente} />
                    <Field label="Inscritos" value={`${f.inscritos} personas`} />
                  </div>
                  <div style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.5, marginBottom: 14 }}>
                    Sesión de formación continua del Colegio de Jueces. Válida para el cómputo anual de horas. Abierta a jueces de la federación y externos inscritos en la lista de formación.
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {esFVV(role) ? (
                      <>
                        <Btn size="sm" variant="ghost" icon={Users}>Ver inscritos</Btn>
                        <Btn size="sm" variant="ghost" icon={Send}>Reenviar convocatoria</Btn>
                      </>
                    ) : (
                      <Btn size="sm" variant="primary" icon={CheckCircle2}>Inscribirme</Btn>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   USUARIOS (gestión de roles, mail y club — colegio y secretaría)
   ============================================================ */
function Usuarios() {
  const ROLES_APP = [
    { id: "colegio", label: "Colegio de Jueces", color: C.navy },
    { id: "secretaria", label: "Secretaría", color: C.navy },
    { id: "club", label: "Club", color: C.hull },
    { id: "juez", label: "Juez / Oficial", color: C.buoy },
  ];
  const [lista, setLista] = useState(USUARIOS.map((u) => ({ ...u })));
  const [editando, setEditando] = useState(null); // email en edición
  const [draftEdit, setDraftEdit] = useState({ email: "", rol: "", org: "" });
  const [nuevo, setNuevo] = useState(false);
  const [draft, setDraft] = useState({ nombre: "", email: "", rol: "club", org: "" });

  const rolInfo = (id) => ROLES_APP.find((r) => r.id === id) || { label: id, color: C.slate };
  const abrirEdicion = (u) => { setEditando(u.email); setDraftEdit({ email: u.email, rol: u.rol, org: u.org || "" }); };
  const guardar = (email) => { setLista(lista.map((u) => u.email === email ? { ...u, ...draftEdit } : u)); setEditando(null); };
  const eliminar = (email) => setLista(lista.filter((u) => u.email !== email));
  const crear = () => {
    if (!draft.nombre || !draft.email) return;
    setLista([...lista, { ...draft }]); setNuevo(false); setDraft({ nombre: "", email: "", rol: "club", org: "" });
  };

  return (
    <div>
      <SectionTitle icon={Users} action={<Btn size="sm" icon={Plus} onClick={() => setNuevo(true)}>Nuevo usuario</Btn>}>Usuarios de la app</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16, background: C.foam, border: "none" }}>
        <div style={{ fontSize: 13.5, color: C.navy, display: "flex", gap: 10, alignItems: "center" }}>
          <Users size={17} color={C.hull} /> Asigna el rol de cada usuario y edita su correo, club u organización. Los cambios se reflejarían en el directorio (Entra ID / lista de accesos).
        </div>
      </Card>

      {nuevo && (
        <Card style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Nombre</label><input value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} style={inp} /></div>
              <div><label style={lbl}>Correo</label><input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="correo@ejemplo.com" style={inp} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Rol</label><select value={draft.rol} onChange={(e) => setDraft({ ...draft, rol: e.target.value })} style={inp}>{ROLES_APP.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
              <div><label style={lbl}>Club / Organización</label><input value={draft.org} onChange={(e) => setDraft({ ...draft, org: e.target.value })} style={inp} /></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setNuevo(false)}>Cancelar</Btn>
              <Btn variant="primary" icon={CheckCircle2} onClick={crear} style={{ opacity: draft.nombre && draft.email ? 1 : .5, pointerEvents: draft.nombre && draft.email ? "auto" : "none" }}>Crear usuario</Btn>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {lista.map((u) => {
          const ri = rolInfo(u.rol);
          const enEd = editando === u.email;
          return (
            <Card key={u.email} style={{ padding: 16 }}>
              {enEd ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><label style={lbl}>Correo</label><input value={draftEdit.email} onChange={(e) => setDraftEdit({ ...draftEdit, email: e.target.value })} style={inp} /></div>
                    <div><label style={lbl}>Rol</label><select value={draftEdit.rol} onChange={(e) => setDraftEdit({ ...draftEdit, rol: e.target.value })} style={inp}>{ROLES_APP.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
                  </div>
                  <div><label style={lbl}>Club / Organización</label><input value={draftEdit.org} onChange={(e) => setDraftEdit({ ...draftEdit, org: e.target.value })} style={inp} /></div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Btn size="sm" variant="ghost" onClick={() => setEditando(null)}>Cancelar</Btn>
                    <Btn size="sm" variant="primary" icon={CheckCircle2} onClick={() => guardar(u.email)}>Guardar</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: ri.color, color: "#fff", display: "grid", placeItems: "center", fontFamily: font.display, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {u.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: C.navy, fontSize: 14.5 }}>{u.nombre}</div>
                    <div style={{ fontSize: 12.5, color: C.slate, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}{u.org ? ` · ${u.org}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ri.color, background: ri.color + "16", padding: "3px 9px", borderRadius: 6, flexShrink: 0 }}>{ri.label}</span>
                  <button onClick={() => abrirEdicion(u)} title="Editar" style={{ background: "none", border: "none", color: C.hull, cursor: "pointer", padding: 4 }}><FileSignature size={16} /></button>
                  <button onClick={() => eliminar(u.email)} title="Eliminar" style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", padding: 4 }} onMouseEnter={(e) => (e.currentTarget.style.color = C.red)} onMouseLeave={(e) => (e.currentTarget.style.color = C.gray)}><X size={16} /></button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ ...sub, marginTop: 28 }}>Catálogo de clubes (autoridades organizadoras)</div>
      <div style={{ fontSize: 12.5, color: C.slate, marginBottom: 12 }}>Datos de contacto y logos de los clubes, usados en regatas y en el generador de AR/IR.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {CLUBES.map((c) => (
          <Card key={c.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: C.foam, display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden" }}>
                {c.logo
                  ? <img src={c.logo} alt={c.abbr} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentNode.innerHTML = `<span style='font-size:11px;font-weight:700;color:${C.hull}'>${c.abbr.slice(0, 3)}</span>`; }} />
                  : <Ship size={18} color={C.hull} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: C.navy, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.abbr}</div>
                <div style={{ fontSize: 11.5, color: C.gray, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.slate, display: "grid", gap: 2 }}>
              {c.email && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>✉ {c.email}</span>}
              {c.tel && <span>☎ {c.tel}</span>}
              {c.nif && <span>NIF {c.nif}</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   BAREMOS DE DIETAS (gestión por el técnico FVV)
   ============================================================ */
function Baremos() {
  const [baremos, setBaremos] = useState(BAREMOS_ENTIDAD);
  const [guardado, setGuardado] = useState(false);

  const nombres = {
    "Juez · FVV": "Juez — FVV (Federación Vasca de Vela)",
    "Juez · RFEV": "Juez — RFEV (Real Federación Española de Vela)",
    "Técnico · FVV": "Técnico — FVV",
  };
  const set = (ent, campo, val) => {
    setBaremos({ ...baremos, [ent]: { ...baremos[ent], [campo]: Math.max(0, parseFloat(val) || 0) } });
    setGuardado(false);
  };

  return (
    <div>
      <SectionTitle icon={Euro} action={<Btn icon={CheckCircle2} onClick={() => setGuardado(true)}>Guardar baremos</Btn>}>Baremos de dietas</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16, background: C.foam, border: "none" }}>
        <div style={{ fontSize: 13.5, color: C.navy, display: "flex", gap: 10, alignItems: "center" }}>
          <Euro size={17} color={C.hull} /> Estos importes los fija la federación. Se aplican automáticamente en las liquidaciones: los de FVV en actuaciones de regata, y en uso personal los de la entidad que elija el juez.
        </div>
      </Card>

      <div style={{ display: "grid", gap: 14 }}>
        {Object.keys(baremos).map((ent) => (
          <Card key={ent} style={{ padding: 20 }}>
            <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 16, color: C.navy, marginBottom: 14 }}>{nombres[ent]}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
              <BaremoInput label="Día de regata (€)" value={baremos[ent].diaRegata} onChange={(v) => set(ent, "diaRegata", v)} />
              <BaremoInput label="Día de viaje (€)" value={baremos[ent].diaViaje} onChange={(v) => set(ent, "diaViaje", v)} />
              <BaremoInput label="Kilómetro (€)" value={baremos[ent].km} onChange={(v) => set(ent, "km", v)} step="0.01" />
            </div>
          </Card>
        ))}
      </div>

      {guardado && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, color: C.green, fontSize: 13.5, fontWeight: 600 }}>
          <CheckCircle2 size={16} /> Baremos guardados. Se aplicarán a las nuevas liquidaciones.
        </div>
      )}
    </div>
  );
}
function BaremoInput({ label, value, onChange, step = "1" }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type="number" min="0" step={step} value={value} onChange={(e) => onChange(e.target.value)} style={inp} />
    </div>
  );
}

/* ============================================================
   SUBVENCIONES (abiertas por enlace · cerradas por convocatoria)
   ============================================================ */
function Subvenciones() {
  const [convocatorias, setConvocatorias] = useState(CONVOCATORIAS);
  const [detalle, setDetalle] = useState(null);
  const [creando, setCreando] = useState(false);
  const [manual, setManual] = useState(false);
  const [confirmar, setConfirmar] = useState(null); // id a eliminar

  if (creando) return <NuevaConvocatoria onClose={() => setCreando(false)} onCrear={(c) => { setConvocatorias([c, ...convocatorias]); setCreando(false); }} />;
  if (manual) return <SubvencionManual onClose={() => setManual(false)} onCrear={(c) => { setConvocatorias([c, ...convocatorias]); setManual(false); }} />;
  if (detalle) {
    const c = convocatorias.find((x) => x.id === detalle);
    return c.tipo === "abierta"
      ? <ConvocatoriaAbierta conv={c} back={() => setDetalle(null)} />
      : <ConvocatoriaCerrada conv={c} back={() => setDetalle(null)} />;
  }

  return (
    <div>
      <SectionTitle icon={HandCoins} action={
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant="ghost" icon={FileSignature} onClick={() => setManual(true)}>Subvención manual</Btn>
          <Btn size="sm" icon={Plus} onClick={() => setCreando(true)}>Nueva convocatoria</Btn>
        </div>
      }>Subvenciones</SectionTitle>
      <div style={{ display: "grid", gap: 12 }}>
        {convocatorias.map((c) => {
          const esManual = c.tipo === "manual";
          const n = c.tipo === "abierta" ? (c.solicitudes?.length || 0) : (c.convocados?.length || 0);
          const [tag, color] = c.tipo === "abierta" ? ["Abierta", C.green] : esManual ? ["Manual", C.buoy] : ["Cerrada", C.hull];
          return (
            <Card key={c.id} style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ minWidth: 0, cursor: "pointer", flex: 1 }} onClick={() => setDetalle(c.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color, background: color + "16", padding: "2px 8px", borderRadius: 6 }}>{tag}</span>
                    <span style={{ fontSize: 12, color: C.gray }}>{c.id}</span>
                  </div>
                  <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 16, color: C.navy }}>{c.titulo}</div>
                  <div style={{ fontSize: 12.5, color: C.slate, marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>Solicitud hasta <strong>{fecha(c.cierre)}</strong></span>
                    {c.finFirma && <span>Firma hasta <strong>{fecha(c.finFirma)}</strong></span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: C.navy }}>{n}</div>
                    <div style={{ fontSize: 11.5, color: C.slate }}>{c.tipo === "abierta" ? "solicitudes" : "convocados"}</div>
                  </div>
                  <button onClick={() => setConfirmar(c.id)} title="Eliminar convocatoria" style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", padding: 4 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.red)} onMouseLeave={(e) => (e.currentTarget.style.color = C.gray)}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {confirmar === c.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.graySoft}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: C.red, fontWeight: 600 }}>¿Eliminar «{c.titulo}»? Esta acción no se puede deshacer.</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn size="sm" variant="ghost" onClick={() => setConfirmar(null)}>Cancelar</Btn>
                    <Btn size="sm" variant="danger" icon={X} onClick={() => { setConvocatorias(convocatorias.filter((x) => x.id !== c.id)); setConfirmar(null); }}>Eliminar</Btn>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {convocatorias.length === 0 && <Card style={{ padding: 24, textAlign: "center", color: C.slate, fontSize: 13.5 }}>No hay convocatorias. Crea una nueva o registra una subvención manual.</Card>}
      </div>
    </div>
  );
}

// Subvención manual: alta suelta de una ayuda a un federado, sin convocatoria
function SubvencionManual({ onClose, onCrear }) {
  const [busq, setBusq] = useState("");
  const [sel, setSel] = useState(null);
  const [tipo, setTipo] = useState(TIPOS_SUBVENCION[0]);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");

  const resultados = busq.length >= 2
    ? FEDERADOS.filter((f) => f.nombre.toLowerCase().includes(busq.toLowerCase()) || f.dni.toLowerCase().includes(busq.toLowerCase()))
    : [];

  const crear = () => {
    onCrear({
      id: "SUB-2026-M" + (Math.floor(Math.random() * 90) + 10), titulo: `${tipo} — ${sel.nombre}`, tipo: "manual", estado: "abierta",
      apertura: "2026-08-01", cierre: "2026-08-01",
      convocados: [{ nombre: sel.nombre, dni: sel.dni, club: sel.club, cantidad: parseFloat(cantidad) || 0, estado: "borrador", motivo }],
    });
  };

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={onClose} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={FileSignature}>Subvención manual</SectionTitle>
      <Card style={{ padding: 24, maxWidth: 620 }}>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={lbl}>Federado</label>
            {sel ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.foam, borderRadius: 9, padding: "10px 12px" }}>
                <div><strong style={{ color: C.navy }}>{sel.nombre}</strong> <span style={{ color: C.slate, fontSize: 13 }}>· {sel.club} · {sel.dni}</span></div>
                <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: C.hull, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cambiar</button>
              </div>
            ) : (
              <>
                <div style={{ position: "relative" }}>
                  <Search size={16} color={C.gray} style={{ position: "absolute", left: 12, top: 12 }} />
                  <input value={busq} onChange={(e) => setBusq(e.target.value)} placeholder="Busca por nombre o DNI…" style={{ ...inp, paddingLeft: 36 }} />
                </div>
                {resultados.length > 0 && (
                  <div style={{ border: `1px solid ${C.line}`, borderRadius: 9, marginTop: 6, overflow: "hidden" }}>
                    {resultados.map((f) => (
                      <button key={f.dni} onClick={() => { setSel(f); setBusq(""); }} style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "10px 12px", background: "#fff", border: "none", borderBottom: `1px solid ${C.graySoft}`, cursor: "pointer", textAlign: "left", fontFamily: font.body }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.foam)} onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
                        <span style={{ fontSize: 13.5, color: C.ink }}>{f.nombre}</span>
                        <span style={{ fontSize: 12.5, color: C.slate }}>{f.club} · {f.dni}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>Si no aparece, actualiza la base de federados importando el Excel.</div>
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px", gap: 12 }}>
            <div>
              <label style={lbl}>Tipo de ayuda</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inp}>{TIPOS_SUBVENCION.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div>
              <label style={lbl}>Cantidad €</label>
              <input value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0" inputMode="decimal" style={inp} />
            </div>
          </div>
          <div>
            <label style={lbl}>Motivo</label>
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo de la ayuda" style={inp} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn variant="primary" icon={Send} onClick={crear}
              style={{ opacity: sel && cantidad ? 1 : .5, pointerEvents: sel && cantidad ? "auto" : "none" }}>
              Crear y enviar a firma
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Crear convocatoria: elige modalidad
function NuevaConvocatoria({ onClose, onCrear }) {
  const [tipo, setTipo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [cierre, setCierre] = useState("");
  const [finFirma, setFinFirma] = useState("");

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={onClose} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={Plus}>Nueva convocatoria de subvención</SectionTitle>
      <Card style={{ padding: 24, maxWidth: 640 }}>
        <label style={lbl}>Título</label>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ayudas desplazamiento Cto. España…" style={{ ...inp, marginBottom: 18 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div><label style={lbl}>Fin de solicitud</label><input type="date" value={cierre} onChange={(e) => setCierre(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Fin de firma</label><input type="date" value={finFirma} onChange={(e) => setFinFirma(e.target.value)} style={inp} /></div>
        </div>

        <label style={lbl}>Modalidad</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }} className="fvv-mod-grid">
          <ModCard active={tipo === "abierta"} onClick={() => setTipo("abierta")} icon={Link2} color={C.green}
            titulo="Abierta" desc="Se publica un enlace para que cualquier deportista con licencia solicite. Indica persona y motivo." />
          <ModCard active={tipo === "cerrada"} onClick={() => setTipo("cerrada")} icon={Upload} color={C.hull}
            titulo="Cerrada" desc="Subes un Excel o seleccionas convocados. El sistema genera formularios rellenos con la cantidad para que los firmen." />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" icon={ArrowRight}
            style={{ opacity: tipo && titulo && cierre ? 1 : .5, pointerEvents: tipo && titulo && cierre ? "auto" : "none" }}
            onClick={() => onCrear({
              id: "SUB-2026-0" + (Math.floor(Math.random() * 9) + 3), titulo, tipo, estado: "abierta",
              apertura: new Date().toISOString().slice(0, 10), cierre, finFirma,
              ...(tipo === "abierta" ? { solicitudes: [] } : { convocados: [] }),
            })}>
            Crear convocatoria
          </Btn>
        </div>
      </Card>
      <style>{`@media(max-width:560px){.fvv-mod-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}
function ModCard({ active, onClick, icon: Ic, color, titulo, desc }) {
  return (
    <div onClick={onClick} style={{ border: `2px solid ${active ? color : C.line}`, borderRadius: 12, padding: 16, cursor: "pointer", background: active ? color + "0C" : "#fff", transition: "border .15s" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", color, display: "grid", placeItems: "center", marginBottom: 10 }}><Ic size={20} /></div>
      <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 15, color: C.navy }}>{titulo}</div>
      <div style={{ fontSize: 12.5, color: C.slate, marginTop: 4, lineHeight: 1.45 }}>{desc}</div>
    </div>
  );
}

// Convocatoria ABIERTA: enlace público + solicitudes recibidas
function ConvocatoriaAbierta({ conv, back }) {
  const [copiado, setCopiado] = useState(false);
  const [verForm, setVerForm] = useState(false);
  const [sols, setSols] = useState(conv.solicitudes || []);
  const cambiar = (i, estado) => setSols(sols.map((s, idx) => idx === i ? { ...s, estado } : s));
  const enlace = `https://subvenciones.euskalbela.es/s/${conv.id.toLowerCase()}`;

  if (verForm) return <FormularioAbierto conv={conv} back={() => setVerForm(false)} />;

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={Link2}>{conv.titulo}</SectionTitle>

      <Card style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.hull, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Enlace público de solicitud</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <code style={{ flex: 1, minWidth: 220, background: C.foam, padding: "10px 12px", borderRadius: 8, fontSize: 13, color: C.navy, fontFamily: "monospace" }}>{enlace}</code>
          <Btn size="sm" variant="soft" icon={Copy} onClick={() => { setCopiado(true); setTimeout(() => setCopiado(false), 1500); }}>{copiado ? "Copiado" : "Copiar"}</Btn>
          <Btn size="sm" variant="ghost" icon={ArrowRight} onClick={() => setVerForm(true)}>Ver formulario</Btn>
        </div>
        <div style={{ fontSize: 12.5, color: C.slate, marginTop: 10 }}>
          Cualquiera con el enlace puede solicitar sin cuenta. En producción, cada envío genera un acceso único; ideal cuando hay menores (firma el club o tutor).
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", fontSize: 12.5 }}>
          <span style={{ color: C.slate }}>Fin de solicitud: <strong style={{ color: C.navy }}>{fecha(conv.cierre)}</strong></span>
          {conv.finFirma && <span style={{ color: C.slate }}>Fin de firma: <strong style={{ color: C.navy }}>{fecha(conv.finFirma)}</strong></span>}
        </div>
      </Card>

      <div style={sub}>Solicitudes recibidas</div>
      <Card style={{ padding: 8 }}>
        {sols.length ? sols.map((s, i) => {
          const st = s.estado; // pendiente | denegada | concedida | firmada
          const badge = st === "firmada" ? "firmada" : st === "concedida" ? "concedida" : st === "denegada" ? "denegada" : "pendiente";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 10px", borderBottom: `1px solid ${C.graySoft}` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: C.ink }}><strong>{s.nombre}</strong> · {s.club}</div>
                <div style={{ fontSize: 12.5, color: C.slate }}>{s.tipo} — {s.motivo}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.hull, display: "flex", alignItems: "center", gap: 3 }}><FileText size={12} /> Clasificación</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.hull, display: "flex", alignItems: "center", gap: 3 }}><FileText size={12} /> {s.nfacturas || 1} factura(s)</span>
                  {st === "concedida" && <span style={{ fontSize: 11.5, fontWeight: 700, color: C.amber, display: "flex", alignItems: "center", gap: 3 }}><Clock size={12} /> Pendiente de firma</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                {s.importe && <strong style={{ fontFamily: font.display, color: C.navy, fontSize: 15 }}>{eur(s.importe)}</strong>}
                <Badge status={badge} />
                {st === "pendiente" && (
                  <>
                    <Btn size="sm" variant="primary" icon={CheckCircle2} onClick={() => cambiar(i, "concedida")}>Conceder</Btn>
                    <Btn size="sm" variant="danger" icon={XCircle} onClick={() => cambiar(i, "denegada")}>Denegar</Btn>
                  </>
                )}
                {st === "concedida" && <Btn size="sm" variant="soft" icon={FileSignature} onClick={() => cambiar(i, "firmada")}>Marcar firmada</Btn>}
              </div>
            </div>
          );
        }) : <div style={{ padding: 14, color: C.slate, fontSize: 13 }}>Aún no hay solicitudes.</div>}
      </Card>
    </div>
  );
}

// Vista del formulario que ve el solicitante (por el enlace público)
function FormularioAbierto({ conv, back }) {
  const [enviado, setEnviado] = useState(false);
  const [f, setF] = useState({ nombre: "", dni: "", club: "", tipo: TIPOS_SUBVENCION[0], importe: "", motivo: "", clasifTipo: "link", clasifLink: "", clasifPdf: false, facturas: [] });
  const set = (k, v) => setF({ ...f, [k]: v });
  const addFactura = () => set("facturas", [...f.facturas, { nombre: `factura_${f.facturas.length + 1}.pdf`, importe: "" }]);
  const setFactura = (i, campo, val) => set("facturas", f.facturas.map((x, idx) => idx === i ? { ...x, [campo]: val } : x));
  const delFactura = (i) => set("facturas", f.facturas.filter((_, idx) => idx !== i));
  const totalFacturas = f.facturas.reduce((a, x) => a + (parseFloat(x.importe) || 0), 0);
  const clasifOk = f.clasifTipo === "link" ? f.clasifLink.trim() : f.clasifPdf;
  const valido = f.nombre && f.dni && f.importe && clasifOk && f.facturas.length > 0;

  if (enviado) return (
    <Card style={{ padding: 36, maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenSoft, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><CheckCircle2 size={30} color={C.green} /></div>
      <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: C.navy }}>Solicitud registrada</div>
      <div style={{ fontSize: 13.5, color: C.slate, marginTop: 8 }}>Tu solicitud ha quedado registrada con su documentación. La federación la revisará y te avisará por correo.</div>
      <Btn variant="primary" onClick={back} style={{ marginTop: 20 }}>Volver</Btn>
    </Card>
  );
  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back} style={{ marginBottom: 16 }}>Volver</Btn>
      <Card style={{ padding: 28, maxWidth: 580, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ margin: "0 auto 10px", width: 48, height: 48 }}><Escudo size={48} /></div>
          <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: C.navy }}>{conv.titulo}</div>
          <div style={{ fontSize: 12.5, color: C.slate, marginTop: 4 }}>Solicitud de subvención · sin necesidad de cuenta</div>
          {conv.cierre && <div style={{ fontSize: 12, color: C.hull, fontWeight: 600, marginTop: 6 }}>Plazo de solicitud hasta el {fecha(conv.cierre)}{conv.finFirma ? ` · firma hasta el ${fecha(conv.finFirma)}` : ""}</div>}
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Nombre del deportista</label><input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Nombre y apellidos" style={inp} /></div>
            <div><label style={lbl}>DNI</label><input value={f.dni} onChange={(e) => set("dni", e.target.value)} placeholder="00000000A" style={inp} /></div>
          </div>
          <div><label style={lbl}>Club</label><input value={f.club} onChange={(e) => set("club", e.target.value)} placeholder="Club náutico" style={inp} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Tipo de ayuda</label><select value={f.tipo} onChange={(e) => set("tipo", e.target.value)} style={inp}>{TIPOS_SUBVENCION.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Importe solicitado (€)</label><input value={f.importe} onChange={(e) => set("importe", e.target.value)} placeholder="0,00" style={inp} /></div>
          </div>
          <div><label style={lbl}>Motivo de la solicitud</label><textarea value={f.motivo} onChange={(e) => set("motivo", e.target.value)} rows={2} placeholder="Explica para qué solicitas la ayuda…" style={{ ...inp, resize: "vertical" }} /></div>

          {/* Clasificación: link o PDF */}
          <div>
            <label style={lbl}>Clasificación deportiva</label>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button onClick={() => set("clasifTipo", "link")} style={toggle(f.clasifTipo === "link", C.hull)}>Enlace</button>
              <button onClick={() => set("clasifTipo", "pdf")} style={toggle(f.clasifTipo === "pdf", C.hull)}>PDF</button>
            </div>
            {f.clasifTipo === "link"
              ? <input value={f.clasifLink} onChange={(e) => set("clasifLink", e.target.value)} placeholder="https://resultados…" style={inp} />
              : (
                <button onClick={() => set("clasifPdf", true)} style={{ width: "100%", padding: "12px", border: `1.5px dashed ${f.clasifPdf ? C.green : C.line}`, borderRadius: 9, background: f.clasifPdf ? C.greenSoft : "#fff", color: f.clasifPdf ? C.green : C.slate, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {f.clasifPdf ? <><CheckCircle2 size={16} /> clasificacion.pdf adjunto</> : <><Upload size={16} /> Adjuntar PDF de clasificación</>}
                </button>
              )}
          </div>

          {/* Facturas por el importe */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Facturas (PDF)</label>
              <Btn size="sm" variant="ghost" icon={Plus} onClick={addFactura}>Añadir factura</Btn>
            </div>
            {f.facturas.length === 0 && <div style={{ fontSize: 12.5, color: C.slate, padding: "8px 0" }}>Adjunta las facturas que justifican el importe solicitado.</div>}
            {f.facturas.map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.ink, background: C.foam, padding: "8px 10px", borderRadius: 8 }}><FileText size={15} color={C.hull} /> {x.nombre}</span>
                <input value={x.importe} onChange={(e) => setFactura(i, "importe", e.target.value)} placeholder="€" style={{ ...inp, width: 90, textAlign: "center" }} />
                <button onClick={() => delFactura(i)} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", padding: 4 }}><X size={15} /></button>
              </div>
            ))}
            {f.facturas.length > 0 && (
              <div style={{ fontSize: 12.5, marginTop: 4, color: Math.abs(totalFacturas - (parseFloat(f.importe) || 0)) < 0.01 ? C.green : C.amber, fontWeight: 600 }}>
                Total facturas: {eur(totalFacturas)} {f.importe && `· solicitado: ${eur(parseFloat(f.importe) || 0)}`}
                {f.importe && Math.abs(totalFacturas - (parseFloat(f.importe) || 0)) >= 0.01 && " ⚠ no cuadra con el importe"}
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: C.slate }}>Si el deportista es menor, cumplimenta el club o el tutor legal.</div>
          <Btn variant="primary" icon={Send} onClick={() => setEnviado(true)} style={{ justifyContent: "center", opacity: valido ? 1 : .5, pointerEvents: valido ? "auto" : "none" }}>Enviar y registrar solicitud</Btn>
        </div>
      </Card>
    </div>
  );
}

// Convocatoria CERRADA: convocados con formularios rellenos para firmar
function ConvocatoriaCerrada({ conv, back }) {
  const [convocados, setConvocados] = useState(conv.convocados || []);
  const [importando, setImportando] = useState(false);
  const [añadiendo, setAñadiendo] = useState(false);
  const [busq, setBusq] = useState("");
  const [selF, setSelF] = useState(null);
  const [cant, setCant] = useState("");

  const total = convocados.reduce((a, c) => a + (c.cantidad || 0), 0);
  const firmadas = convocados.filter((c) => c.estado === "firmada").length;

  const marcarEnviados = () => setConvocados(convocados.map((c) => c.estado === "borrador" ? { ...c, estado: "enviada" } : c));
  const quitar = (i) => setConvocados(convocados.filter((_, idx) => idx !== i));

  const dnisPresentes = convocados.map((c) => c.dni);
  const resultados = busq.length >= 2
    ? FEDERADOS.filter((f) => !dnisPresentes.includes(f.dni) && (f.nombre.toLowerCase().includes(busq.toLowerCase()) || f.dni.toLowerCase().includes(busq.toLowerCase())))
    : [];

  const añadirConvocado = () => {
    if (!selF || !cant) return;
    setConvocados([...convocados, { nombre: selF.nombre, dni: selF.dni, club: selF.club, cantidad: parseFloat(cant) || 0, estado: "borrador" }]);
    setSelF(null); setCant(""); setBusq(""); setAñadiendo(false);
  };

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back} style={{ marginBottom: 16 }}>Volver</Btn>
      <SectionTitle icon={FileSignature} action={
        <div style={{ display: "flex", gap: 8 }}>
          <Btn size="sm" variant="ghost" icon={Plus} onClick={() => setAñadiendo(!añadiendo)}>Añadir convocado</Btn>
          <Btn size="sm" variant="soft" icon={Upload} onClick={() => setImportando(!importando)}>Importar Excel</Btn>
        </div>
      }>{conv.titulo}</SectionTitle>

      {importando && (
        <Card style={{ padding: 18, marginBottom: 16, background: C.foam, border: "none" }}>
          <div style={{ border: `1.5px dashed ${C.line}`, borderRadius: 10, padding: 20, textAlign: "center", color: C.slate, fontSize: 13 }}>
            <Upload size={20} /><div style={{ marginTop: 6 }}>Arrastra el Excel de convocados (nombre, DNI, club, cantidad)</div>
          </div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 10 }}>Cada fila genera un formulario relleno con sus datos y su cantidad, listo para enviar a firma.</div>
        </Card>
      )}

      {añadiendo && (
        <Card style={{ padding: 16, marginBottom: 16, background: C.foam, border: "none" }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={lbl}>Federado</label>
              {selF ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 9, padding: "10px 12px", border: `1px solid ${C.line}` }}>
                  <div><strong style={{ color: C.navy }}>{selF.nombre}</strong> <span style={{ color: C.slate, fontSize: 13 }}>· {selF.club} · {selF.dni}</span></div>
                  <button onClick={() => setSelF(null)} style={{ background: "none", border: "none", color: C.hull, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cambiar</button>
                </div>
              ) : (
                <>
                  <div style={{ position: "relative" }}>
                    <Search size={16} color={C.gray} style={{ position: "absolute", left: 12, top: 12 }} />
                    <input value={busq} onChange={(e) => setBusq(e.target.value)} placeholder="Busca por nombre o DNI…" style={{ ...inp, paddingLeft: 36 }} />
                  </div>
                  {resultados.length > 0 && (
                    <div style={{ border: `1px solid ${C.line}`, borderRadius: 9, marginTop: 6, overflow: "hidden", background: "#fff" }}>
                      {resultados.map((f) => (
                        <button key={f.dni} onClick={() => { setSelF(f); setBusq(""); }} style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "10px 12px", background: "#fff", border: "none", borderBottom: `1px solid ${C.graySoft}`, cursor: "pointer", textAlign: "left", fontFamily: font.body }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.foam)} onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
                          <span style={{ fontSize: 13.5, color: C.ink }}>{f.nombre}</span>
                          <span style={{ fontSize: 12.5, color: C.slate }}>{f.club} · {f.dni}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 130 }}>
                <label style={lbl}>Cantidad €</label>
                <input value={cant} onChange={(e) => setCant(e.target.value)} placeholder="0" inputMode="decimal" style={inp} />
              </div>
              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                <Btn size="sm" variant="ghost" onClick={() => { setAñadiendo(false); setSelF(null); setBusq(""); }}>Cancelar</Btn>
                <Btn size="sm" variant="primary" icon={CheckCircle2} onClick={añadirConvocado} style={{ opacity: selF && cant ? 1 : .5, pointerEvents: selF && cant ? "auto" : "none" }}>Añadir</Btn>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Stat icon={Users} label="Convocados" value={convocados.length} tone={C.hull} />
        <Stat icon={Euro} label="Importe total" value={eur(total)} tone={C.navy} />
        <Stat icon={FileSignature} label="Firmadas" value={`${firmadas}/${convocados.length}`} tone={C.green} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={sub}>Convocados</div>
        <Btn size="sm" variant="primary" icon={Send} onClick={marcarEnviados}>Enviar formularios a firma</Btn>
      </div>
      <Card style={{ padding: 8 }}>
        {convocados.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 10px", borderBottom: `1px solid ${C.graySoft}` }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, color: C.ink }}><strong>{c.nombre}</strong> · {c.club}</div>
              <div style={{ fontSize: 12.5, color: C.slate }}>DNI {c.dni} · <strong style={{ color: C.navy }}>{eur(c.cantidad)}</strong></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <Badge status={c.estado === "firmada" ? "aprobada" : c.estado === "enviada" ? "enviada" : "borrador"} />
              {c.estado === "borrador" && <button onClick={() => quitar(i)} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer" }}><X size={15} /></button>}
            </div>
          </div>
        ))}
        {convocados.length === 0 && <div style={{ padding: 14, color: C.slate, fontSize: 13 }}>Importa un Excel o añade convocados para empezar.</div>}
      </Card>
      <div style={{ fontSize: 12.5, color: C.slate, marginTop: 12 }}>
        Cada formulario se envía relleno con los datos y la cantidad del subvencionado. Al firmarlo, se archiva automáticamente en el sistema.
      </div>
    </div>
  );
}

/* ============================================================
   INSTRUCCIONES (integración proyecto para clubes)
   ============================================================ */
function Instrucciones() {
  const guias = [
    { t: "Cómo solicitar una neumática", d: "Paso a paso del formulario de reserva y plazos.", ic: Waves },
    { t: "Recogida y devolución", d: "Qué revisar, cómo registrar incidencias, endulzado del motor.", ic: Ship },
    { t: "Condiciones de uso de la embarcación", d: "Los 8 puntos que firma el responsable de la entidad.", ic: FileText },
    { t: "Contacto con la federación", d: "A quién escribir ante una avería o anomalía.", ic: Bell },
  ];
  return (
    <div>
      <SectionTitle icon={FileText}>Instrucciones para clubes</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16, background: C.navy, border: "none" }}>
        <div style={{ color: "#fff", fontSize: 13.5, display: "flex", gap: 10, alignItems: "center" }}>
          <FileText size={18} /> Aquí se integra tu proyecto de instrucciones. Cada guía puede enlazar a su contenido detallado.
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
        {guias.map((g) => (
          <Card key={g.t} style={{ padding: 18 }} onClick={() => {}} hover>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: C.foam, display: "grid", placeItems: "center", color: C.hull, marginBottom: 12 }}><g.ic size={20} /></div>
            <div style={{ fontWeight: 600, color: C.navy, fontSize: 15 }}>{g.t}</div>
            <div style={{ fontSize: 13, color: C.slate, marginTop: 4, lineHeight: 1.5 }}>{g.d}</div>
            <div style={{ marginTop: 12, color: C.hull, fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>Abrir guía <ArrowRight size={14} /></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   DETALLE (reserva / liquidación / regata / juez)
   ============================================================ */
function Detail({ detail, back }) {
  const { role } = useContext(AppCtx);
  if (detail.tipo === "reserva") return <ReservaDetail id={detail.id} back={back} role={role} />;
  if (detail.tipo === "liquidacion") return <LiquidacionDetail id={detail.id} back={back} role={role} />;
  if (detail.tipo === "regata") return <RegataDetail id={detail.id} back={back} />;
  if (detail.tipo === "juez") {
    if (role === "club") return <div><Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back} style={{ marginBottom: 16 }}>Volver</Btn><FichaJuezReducida juezId={detail.id} /></div>;
    return <div><Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back} style={{ marginBottom: 16 }}>Volver</Btn><Expediente juezId={detail.id} /></div>;
  }
  return null;
}

// Ficha reducida de juez para clubes: solo nombre, apellidos, puesto, categoría y federación
function FichaJuezReducida({ juezId }) {
  const j = jueza(juezId);
  return (
    <div>
      <SectionTitle icon={Award}>Oficial de regata</SectionTitle>
      <Card style={{ padding: 22, maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.hull, color: "#fff", display: "grid", placeItems: "center", fontFamily: font.display, fontWeight: 700, fontSize: 18 }}>
            {j.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 17, color: C.navy }}>{j.nombre}</div>
            <div style={{ fontSize: 13, color: C.slate }}>{j.estamento}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          <Field label="Categoría / estamento" value={j.estamento} />
          <Field label="Federación" value="Federación Vasca de Vela" />
        </div>
        <div style={{ fontSize: 12, color: C.gray, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.graySoft}` }}>
          Los datos personales y económicos del oficial solo son visibles para la federación.
        </div>
      </Card>
    </div>
  );
}

function DocHeader({ titulo, ref: refId, estado, extra }) {
  return (
    <div style={{ textAlign: "center", borderBottom: `2px solid ${C.hull}`, paddingBottom: 16, marginBottom: 20 }}>
      <div style={{ margin: "0 auto 10px", width: 52, height: 52 }}><Escudo size={52} /></div>
      <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 600, color: C.hull, letterSpacing: ".02em" }}>{titulo}</div>
      <div style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>Referencia: <strong>{refId}</strong>{extra}</div>
      <div style={{ marginTop: 12 }}><Badge status={estado} /></div>
    </div>
  );
}

function ReservaDetail({ id, back, role }) {
  const r = RESERVAS.find((x) => x.id === id);
  const [form, setForm] = useState(null); // 'recogida' | 'devolucion'
  const n = neumaticaDe(r.neumatica);

  if (form) return <ActaForm tipo={form} reserva={r} onClose={() => setForm(null)} />;

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back} style={{ marginBottom: 16 }}>Volver</Btn>
      <Card style={{ padding: 28, maxWidth: 760, margin: "0 auto" }}>
        <DocHeader titulo="SOLICITUD DE NEUMÁTICA" ref={r.id} estado={r.estado} extra={` · Presentada ${fecha(r.presentada)}`} />

        <div style={sub}>Neumática</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
          <Field label="Embarcación" value={`${n.nombre} “${n.alias}”`} />
          <Field label="Recogida" value={fecha(r.recogida)} />
          <Field label="Devolución" value={fecha(r.devolucion)} />
        </div>

        <div style={sub}>Solicitante</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
          <Field label="Representante" value={r.representante} />
          <Field label="DNI" value={r.dni} />
          <Field label="Email" value={r.mail} />
          <Field label="Club" value={r.club} wide />
          <Field label="Evento" value={r.evento} wide />
        </div>

        <div style={sub}>Patrón</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
          <Field label="Patrón" value={r.patron} />
          <Field label="Titulación" value={r.titulacion} />
          <Field label="Móvil" value={r.movil} />
        </div>

        {r.estado === "denegada" && (
          <div style={{ background: C.redSoft, padding: 14, borderRadius: 10, fontSize: 13.5, color: C.red, marginBottom: 16 }}>
            <strong>Denegada:</strong> {r.motivoDenegacion}
          </div>
        )}
        {r.aprobadaPor && (
          <div style={{ fontSize: 12.5, color: C.slate, marginBottom: 16 }}>Aprobada por <strong>{r.aprobadaPor}</strong></div>
        )}

        {/* Acciones por rol */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 16, borderTop: `1px solid ${C.graySoft}` }}>
          {esFVV(role) && r.estado === "pendiente" && (
            <>
              <Btn variant="primary" icon={CheckCircle2}>Conceder</Btn>
              <Btn variant="danger" icon={XCircle}>Denegar</Btn>
            </>
          )}
          {role === "club" && r.estado === "concedida" && (
            <>
              <Btn variant="dark" icon={ClipboardList} onClick={() => setForm("recogida")}>Acta de recogida</Btn>
              <Btn variant="buoy" icon={ClipboardList} onClick={() => setForm("devolucion")}>Acta de devolución</Btn>
            </>
          )}
          <Btn variant="ghost" icon={Download}>Descargar PDF</Btn>
        </div>
      </Card>
    </div>
  );
}

function ActaForm({ tipo, reserva, onClose }) {
  const [hayInc, setHayInc] = useState(null);
  const [texto, setTexto] = useState("");
  const [enviado, setEnviado] = useState(false);
  const esRec = tipo === "recogida";

  if (enviado) return (
    <div>
      <Card style={{ padding: 36, maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenSoft, display: "grid", placeItems: "center", margin: "0 auto 16px" }}><CheckCircle2 size={30} color={C.green} /></div>
        <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: C.navy }}>Acta de {tipo} registrada</div>
        <div style={{ fontSize: 13.5, color: C.slate, marginTop: 8, lineHeight: 1.5 }}>Se ha archivado en el expediente de la reserva {reserva.id}{hayInc ? " con incidencias notificadas a la federación." : " sin incidencias."}</div>
        <Btn variant="primary" onClick={onClose} style={{ marginTop: 20 }}>Volver a la reserva</Btn>
      </Card>
    </div>
  );

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={onClose} style={{ marginBottom: 16 }}>Volver</Btn>
      <Card style={{ padding: 28, maxWidth: 620, margin: "0 auto" }}>
        <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 600, color: C.navy, marginBottom: 4 }}>
          Acta de {esRec ? "recogida" : "devolución"}
        </div>
        <div style={{ fontSize: 13, color: C.slate, marginBottom: 22 }}>{reserva.id} · {neumaticaDe(reserva.neumatica)?.nombre} “{neumaticaDe(reserva.neumatica)?.alias}”</div>

        <div style={{ ...sub, marginTop: 0 }}>¿Se observan incidencias?</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button onClick={() => setHayInc(false)} style={toggle(hayInc === false, C.green)}><CheckCircle2 size={15} /> Sin incidencias</button>
          <button onClick={() => setHayInc(true)} style={toggle(hayInc === true, C.red)}><AlertTriangle size={15} /> Hay incidencias</button>
        </div>

        {hayInc && (
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Describe la incidencia</label>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4}
              placeholder="Estado del casco, motor, material, anomalías observadas…"
              style={{ ...inp, resize: "vertical" }} />
            <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>Se adjuntará al acta y se enviará por correo a la federación.</div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" icon={Send} onClick={() => setEnviado(true)}
            style={{ opacity: hayInc === null ? .5 : 1, pointerEvents: hayInc === null ? "none" : "auto" }}>
            Registrar y archivar
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function LiquidacionDetail({ id, back, role }) {
  const l = LIQUIDACIONES.find((x) => x.id === id);
  const j = jueza(l.juez);
  const [estado, setEstado] = useState(l.estado);
  // Pagador tomado del nombramiento del juez en esa regata
  const nombramiento = regataDe(l.regata)?.nombramientos.find((n) => n.juez === l.juez);
  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back} style={{ marginBottom: 16 }}>Volver</Btn>
      <Card style={{ padding: 28, maxWidth: 720, margin: "0 auto" }}>
        <DocHeader titulo="LIQUIDACIÓN DE DIETAS" ref={l.id} estado={estado} extra={` · ${fecha(l.presentada)}`} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
          <Field label="Nombre" value={j.nombre} />
          <Field label="DNI" value={j.dni} />
          <Field label="Evento" value={regataDe(l.regata)?.nombre} />
          <Field label="Motivo" value={l.motivo} />
          <Field label="Salida" value={fecha(l.salida)} />
          <Field label="Regreso" value={fecha(l.regreso)} />
        </div>

        <div style={sub}>Gastos</div>
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", background: C.navy, color: "#fff", fontSize: 12, fontWeight: 700, padding: "9px 14px" }}>
            <span>Concepto</span><span>Detalle</span><span>Total</span>
          </div>
          {l.gastos.map((g, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", padding: "10px 14px", fontSize: 13, borderTop: `1px solid ${C.graySoft}`, alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: C.ink }}>{g.concepto}</span>
              <span style={{ color: C.slate }}>{g.detalle}</span>
              <span style={{ fontWeight: 600, color: C.ink, textAlign: "right" }}>{eur(g.total)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: C.foam, fontFamily: font.display }}>
            <strong style={{ color: C.navy }}>TOTAL A PAGAR</strong>
            <strong style={{ color: C.hull, fontSize: 16 }}>{eur(l.total)}</strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
          <Field label="IBAN" value={l.iban} />
          {nombramiento && <div><div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: C.gray, fontWeight: 700, marginBottom: 3 }}>Pagador</div><PagadorTag pagador={nombramiento.pagador} /></div>}
        </div>
        {(estado === "pagada" || l.pagadaPor) && estado !== "enviada" && l.pagadaPor && <div style={{ fontSize: 12.5, color: C.slate, marginTop: 12 }}>Pagada por <strong>{l.pagadaPor}</strong></div>}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 18, marginTop: 18, borderTop: `1px solid ${C.graySoft}`, alignItems: "center" }}>
          {(() => {
            const pagador = nombramiento?.pagador || (l.tipo === "personal" ? "Personal" : "FVV");
            const necesitaDosPasos = ["FVV", "FGV", "FAV", "FBV"].includes(pagador);

            // Uso personal: sin aprobación, solo PDF
            if (pagador === "Personal") {
              return <><span style={{ fontSize: 13, color: C.slate }}>Uso personal · no requiere aprobación.</span><Btn variant="primary" icon={Download}>Descargar PDF</Btn></>;
            }
            // Club: paga y valida el club
            if (pagador === "Club") {
              if (role === "club") {
                return <>
                  {estado === "enviada" && <>
                    <Btn variant="primary" icon={CheckCircle2} onClick={() => setEstado("pagada")}>Validar y pagar</Btn>
                    <Btn variant="danger" icon={XCircle} onClick={() => setEstado("borrador")}>Devolver para corregir</Btn>
                  </>}
                  {estado === "pagada" && <span style={{ fontSize: 13, color: C.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={16} /> Validada y pagada por el club</span>}
                  {estado === "borrador" && <span style={{ fontSize: 13, color: C.amber, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Clock size={15} /> Devuelta al oficial para corrección</span>}
                  <Btn variant="ghost" icon={Download}>Descargar PDF</Btn>
                </>;
              }
              return <>
                <div style={{ fontSize: 13, color: C.buoy, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Ship size={16} /> La gestiona y paga el club ({regataDe(l.regata)?.club}); la FVV no interviene.
                </div>
                <Btn variant="ghost" icon={Download}>Descargar PDF</Btn>
              </>;
            }
            // FVV/FGV/FAV/FBV: dos pasos
            if (necesitaDosPasos) {
              return <>
                {/* Paso 1: Colegio de Jueces */}
                {role === "colegio" && estado === "enviada" && (
                  <>
                    <Btn variant="primary" icon={CheckCircle2} onClick={() => setEstado("aprob1")}>Aprobar (1º · Colegio)</Btn>
                    <Btn variant="danger" icon={XCircle} onClick={() => setEstado("borrador")}>Devolver al juez</Btn>
                  </>
                )}
                {/* Paso 2: Secretaría */}
                {role === "secretaria" && estado === "aprob1" && (
                  <>
                    <Btn variant="primary" icon={CheckCircle2} onClick={() => setEstado("pagada")}>Aprobar y pagar (2º · Secretaría)</Btn>
                    <Btn variant="danger" icon={XCircle} onClick={() => setEstado("enviada")}>Devolver al Colegio</Btn>
                  </>
                )}
                {/* Estados informativos */}
                {estado === "enviada" && role !== "colegio" && <span style={{ fontSize: 13, color: C.amber, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Clock size={15} /> Pendiente 1ª aprobación (Colegio de Jueces)</span>}
                {estado === "aprob1" && role !== "secretaria" && <span style={{ fontSize: 13, color: C.buoy, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={15} /> Aprobada por Colegio · pendiente de Secretaría</span>}
                {estado === "pagada" && <span style={{ fontSize: 13, color: C.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={16} /> Pagada</span>}
                <Btn variant="ghost" icon={Download}>Descargar PDF</Btn>
              </>;
            }
            return <Btn variant="ghost" icon={Download}>Descargar PDF</Btn>;
          })()}
        </div>
      </Card>
    </div>
  );
}

function RegataDetail({ id, back }) {
  const { openDetail, role } = useContext(AppCtx);
  const r = regataDe(id);
  const liq = LIQUIDACIONES.filter((l) => l.regata === id);
  const [nombramientos, setNombramientos] = useState(r.nombramientos);
  const [asignando, setAsignando] = useState(false);
  const [juezSel, setJuezSel] = useState("");
  const [rolSel, setRolSel] = useState("Oficial Principal");
  const [pagadorSel, setPagadorSel] = useState("FVV");
  const [estadoRegata, setEstadoRegata] = useState(r.estado || "pendiente");
  const [ar, setAr] = useState(r.ar?.estado || "pendiente");
  const [ir, setIr] = useState(r.ir?.estado || "pendiente");
  const [genTipo, setGenTipo] = useState(null); // 'AR' | 'IR' | null
  const [docAR, setDocAR] = useState(r.arData || null);
  const [docIR, setDocIR] = useState(r.irData || null);
  const [revAR, setRevAR] = useState(r.arRevision || []); // registro de cambios/comentarios
  const [revIR, setRevIR] = useState(r.irRevision || []);
  const [envio, setEnvio] = useState(r.nombramientoEnviado);

  const ROLES = ["Oficial Principal", "Oficial", "Presidente Comité de Protestas", "Vocal Comité de Protestas", "Medidor"];
  const PAGADORES = ["Club", "FVV", "FGV", "FAV", "FBV", "Voluntario"];
  const esClub = role === "club";
  const esColegio = role === "colegio" || role === "tecnico";
  const ESTADOS_REGATA = ["pendiente", "provisional", "ready", "realizado"];
  const dispPara = (juezId) => DISPONIBILIDAD.some((d) => d.juez === juezId && d.disp && r.nombre.toLowerCase().includes(d.regata.toLowerCase().split(" ")[0].toLowerCase()));

  const añadir = () => {
    if (!juezSel) return;
    setNombramientos([...nombramientos, { juez: juezSel, rol: rolSel, pagador: pagadorSel }]);
    setAsignando(false); setJuezSel("");
  };
  const quitar = (i) => setNombramientos(nombramientos.filter((_, idx) => idx !== i));
  const cambiarEstadoRegata = (e) => { setEstadoRegata(e); if (e === "ready") setEnvio(true); };
  const guardarDoc = (tipo, datos) => {
    const yaExistia = tipo === "AR" ? docAR : docIR;
    if (tipo === "AR") { setDocAR(datos); setAr("revision"); }
    else { setDocIR(datos); setIr("revision"); }
    // Si el Colegio modifica un documento ya guardado, queda registrado
    if (yaExistia && (role === "colegio" || role === "tecnico")) {
      const entrada = { tipo: "cambio", texto: "Datos del documento modificados en la revisión.", autor: "Colegio de Jueces", fecha: new Date().toISOString().slice(0, 10) };
      if (tipo === "AR") setRevAR([...revAR, entrada]); else setRevIR([...revIR, entrada]);
    }
    setGenTipo(null);
  };
  // Revisión del Colegio: registra un cambio/comentario en el histórico
  const revisarDoc = (tipo, entrada) => {
    if (tipo === "AR") setRevAR([...revAR, entrada]);
    else setRevIR([...revIR, entrada]);
  };
  const editarDoc = (tipo) => setGenTipo(tipo); // reabrir el generador para modificar datos

  if (genTipo) return <GeneradorARIR tipo={genTipo} regata={r} onGuardar={(d) => guardarDoc(genTipo, d)} onClose={() => setGenTipo(null)} />;

  return (
    <div>
      <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back} style={{ marginBottom: 16 }}>Volver</Btn>
      <Card style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 600, color: C.navy }}>{r.nombre}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: C.slate, marginTop: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={14} /> {fecha(r.fecha)} → {fecha(r.fechaFin)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={14} /> {r.club}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Award size={14} /> {r.ambito}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {r.clases.map((c) => <span key={c} style={{ fontSize: 12, fontWeight: 600, background: C.foam, color: C.navy, padding: "4px 10px", borderRadius: 6 }}>{c}</span>)}
        </div>

        {/* Estado de la regata */}
        <div style={{ marginTop: 18, padding: 14, background: C.foam, borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={lbl}>Estado</span>
              <Badge status={estadoRegata} />
            </div>
            {esFVV(role) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ESTADOS_REGATA.map((e) => (
                  <button key={e} onClick={() => cambiarEstadoRegata(e)} style={miniBtn(estadoRegata === e, e === "ready" ? C.buoy : e === "realizado" ? C.green : C.amber)}>
                    {STATUS[e]?.label || e}
                  </button>
                ))}
              </div>
            )}
          </div>
          {envio
            ? <div style={{ fontSize: 12.5, color: C.green, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} /> Nombramientos enviados (definitivos)</div>
            : <div style={{ fontSize: 12.5, color: C.slate, marginTop: 10 }}>Los nombramientos se envían automáticamente al marcar «Ready».</div>}
        </div>

        {/* AR / IR con su flujo */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }} className="fvv-arir">
          <DocFlujo label="AR" titulo="Anuncio de Regata" estado={ar} setEstado={setAr} esClub={esClub} esColegio={esColegio} puedeGenerar={esClub || esFVV(role)} onGenerar={() => setGenTipo("AR")} doc={docAR} revision={revAR} onRevisar={(e) => revisarDoc("AR", e)} onEditar={() => editarDoc("AR")} />
          <DocFlujo label="IR" titulo="Instrucciones de Regata" estado={ir} setEstado={setIr} esClub={esClub} esColegio={esColegio} puedeGenerar={esClub || esFVV(role)} onGenerar={() => setGenTipo("IR")} doc={docIR} revision={revIR} onRevisar={(e) => revisarDoc("IR", e)} onEditar={() => editarDoc("IR")} />
        </div>

        {(r.link || r.mails) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 16 }}>
            {r.link && <div><div style={lbl}>Enlace de la regata</div><a href={r.link} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, color: C.hull, wordBreak: "break-all" }}>{r.link}</a></div>}
            {r.mails && <div><div style={lbl}>Correos del evento</div><div style={{ fontSize: 13.5, color: C.ink, wordBreak: "break-all" }}>{r.mails}</div></div>}
          </div>
        )}

        <div style={{ ...sub, marginTop: 22 }}>Nombramientos</div>
        <Card style={{ padding: 8, marginBottom: 12 }}>
          {nombramientos.length ? nombramientos.map((nm, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 10px", borderBottom: `1px solid ${C.graySoft}` }}>
              <div onClick={() => openDetail({ tipo: "juez", id: nm.juez })} style={{ cursor: "pointer", minWidth: 0 }}>
                <div style={{ fontSize: 14, color: C.ink }}><strong>{jueza(nm.juez)?.nombre}</strong></div>
                <div style={{ fontSize: 12.5, color: C.slate, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {nm.rol}
                  {nm.pagador && <PagadorTag pagador={nm.pagador} />}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 12.5, color: C.hull, fontWeight: 600, cursor: "pointer" }} onClick={() => openDetail({ tipo: "juez", id: nm.juez })}>Expediente</span>
                {esColegio && <button onClick={() => quitar(i)} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", padding: 4 }}><X size={15} /></button>}
              </div>
            </div>
          )) : <div style={{ padding: 14, color: C.amber, fontSize: 13, fontWeight: 600 }}>Sin nombramientos. Asigna jueces desde la disponibilidad registrada.</div>}
        </Card>

        {esColegio && (asignando ? (
          <Card style={{ padding: 16, marginBottom: 18, background: C.foam, border: "none" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={lbl}>Juez / Oficial</label>
                <select value={juezSel} onChange={(e) => setJuezSel(e.target.value)} style={inp}>
                  <option value="">Selecciona…</option>
                  {JUECES.map((j) => (
                    <option key={j.id} value={j.id}>{j.nombre}{dispPara(j.id) ? "  ✓ disponible" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Rol en la regata</label>
                <select value={rolSel} onChange={(e) => setRolSel(e.target.value)} style={inp}>
                  {ROLES.map((ro) => <option key={ro}>{ro}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Pagador</label>
                <select value={pagadorSel} onChange={(e) => setPagadorSel(e.target.value)} style={inp}>
                  {PAGADORES.map((p) => <option key={p}>{p}</option>)}
                </select>
                {pagadorSel === "Voluntario" && <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>El voluntario no genera liquidación (no cobra).</div>}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Btn variant="ghost" size="sm" onClick={() => setAsignando(false)}>Cancelar</Btn>
                <Btn variant="primary" size="sm" icon={CheckCircle2} onClick={añadir} style={{ opacity: juezSel ? 1 : .5, pointerEvents: juezSel ? "auto" : "none" }}>Nombrar</Btn>
              </div>
            </div>
          </Card>
        ) : (
          <div style={{ marginBottom: 18 }}>
            <Btn variant="ghost" icon={Plus} onClick={() => setAsignando(true)}>Añadir nombramiento</Btn>
          </div>
        ))}

        <div style={sub}>Liquidaciones vinculadas</div>
        <Card style={{ padding: 8 }}>
          {liq.length ? liq.map((l) => (
            <Row key={l.id} onClick={() => openDetail({ tipo: "liquidacion", id: l.id })}
              left={<><strong>{l.id}</strong> · {jueza(l.juez)?.nombre}</>} mid={eur(l.total)} right={<Badge status={l.estado} />} />
          )) : <div style={{ padding: 14, color: C.slate, fontSize: 13 }}>Aún no hay liquidaciones para esta regata.</div>}
        </Card>
      </Card>
    </div>
  );
}

const sub = { fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: C.hull, fontWeight: 700, margin: "0 0 12px", paddingBottom: 6, borderBottom: `1px solid ${C.graySoft}` };

/* ============================================================
   ROOT
   ============================================================ */
export default function App() {
  const [user, setUser] = useState(null);
  return (
    <div style={{ minHeight: "100vh", background: "#F4F7FB", color: "#0A1929" }}>
      {!user ? <Login onPick={setUser} /> : <Shell user={user} onLogout={() => setUser(null)} />}
    </div>
  );
}
