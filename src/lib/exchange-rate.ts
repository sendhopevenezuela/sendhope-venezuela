const DOLAR_API_URL = "https://ve.dolarapi.com/v1/dolares/oficial";

type DolarApiResponse = {
  promedio: number;   // tasa promedio
  compra: number;
  venta: number;
  fechaActualizacion: string;
};

/**
 * Obtiene la tasa oficial VES/USD desde ve.dolarapi.com.
 * Retorna la tasa de venta (cuántos VES equivalen a 1 USD).
 * En caso de error de red, retorna null — el caller decide qué hacer.
 */
export async function getOfficialExchangeRate(): Promise<{
  rate: number;
  updatedAt: string;
} | null> {
  try {
    const res = await fetch(DOLAR_API_URL, {
      // No cacheamos en el servidor: siempre queremos la tasa del momento
      cache: "no-store",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(5000), // timeout de 5 segundos
    });

    if (!res.ok) {
      console.warn(`[ExchangeRate] API returned ${res.status}`);
      return null;
    }

    const data: DolarApiResponse = await res.json();

    // Usamos `promedio` como tasa de referencia
    const rate = data.promedio ?? data.venta;
    if (!rate || rate <= 0) return null;

    return { rate, updatedAt: data.fechaActualizacion };
  } catch (err) {
    console.warn("[ExchangeRate] Failed to fetch exchange rate:", err);
    return null;
  }
}

/**
 * Convierte un monto en VES a USD usando la tasa oficial.
 * Retorna el monto en USD redondeado a 2 decimales.
 */
export function vesToUSD(amountVES: number, rateVESperUSD: number): number {
  return Math.round((amountVES / rateVESperUSD) * 100) / 100;
}
