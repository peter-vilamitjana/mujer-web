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
              ? 'text-amber-400 fill-amber-400'
              : 'text-muted-foreground/30 fill-transparent'
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
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 min-w-[280px] max-w-[320px] shrink-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{review.clientName}</p>
            {review.serviceName && (
              <p className="text-[11px] text-muted-foreground leading-tight">{review.serviceName}</p>
            )}
          </div>
        </div>
        {review.verified && (
          <span className="text-[10px] text-emerald-500 font-medium shrink-0 mt-0.5">✓ Verificada</span>
        )}
      </div>
      <StarRow rating={review.rating} />
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{review.comment}</p>
      )}
      <p className="text-[11px] text-muted-foreground/60">{date}</p>
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
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-md w-full mx-auto">
      <h3 className="text-base font-semibold">Dejá tu reseña</h3>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Puntaje</label>
        <StarRow rating={rating} interactive onRate={setRating} />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Tu nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Laura G."
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Comentario (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Contá tu experiencia..."
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
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
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <p className="text-muted-foreground text-sm">Todavía no hay reseñas. ¡Sé el primero!</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center px-6 rounded-xl border border-border bg-card hover:bg-accent text-sm font-medium transition-colors"
          >
            Dejar una reseña
          </button>
          {showForm && (
            <div className="mt-6">
              <ReviewForm tenantSlug={tenantSlug} onDone={() => { setShowForm(false); setSubmitted(true); }} />
            </div>
          )}
          {submitted && (
            <p className="text-sm text-emerald-500 font-medium">¡Gracias por tu reseña!</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 border-t border-border overflow-hidden">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Reseñas</h2>
            {stats.count > 0 && (
              <div className="flex items-center gap-2">
                <StarRow rating={Math.round(stats.average)} />
                <span className="text-sm font-medium">{stats.average.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({stats.count} reseñas)</span>
              </div>
            )}
          </div>
          {!submitted && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="shrink-0 h-10 px-5 rounded-xl border border-border bg-card hover:bg-accent text-sm font-medium transition-colors"
            >
              {showForm ? 'Cancelar' : 'Escribir reseña'}
            </button>
          )}
          {submitted && (
            <span className="text-sm text-emerald-500 font-medium shrink-0">¡Gracias por tu reseña!</span>
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
