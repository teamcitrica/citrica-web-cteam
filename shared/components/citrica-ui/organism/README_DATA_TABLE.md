# DataTable Component - Guía de Uso

## 📋 Descripción

Sistema completo de tablas con búsqueda múltiple, ordenamiento, paginación y exportación a Excel, CSV y PDF.

## 🏗️ Arquitectura

```
shared/
├── hooks/
│   └── useTableFeatures.ts          # Hook con lógica de búsqueda, paginación y exportación
└── components/citrica-ui/organism/
    ├── data-table.tsx                # Componente visual de la tabla
    └── export-modal.tsx              # Modal para exportación

app/[tu-modulo]/
├── page.tsx                          # Página que usa la tabla
└── columns/
    └── [entity]-columns.tsx          # Definición de columnas y exportación
```

## 🚀 Uso Básico

### 1. Crear archivo de columnas

Crea un archivo `columns/[entity]-columns.tsx`:

```tsx
import React from "react";
import { Column } from "@/shared/components/citrica-ui/organism/data-table";
import { ExportColumn } from "@/shared/hooks/useTableFeatures";

// Tipo de tu entidad
type MyEntity = {
  id: number;
  name: string;
  email: string;
};

// Columnas para la tabla visual
export const getMyEntityColumns = (): Column<MyEntity>[] => [
  {
    name: "NOMBRE",
    uid: "name",
    sortable: true,
    render: (item) => <div>{item.name}</div>,
  },
  {
    name: "EMAIL",
    uid: "email",
    sortable: true,
  },
];

// Columnas para exportación
export const getMyEntityExportColumns = (): ExportColumn[] => [
  {
    header: "NOMBRE",
    key: "name",
  },
  {
    header: "EMAIL",
    key: "email",
  },
];
```

### 2. Usar en tu página

```tsx
"use client";
import { useMemo } from "react";
import { DataTable } from "@/shared/components/citrica-ui/organism/data-table";
import { getMyEntityColumns, getMyEntityExportColumns } from "./columns/entity-columns";

export default function MyPage() {
  const { data, isLoading } = useMyData(); // Tu hook de datos

  const columns = useMemo(() => getMyEntityColumns(), []);
  const exportColumns = useMemo(() => getMyEntityExportColumns(), []);

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Buscar..."
      searchFields={["name", "email"]}
      getRowKey={(item) => item.id}

      // Exportación
      enableExport={true}
      exportColumns={exportColumns}
      exportTitle="Mi Tabla"
      tableName="mi-tabla"

      // Opcionales
      showRowsPerPageSelector={true}
      onAdd={() => console.log("Agregar")}
      addButtonText="Nuevo"
    />
  );
}
```

## ⚙️ Props del DataTable

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `data` | `T[]` | - | **(Requerido)** Datos a mostrar |
| `columns` | `Column<T>[]` | - | **(Requerido)** Columnas de la tabla |
| `getRowKey` | `(item: T) => string \| number` | - | **(Requerido)** Función para obtener la key única |
| `isLoading` | `boolean` | `false` | Mostrar spinner de carga |
| `itemsPerPage` | `number` | `15` | Items por página |
| `searchPlaceholder` | `string` | `"Buscar..."` | Placeholder del input de búsqueda |
| `searchFields` | `(keyof T)[]` | `[]` | Campos donde buscar |
| `onAdd` | `() => void` | - | Función para botón "Agregar" |
| `addButtonText` | `string` | `"Agregar"` | Texto del botón agregar |
| `emptyContent` | `string` | `"No se encontraron registros"` | Texto cuando no hay datos |
| `headerColor` | `string` | `"#42668A"` | Color del header |
| `headerTextColor` | `string` | `"#ffffff"` | Color del texto del header |
| `paginationColor` | `string` | `"#42668A"` | Color de la paginación |
| `renderActions` | `(item: T) => ReactNode` | - | Render de acciones por fila |
| `enableExport` | `boolean` | `false` | Habilitar exportación |
| `exportColumns` | `ExportColumn[]` | `[]` | Columnas para exportar |
| `exportTitle` | `string` | `"Tabla de datos"` | Título para PDF |
| `tableName` | `string` | `"tabla"` | Nombre base para archivos |
| `showRowsPerPageSelector` | `boolean` | `false` | Mostrar selector de filas |

## 📊 Definición de Columnas

### Column (Visual)

```tsx
interface Column<T> {
  name: string;           // Nombre visible en el header
  uid: string;            // ID único de la columna
  sortable?: boolean;     // Si se puede ordenar
  render?: (item: T) => React.ReactNode; // Render personalizado
}
```

### ExportColumn (Exportación)

```tsx
interface ExportColumn {
  header: string;         // Nombre en el archivo exportado
  key: string;            // Campo del objeto a exportar
  format?: (value: any, row?: any) => string; // Formato personalizado
}
```

## 🎨 Ejemplos Avanzados

### Columna con render personalizado

```tsx
{
  name: "USUARIO",
  uid: "user",
  sortable: true,
  render: (item) => (
    <div className="flex items-center gap-2">
      <Avatar src={item.avatar} />
      <div>
        <div className="font-medium">{item.name}</div>
        <div className="text-sm text-gray-500">{item.email}</div>
      </div>
    </div>
  ),
}
```

### Exportación con formato personalizado

```tsx
{
  header: "PRECIO",
  key: "price",
  format: (value) => `$${value.toFixed(2)}`,
}
```

### Búsqueda en múltiples campos

```tsx
<DataTable
  searchFields={["name", "email", "phone", "address"]}
  // Busca en todos estos campos simultáneamente
/>
```

### Columnas con dependencias

```tsx
export const getContactColumns = ({ getCompanyName }) => [
  {
    name: "EMPRESA",
    uid: "company",
    render: (contact) => getCompanyName(contact.company_id),
  },
];

// En el componente
const getCompanyName = useCallback((id) => {
  return companies.find(c => c.id === id)?.name || "-";
}, [companies]);

const columns = useMemo(
  () => getContactColumns({ getCompanyName }),
  [getCompanyName]
);
```

## 🎯 Características

✅ **Búsqueda múltiple**: Busca en varios campos simultáneamente
✅ **Ordenamiento**: Click en columnas para ordenar
✅ **Paginación**: Navegación entre páginas con selector de filas
✅ **Exportación**: Excel, CSV y PDF con un click
✅ **Responsive**: Se adapta a diferentes tamaños de pantalla
✅ **TypeScript**: Completamente tipado
✅ **Modular**: Columnas separadas por archivo
✅ **Reutilizable**: Un solo componente para todas las tablas

## 📝 Notas

- Las columnas de **display** y **export** pueden ser diferentes
- Usa `render` para personalizar celdas complejas
- Usa `format` en exportación para transformar datos
- El hook `useTableFeatures` maneja todo el estado internamente
- Los archivos exportados incluyen la fecha automáticamente

## 🔧 Migración de tablas existentes

1. Crear archivo `columns/[entity]-columns.tsx`
2. Mover definición de columnas al nuevo archivo
3. Agregar columnas de exportación
4. Actualizar props del DataTable:
   - Cambiar `searchKey` por `searchFields`
   - Agregar `enableExport={true}`
   - Agregar `exportColumns` y `tableName`
