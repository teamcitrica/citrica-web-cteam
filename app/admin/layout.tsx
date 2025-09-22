'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/citrica-ui/organism/sidebar";
import { siteConfig } from "@/config/site";
import { UserAuth } from "@/shared/context/auth-context";
import { CircularProgress } from "@heroui/react";
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
      router.push('/login');
      return;
    }
  }, [userSession, router]);


  if (userInfo === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <Container>
          <Col cols={{ lg: 3, md: 3, sm: 4 }} className="mx-auto text-center">
            <div className="h-full w-full flex justify-center items-center">
              <CircularProgress aria-label="Loading..." size="lg" />
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