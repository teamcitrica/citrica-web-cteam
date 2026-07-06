"use client";
import { useMemo } from "react";
import { Text, Col, Container } from "citrica-ui-toolkit";

import { Sorteo, getTamboColumns } from "./columns/tambo-columns";
import TamboFilterBar from "./components/tambo-filter-bar";

import {
  useTamboEncrypted,
  TAMBO_PAGE_SIZE,
} from "@/hooks/tambo-encrypted/use-tambo-encrypted";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";

export default function TamboEncryptedPage() {
  const tambo = useTamboEncrypted();
  const columns = useMemo(() => getTamboColumns(), []);

  if (tambo.forbidden) {
    return (
      <p className="text-yellow-600 text-center mt-10">
        No tienes permiso para ver esta información.
      </p>
    );
  }

  if (tambo.displayError) {
    return (
      <p className="text-red-500 text-center mt-10">{tambo.displayError}</p>
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
                Tambo Encriptado
              </Text>
            </h1>

            <DataTable<Sorteo>
              key={`${tambo.sortDescriptor.column}-${tambo.sortDescriptor.direction}`}
              serverSidePagination
              columns={columns}
              currentPage={tambo.page}
              customFilters={<TamboFilterBar table={tambo} />}
              data={tambo.paginatedItems}
              defaultSortDirection={tambo.sortDescriptor.direction}
              emptyContent={
                tambo.hasSearched
                  ? "No se encontraron registros"
                  : "Agrega y aplica un filtro para ver registros"
              }
              getRowKey={(s) => s.id}
              headerColor="#265197"
              headerTextColor="#ffffff"
              isLoading={tambo.loading || tambo.isFetchingBatch}
              itemsPerPage={TAMBO_PAGE_SIZE}
              paginationColor="#265197"
              searchFields={[]}
              totalRecords={tambo.totalRecords}
              onPageChange={tambo.goToPage}
              onSortChange={(col, dir) => {
                tambo.setSortDescriptor({ column: col, direction: dir });
                tambo.goToPage(1);
              }}
            />
          </div>
        </Col>
      </Container>
    </div>
  );
}
