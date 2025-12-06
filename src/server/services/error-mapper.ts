// /src/server/utils/error-mapper.ts

import { TRPCError } from "@trpc/server";

// Definicja oczekiwanej, wewnętrznej struktury błędu z Postgres/Drizzle
type PostgresError = {
  code: string; // Kod błędu SQLSTATE (np. '23505')
  detail?: string;
  constraint?: string; // Nazwa naruszonego ograniczenia
  column?: string; // Nazwa naruszonej kolumny (dla 'not null')
  message: string;
};

/**
 * Tłumaczy specyficzne błędy Postgres/Drizzle na generyczne i czytelne TRPCError.
 * Gwarantuje, że Serwisy rzucają błędy Logiki (TRPCError), a nie błędy Protokołu DB.
 */
export function mapPostgresError(error: unknown): TRPCError {
  const dbError = error as PostgresError;

  // W przypadku, gdy już mamy TRPCError (np. rzucony jawnie w serwisie - UNAUTHORIZED)
  if (error instanceof TRPCError) {
    return error;
  }

  // --- OBSŁUGA KLUCZOWYCH KODÓW POSTGRESQL ---

  // 1. NARUSZENIE UNIKALNOŚCI (Unique Constraint Violation)
  // Kod: 23505 (np. próba rejestracji na zajęty email, który ma .unique() w schemacie)
  if (dbError.code === "23505") {
    let field = "pole";

    // a) Spróbuj odczytać nazwę pola z detalu (najdokładniejsze)
    if (dbError.detail) {
      const match = /Key \((.*?)\)=/.exec(dbError.detail);
      if (match?.at(1)) {
        // Czyścimy nazwę klucza, aby została sama nazwa kolumny (np. 'email')
        field = match.at(1)!.split("_").pop() ?? "pole";
      }
    } else if (dbError.constraint) {
      // b) Alternatywnie, wyciągnij z nazwy constraintu (mniej dokładne, ale działa)
      field = dbError.constraint?.split("_").pop() ?? "pole";
    }

    // Rzucamy błąd CONFLICT (kod HTTP 409) - zasób już istnieje
    throw new TRPCError({
      code: "CONFLICT",
      message: `Wartość w polu '${field}' jest już zajęta. Proszę podać unikalną wartość.`,
      cause: { field: field, type: "unique_violation" },
    });
  }

  // 2. NARUSZENIE NOT NULL (Not Null Violation)
  // Kod: 23502 (np. próba wstawienia rekordu bez wymaganego pola)
  if (dbError.code === "23502") {
    const field = dbError.column ?? "pola";
    // Rzucamy BAD_REQUEST (kod HTTP 400), bo to błąd danych wejściowych
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Wymagane pole '${field}' nie może być puste.`,
      cause: { field: field, type: "not_null_violation" },
    });
  }

  // --- BŁĄD OGÓLNY / NIEZNANY ---
  // W przypadku innych, nieobsłużonych błędów DB (np. awaria połączenia)
  console.error(`❌ Nieznany błąd Postgres (${dbError.code}):`, error);

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR", // Kod HTTP 500
    message: "Wystąpił nieznany błąd serwera. Spróbuj ponownie.",
  });
}
