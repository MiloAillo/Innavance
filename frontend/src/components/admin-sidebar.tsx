import { LogOut, Building2, CalendarDays, Clock3, Settings, Users } from "lucide-react";

export type AdminView = "home" | "rooms" | "history" | "users" | "settings";

interface AdminSidebarProps {
    activeView: AdminView;
    isManager: boolean;
    name: string;
    isPolling: boolean;
    onChange: (view: AdminView) => void;
    onLogout: () => void;
}

const items: { id: AdminView; label: string; icon: typeof Building2; managerOnly?: boolean }[] = [
    { id: "home", label: "Home", icon: Building2 },
    { id: "rooms", label: "Rooms", icon: CalendarDays },
    { id: "history", label: "History", icon: Clock3 },
    { id: "users", label: "Users", icon: Users, managerOnly: true },
    { id: "settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ activeView, isManager, name, isPolling, onChange, onLogout }: AdminSidebarProps) {
    return (
        <aside className="flex w-full shrink-0 flex-col bg-neutral-900 p-4 text-white md:h-full md:w-64 md:overflow-y-auto">
            <div className="mb-4 flex items-center justify-between gap-3 px-2 md:mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold">Innavance</p>
                        {isPolling && (
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-medium text-green-400">LIVE</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-neutral-400">Admin panel</p>
                </div>
                <div className="flex items-center gap-2 md:hidden">
                    <span className="text-sm font-medium text-neutral-300">{name}</span>
                    <button aria-label="Sign out" onClick={onLogout} className="rounded-lg p-2 text-neutral-300 hover:bg-neutral-800 hover:text-white"><LogOut size={18} /></button>
                </div>
            </div>
            <nav className="flex flex-1 gap-2 overflow-x-auto md:flex-col">
                {items.filter((item) => !item.managerOnly || isManager).map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => onChange(id)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${activeView === id ? "bg-green-500 text-white" : "text-neutral-300 hover:bg-neutral-800 hover:text-white"}`}>
                        <Icon size={18} />{label}
                    </button>
                ))}
            </nav>
            <div className="mt-5 hidden border-t border-neutral-800 pt-4 md:block">
                <p className="px-2 text-sm font-medium">{name}</p>
                <button onClick={onLogout} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"><LogOut size={18} />Sign out</button>
            </div>
        </aside>
    );
}
