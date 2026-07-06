"use client";
import { useMemo } from "react";
import { Text, Col, Container } from "citrica-ui-toolkit";

import { PollaSorteo, getPollaColumns } from "./columns/polla-columns";
import PollaFilterBar from "./components/polla-filter-bar";

import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import {
  usePollaEncrypted,
  POLLA_PAGE_SIZE,
} from "@/hooks/polla-encrypted/use-polla-encrypted";

export default function PollaEncryptedPage() {
  const polla = usePollaEncrypted();
  const columns = useMemo(() => getPollaColumns(), []);

  if (polla.forbidden) {
    return (
      <p className="text-yellow-600 text-center mt-10">
        No tienes permiso para ver esta información.
      </p>
    );
  }

  if (polla.displayError) {
    return (
      <p className="text-red-500 text-center mt-10">{polla.displayError}</p>
    );
  }

  return (
    <div className="pb-[100px]">
      <Container>
        <Col noPadding cols={{ lg: 12, md: 6, sm: 4 }}>
          <div className="">
            <h1 className="text-2xl font-bold text-[#265197] mb-5">
              <Text isAdmin color="#678CC5" variant="title" weight="bold">
                CRM
              </Text>
              {" > "}
              <Text isAdmin color="#265197" variant="title" weight="bold">
                Polla Encriptada
              </Text>
            </h1>

            <DataTable<PollaSorteo>
              key={`${polla.sortDescriptor.column}-${polla.sortDescriptor.direction}`}
              serverSidePagination
              columns={columns}
              currentPage={polla.page}
              customFilters={<PollaFilterBar table={polla} />}
              data={polla.paginatedItems}
              defaultSortDirection={polla.sortDescriptor.direction}
              emptyContent={
                polla.hasSearched
                  ? "No se encontraron registros"
                  : "Agrega y aplica un filtro para ver registros"
              }
              getRowKey={(s) => s.id}
              headerColor="#265197"
              headerTextColor="#ffffff"
              isLoading={polla.loading || polla.isFetchingBatch}
              itemsPerPage={POLLA_PAGE_SIZE}
              paginationColor="#265197"
              searchFields={[]}
              totalRecords={polla.totalRecords}
              onPageChange={polla.goToPage}
              onSortChange={(col, dir) => {
                polla.setSortDescriptor({ column: col, direction: dir });
                polla.goToPage(1);
              }}
            />
          </div>
        </Col>
      </Container>
    </div>
  );
}
