"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/shared/context/supabase-context";

export default function SupabaseTest() {
  const { supabase } = useSupabase();
  const [testResults, setTestResults] = useState<any>({
    rolesTest: null,
    usersTest: null,
    connectionTest: null,
  });

  useEffect(() => {
    const runTests = async () => {
      console.log("🧪 Iniciando pruebas de Supabase...");

      // Test 1: Verificar conexión básica
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        console.log("✅ Test de sesión:", { sessionData, sessionError });
        setTestResults((prev: any) => ({
          ...prev,
          connectionTest: { sessionData, sessionError },
        }));
      } catch (err) {
        console.error("❌ Error en test de sesión:", err);
      }

      // Test 2: Consultar tabla roles
      try {
        const { data, error, status, statusText } = await supabase
          .from("roles")
          .select("*");

        console.log("🔍 Test de roles:", {
          data,
          error,
          status,
          statusText,
          errorDetails: error
            ? {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              }
            : null,
        });

        setTestResults((prev: any) => ({
          ...prev,
          rolesTest: { data, error, status },
        }));
      } catch (err) {
        console.error("❌ Error en test de roles:", err);
      }

      // Test 3: Consultar tabla users
      try {
        const { data, error, status, statusText } = await supabase
          .from("users")
          .select("*, role:roles(name)");

        console.log("🔍 Test de users:", {
          data,
          error,
          status,
          statusText,
          errorDetails: error
            ? {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              }
            : null,
        });

        setTestResults((prev: any) => ({
          ...prev,
          usersTest: { data, error, status },
        }));
      } catch (err) {
        console.error("❌ Error en test de users:", err);
      }
    };

    runTests();
  }, [supabase]);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-black">
        Pruebas de Conexión Supabase
      </h1>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow text-black">
          <h2 className="font-bold mb-2">Test de Sesión</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(testResults.connectionTest, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow text-black">
          <h2 className="font-bold mb-2">Test de Roles</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(testResults.rolesTest, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow text-black">
          <h2 className="font-bold mb-2">Test de Users</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(testResults.usersTest, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
