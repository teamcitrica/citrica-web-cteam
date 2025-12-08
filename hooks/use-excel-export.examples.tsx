/**
 * EJEMPLOS DE USO DEL HOOK useExcelExport
 *
 * Este archivo contiene ejemplos prácticos de cómo usar el hook
 * para exportar datos a Excel en diferentes escenarios.
 */

import { useExcelExport } from "./use-excel-export";

// ============================================================
// EJEMPLO 1: Uso básico - Exportar lista simple
// ============================================================
export function Example1_BasicExport() {
  const { exportToExcel } = useExcelExport();

  const users = [
    { id: 1, name: "Juan", email: "juan@example.com", age: 25 },
    { id: 2, name: "María", email: "maria@example.com", age: 30 },
    { id: 3, name: "Pedro", email: "pedro@example.com", age: 28 },
  ];

  const handleExport = () => {
    exportToExcel({
      data: users,
      fileName: "usuarios",
      sheetName: "Lista de Usuarios",
    });
  };

  return (
    <button onClick={handleExport}>
      Exportar Usuarios a Excel
    </button>
  );
}

// ============================================================
// EJEMPLO 2: Con mapeo de columnas personalizado
// ============================================================
export function Example2_ColumnMapping() {
  const { exportToExcel } = useExcelExport();

  const products = [
    { id: 1, name: "Laptop", price: 1200, stock: 15, created_at: "2024-01-15" },
    { id: 2, name: "Mouse", price: 25, stock: 50, created_at: "2024-02-20" },
    { id: 3, name: "Teclado", price: 75, stock: 30, created_at: "2024-03-10" },
  ];

  const handleExport = () => {
    exportToExcel({
      data: products,
      fileName: "productos",
      sheetName: "Inventario",
      columnMapping: {
        id: "ID PRODUCTO",
        name: "NOMBRE",
        price: "PRECIO (USD)",
        stock: "STOCK DISPONIBLE",
        created_at: "FECHA DE REGISTRO",
      },
    });
  };

  return (
    <button onClick={handleExport}>
      Exportar Productos a Excel
    </button>
  );
}

// ============================================================
// EJEMPLO 3: Excluir columnas sensibles
// ============================================================
export function Example3_ExcludeColumns() {
  const { exportToExcel } = useExcelExport();

  const usersWithSensitiveData = [
    {
      id: 1,
      name: "Juan",
      email: "juan@example.com",
      password: "hash123",
      token: "abc123",
      role: "admin"
    },
    {
      id: 2,
      name: "María",
      email: "maria@example.com",
      password: "hash456",
      token: "def456",
      role: "user"
    },
  ];

  const handleExport = () => {
    exportToExcel({
      data: usersWithSensitiveData,
      fileName: "usuarios_seguros",
      excludeColumns: ["password", "token"], // No exportar estas columnas
    });
  };

  return (
    <button onClick={handleExport}>
      Exportar Usuarios (Sin Datos Sensibles)
    </button>
  );
}

// ============================================================
// EJEMPLO 4: Con formateador personalizado
// ============================================================
export function Example4_CustomFormatter() {
  const { exportToExcel } = useExcelExport();

  const sales = [
    { id: 1, product: "Laptop", price: 1200, quantity: 2, paid: true },
    { id: 2, product: "Mouse", price: 25, quantity: 5, paid: false },
    { id: 3, product: "Teclado", price: 75, quantity: 3, paid: true },
  ];

  const handleExport = () => {
    exportToExcel({
      data: sales,
      fileName: "ventas",
      customFormatter: (key, value, row) => {
        // Formatear precios con símbolo de moneda
        if (key === "price") {
          return `$${value.toFixed(2)}`;
        }

        // Calcular total (precio × cantidad)
        if (key === "quantity") {
          const total = row.price * value;
          return `${value} (Total: $${total.toFixed(2)})`;
        }

        // Formatear estado de pago
        if (key === "paid") {
          return value ? "✅ Pagado" : "❌ Pendiente";
        }

        return value;
      },
    });
  };

  return (
    <button onClick={handleExport}>
      Exportar Ventas con Formato
    </button>
  );
}

// ============================================================
// EJEMPLO 5: Exportar datos filtrados de una tabla
// ============================================================
export function Example5_FilteredData() {
  const { exportToExcel } = useExcelExport();

  const allOrders = [
    { id: 1, customer: "Juan", status: "completed", total: 150, date: "2024-01-15" },
    { id: 2, customer: "María", status: "pending", total: 200, date: "2024-01-20" },
    { id: 3, customer: "Pedro", status: "completed", total: 300, date: "2024-02-10" },
    { id: 4, customer: "Ana", status: "cancelled", total: 100, date: "2024-02-15" },
  ];

  const handleExportCompleted = () => {
    // Filtrar solo órdenes completadas
    const completedOrders = allOrders.filter(order => order.status === "completed");

    exportToExcel({
      data: completedOrders,
      fileName: "ordenes_completadas",
      sheetName: "Órdenes Completadas",
      columnMapping: {
        id: "ID ORDEN",
        customer: "CLIENTE",
        status: "ESTADO",
        total: "TOTAL",
        date: "FECHA",
      },
    });
  };

  return (
    <button onClick={handleExportCompleted}>
      Exportar Órdenes Completadas
    </button>
  );
}

