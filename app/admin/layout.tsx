'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/citrica-ui/organism/sidebar";
import { siteConfig } from "@/config/site";
import { UserAuth } from "@/shared/context/auth-context";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import { Container, Col } from '@citrica/objects'
import Navbar from "@/shared/components/citrica-ui/organism/navbar";
import "@/styles/globals.scss";
export default function PanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
  const { userSession, userInfo, signOut, checkUser } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userSession === null) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [userSession, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (userSession === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <Container>
        <Col cols={{ lg: 3, md: 3, sm: 4 }} className="mx-auto text-center">
          <div className="relative w-16 h-16 mx-auto mb-8">
            <div className="absolute inset-0 w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-1">
              <Text variant="title" textColor="color-on-container">
                Verificando sesión
              </Text>
              <div className="flex items-center space-x-1 ml-1">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </Col>
      </Container>
    </div>
    );
  }

  return (
     <div className="container-general-pase-admin w-full flex justify-center">
      <div className="w-full max-w-[1920px]">
        <div className="h-full bg-[#FFFFFF] flex flex-row justify-start min-h-full">
          <Sidebar items={siteConfig.sidebarItems} session={userSession} />
          <div className="bg-[#FAF9F6] flex-1 text-white w-[80%] ">
            <Navbar session={userSession} />
            <div className="pt-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}