'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { submitReview, type ReviewData, type SalonRatingStats } from '@/actions/reviews.actions';

function StarRow({ rating, interactive = false, onRate }: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`transition-colors ${
            interactive ? 'cursor-pointer w-6 h-6' : 'w-4 h-4'
          } ${
            n <= (interactive ? (hover || rating) : rating)
              ? 'text-primary fill-primary'
              : 'text-on-surface-variant/30 fill-transparent'
          }`}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(n)}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const date = new Date(review.createdAtMs).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const initials = review.clientName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="rounded-[1.5rem] border border-outline-subtle bg-surface-card p-5 flex flex-col gap-3 min-w-[280px] max-w-[320px] shrink-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center font-sans text-xs font-bold text-on-surface-secondary">
            {initials}
          </div>
          <div>
            <p className="font-sans text-sm font-semibold leading-tight text-on-surface">{review.clientName}</p>
            {review.serviceName && (
              <p className="font-sans text-[11px] text-on-surface-secondary leading-tight">{review.serviceName}</p>
            )}
          </div>
        </div>
        {review.verified && (
          <span className="font-sans text-[10px] text-success font-medium shrink-0 mt-0.5">✓ Verificada</span>
        )}
      </div>
      <StarRow rating={review.rating} />
      {review.comment && (
        <p className="font-sans text-sm text-on-surface-secondary leading-relaxed line-clamp-4">{review.comment}</p>
      )}
      <p className="font-sans text-[11px] text-on-surface-variant">{date}</p>
    </div>
  );
}

function ReviewForm({ tenantSlug, onDone }: { tenantSlug: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (rating === 0) { setError('Seleccioná una cantidad de estrellas.'); return; }
    if (!name.trim()) { setError('Tu nombre es requerido.'); return; }
    setError('');
    startTransition(async () => {
      const result = await submitReview(tenantSlug, {
        rating,
        comment: comment || undefined,
        clientName: name,
      });
      if (result.success) {
        onDone();
      } else {
        setError(result.error ?? 'Error al enviar la reseña.');
      }
    });
  };

  return (
    <div className="rounded-[1.5rem] border border-outline-subtle bg-surface-card p-6 space-y-4 max-w-md w-full mx-auto">
      <h3 className="font-sans text-base font-semibold text-on-surface">Dejá tu reseña</h3>

      <div className="space-y-1">
        <label className="font-sans text-xs text-on-surface-secondary uppercase tracking-wide">Puntaje</label>
        <StarRow rating={rating} interactive onRate={setRating} />
      </div>

      <div className="space-y-1">
        <label className="font-sans text-xs text-on-surface-secondary uppercase tracking-wide">Tu nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Laura G."
          className="w-full rounded-xl border border-outline-subtle bg-surface px-4 py-2.5 font-sans text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-1">
        <label className="font-sans text-xs text-on-surface-secondary uppercase tracking-wide">Comentario (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Contá tu experiencia..."
          rows={3}
          className="w-full rounded-xl border border-outline-subtle bg-surface px-4 py-2.5 font-sans text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {error && <p className="font-sans text-sm text-danger">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-surface font-sans text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {isPending ? 'Enviando...' : 'Publicar reseña'}
      </button>
    </div>
  );
}

interface Props {
  tenantSlug: string;
  initialReviews: ReviewData[];
  stats: SalonRatingStats;
}

export default function SalonReviews({ tenantSlug, initialReviews, stats }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (initialReviews.length === 0 && !showForm) {
    return (
      <section id="reviews" className="py-16 px-4 border-t border-outline-subtle bg-surface">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <p className="font-sans text-on-surface-secondary text-sm">Todavía no hay reseñas. ¡Sé el primero!</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center px-6 rounded-xl border border-outline-subtle bg-surface-card hover:bg-surface-hover font-sans text-sm font-medium text-on-surface transition-colors"
          >
            Dejar una reseña
          </button>
          {showForm && (
            <div className="mt-6">
              <ReviewForm tenantSlug={tenantSlug} onDone={() => { setShowForm(false); setSubmitted(true); }} />
            </div>
          )}
          {submitted && (
            <p className="font-sans text-sm text-success font-medium">¡Gracias por tu reseña!</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-16 px-4 border-t border-outline-subtle bg-surface overflow-hidden">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h2 className="font-vogue text-2xl font-semibold tracking-tight text-on-surface">Reseñas</h2>
            {stats.count > 0 && (
              <div className="flex items-center gap-2">
                <StarRow rating={Math.round(stats.average)} />
                <span className="font-sans text-sm font-medium text-on-surface">{stats.average.toFixed(1)}</span>
                <span className="font-sans text-sm text-on-surface-secondary">({stats.count} reseñas)</span>
              </div>
            )}
          </div>
          {!submitted && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="shrink-0 h-10 px-5 rounded-xl border border-outline-subtle bg-surface-card hover:bg-surface-hover font-sans text-sm font-medium text-on-surface transition-colors"
            >
              {showForm ? 'Cancelar' : 'Escribir reseña'}
            </button>
          )}
          {submitted && (
            <span className="font-sans text-sm text-success font-medium shrink-0">¡Gracias por tu reseña!</span>
          )}
        </div>

        {/* Review form */}
        {showForm && !submitted && (
          <div className="mb-8">
            <ReviewForm
              tenantSlug={tenantSlug}
              onDone={() => { setShowForm(false); setSubmitted(true); }}
            />
          </div>
        )}

        {/* Reviews horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {initialReviews.map((review) => (
            <div key={review.id} className="snap-start">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
