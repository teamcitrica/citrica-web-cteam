# 📊 Guía de Migración - Hook useExcelExport

## 🎯 Objetivo
Esta guía te ayudará a migrar el código actual de exportación a Excel en tus páginas para usar el nuevo hook reutilizable `useExcelExport`.

---

## ✅ Beneficios del Hook

- ✨ **Reutilizable**: Úsalo en cualquier proyecto o componente
- 🔧 **Configurable**: Múltiples opciones de personalización
- 📦 **Mantenible**: Un solo lugar para actualizar la lógica
- 🚀 **Fácil de usar**: API simple e intuitiva
- 📝 **Documentado**: Ejemplos completos incluidos
- 🎨 **Flexible**: Formateo automático y personalizado

---

## 📂 Archivos Creados

```
hooks/
├── use-excel-export.tsx           # Hook principal
├── use-excel-export.examples.tsx  # 10 ejemplos de uso
└── GUIA_MIGRACION_EXCEL_EXPORT.md # Esta guía
```

---

## 🔄 Migración Paso a Paso

### **ANTES: Código actual en role-data/[roleId]/page.tsx**

```typescript
import * as XLSX from "xlsx";

// Dentro del componente...
const exportToExcel = () => {
  const dataToExport = filteredData.map((row) => {
    const exportRow: any = {};

    Object.keys(row).forEach((key) => {
      const value = row[key];

      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('created_at')) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            exportRow[key.toUpperCase()] = date.toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          } else {
            exportRow[key.toUpperCase()] = value ?? "-";
          }
        } catch {
          exportRow[key.toUpperCase()] = value ?? "-";
        }
      } else if (typeof value === 'object' && value !== null) {
        exportRow[key.toUpperCase()] = JSON.stringify(value);
      } else {
        exportRow[key.toUpperCase()] = value ?? "-";
      }
    });

    return exportRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, credentials?.table_name || "Datos");

  const fileName = `${credentials?.table_name || 'datos'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
```

### **DESPUÉS: Usando el hook useExcelExport**

```typescript
import { useExcelExport } from "@/hooks/use-excel-export";

// Dentro del componente...
const { exportToExcel } = useExcelExport();

const handleExport = () => {
  exportToExcel({
    data: filteredData,
    fileName: credentials?.table_name || 'datos',
    sheetName: credentials?.table_name || 'Datos',
  });
};
```

**¡Solo 7 líneas vs 40+ líneas anteriores!** 🎉

---

## 📝 Ejemplo de Migración Completa

### **Archivo: app/admin/role-data/[roleId]/page.tsx**

#### **Cambio 1: Importar el hook**

```diff
- import * as XLSX from "xlsx";
+ import { useExcelExport } from "@/hooks/use-excel-export";
```

#### **Cambio 2: Usar el hook en el componente**

```diff
export default function RoleDataPage() {
  const params = useParams();
  const { userInfo } = UserAuth();
  const roleId = Number(params.roleId);

+ const { exportToExcel } = useExcelExport();

  const { credentials, tableData, isLoading, error, applyFilters } = useRoleData(roleId);

  // ... resto del código
```

#### **Cambio 3: Reemplazar la función exportToExcel**

```diff
- // Función para exportar a Excel
- const exportToExcel = () => {
-   // Preparar los datos para el Excel
-   const dataToExport = filteredData.map((row) => {
-     const exportRow: any = {};
-
-     // ... 30+ líneas de código ...
-   });
-
-   const worksheet = XLSX.utils.json_to_sheet(dataToExport);
-   const workbook = XLSX.utils.book_new();
-   XLSX.utils.book_append_sheet(workbook, worksheet, credentials?.table_name || "Datos");
-
-   const fileName = `${credentials?.table_name || 'datos'}_${new Date().toISOString().split('T')[0]}.xlsx`;
-   XLSX.writeFile(workbook, fileName);
- };

+ const handleExportToExcel = () => {
+   exportToExcel({
+     data: filteredData,
+     fileName: credentials?.table_name || 'datos',
+     sheetName: credentials?.table_name || 'Datos',
+   });
+ };
```

#### **Cambio 4: Actualizar el botón**

```diff
{filteredData.length > 0 && (
  <button
-   onClick={exportToExcel}
+   onClick={handleExportToExcel}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2"
  >
    <span>📥</span>
    <span>Exportar a Excel</span>
  </button>
)}
```

---

## 🎨 Ejemplos de Uso Avanzado

### **1. Excluir columnas sensibles**

```typescript
const handleExport = () => {
  exportToExcel({
    data: userData,
    fileName: 'usuarios',
    excludeColumns: ['password', 'token', 'secret_key'],
  });
};
```

### **2. Mapear nombres de columnas**

```typescript
const handleExport = () => {
  exportToExcel({
    data: tableData,
    fileName: 'registros',
    columnMapping: {
      id: 'ID',
      first_name: 'NOMBRE',
      last_name: 'APELLIDO',
      email: 'CORREO ELECTRÓNICO',
      created_at: 'FECHA DE REGISTRO',
    },
  });
};
```

### **3. Formatear valores personalizados**

```typescript
const handleExport = () => {
  exportToExcel({
    data: salesData,
    fileName: 'ventas',
    customFormatter: (key, value, row) => {
      // Formatear precios
      if (key === 'price' || key === 'total') {
        return `$${value.toFixed(2)}`;
      }

      // Formatear booleanos
      if (typeof value === 'boolean') {
        return value ? 'SÍ' : 'NO';
      }

      return value;
    },
  });
};
```

### **4. Exportar múltiples hojas**

```typescript
const { exportMultipleSheets } = useExcelExport();

const handleExportComplete = () => {
  exportMultipleSheets({
    fileName: 'reporte_completo',
    sheets: [
      { data: users, sheetName: 'Usuarios' },
      { data: products, sheetName: 'Productos' },
      { data: sales, sheetName: 'Ventas' },
    ],
  });
};
```

---

## 📋 Checklist de Migración

Para migrar cada página:

- [ ] Importar el hook `useExcelExport`
- [ ] Llamar al hook en el componente
- [ ] Eliminar la función `exportToExcel` antigua
- [ ] Crear nueva función usando `exportToExcel` del hook
- [ ] Actualizar el `onClick` del botón
- [ ] (Opcional) Agregar opciones de configuración
- [ ] Probar la exportación
- [ ] Eliminar import de `* as XLSX` si ya no se usa directamente

---

## 🔍 Páginas a Migrar

1. ✅ `app/admin/role-data/[roleId]/page.tsx`
2. ✅ `app/admin/tambo/page.tsx`

---

## 🚀 Uso en Otros Proyectos

Para usar este hook en otro proyecto:

1. **Copiar el archivo del hook:**
   ```bash
   cp hooks/use-excel-export.tsx /ruta/otro-proyecto/hooks/
   ```

2. **Instalar la dependencia XLSX:**
   ```bash
   npm install xlsx
   # o
   yarn add xlsx
   ```

3. **Importar y usar:**
   ```typescript
   import { useExcelExport } from '@/hooks/use-excel-export';

   const { exportToExcel } = useExcelExport();
   ```

---

## 📚 Documentación Adicional

- Ver **use-excel-export.examples.tsx** para 10 ejemplos completos
- El hook incluye JSDoc completo para autocomplete en tu IDE
- Todas las opciones son opcionales (solo `data` es requerido)

---

## ⚡ Funcionalidades Automáticas

El hook maneja automáticamente:

- ✅ Detección de columnas de fecha (por nombre)
- ✅ Formateo de fechas a formato legible
- ✅ Conversión de objetos a JSON string
- ✅ Conversión de booleanos a "Sí/No"
- ✅ Manejo de valores null/undefined (muestra "-")
- ✅ Ajuste automático del ancho de columnas
- ✅ Nombre de archivo con fecha actual
- ✅ Validación de datos vacíos

---

## 💡 Tips

1. **Siempre usa `filteredData`** en lugar de `tableData` si tienes filtros aplicados
2. **Personaliza el `fileName`** según el contexto (ej: nombre de la tabla)
3. **Usa `excludeColumns`** para ocultar datos sensibles
4. **Aprovecha `customFormatter`** para casos especiales
5. **Considera `exportMultipleSheets`** para reportes complejos

---

## 🐛 Solución de Problemas

### Problema: "No se descarga el archivo"

**Solución:** Verifica que `data` no esté vacío:
```typescript
if (filteredData.length === 0) {
  alert("No hay datos para exportar");
  return;
}
```

### Problema: "Las fechas no se formatean"

**Solución:** Asegúrate de que el nombre de la columna incluya "date", "fecha", "created_at", etc.

### Problema: "Columnas con nombres incorrectos"

**Solución:** Usa `columnMapping` para renombrarlas:
```typescript
columnMapping: {
  first_name: "NOMBRE",
  last_name: "APELLIDO"
}
```

---

## ✨ Conclusión

El hook `useExcelExport` simplifica enormemente la exportación de datos a Excel, reduciendo el código, mejorando la mantenibilidad y ofreciendo flexibilidad para casos de uso complejos.

**¡Feliz exportación!** 📊✨
