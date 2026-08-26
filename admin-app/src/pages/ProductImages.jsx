import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ImageManager from "../components/ImageManager";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

/** Galeria unui singur produs: /products/:id/images */
function ProductImages() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState("loading");

  const supabaseReady = Boolean(isSupabaseConfigured && supabase);

  const loadProduct = useCallback(async () => {
    if (!supabaseReady) return;

    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku, brand, categories(name)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      setState("missing");
      return;
    }

    setProduct(data);
    setState("ready");
  }, [id, supabaseReady]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProduct();
  }, [loadProduct]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <Link
              to="/products"
              className="text-xs uppercase tracking-[0.3em] text-ink/50 hover:text-ink"
            >
              &larr; Catalog
            </Link>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              {state === "loading"
                ? "Se incarca..."
                : (product?.name ?? "Produs inexistent")}
            </h1>
            {product && (
              <p className="mt-2 text-sm text-ink/60">
                {[product.brand, product.sku, product.categories?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </header>

        {state === "missing" && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Produsul nu a fost gasit.
          </div>
        )}

        {state === "ready" && (
          <>
            <div className="mt-8">
              <ImageManager productId={product.id} />
            </div>

            <div className="mt-6 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-soft backdrop-blur">
              <h2 className="font-display text-xl text-ink">Cum functioneaza</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/65">
                <li>
                  Fisierele urcate ajung in bucket-ul{" "}
                  <code>product-images</code> din Supabase Storage, intr-un
                  folder cu id-ul produsului.
                </li>
                <li>
                  Imaginea marcata <strong>Principala</strong> este cea afisata
                  pe carduri, in cos si la favorite. Se sincronizeaza automat in{" "}
                  <code>products.image_url</code>.
                </li>
                <li>
                  Ordinea sagetilor este ordinea miniaturilor de pe pagina de
                  produs.
                </li>
                <li>
                  Imaginile marcate <strong>Link</strong> sunt URL-uri externe.
                  Stergerea lor scoate doar randul din galerie, fisierul nu ne
                  apartine.
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductImages;
