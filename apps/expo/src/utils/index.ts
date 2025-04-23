export function formatDateWithHour(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {},
) {
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...opts,
  }).format(new Date(date));

  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",

    hour12: false,
    ...opts,
  }).format(new Date(date));

  return `${formattedDate} às ${formattedTime}`;
}

export function formatPrice(
  price: number | string,
  opts: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: opts.currency ?? "BRL",
    notation: opts.notation ?? "standard",
    ...opts,
  }).format(Number(price));
}
