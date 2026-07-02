import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export async function TransparencyPreview() {
  const t = await getTranslations("transparency");

  interface DbPurchasePhoto {
    photo_url: string;
    photo_type: string;
  }
  interface DbPurchase {
    id: string;
    item_description: string;
    purchase_date: string;
    amount: number;
    currency: string;
    shelter_name: string;
    purchase_photos: DbPurchasePhoto[];
  }

  let purchases: DbPurchase[] = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("purchases")
      .select(`
        id,
        item_description,
        purchase_date,
        amount,
        currency,
        shelter_name,
        purchase_photos (
          photo_url,
          photo_type
        )
      `)
      .order("purchase_date", { ascending: false })
      .limit(3);
    purchases = (data as unknown as DbPurchase[]) ?? [];
  } catch (err) {
    console.warn("[TransparencyPreview] Error fetching purchases:", err);
  }

  const displayItems = purchases.map((p) => {
    const photos = p.purchase_photos || [];
    const productPhoto = photos.find((ph: DbPurchasePhoto) => ph.photo_type === "product")?.photo_url;
    const deliveryPhoto = photos.find((ph: DbPurchasePhoto) => ph.photo_type === "delivery")?.photo_url;
    return {
      id: p.id,
      description: p.item_description,
      shelter: p.shelter_name,
      location: "Venezuela",
      date: new Date(p.purchase_date).toLocaleDateString("es-VE"),
      amount: `$${Number(p.amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD`,
      photo_url: deliveryPhoto ?? productPhoto ?? null,
    };
  });

  return (
    <section className="bg-navy-light py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-sans font-800 text-3xl md:text-4xl text-navy mb-3">
            {t("title")}
          </h2>
          <p className="font-sans font-400 text-muted text-base">
            {t("subtitle")}
          </p>
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-16 text-muted font-sans text-sm border border-dashed border-[#003082]/15 bg-white/50 rounded-2xl mb-12">
            No hay compras registradas en este momento. Las compras confirmadas aparecerán aquí.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {displayItems.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl border border-navy/8 p-5 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                {/* Badge verificado */}
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-verified flex-shrink-0" />
                  <span className="font-mono text-[10px] text-verified tracking-[0.15em] uppercase">
                    {t("purchase_label")}
                  </span>
                </div>

                {/* Foto de la compra/entrega */}
                <div className="w-full h-32 bg-navy/5 rounded-xl overflow-hidden flex items-center justify-center relative">
                  {item.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photo_url}
                      alt={item.description}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-3xl opacity-30">📦</span>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <p className="font-sans font-600 text-navy text-sm leading-snug">
                    {item.description}
                  </p>
                  <p className="font-mono text-[11px] text-muted mt-1 font-semibold">
                    {item.date} · {item.amount}
                  </p>
                </div>

                {/* Refugio */}
                <div className="border-t border-navy/8 pt-3 mt-auto">
                  <p className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
                    {t("delivery_label")}
                  </p>
                  <p className="font-sans font-500 text-sm text-navy mt-0.5">
                    {item.shelter}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-2.5 font-sans font-bold text-base md:text-lg text-white bg-navy hover:bg-navy-mid px-10 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-98"
          >
            {t("cta")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
