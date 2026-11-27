const clock = new Intl.DateTimeFormat("mn-MN", {
  timeZone: "Asia/Hovd", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export function examSchedule(exam) {
  if (!exam.isStartTime) return "Хэзээ ч өгөх боломжтой";
  if (exam.examDate == null || exam.examDate === "") return "Эхлэх цаг тодорхойгүй";
  const date = new Date(exam.examDate);
  return Number.isFinite(date.getTime()) ? clock.format(date) : "Эхлэх цаг тодорхойгүй";
}

export function examMinutes(exam) {
  const minutes = Number(exam.examTime);
  return Number.isFinite(minutes) && minutes > 0 ? `${minutes} минут` : null;
}

export const memberExamActions = {
  "Дууссан": "Дүн харах",
  "Ажиллаж байна": "Үргэлжлүүлэх",
  "Хуваарилсан": "Сорил нээх",
};
