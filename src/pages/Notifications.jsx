import { useState } from "react";

const imgThumb = "https://www.figma.com/api/mcp/asset/a4d622b5-ae61-462a-b4df-449cc82516ca";

const ICON_BG = { like: "rgba(219,139,49,0.12)", comment: "rgba(18,101,135,0.12)", follow: "rgba(119,181,211,0.12)", save: "rgba(0,77,108,0.12)" };
const ICONS = {
    like: <svg width="20" height="20" viewBox="0 0 24 24" fill="#DB8B31"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
    comment: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#126587" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    follow: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#77B5D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8.5" cy="7" r="4" stroke="#77B5D3" strokeWidth="2" /><line x1="20" y1="8" x2="20" y2="14" stroke="#77B5D3" strokeWidth="2" strokeLinecap="round" /><line x1="23" y1="11" x2="17" y2="11" stroke="#77B5D3" strokeWidth="2" strokeLinecap="round" /></svg>,
    save: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="#004D6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const SECTIONS = [
    { label: "Hoje", items: [
            { id: 1, type: "like", username: "marilia_lucia", message: "gostou do teu post", time: "Há 5 minutos", thumb: imgThumb, read: false },
            { id: 2, type: "comment", username: "lourencosoares", message: "comentou: 'Que vista incrível! 🌊'", time: "Há 12 minutos", thumb: imgThumb, read: false },
            { id: 3, type: "follow", username: "ana_ribeiro", message: "começou a seguir-te", time: "Há 1 hora", read: false },
            { id: 4, type: "save", username: "joao_costa", message: "guardou a sua rota", time: "Há 2 horas", read: true },
        ]},
    { label: "Ontem", items: [
            { id: 5, type: "like", username: "pedro_santos", message: "gostou do teu post", time: "Ontem às 18:30", thumb: imgThumb, read: true },
            { id: 6, type: "comment", username: "sofia_lopes", message: "comentou no teu post", time: "Ontem às 15:20", thumb: imgThumb, read: true },
            { id: 7, type: "like", username: "tiago_ferreira", message: "gostou do teu post", time: "Ontem às 12:45", read: true },
        ]},
    { label: "Esta semana", items: [
            { id: 8, type: "follow", username: "catarina_alves", message: "começou a seguir-te", time: "Há 2 dias", read: true },
            { id: 9, type: "save", username: "ricardo_silva", message: "guardou a sua rota 'Monte Farinha'", time: "Há 3 dias", read: true },
            { id: 10, type: "comment", username: "ines_oliveira", message: "comentou: 'Adoro esta zona da ria!'", time: "Há 4 dias", thumb: imgThumb, read: true },
        ]},
];

const NAV = [
    { key: "rotas", label: "Rotas", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
    { key: "mapa", label: "Mapa", d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.553 2.776A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
    { key: "social", label: "Social", d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { key: "notificacoes", label: "Notificações", d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
];

function NotifItem({ n }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3" style={{ background: n.read ? "transparent" : "rgba(219,139,49,0.04)", cursor: "pointer" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ICON_BG[n.type] }}>{ICONS[n.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm leading-[21px] mb-0.5" style={{ color: "#0e2c38" }}><span className="font-semibold">{n.username}</span> {n.message}</p>
                <p className="text-xs" style={{ color: "#bfbbb7" }}>{n.time}</p>
            </div>
            {n.thumb && <div className="w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0" style={{ background: "#e8dcc8" }}><img src={n.thumb} alt="" className="w-full h-full object-cover" /></div>}
        </div>
    );
}

export default function Notificacoes() {
    const [activeTab, setActiveTab] = useState("notificacoes");

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            <div className="h-12 flex-shrink-0" />
            <div className="px-4 pt-4 pb-2 flex-shrink-0"><h1 className="text-2xl font-bold" style={{ color: "#0e2c38" }}>Notificações</h1></div>
            <div className="flex-1 overflow-y-auto pb-4">
                {SECTIONS.map((s) => (
                    <div key={s.label}>
                        <div className="px-8 pt-4 pb-2"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#bfbbb7", letterSpacing: "0.3px" }}>{s.label}</span></div>
                        {s.items.map((n) => <NotifItem key={n.id} n={n} />)}
                    </div>
                ))}
            </div>
            <nav className="flex-shrink-0 flex items-center justify-around px-2" style={{ height: "72px", borderTop: "1px solid rgba(0,77,108,0.06)" }}>
                {NAV.map((item) => {
                    const a = activeTab === item.key;
                    return (
                        <button key={item.key} onClick={() => setActiveTab(item.key)} className="relative flex flex-col items-center gap-1 px-3 py-1.5" style={{ background: "none", border: "none", cursor: "pointer" }}>
                            {a && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-b" style={{ backgroundColor: "#DB8B31" }} />}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d={item.d} stroke={a ? "#0e2c38" : "#bfbbb7"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="text-xs" style={{ fontWeight: a ? 500 : 400, color: a ? "#0e2c38" : "#bfbbb7" }}>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
