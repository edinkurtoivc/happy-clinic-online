import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, File, FileText, Settings, Users } from "lucide-react";
const navigation = [{
  name: "Dashboard",
  href: "/",
  icon: <File className="h-5 w-5" />
}, {
  name: "Patients",
  href: "/patients",
  icon: <Users className="h-5 w-5" />
}, {
  name: "Appointments",
  href: "/appointments",
  icon: <Calendar className="h-5 w-5" />
}, {
  name: "Medical Reports",
  href: "/medical-reports",
  icon: <FileText className="h-5 w-5" />
}, {
  name: "Users",
  href: "/users",
  icon: <Users className="h-5 w-5" />
}, {
  name: "Settings",
  href: "/settings",
  icon: <Settings className="h-5 w-5" />
}];
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  return <div className={cn("flex flex-col border-r bg-white transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-16 items-center justify-center border-b px-4">
        {!collapsed ? <h2 className="text-lg font-semibold text-clinic-800">Medical Clinic</h2> : <span className="text-xl font-bold text-clinic-800">MC</span>}
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map(item => {
        const isActive = location.pathname === item.href;
        return <Link key={item.name} to={item.href} className={cn("flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-clinic-100 text-clinic-700" : "text-gray-700 hover:bg-clinic-50 hover:text-clinic-700")}>
              <span className="mr-3">{item.icon}</span>
              {!collapsed && <span className="text-base text-slate-700 font-normal">{item.name}</span>}
            </Link>;
      })}
      </nav>
      
      <div className="border-t p-2">
        <button onClick={() => setCollapsed(!collapsed)} className="w-full rounded-md p-2 text-sm text-gray-500 hover:bg-clinic-50 hover:text-clinic-700">
          {collapsed ? ">>" : "<<"}
        </button>
      </div>
    </div>;
}