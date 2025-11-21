"use client"
import React from "react"
import { Suspense } from 'react';
import { Button } from "@heroui/react"
import { ChevronDown, Menu } from "lucide-react"
import type { SidebarProps, MenuItem } from "../../../types/sidebar"
import { Icon, Text } from "@citrica-ui"
import { IconName } from "@/shared/components/citrica-ui/atoms/icon"
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

function AccordionItem({ item, isOpen, onToggle }: { item: MenuItem; isOpen: boolean; onToggle: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div>
      <Button
        className= {`w-full justify-between px-4 py-2 transition-colors hover:bg-gray-100`}
        variant="light"
        onPress={onToggle}
      >
        <span className="flex items-center gap-2">
          <Icon name={item.icon as IconName} size={20} color="#265197" />
          <Text variant="label" color="#8099B2">{item.title}</Text>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>
      {isOpen && item.subItems && (
        <div className="ml-6 mt-2 flex flex-col gap-2">
          {item.subItems.map((subItem) => {
            const isActive = pathname === subItem.href;
            return (
              <Button
                key={subItem.title}
                variant="light"
                className={`justify-start px-4 py-2 transition-colors hover:bg-gray-100 ${isActive ? "bg-gray-100" : ""}`}
                onPress={() => router.push(subItem.href)}
              >
                <Text variant="label" color={isActive ? "#000" : "#8099B2"}>{subItem.title}</Text>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ items }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})
  const pathname = usePathname();
  const router = useRouter();

  // Verificar si alguna subopción está activa para mantener el acordeón abierto
  const isSubItemActive = (item: MenuItem): boolean => {
    if (!item.subItems) return false;
    return item.subItems.some(subItem => pathname.startsWith(subItem.href));
  }

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const NavItems = () => (
    <div className="h-[100svh] w-full overflow-y-auto px-2 py-4 bg-sidebar">
      {/* Logo - solo visible en pantallas grandes */}
      <div className="hidden lg:flex justify-start items-center mb-6">
        <img
          src="/img/citrica-logo.png"
          alt="Citrica Logo"
          className="m-4 h-16 w-auto"
        />
      </div>
      {items.map((item) => (
        <div key={item.title} className="mb-2">
          {item.subItems ? (
            <Suspense fallback={<div>Cargando...</div>}>
              <AccordionItem
                item={item}
                isOpen={openItems[item.title] !== undefined ? openItems[item.title] : isSubItemActive(item)}
                onToggle={() => toggleItem(item.title)}
              />
            </Suspense>
          ) : (
            <Button
              variant="light"
              className= {`w-full justify-start gap-2 px-4 py-2 transition-colors hover:bg-gray-100 ${item.href === pathname ? "bg-gray-100" : ""}`}
              onPress={() => {
                if (item.href && item.href !== "#") {
                  router.push(item.href);
                }
              }}
            >
              <Icon name={item.icon as IconName} size={20} color="#265197" />
              <Text variant="label" color={item.href === pathname ? "#000" : "#8099B2"}>{item.title}</Text>
            </Button>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <Button className="md:hidden" isIconOnly variant="light" onPress={() => setIsOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-sidebar transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <h2 className="text-lg font-semibold">Navegación</h2>
          <Button isIconOnly variant="light" onPress={() => setIsOpen(false)}>
            <ChevronDown className="h-6 w-6 rotate-90" />
          </Button>
        </div>
        <NavItems />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden h-screen w-72 border-r bg-background md:block sticky top-0">
        <NavItems />
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}