// ============================================================
// EJEMPLO 6: Exportar múltiples hojas en un solo archivo
// ============================================================
export function Example6_MultipleSheets() {
  const { exportMultipleSheets } = useExcelExport();

  const users = [
    { id: 1, name: "Juan", role: "admin" },
    { id: 2, name: "María", role: "user" },
  ];

  const products = [
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Mouse", price: 25 },
  ];

  const sales = [
    { id: 1, product_id: 1, user_id: 1, total: 1200, date: "2024-01-15" },
    { id: 2, product_id: 2, user_id: 2, total: 25, date: "2024-01-20" },
  ];

  const handleExport = () => {
    exportMultipleSheets({
      fileName: "reporte_completo",
      sheets: [
        {
          data: users,
          sheetName: "Usuarios",
          columnMapping: { id: "ID", name: "NOMBRE", role: "ROL" },
        },
        {
          data: products,
          sheetName: "Productos",
          columnMapping: { id: "ID", name: "PRODUCTO", price: "PRECIO" },
        },
        {
          data: sales,
          sheetName: "Ventas",
          columnMapping: {
            id: "ID",
            product_id: "ID PRODUCTO",
            user_id: "ID USUARIO",
            total: "TOTAL",
            date: "FECHA"
          },
        },
      ],
    });
  };

  return (
    <button onClick={handleExport}>
      Exportar Reporte Completo (Múltiples Hojas)
    </button>
  );
}

// ============================================================
// EJEMPLO 7: Integración con tu página de role-data
// ============================================================
export function Example7_RoleDataIntegration() {
  const { exportToExcel } = useExcelExport();

  // Simular datos de role-data
  const tableData = [
    { id: 1, name: "Test", campaign: "Campaign A", created_at: "2024-01-15T10:30:00Z" },
    { id: 2, name: "Demo", campaign: "Campaign B", created_at: "2024-02-20T14:45:00Z" },
  ];

  const credentials = {
    table_name: "sorteos_tambo",
  };

  const handleExport = () => {
    exportToExcel({
      data: tableData,
      fileName: credentials?.table_name || "datos",
      sheetName: credentials?.table_name || "Datos",
    });
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      📥 Exportar a Excel
    </button>
  );
}

// ============================================================
// EJEMPLO 8: Sin incluir fecha en el nombre del archivo
// ============================================================
export function Example8_NoDateInFileName() {
  const { exportToExcel } = useExcelExport();

  const data = [
    { id: 1, title: "Reporte Mensual", status: "active" },
    { id: 2, title: "Reporte Anual", status: "completed" },
  ];

  const handleExport = () => {
    exportToExcel({
      data: data,
      fileName: "reporte_fijo",
      includeDateInFileName: false, // No agregar fecha al nombre
    });
  };

  return (
    <button onClick={handleExport}>
      Exportar sin Fecha en el Nombre
    </button>
  );
}

// ============================================================
// EJEMPLO 9: Formatear fechas en formato inglés
// ============================================================
export function Example9_EnglishDates() {
  const { exportToExcel } = useExcelExport();

  const events = [
    { id: 1, name: "Conference", date: "2024-06-15T09:00:00Z" },
    { id: 2, name: "Workshop", date: "2024-07-20T14:00:00Z" },
  ];

  const handleExport = () => {
    exportToExcel({
      data: events,
      fileName: "events",
      dateLocale: "en-US", // Formato de fecha en inglés
    });
  };

  return (
    <button onClick={handleExport}>
      Export Events (English Dates)
    </button>
  );
}

// ============================================================
// EJEMPLO 10: Uso completo con todas las opciones
// ============================================================
export function Example10_AllOptions() {
  const { exportToExcel } = useExcelExport();

  const complexData = [
    {
      id: 1,
      first_name: "Juan",
      last_name: "Pérez",
      email: "juan@example.com",
      password: "secret123",
      balance: 1500.75,
      is_active: true,
      metadata: { age: 25, city: "Lima" },
      created_at: "2024-01-15T10:30:00Z",
      last_login: "2024-03-10T08:20:00Z",
    },
    {
      id: 2,
      first_name: "María",
      last_name: "García",
      email: "maria@example.com",
      password: "secret456",
      balance: 2300.50,
      is_active: false,
      metadata: { age: 30, city: "Arequipa" },
      created_at: "2024-02-20T14:45:00Z",
      last_login: "2024-03-11T09:15:00Z",
    },
  ];

  const handleExport = () => {
    exportToExcel({
      data: complexData,
      fileName: "usuarios_completo",
      sheetName: "Usuarios Registrados",
      includeDateInFileName: true,
      dateLocale: "es-ES",
      columnMapping: {
        id: "ID USUARIO",
        first_name: "NOMBRE",
        last_name: "APELLIDO",
        email: "CORREO ELECTRÓNICO",
        balance: "SALDO (S/)",
        is_active: "ESTADO",
        metadata: "INFORMACIÓN ADICIONAL",
        created_at: "FECHA DE REGISTRO",
        last_login: "ÚLTIMO ACCESO",
      },
      excludeColumns: ["password"], // No exportar contraseña
      customFormatter: (key, value, row) => {
        // Formatear saldo con símbolo de moneda
        if (key === "balance") {
          return `S/ ${value.toFixed(2)}`;
        }

        // Formatear estado activo/inactivo
        if (key === "is_active") {
          return value ? "✅ ACTIVO" : "❌ INACTIVO";
        }

        return value;
      },
    });
  };

  return (
    <button
      onClick={handleExport}
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
    >
      📊 Exportar con Todas las Opciones
    </button>
  );
}
