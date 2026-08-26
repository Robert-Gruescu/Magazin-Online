import { useCallback, useEffect, useRef, useState } from "react";
import {
  addImageByUrl,
  deleteProductImage,
  fetchProductImages,
  reorderImages,
  setPrimaryImage,
  uploadProductImage,
  validateImage,
} from "../services/productImages";

/**
 * Galeria de imagini a unui produs: upload prin drag & drop sau selectie,
 * marcarea imaginii principale, reordonare si stergere.
 *
 * Imaginea principala ajunge automat in `products.image_url` (trigger in DB),
 * deci este cea afisata pe carduri, in cos si la favorite.
 */
function ImageManager({ productId, compact = false }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    const { data, error } = await fetchProductImages(productId);
    setImages(data);
    setErrors(error ? [error] : []);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    setBusy(true);
    const problems = [];

    for (const file of files) {
      const invalid = validateImage(file);
      if (invalid) {
        problems.push(invalid);
        continue;
      }
      const { error } = await uploadProductImage(productId, file);
      if (error) problems.push(error);
    }

    setErrors(problems);
    await load();
    setBusy(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDelete = async (image) => {
    setBusy(true);
    const { error } = await deleteProductImage(image);
    setErrors(error ? [error] : []);
    await load();
    setBusy(false);
  };

  const handleSetPrimary = async (image) => {
    setBusy(true);
    const { error } = await setPrimaryImage(image.id);
    setErrors(error ? [error] : []);
    await load();
    setBusy(false);
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next); // feedback imediat, salvarea vine dupa

    setBusy(true);
    const { error } = await reorderImages(next);
    setErrors(error ? [error] : []);
    await load();
    setBusy(false);
  };

  const handleAddUrl = async (event) => {
    event.preventDefault();
    if (!urlValue.trim()) return;

    setBusy(true);
    const { error } = await addImageByUrl(productId, urlValue);
    setErrors(error ? [error] : []);
    if (!error) {
      setUrlValue("");
      setShowUrlInput(false);
    }
    await load();
    setBusy(false);
  };

  return (
    <div className={compact ? "" : "rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur"}>
      {!compact && (
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Imagini produs</h2>
          <span className="text-xs uppercase tracking-[0.25em] text-ink/50">
            {images.length} {images.length === 1 ? "imagine" : "imagini"}
          </span>
        </div>
      )}

      {/* Zona de upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
          dragOver
            ? "border-ink bg-ink/5"
            : "border-ink/15 bg-white/60 hover:border-ink/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <p className="text-sm text-ink/70">
          Trage imaginile aici sau{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="font-semibold text-ink underline underline-offset-2"
          >
            alege fisiere
          </button>
        </p>
        <p className="mt-1 text-xs text-ink/45">
          JPG, PNG, WebP sau AVIF · maxim 5 MB per fisier
        </p>

        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="mt-3 text-xs text-ink/50 underline underline-offset-2 hover:text-ink"
        >
          sau adauga un link extern
        </button>

        {showUrlInput && (
          <form onSubmit={handleAddUrl} className="mt-3 flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white"
            >
              Adauga
            </button>
          </form>
        )}
      </div>

      {busy && (
        <p className="mt-3 text-xs text-ink/50">Se proceseaza imaginile...</p>
      )}

      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {/* Galeria */}
      {loading ? (
        <p className="mt-5 text-sm text-ink/50">Se incarca galeria...</p>
      ) : images.length === 0 ? (
        <p className="mt-5 text-sm text-ink/45">
          Produsul nu are inca nicio imagine.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <figure
              key={image.id}
              className={`group relative overflow-hidden rounded-2xl border bg-white ${
                image.is_primary ? "border-ink" : "border-ink/10"
              }`}
            >
              <div className="aspect-square w-full bg-ink/5">
                <img
                  src={image.url}
                  alt={image.alt || ""}
                  loading="lazy"
                  className="h-full w-full object-contain p-2"
                />
              </div>

              {image.is_primary && (
                <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Principala
                </span>
              )}

              {!image.storage_path && (
                <span
                  className="absolute right-2 top-2 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800"
                  title="Link extern, nu este un fisier din Storage"
                >
                  Link
                </span>
              )}

              <figcaption className="flex items-center justify-between gap-1 border-t border-ink/5 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || busy}
                    className="rounded-lg border border-ink/10 px-2 py-1 text-xs text-ink/60 disabled:opacity-30"
                    aria-label="Muta mai sus"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1 || busy}
                    className="rounded-lg border border-ink/10 px-2 py-1 text-xs text-ink/60 disabled:opacity-30"
                    aria-label="Muta mai jos"
                  >
                    &rarr;
                  </button>
                </div>

                <div className="flex gap-1">
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(image)}
                      disabled={busy}
                      className="rounded-lg border border-ink/10 px-2 py-1 text-[11px] font-semibold text-ink/60 hover:text-ink disabled:opacity-40"
                    >
                      Principala
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    disabled={busy}
                    className="rounded-lg border border-ink/10 px-2 py-1 text-[11px] font-semibold text-rose-500 hover:bg-rose-50 disabled:opacity-40"
                  >
                    Sterge
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageManager;
