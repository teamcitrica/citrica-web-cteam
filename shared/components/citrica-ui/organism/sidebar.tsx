"use client"
import React from "react"
import { Suspense } from 'react';
import { Button, Link } from "@heroui/react"
import { ChevronDown, Menu } from "lucide-react"
import type { SidebarProps, MenuItem } from "../../../types/sidebar"
import Icon, { IconName } from "@/shared/components/citrica-ui/atoms/icon"
import Text from "../atoms/text"
import { usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation'
import { getParamFromPath } from "@/shared/utils/general"
import { siteConfig } from "@/config/site";

const SUBLINK_SEARCH_PARAM = siteConfig.subItemSearchParam;

function AccordionItem({ item, isOpen, onToggle }: { item: MenuItem; isOpen: boolean; onToggle: () => void }) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get(SUBLINK_SEARCH_PARAM) || "";
  return (
    <div>
      <Button
        className={`w-full justify-between px-4 py-2 transition-colors hover:bg-gray-100`}
        variant="light"
        onPress={onToggle}
      >
        <span className="flex items-center gap-2">
          <Icon name={item.icon as IconName} size={20} />
          <Text variant="label">{item.title}</Text>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>
      {isOpen && item.subItems && (
        <div className="ml-6 mt-2 flex flex-col gap-2">
          {item.subItems.map((subItem) => (
            <Button
              key={subItem.title}
              as={Link}
              href={subItem.href}
              variant="light"
              className={`justify-start px-4 py-2 transition-colors hover:bg-gray-100 ${getParamFromPath(subItem.href, SUBLINK_SEARCH_PARAM) === queryParam ? "bg-gray-100" : ""}`}
            >
              <Text variant="label">{subItem.title}</Text>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ items }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})
  const pathname = usePathname();

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const NavItems = () => (
    <div className="h-[100svh] w-full overflow-y-auto px-2 py-4 bg-[#FFFFFF] rounded-[16px]  bg-sidebar">
      <div className="">

      </div>
      <div className="pt-[8px] pl-[12px] only-lg">
        <span className="text-sidebar-panel-administrativo">Panel de administración</span>
      </div>
      <div className="mt-[38px]">
        {items.map((item) => (
          <div key={item.title} className="mb-2">
            {item.subItems ? (
              <Suspense fallback={<div>Cargando...</div>}>
                <AccordionItem
                  item={item}
                  isOpen={openItems[item.title] || item.href == pathname || false}
                  onToggle={() => toggleItem(item.title)}
                />
              </Suspense>
            ) : (
              <Button
                as={Link}
                href={item.href || "#"}
                variant="light"
                className={`w-full h-[56px] flex items-center justify-center lg:justify-start gap-2 px-0 lg:px-4 rounded-[12px] transition-colors hover:bg-gray-100 ${item.href === pathname ? "bg-[#F2F0E9]" : ""}`}
              >
                <div
                  className={`
    flex shrink-0
    ${item.href === pathname ? "bg-[#F2F0E9]" : ""}
    lg:flex lg:items-center lg:justify-center  /* desde 1024px */
    max-xl:flex max-xl:items-center max-xl:justify-center /* hasta 1279px */
    lg:w-[48px] lg:h-[48px] max-xl:w-[48px] max-xl:h-[48px]
  `}
                >
                  <Icon name={item.icon as IconName} size={20} />
                </div>
                <h3 className="text-menuitems hidden xl:block">{item.title}</h3>
              </Button>

            )}
          </div>
        ))}
      </div>

    </div>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <div
        className={`fixed bottom-0 left-0 z-50 w-full h-[70px] bg-sidebar border-t-2 border-gray-200 
  flex flex-row justify-between items-center px-4 md:hidden`}
      >
        {items.map((item) => (
          <Button
            key={item.title}
            as={Link}
            href={item.href || "#"}
            variant="light"
            className={`flex flex-row items-center justify-between w-full h-full rounded-t-[15px] transition-colors 
      ${item.href === pathname ? "bg-[#FFF]" : "bg-transparent hover:bg-gray-100"}`}
          >

            <div className="bg-[#F2F0E9] rounded-[20px] w-[84px] h-[56px] flex items-center justify-center">
              <Icon name={item.icon as IconName} size={20} />
            </div>
            {/* Oculta el texto en sm */}
            <span className="hidden">{item.title}</span>
          </Button>
        ))}
      </div>



      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-sidebar transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <h2 className="text-lg font-semibold text-[#000]">Navegación</h2>
          <Button isIconOnly variant="light" onPress={() => setIsOpen(false)}>
            <ChevronDown className="h-6 w-6 rotate-90" />
          </Button>
        </div>
        <NavItems />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden w-72 bg-background only-lg 
                border-r-[5px] border-r-[#F2F0E9] 
                rounded-tr-[20px] rounded-br-[20px] 
                overflow-hidden shadow-lg mt-px">
        <NavItems />
      </div>

      <div className="hidden w-[102px] bg-background only-md
                border-r-[5px] border-r-[#F2F0E9] 
                rounded-tr-[20px] rounded-br-[20px] 
                overflow-hidden shadow-lg mt-px">
        <NavItems />
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}