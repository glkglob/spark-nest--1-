import { useEffect, useMemo, useState } from "react";
import constructionData, { type Project } from "@/data/construction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Building2,
  User,
  LayoutDashboard,
  Kanban,
  LineChart,
  ClipboardCheck,
  ShieldCheck,
  Award,
  Box,
  Clock,
  MessageSquare,
  Folder,
  Users,
  PoundSterling,
  BarChart3,
  CloudSun,
  Smartphone,
  Plug,
  Settings,
  RefreshCw,
  AlertTriangle,
  CloudRain,
  Info,
  QrCode,
  Video,
  PhoneCall,
  Brain,
  Calculator,
  TrendingUp,
  TrendingDown,
  Bell,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const abccColors = ["hsl(var(--primary))", "hsl(var(--accent))", "#B4413C", "#ECEBD5"]; // brand

export default function Construction() {
  const [module, setModule] = useState<string>("dashboard");
  const [projectId, setProjectId] = useState<number>(constructionData.projects[0].id);
  const project = useMemo<Project | undefined>(() => constructionData.projects.find(p => p.id === projectId), [projectId]);

  const costPerfData = [
    { name: "Week 1", PV: 100000, EV: 95000, AC: 98000 },
    { name: "Week 2", PV: 200000, EV: 190000, AC: 195000 },
    { name: "Week 3", PV: 350000, EV: 340000, AC: 345000 },
    { name: "Week 4", PV: 500000, EV: 480000, AC: 490000 },
    { name: "Current", PV: 595000, EV: 585000, AC: 585000 },
  ];

  const abccData = [
    { name: "Labor", value: 328000 },
    { name: "Materials", value: 284000 },
    { name: "Equipment", value: 156000 },
    { name: "Overhead", value: 127500 },
  ];

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const [now, setNow] = useState(new Date());

  const budgetUsedPct = project ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0;

  const action = {
    orderMaterial: () => toast.success("Material order initiated - supplier contacted"),
    dismissAlert: () => toast("Alert dismissed"),
    rescheduleWork: () => toast("Rescheduling opened"),
    monitorWeather: () => toast("Weather monitoring enabled"),
    viewAI: () => { toast("AI insights loading..."); setModule("reports"); },
    startMeeting: () => toast("Starting video conference..."),
    clock: () => toast.success("Clock-in recorded"),
    scan: () => toast("QR/Barcode scanner activated"),
    call: () => toast("Calling…"),
  };

  return (
    <div className="container mx-auto grid gap-6 py-6 md:grid-cols-[280px_1fr]">
      <aside className="sticky top-20 h-max rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Building2 className="h-5 w-5"/></span>
          <div>
            <div className="font-semibold leading-tight">Construction Success</div>
            <div className="text-xs text-muted-foreground">All‑in‑one platform</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border p-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><User className="h-4 w-4"/></div>
          <div className="text-sm">
            <div className="font-medium">John Smith</div>
            <div className="text-muted-foreground">Site Manager</div>
          </div>
        </div>

        <div className="mt-4">
          <Select value={String(projectId)} onValueChange={(v)=>setProjectId(Number(v))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select project"/></SelectTrigger>
            <SelectContent>
              {constructionData.projects.map(p=> (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <nav className="mt-4 space-y-1">
          <NavItem icon={<LayoutDashboard className="h-4 w-4"/>} active={module==='dashboard'} onClick={()=>setModule('dashboard')}>Executive Dashboard</NavItem>
          <NavItem icon={<Kanban className="h-4 w-4"/>} active={module==='projects'} onClick={()=>setModule('projects')}>Project Management</NavItem>
          <NavItem icon={<LineChart className="h-4 w-4"/>} active={module==='abcc'} onClick={()=>setModule('abcc')}>Cost Control (ABCC)</NavItem>
          <NavItem icon={<ClipboardCheck className="h-4 w-4"/>} active={module==='acc'} onClick={()=>setModule('acc')}>Acceptance Criteria</NavItem>
          <NavItem icon={<ShieldCheck className="h-4 w-4"/>} active={module==='safety'} onClick={()=>setModule('safety')}>Safety & Health</NavItem>
          <NavItem icon={<Award className="h-4 w-4"/>} active={module==='quality'} onClick={()=>setModule('quality')}>Quality Control</NavItem>
          <NavItem icon={<Box className="h-4 w-4"/>} active={module==='materials'} onClick={()=>setModule('materials')}>Materials & Inventory</NavItem>
          <NavItem icon={<Clock className="h-4 w-4"/>} active={module==='time'} onClick={()=>setModule('time')}>Time & Labor</NavItem>
          <NavItem icon={<MessageSquare className="h-4 w-4"/>} active={module==='communication'} onClick={()=>setModule('communication')}>Communications</NavItem>
          <NavItem icon={<Folder className="h-4 w-4"/>} active={module==='documents'} onClick={()=>setModule('documents')}>Documents</NavItem>
          <NavItem icon={<Users className="h-4 w-4"/>} active={module==='stakeholders'} onClick={()=>setModule('stakeholders')}>Stakeholders</NavItem>
          <NavItem icon={<PoundSterling className="h-4 w-4"/>} active={module==='budget'} onClick={()=>setModule('budget')}>Financials</NavItem>
          <NavItem icon={<BarChart3 className="h-4 w-4"/>} active={module==='reports'} onClick={()=>setModule('reports')}>Analytics & AI</NavItem>
          <NavItem icon={<CloudSun className="h-4 w-4"/>} active={module==='weather'} onClick={()=>setModule('weather')}>Weather</NavItem>
          <NavItem icon={<Smartphone className="h-4 w-4"/>} active={module==='mobile'} onClick={()=>setModule('mobile')}>Mobile Ops</NavItem>
          <NavItem icon={<Plug className="h-4 w-4"/>} active={module==='integrations'} onClick={()=>setModule('integrations')}>Integrations</NavItem>
          <NavItem icon={<Settings className="h-4 w-4"/>} active={module==='settings'} onClick={()=>setModule('settings')}>Settings</NavItem>
        </nav>

        <div className="mt-6 space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Quick actions</div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={action.orderMaterial} className="justify-start"><AlertTriangle className="mr-2 h-4 w-4"/> Incident</Button>
            <Button size="sm" variant="secondary" onClick={action.clock} className="justify-start"><Clock className="mr-2 h-4 w-4"/> Clock</Button>
            <Button size="sm" variant="outline" onClick={action.scan} className="justify-start"><QrCode className="mr-2 h-4 w-4"/> Scan</Button>
            <Button size="sm" variant="outline" onClick={action.startMeeting} className="justify-start"><Video className="mr-2 h-4 w-4"/> Meet</Button>
          </div>

          <div className="mt-4 rounded-lg border p-3 text-sm">
            <div className="font-medium">System status</div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>GPS Tracking • <span className="text-emerald-600">Online</span></li>
              <li>Weather API • <span className="text-emerald-600">Connected</span></li>
              <li>Payroll • <span className="text-emerald-600">Synced</span></li>
              <li>Cloud Backup • <span className="text-primary">Syncing</span></li>
            </ul>
          </div>
        </div>
      </aside>

      <main className="space-y-6">
        {module === "dashboard" && project && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Executive Dashboard</h1>
                <p className="text-sm text-muted-foreground">{now.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden rounded-full border px-3 py-1 text-sm md:flex md:items-center md:gap-2"><CloudSun className="h-4 w-4"/>16°C, Partly Cloudy</div>
                <Button size="sm" onClick={()=>toast("Refreshed")}><RefreshCw className="mr-2 h-4 w-4"/> Refresh All</Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Kpi title="Project Health" value="94%" note="Target 95%" trend="up" progress={94} />
              <Kpi title="Cost Performance" value={`£${Math.round(project.spent/1000)}K`} note={`Budget £${Math.round(project.budget/1000)}K (${budgetUsedPct}% used)`} trend="right" progress={budgetUsedPct} />
              <Kpi title="Acceptance Criteria" value="142/186" note="Progress 76%" trend="up" progress={76} />
              <Kpi title="Team Performance" value="87%" note="Productivity Index" trend="up" progress={87} />
              <Kpi title="Material Status" value="2 Critical" note="4 Low Stock" trend="down" progress={35} warn />
              <Kpi title="AI Predictions" value="92% Accuracy" note="Forecast Confidence" trend="right" progress={92} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Cost Performance (EVM)</CardTitle></CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RLineChart data={costPerfData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v)=>`£${v/1000}k`} />
                      <Tooltip formatter={(v:number)=>`£${(v/1000).toFixed(0)}k`} />
                      <Legend />
                      <Area type="monotone" dataKey="PV" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" />
                      <Area type="monotone" dataKey="EV" stroke="#FFC185" fill="rgba(255,193,133,0.2)" />
                      <Line type="monotone" dataKey="AC" stroke="#B4413C" strokeWidth={2} dot={false} />
                    </RLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>ABCC Distribution</CardTitle></CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={abccData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {abccData.map((_, i) => (<Cell key={i} fill={abccColors[i%abccColors.length]} />))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v:number)=>`£${(v/1000).toFixed(0)}k`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Critical alerts</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <AlertRow icon={<AlertTriangle className="h-4 w-4"/>} title="Material Supply Critical" desc="Steel reinforcement at 8 tonnes - only 2 days supply remaining" actions={<div className="flex gap-2"><Button size="sm" onClick={action.orderMaterial}>Order Now</Button><Button size="sm" variant="outline" onClick={action.dismissAlert}>Dismiss</Button></div>} />
                  <AlertRow icon={<CloudRain className="h-4 w-4"/>} title="Weather Impact Alert" desc="Heavy rain forecast Saturday - Concrete pour may need rescheduling" actions={<div className="flex gap-2"><Button size="sm" onClick={action.rescheduleWork}>Reschedule</Button><Button size="sm" variant="outline" onClick={action.monitorWeather}>Monitor</Button></div>} />
                  <AlertRow icon={<Info className="h-4 w-4"/>} title="AI Insight Available" desc="Cost optimization suggestions ready - Potential saving of £15,000" actions={<div className="flex gap-2"><Button size="sm" onClick={action.viewAI}>View Insights</Button><Button size="sm" variant="outline" onClick={()=>toast("Remind later")}>Later</Button></div>} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Communication Center</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <Stat icon={<MessageSquare className="h-4 w-4"/>} value={String(constructionData.communications.unreadMessages)} label="Unread" />
                    <Stat icon={<Video className="h-4 w-4"/>} value={String(constructionData.communications.activeCalls)} label="Calls" />
                    <Stat icon={<Bell className="h-4 w-4"/>} value={String(constructionData.communications.notifications)} label="Notifs" />
                  </div>
                  {constructionData.communications.recentMessages.map((m,i)=> (
                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-semibold">{m.avatar}</div>
                      <div className="min-w-0">
                        <div className="text-sm"><span className="font-medium">{m.from}</span> · <span className="text-muted-foreground">{m.timestamp}</span></div>
                        <div className="text-sm text-muted-foreground">{m.message}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" className="w-full" onClick={()=>setModule('communication')}><PhoneCall className="mr-2 h-4 w-4"/> Open Messages</Button>
                    <Button className="w-full" onClick={action.startMeeting}><Video className="mr-2 h-4 w-4"/> Start Meeting</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Stakeholder Dashboard</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {constructionData.stakeholders.map(s => (
                  <div key={s.id} className="rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <Badge className="capitalize">{s.type}</Badge>
                      <div className="font-medium">{s.name}</div>
                      <div className="ml-auto text-xs text-muted-foreground">{s.status}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Contact: {s.contact}</div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={()=>toast(`Contacting ${s.name}`)}>Contact</Button>
                      <Button size="sm" variant="outline" onClick={()=>toast("Opening details…")}>Details</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {module !== "dashboard" && (
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{module.replace(/-/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This module is ready to be filled. Tell me what views you want and I will build them next.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, children, active, onClick }:{ icon: React.ReactNode; children: React.ReactNode; active?: boolean; onClick?: ()=>void }){
  return (
    <button onClick={onClick} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-primary/5 border-primary/30 text-foreground' : 'hover:bg-accent'}`}>
      <span className="flex items-center gap-2">{icon}{children}</span>
    </button>
  );
}

function Kpi({ title, value, note, trend, progress, warn }:{ title:string; value:string; note?:string; trend:'up'|'down'|'right'; progress:number; warn?:boolean }){
  const TrendIcon = trend==='up' ? TrendingUp : trend==='down' ? TrendingDown : RefreshCw;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
          <TrendIcon className={`h-4 w-4 ${trend==='up' ? 'text-emerald-600' : trend==='down' ? 'text-destructive' : 'text-muted-foreground'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold ${warn ? 'text-amber-600' : ''}`}>{value}</div>
        {note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>}
        <div className="mt-3"><Progress value={progress} /></div>
      </CardContent>
    </Card>
  );
}

function AlertRow({ icon, title, desc, actions }:{ icon: React.ReactNode; title: string; desc: string; actions?: React.ReactNode }){
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      {actions}
    </div>
  );
}

function Stat({ icon, value, label }:{ icon: React.ReactNode; value: string; label: string }){
  return (
    <div className="flex flex-1 items-center gap-2 rounded-lg border p-3">
      {icon}
      <div>
        <div className="text-lg font-semibold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
