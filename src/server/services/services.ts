import type { DatabaseConnection } from "../db";
import auth from "./auth";
import { mapPostgresError } from "./error-mapper";

// Typy pomocnicze (musisz zaimportować 'Database' z db/index.ts)

type ServiceContext<TData> = {
  db: DatabaseConnection;
  data: TData;
};

// Typ funkcji logiki biznesowej, którą opakowujemy
type ServiceLogic<TData, TResult> = (
  ctx: ServiceContext<TData>
) => Promise<TResult>;

// /src/server/utils/compose-service.ts (Przykładowa implementacja)

// PRZECIĄŻENIE 1: Dla funkcji, które NIE PRZYJMUJĄ DANYCH WEJŚCIOWYCH (np. signOut())
// TData jest automatycznie ustawiane na 'void' lub 'undefined'
export function composeService<TResult>(
  serviceLogic: ServiceLogic<void, TResult>
): (db: DatabaseConnection, data?: void) => Promise<TResult>;

// PRZECIĄŻENIE 2: Dla funkcji, które PRZYJMUJĄ DANE WEJŚCIOWE
export function composeService<TData, TResult>(
  serviceLogic: ServiceLogic<TData, TResult>
): (db: DatabaseConnection, data: TData) => Promise<TResult>;

// FAKTYCZNA IMPLEMENTACJA
export function composeService<TData, TResult>(
  serviceLogic: ServiceLogic<TData, TResult>
) {
  // Funkcja zwracana, wywoływana przez tRPC Router. Przyjmuje 'data' jako opcjonalne.
  // Zwrócony typ TData będzie 'void' w przypadku wywołania bez argumentów
  return async (db: DatabaseConnection, data: TData): Promise<TResult> => {
    try {
      // Wstrzykujemy dane i kontekst DB do logiki biznesowej
      // W przypadku braku danych, 'data' będzie 'undefined' (lub 'void'), co jest w porządku.
      return await serviceLogic({ db, data });
    } catch (error) {
      // Centralny Error Handler (mapowanie błędów DB na TRPCError)
      // throw mapDrizzleError(error);
      throw mapPostgresError(error);
    }
  };
}
const services = {
  auth,
};
export default services;
