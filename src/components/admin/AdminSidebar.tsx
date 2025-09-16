import { useState } from "react";
import { 
  Calendar,
  Users,
  Settings,
  FileText,
  Euro,
  Clock,
  BarChart3,
  Mail,
  Image,
  Wrench,
  Home,
  ShoppingCart,
  MessageSquare,
  Star
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Tableau de bord",
    url: "/admin",
    icon: Home,
    group: "main"
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: MessageSquare,
    group: "business"
  },
  {
    title: "Réservations",
    url: "/admin/bookings",
    icon: Calendar,
    group: "business"
  },
  {
    title: "Clients",
    url: "/admin/clients", 
    icon: Users,
    group: "business"
  },
  {
    title: "Services",
    url: "/admin/services",
    icon: ShoppingCart,
    group: "business"
  },
  {
    title: "Horaires",
    url: "/admin/schedule",
    icon: Clock,
    group: "business"
  },
  {
    title: "Paiements",
    url: "/admin/payments",
    icon: Euro,
    group: "business"
  },
  {
    title: "Articles/Blog",
    url: "/admin/blog",
    icon: FileText,
    group: "content"
  },
  {
    title: "Témoignages",
    url: "/admin/testimonials",
    icon: Star,
    group: "content"
  },
  {
    title: "Galerie",
    url: "/admin/gallery",
    icon: Image,
    group: "content"
  },
  {
    title: "Galerie",
    url: "/admin/gallery",
    icon: Image,
    group: "content"
  },
  {
    title: "Statistiques",
    url: "/admin/stats",
    icon: BarChart3,
    group: "analytics"
  },
  {
    title: "Paramètres",
    url: "/admin/settings",
    icon: Settings,
    group: "system"
  }
];

const groups = {
  main: "Principal",
  business: "Gestion Business", 
  content: "Contenu",
  analytics: "Analytique",
  system: "Système"
};

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50";
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo/Branding */}
        <div className="p-4 border-b">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-mystique rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">RS</span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Renaissance By Steph</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-mystique rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-sm font-bold">RS</span>
            </div>
          )}
        </div>

        {Object.entries(groupedItems).map(([groupKey, items]) => (
          <SidebarGroup key={groupKey}>
            {!collapsed && (
              <SidebarGroupLabel>{groups[groupKey as keyof typeof groups]}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/admin"}
                        className={getNavClass(item.url)}
                      >
                        <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}