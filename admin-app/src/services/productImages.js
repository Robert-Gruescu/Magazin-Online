import { supabase } from "../supabaseClient";

export const BUCKET = "product-images";
export const MAX_SIZE = 5 * 1024 * 1024; // 5 MB, la fel ca limita bucket-ului
export const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const extensionFor = (file) => {
  const fromType = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[file.type];
  if (fromType) return fromType;
  const fromName = file.name.split(".").pop()?.toLowerCase();
  return fromName && fromName.length <= 5 ? fromName : "jpg";
};

const randomId = () =>
  (globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/** Verifica un fisier inainte de upload. Returneaza un mesaj sau null. */
export function validateImage(file) {
  if (!ACCEPTED.includes(file.type)) {
    return `${file.name}: format neacceptat. Foloseste JPG, PNG, WebP sau AVIF.`;
  }
  if (file.size > MAX_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `${file.name}: ${mb} MB, peste limita de 5 MB.`;
  }
  return null;
}

/** Imaginile unui produs, in ordinea de afisare. */
export async function fetchProductImages(productId) {
  const { data, error } = await supabase
    .from("product_images")
    .select("id, url, storage_path, alt, sort_order, is_primary")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/**
 * Urca un fisier in Storage si creeaza randul din `product_images`.
 * Daca inserarea in tabel esueaza, fisierul urcat este sters, ca sa nu ramana
 * orfan in bucket.
 */
export async function uploadProductImage(productId, file, { alt } = {}) {
  const invalid = validateImage(file);
  if (invalid) return { data: null, error: invalid };

  const path = `${productId}/${randomId()}.${extensionFor(file)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      data: null,
      error:
        /bucket not found/i.test(uploadError.message)
          ? "Bucket-ul product-images nu exista. Ruleaza sql/005_imagini.sql."
          : `Upload esuat: ${uploadError.message}`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url: publicUrl,
      storage_path: path,
      alt: alt || file.name.replace(/\.[^.]+$/, ""),
    })
    .select("id, url, storage_path, alt, sort_order, is_primary")
    .single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { data: null, error: `Nu am putut salva imaginea: ${error.message}` };
  }

  return { data, error: null };
}

/** Sterge randul si, daca fisierul e din bucket-ul nostru, si fisierul. */
export async function deleteProductImage(image) {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", image.id);

  if (error) return { error: error.message };

  if (image.storage_path) {
    await supabase.storage.from(BUCKET).remove([image.storage_path]);
  }

  return { error: null };
}

/** Marcheaza o imagine ca principala. Triggerul le scoate pe celelalte din rol. */
export async function setPrimaryImage(imageId) {
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  return { error: error?.message ?? null };
}

/** Salveaza ordinea imaginilor, in ordinea din lista primita. */
export async function reorderImages(images) {
  const updates = images.map((image, index) =>
    supabase
      .from("product_images")
      .update({ sort_order: index + 1 })
      .eq("id", image.id),
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  return { error: failed?.error?.message ?? null };
}

/** Adauga o imagine dupa URL extern, fara upload. */
export async function addImageByUrl(productId, url, alt) {
  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, url: url.trim(), alt: alt || null })
    .select("id, url, storage_path, alt, sort_order, is_primary")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
