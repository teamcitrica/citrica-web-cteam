"use client";

import Header from "@/shared/components/citrica-ui/organism/header";

export default function HeaderWrapper() {
  const logo = (
    <div className="flex items-center space-x-2">
      <img
        src="/img/citrica-logo.png"
        alt="Cítrica Logo"
        className="h-10 bg-black"
      />
    </div>
  );
  return (
    <Header
      logo={logo}
      variant="standard"
      className="bg-color-ct-black"
      showButton={false}
      navLinks={[]}
    />
  );
}
