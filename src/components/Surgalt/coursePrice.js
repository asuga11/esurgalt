const currency = new Intl.NumberFormat("en-US");

export function formatCoursePrice(price) {
  if (price == null || (typeof price === "string" && !price.trim())) return "Үнэ тодорхойгүй";
  const amount = Number(price);
  if (!Number.isFinite(amount)) return String(price);
  return amount === 0 ? "Үнэгүй" : `${currency.format(amount)} ₮`;
}

export function coursePrice(course) {
  const listed = formatCoursePrice(course.price);
  const sale = Number(course.sale);
  const discounted = course.info?.sellingPrice;
  const hasDiscount = sale > 0 && discounted != null && String(discounted).trim() !== "";
  const current = hasDiscount ? formatCoursePrice(discounted) : listed;

  return { current, previous: hasDiscount && current !== listed && course.price != null ? listed : null, discount: hasDiscount ? sale : 0 };
}
