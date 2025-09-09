import Footer from "@/shared/components/citrica-ui/organism/footer";
import SectionTypography from "./components/section-typography";

import SectionSkeleton from "../home/components/section-skeleton";

export const dynamic = 'force-dynamic'

export default async function Home() {
  return (
    <>
     
      <section>
        <SectionTypography />
        <SectionSkeleton />
      </section>
    </>
  );
}