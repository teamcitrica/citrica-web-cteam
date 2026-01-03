export type SiteConfig = typeof siteConfig;
import { Home, ClipboardCheck, Settings, Users, Bell, ShieldCheck, Calendar, UserStar, Sparkles, Folder } from "lucide-react"

const ROL_ADMIN = 1;
const ROL_USER = 2;
const ROL_MODERADOR = 3;
const ROL_CLIENTE = 12;
const SUBITEM_SEARCH_PARAM = "page";

export const siteConfig = {
	name: "Cítrica",
	description: "Aplicaciones y sitios web a meedida para tu negocio",
	navLinks: [
		{
			title: "Inicio",
			href: "#inicio",
		},
		{
			title: "Proyectos",
			href: "#proyectos",
		},
		{
			title: "Panel",
			href: "/panel",
		},
	],
	subItemSearchParam: SUBITEM_SEARCH_PARAM, // FOR SUBSECTIONS IN SIDEBAR
	sidebarItems: [
		{
			title: "USUARIOS DE SISTEMA",
			icon: "Users",
			href: "/admin/users",
			allowedRoles: [ROL_ADMIN],
			subItems: [
				{
					title: "Usuarios",
					href: "/admin/users/usuarios",
				},

			],
		},
		{
			title: "IA",
			icon: "Sparkles",
			href: "/admin/ia",
			allowedRoles: [ROL_ADMIN],
			subItems: [
				{ 
					title: "Databases RAG",
					href: "/admin/ia/databases_rag",
				},
				{
					title: "Chat",
					href: "/admin/ia/chat",
				},

			],
		},
		{
			title: "AGENDA",
			icon: "Calendar",
			href: "/admin/agenda",
			allowedRoles: [ROL_ADMIN],
			subItems: [
				{
					title: "Calendario",
					href: "/admin/agenda/calendario",
				},
				{
					title: "Disponibilidad",
					href: "/admin/agenda/disponibilidad",
				},
				{
					title: "Configuración",
					href: "/admin/agenda/configuracion",
				},
			],
		},
		{
			title: "CRM",
			icon: "UserStar",
			href: "/admin/crm",
			allowedRoles: [ROL_ADMIN],
			subItems: [
				{
					title: "Contactos",
					href: "/admin/crm/contactos",
				},
				{
					title: "Empresas",
					href: "/admin/crm/empresas",
				},
				// {
				// 	title: "Reuniones",
				// 	href: "/admin/crm/reuniones",
				// },
				{
					title: "Proyectos",
					href: "/admin/crm/proyectos",
				},
				// {
				// 	title: "Configuración",
				// 	href: "/admin/crm/configuracion",
				// },
			],
		},
		{
			title: "PROYECTOS",
			icon: "Folder",
			href: "/admin/client/mis-datos",
			allowedRoles: [ROL_CLIENTE],
			subItems: [],
		},
		{
			title: "CMS",
			icon: "ClipboardCheck",
			href: "/admin/CMS",
			allowedRoles: [ROL_ADMIN],
			subItems: [
				{
					title: "Proyectos",
					href: "/admin/CMS/proyectos",
				},
				{
					title: "Solution card",
					href: "/admin/CMS/solution_card",
				},
				{
					title: "Configuración",
					href: "/admin/CMS/configuracion",
				},
			],
		},

	],
	links: {
		github: "https://github.com/nextui-org/nextui",
		twitter: "https://twitter.com/getnextui",
		docs: "https://nextui.org",
		discord: "https://discord.gg/9b6yyZKmH4",
		sponsor: "https://patreon.com/jrgarciadev"
	},
};
