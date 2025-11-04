export type SiteConfig = typeof siteConfig;
import { Home, ClipboardCheck, Settings, Users, Bell, ShieldCheck } from "lucide-react"

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
			title: "Usuarios de Sistema",
			icon: "Settings",
			href: "/admin/users",
		},
		{
			title: "Reservas",
			icon: "ClipboardCheck",
			href: "/admin/reservas",
			subItems: [
				{
					title: "Ver reservas",
					href: "/admin/reservas",
				},
				{
					title: "Calendario",
					href: "/admin/reservas/calendario",
				},
				{
					title: "Gestión de disponibilidad",
					href: "/admin/reservas/disponibilidad",
				},
			],
		},
		// {
		// 	title: "Reuniones",
		// 	icon: "ClipboardCheck",
		// 	href: "/panel/tareas",
		// },
		// {
		// 	title: "CMS",
		// 	icon: "Settings",
		// 	href: "/panel/config-app", // ONLY TO DETERMINE ACTIVE, IS NOT LINKING
		// 	subItems: [
		// 		{
		// 			title: "Proyectos",
		// 			href: "/panel/config-app?" + SUBITEM_SEARCH_PARAM + "=basic",
		// 		},

		// 	],
		// },
		// {
		// 	title: "CMR	",
		// 	icon: "Users",
		// 	href: "/",
		// },
	],
	links: {
		github: "https://github.com/nextui-org/nextui",
		twitter: "https://twitter.com/getnextui",
		docs: "https://nextui.org",
		discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev"
	},
};
