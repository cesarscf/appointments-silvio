import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { cn };

export function formatTime(time: string): string {
  return time.slice(0, 2);
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date));
}

export function formatPrice(
  price: number | string,
  opts: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: opts.currency ?? "BRL",
    notation: opts.notation ?? "compact",
    ...opts,
  }).format(Number(price));
}
