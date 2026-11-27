import { useContext } from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";
import AxiosDB from "./AxiosDB";
import MainContext, { MainStore } from "./Context/MainContext";
import { uploadBaseUrl } from "./config";

vi.mock("./AxiosDB", () => ({
  default: {
    get: vi.fn(async () => ({ data: { success: true, logoutTime: 60000, niit: {}, address: [] } })),
    post: vi.fn(),
    put: vi.fn(),
  },
}));
vi.mock("jodit-react", () => ({ default: () => null }));

const openDashboard = (path = "/control") => render(
  <MemoryRouter initialEntries={[path]}>
    <MainStore><App /></MainStore>
  </MemoryRouter>
);

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("keeps a stored session on a direct dashboard visit", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const claims = btoa(JSON.stringify({ role: "admin", name: "Test Admin" }));
  localStorage.setItem("token", `e30.${claims}.test`);

  openDashboard();

  expect(await screen.findByRole("heading", { name: "Нийт үзүүлэлт" }, { timeout: 3000 })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Хянах самбар" })).toHaveAttribute("aria-current", "page");
});

function SessionStatus() {
  const { user } = useContext(MainContext);
  return <p>{user ? "Signed in" : "Signed out"}</p>;
}

test.each([30, 90])("signs out away from the dashboard at the earlier deadline (JWT: %ss)", async (jwtSeconds) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  const exp = Date.now() / 1000 + jwtSeconds;
  const token = mockToken("admin", "admin-1", exp);
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify({ role: "admin" }));

  await act(async () => {
    render(<MemoryRouter><MainStore><SessionStatus /></MainStore></MemoryRouter>);
  });

  const duration = Math.min(jwtSeconds, 60) * 1000;
  await act(() => vi.advanceTimersByTimeAsync(duration - 1));
  expect(screen.getByText("Signed in")).toBeInTheDocument();

  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(screen.getByText("Signed out")).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
});

test("redirects an expired dashboard session to login when the tab regains focus", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const exp = Math.floor(Date.now() / 1000) + 30;
  localStorage.setItem("token", mockToken("admin", "admin-1", exp));
  openDashboard();
  expect(await screen.findByRole("heading", { name: "Нийт үзүүлэлт" })).toBeInTheDocument();

  vi.spyOn(Date, "now").mockReturnValue(exp * 1000);
  fireEvent.focus(window);

  expect(await screen.findByRole("heading", { name: "Нэвтрэх", level: 1 })).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBeNull();
});

test("sends a guest to the login form on a direct dashboard visit", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  openDashboard("/control/training");

  expect(await screen.findByRole("heading", { name: "Нэвтрэх", level: 1 }, { timeout: 3000 })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Имэйл хаяг" })).toBeRequired();

  const rolePicker = within(screen.getByRole("group", { name: "Хэрэглэгчийн төрөл" }));
  expect(rolePicker.getAllByRole("radio")).toHaveLength(7);
  expect(rolePicker.getByRole("radio", { name: "Сурагч" })).toBeChecked();

  fireEvent.click(rolePicker.getByRole("radio", { name: "Оюутан" }));
  expect(screen.getByRole("textbox", { name: "Нэвтрэх нэр" })).toHaveAttribute("type", "text");
});

test("keeps a failed sign-in message next to the form and clears it on edit", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  AxiosDB.post.mockRejectedValueOnce({ response: { data: { error: "Нэвтрэх мэдээллээ шалгана уу." } } });
  openDashboard("/login");

  const email = await screen.findByLabelText("Имэйл хаяг", { exact: true }, { timeout: 3000 });
  fireEvent.change(email, { target: { value: "student@example.test" } });
  fireEvent.change(screen.getByLabelText("Нууц үг", { exact: true }), { target: { value: "example-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Нэвтрэх", exact: true }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Нэвтрэх мэдээллээ шалгана уу.");
  expect(screen.getByRole("button", { name: "Нэвтрэх", exact: true })).toBeEnabled();

  fireEvent.change(email, { target: { value: "student2@example.test" } });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("opens the complete exam catalog from the header exam menu and filters every page", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const examType = "ЭЕШ-ын сорил";
  const exams = [
    { _id: "math-1", examType, name: "Математик-2025", lessonName: "Математик", examTime: 80, createdAt: "2025-01-01" },
    { _id: "english-2", examType, name: "Англи хэл-2024", lessonName: "Англи хэл", examTime: 60, createdAt: "2024-01-01", isOpenAnswer: true },
  ];
  const originalGet = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation((url, options) => {
    if (url !== "shalgalt/lists") return originalGet(url, options);
    const page = options.params.page;
    return Promise.resolve({ data: { shalgalt: [exams[page - 1]], pagination: { pageCount: exams.length } } });
  }, async () => {
    openDashboard("/login");
    const mainNav = await screen.findByRole("navigation", { name: "Үндсэн цэс", exact: true }, { timeout: 3000 });
    fireEvent.click(within(mainNav).getByRole("button", { name: "Сорил", exact: true }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "ЭЕШ-ын сорил" }));
    const subject = await screen.findByLabelText("Хичээл", { exact: true }, { timeout: 3000 });
    const search = screen.getByRole("searchbox", { name: "Сорил хайх" });

    expect(await screen.findByText("Нийт 2 сорил", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(subject).toHaveValue("");
    expect(screen.getAllByRole("article")).toHaveLength(2);

    fireEvent.change(search, { target: { value: "АнгЛИ   2024" } });
    expect(screen.getByRole("link", { name: "Англи хэл-2024" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Математик-2025" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Шүүлтүүр арилгах" }));
    fireEvent.change(subject, { target: { value: "Математик" } });
    expect(screen.getByRole("link", { name: "Математик-2025" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Англи хэл-2024" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Шүүлтүүр арилгах" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Үр дүн гарсан сорил" }));
    expect(screen.getByRole("link", { name: "Англи хэл-2024" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Үр дүн", exact: true })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Шүүлтүүр арилгах" }));
    fireEvent.change(screen.getByLabelText("Эрэмбэлэх"), { target: { value: "duration" } });
    expect(screen.getAllByRole("article")[0]).toHaveTextContent("Англи хэл-2024");
  });
});

test("shows exam instructions and keeps the filters when returning to the catalog", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const category = "ЭЕШ-ын сорил";
  const exam = { _id: "math", name: "Математикийн сорил", examType: category, lessonName: "Алгебр", examTime: 45,
    introduction: "<p>Эхлээд заавраа уншаарай.</p>" };
  const get = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url === "shalgalt/lists") return { data: { shalgalt: [exam] } };
    if (url === "shalgalt/math") return { data: { success: true, shalgalt: exam, listTests: ["q1", "q2"] } };
    return get(url, options);
  }, async () => {
    openDashboard(`/soril/${encodeURIComponent(category)}?subject=${encodeURIComponent(exam.lessonName)}`);
    fireEvent.click(await screen.findByRole("link", { name: exam.name }, { timeout: 3000 }));
    expect(await screen.findByRole("heading", { name: exam.name, level: 1 }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("Эхлээд заавраа уншаарай.")).toBeInTheDocument();
    expect(screen.getByText("45 минут")).toBeInTheDocument();
    expect(screen.getByText("Даалгаврын тоо")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Нэвтрэх" })).toBeEnabled();
    fireEvent.click(screen.getByRole("link", { name: "Сорилын жагсаалт" }));
    expect(await screen.findByLabelText("Хичээл", { exact: true })).toHaveValue(exam.lessonName);
  });
});

test("opens a previously registered exam from its public details without enrolling again", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("Student", "learner"));
  const exam = { _id: "math", name: "Математик", examType: "ЭЕШ-ын сорил" };
  const get = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url === "shalgalt/math") return { data: { success: true, shalgalt: exam } };
    if (url === "shalgalt/member/learner") return { data: { shalgaltuud: [
      { shalgalt: exam, info: { examStatus: "Ажиллаж байна" } },
    ] } };
    return get(url, options);
  }, async () => {
    openDashboard("/e/math");
    expect(await screen.findByRole("link", { name: "Үргэлжлүүлэх" }, { timeout: 3000 })).toHaveAttribute("href", "/control/soril/math");
    expect(screen.queryByRole("button", { name: "Бүртгүүлэх" })).not.toBeInTheDocument();
  });
});

function mockToken(role, id, exp) {
  return `e30.${btoa(JSON.stringify({ role, id, name: "Test user", exp }))}.test`;
}

test("opens an uploaded lesson from the signed-in training dashboard", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("suragch", "learner"));
  const get = AxiosDB.get.getMockImplementation();
  const course = { _id: "math", name: "Математик" };
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url === "surgalt/math/learn") throw { response: { status: 404 } };
    if (url === "surgalt/math") return { data: { surgalt: { ...course, lessons: [
      { _id: "one", lessonName: "Тэгшитгэл", lessonType: false, url: "lesson 1.mp4", introduction: "<p>Хичээлийн тайлбар</p>", materials: [{ title: "Дадлага", url: "https://example.test/notes.pdf" }] },
      { _id: "two", lessonName: "Давтлага", url: "surgalt/videos/lesson-2.mp4" },
    ] } } };
    if (url !== "surgalt/member/learner") return get(url, options);
    return { data: { surgaltuud: [{
      suraltsagch: { status: "Худалдаж авсан" },
      surgalt: course,
    }] } };
  }, async () => {
    openDashboard("/control/training");
    fireEvent.click(await screen.findByRole("link", { name: /Математик\s*Үзэх/ }, { timeout: 3000 }));
    await screen.findByRole("heading", { name: "Математик", level: 1 }, { timeout: 3000 });
    const viewer = screen.getByRole("main");
    const expected = new URL(`${uploadBaseUrl}/surgalt/videos/lesson%201.mp4`, window.location.href).href;
    await waitFor(() => expect(viewer.querySelector("video")).toHaveAttribute("src", expected));
    expect(screen.getByText("Хичээлийн тайлбар")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Үзсэнээр тэмдэглэх" }));
    expect(screen.getByRole("progressbar", { name: "Сургалтын ахиц" })).toHaveAttribute("value", "1");
    fireEvent.click(screen.getByRole("button", { name: "Материал" }));
    expect(screen.getByRole("link", { name: "Дадлага" })).toHaveAttribute("href", "https://example.test/notes.pdf");
    fireEvent.click(screen.getByRole("button", { name: "Миний тэмдэглэл" }));
    fireEvent.change(screen.getByLabelText("Хувийн тэмдэглэл"), { target: { value: "Дахин давтах" } });
    fireEvent.click(screen.getByRole("button", { name: "Хадгалах" }));
    expect(screen.getByText("Тэмдэглэл хадгалагдлаа.")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("esurgalt.learn:learner:math")).notes).toEqual({ one: "Дахин давтах" });

    fireEvent.click(within(viewer).getByRole("button", { name: "Дараагийн хичээл" }));
    const next = new URL(`${uploadBaseUrl}/surgalt/videos/lesson-2.mp4`, window.location.href).href;
    await waitFor(() => expect(viewer.querySelector("video")).toHaveAttribute("src", next));
  });
});

test("does not show a paid lesson when opening its address without access", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("Student", "learner"));
  const get = AxiosDB.get.getMockImplementation();
  const course = { _id: "math", name: "Математик", isTulbur: true, lessons: [{ _id: "one", url: "lesson.mp4" }] };
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url === "surgalt/math/learn") throw { response: { status: 403 } };
    if (url === "surgalt/math") return { data: { surgalt: course } };
    if (url === "surgalt/member/learner") return { data: { surgaltuud: [{ surgalt: course, suraltsagch: { status: "Хүсэлт илгээсэн" } }] } };
    return get(url, options);
  }, async () => {
    openDashboard("/control/learn/math?lesson=one");
    expect(await screen.findByText("Сургалтын үзэх эрх идэвхгүй байна", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(document.querySelector("video")).toBeNull();
  });
});

test("plays the requested lesson from the authenticated learning response", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const token = mockToken("Student", "learner");
  localStorage.setItem("token", token);
  const courseId = "63cf8d3013b195f7c0aeac32";
  const lessonId = "68c18c250f2ba68bc785c37a";
  const get = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url !== `surgalt/${courseId}/learn`) return get(url, options);
    expect(options.headers.Authorization).toBe(`Bearer ${token}`);
    return { data: {
      success: true,
      surgalt: { _id: courseId, name: "Өгөгдлийн сан" },
      access: { full: true },
      progress: { lastLesson_id: "first" },
      lessons: [
        { _id: "first", lessonName: "Эхний хичээл", number: 1, locked: false, videoUrl: "https://example.test/first.mp4" },
        { _id: lessonId, lessonName: "Сонгосон хичээл", number: 2, locked: false, videoUrl: "https://west.edu.mn/upload/surgalt/videos/chosen.mp4?ticket=test" },
        { _id: "blocked", lessonName: "Түгжээтэй хичээл", number: 3, locked: true, videoUrl: "https://example.test/locked.mp4" },
      ],
    } };
  }, async () => {
    openDashboard(`/control/learn/${courseId}?lesson=${lessonId}`);
    const blocked = await screen.findByRole("button", { name: /Түгжээтэй хичээл/ }, { timeout: 3000 });
    expect(blocked).toBeDisabled();
    const expected = new URL(`${uploadBaseUrl}/surgalt/videos/chosen.mp4?ticket=test`, window.location.href).href;
    await waitFor(() => expect(document.querySelector("video")).toHaveAttribute("src", expected));
  });
});

test("shows the course catalog on the training dashboard when the member list is empty", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("Student", "learner"));
  const course = { _id: "free", name: "Үнэгүй математик", isTulbur: false, video: "https://example.test/math.mp4" };
  const get = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url === "surgalt/member/learner") return { data: { surgaltuud: [] } };
    if (url === "surgalt") return { data: { surgalt: [course] } };
    if (url === "surgalt/free") return { data: { surgalt: course } };
    return get(url, options);
  }, async () => {
    openDashboard("/control/training");
    expect(await screen.findByText("Бүртгүүлсэн сургалт алга")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("link", { name: "Үнэгүй математик сургалт · Үзэх" }));
    expect(await screen.findByRole("heading", { name: "Үнэгүй математик", level: 1 }, { timeout: 3000 })).toBeInTheDocument();
    await waitFor(() => expect(document.querySelector("video")).toHaveAttribute("src", course.video));
  });
});

test("shows a member-list error and allows retry on the training dashboard", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("suragch", "learner"));
  const get = AxiosDB.get.getMockImplementation();
  let fail = true;
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url === "surgalt") return { data: { surgalt: [] } };
    if (url !== "surgalt/member/learner") return get(url, options);
    if (fail) throw new Error("Сервер түр завгүй байна.");
    return { data: { surgaltuud: [] } };
  }, async () => {
    openDashboard("/control/training");
    expect(await screen.findByText("Миний сургалтуудыг ачаалж чадсангүй")).toBeInTheDocument();
    expect(screen.getByText("Сервер түр завгүй байна.")).toBeInTheDocument();
    fail = false;
    fireEvent.click(screen.getByRole("button", { name: "Дахин оролдох" }));
    expect(await screen.findByText("Бүртгүүлсэн сургалт алга")).toBeInTheDocument();
  });
});

test("lets a teacher open the course player from the training management table", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("bagsh", "teacher-1"));
  const course = { _id: "math", name: "Математик" };
  const lesson = { _id: "one", lessonName: "Тэгшитгэл", url: "https://example.test/math.mp4" };
  const get = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url === "surgalt?owner_id=teacher-1") return { data: { surgalt: [course] } };
    if (url === "surgalt/math/url") return { data: { surgalt: { ...course, lessons: [lesson] } } };
    return get(url, options);
  }, async () => {
    openDashboard("/control/training");
    fireEvent.click(await screen.findByRole("button", { name: "Үзэх", exact: true }, { timeout: 3000 }));
    const dialog = await screen.findByRole("dialog", { name: "Математик" });
    await waitFor(() => expect(dialog.querySelector("video")).toHaveAttribute("src", lesson.url));
  });
});

test("loads the student profile after signing in from a link", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const token = mockToken("Student", "student-1");
  openDashboard(`/tlogin/${token}`);

  expect(await screen.findByRole("heading", { name: "Сүүлийн дүн" })).toBeInTheDocument();
  await waitFor(() => expect(AxiosDB.get).toHaveBeenCalledWith("students/student-1", {
    headers: { Authorization: `Bearer ${token}` },
  }));
  expect(localStorage.getItem("token")).toBe(token);
});

test.each(["Student", "suragch"])("shows personal exams and courses on the %s dashboard", async (role) => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken(role, "learner"));
  const get = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation(async (url, options) => {
    if (url === "shalgalt/member/learner") return { data: { shalgaltuud: [
      { shalgalt: { _id: "open", name: "Математикийн сорил" }, info: { examStatus: "Ажиллаж байна" } },
      { shalgalt: { _id: "graded", name: "Алгебрын дүн" }, info: { examStatus: "Дууссан", endTime: "2026-11-25T00:00:00Z" } },
      { shalgalt: { _id: "zero", name: "Өмнөх дүн" }, info: { examStatus: "Дууссан", endTime: "2026-11-24T00:00:00Z", unelgee: { dun: 0 } } },
    ] } };
    if (url === "shalgaltdun/result/graded/learner") return { data: { success: true, shalgaltdun: { unelgee: { dun: 84 } } } };
    if (url === "surgalt/member/learner") return { data: { surgaltuud: [
      { surgalt: { _id: "course", name: "Программчлал" }, suraltsagch: { status: "Худалдаж авсан" } },
      { surgalt: { _id: "pending", name: "Төлбөр хүлээгдэж буй сургалт" }, suraltsagch: { status: "Хүсэлт илгээсэн" } },
    ] } };
    return get(url, options);
  }, async () => {
    openDashboard();
    expect(await screen.findByRole("link", { name: "Сорилоо үргэлжлүүлэх" }, { timeout: 3000 })).toHaveAttribute("href", "/control/soril/open");
    expect(await screen.findByRole("progressbar", { name: "Гүйцэтгэл · Алгебрын дүн" })).toHaveAttribute("value", "84");
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Программчлал" })).toHaveAttribute("href", "/control/learn/course");
    expect(screen.queryByText("Төлбөр хүлээгдэж буй сургалт")).not.toBeInTheDocument();
  });
});

test("opens a completed exam from the school student list", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("surguuli", "school-1"));

  const requests = [];
  const originalGet = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation(async (url, options) => {
    requests.push(url);
    const shalgalt = { _id: "exam-1", name: "Математикийн сорил", isOpenAnswer: true };
    const info = { member_id: "student-1", examStatus: "Дууссан" };
    if (url === "shalgalt/member/student-1") return { data: { shalgaltuud: [{ shalgalt, info }] } };
    if (url === "shalgalt/findOne/exam-1/student-1") return { data: { success: true, shalgalt, info } };
    if (url === "shalgaltdun/result/exam-1/student-1") {
      return { data: { success: true, shalgaltdun: { unelgee: { dun: 85 }, contentQuiz: [
        { _id: "choice", onoo: 0, testsan_id: {
          testType: "Нэг сонголттой", points: 2, question: "<p>Зөв тоог сонгоно уу.</p>",
          answers: [{ _id: "a1", answer: "Найм", correct: true }, { _id: "a2", answer: "Ес" }],
        }, studAnswers: [{ _id: "a2" }] },
        { _id: "written", onoo: 1, testsan_id: {
          testType: "Задгай даалгавар", points: 2, question: "<p>Тооцооллын дүнг оруулна уу.</p>",
          answers: [{ _id: "a3", answer: "а", value: "42", correct: true }],
        }, studAnswers: [{ _id: "a3", answer: "а", value: "41" }] },
      ] } } };
    }
    return originalGet(url, options);
  }, async () => {
    openDashboard("/control/suragch/student-1");
    fireEvent.click(await screen.findByRole("button", { name: "Сорилын үр дүн" }));
    expect(await screen.findByRole("heading", { name: "Таны гүйцэтгэл" })).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Зөв тоог сонгоно уу.")).toBeInTheDocument();
    expect(screen.getByText("Таны сонголт")).toBeInTheDocument();
    expect(screen.getByText("Найм")).toBeInTheDocument();
    expect(screen.getByText("1 / 2 оноо")).toBeInTheDocument();
    expect(screen.getByText("41")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Хэсэгчилсэн оноо (1)" }));
    expect(screen.queryByText("Зөв тоог сонгоно уу.")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Даалгавар 2" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Эхлүүлэх" })).not.toBeInTheDocument();
    expect(requests).not.toContain("shalgalt/findOne/exam-1/school-1");
  });
});

test("recovers an invalid saved question order and waits for an answer before finishing", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("suragch", "learner"));
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  const orderKey = "exam_question_order_exam-2_learner";
  localStorage.setItem(orderKey, JSON.stringify(["q1", "q1"]));

  const examId = "exam-2";
  const question = {
    _id: "q1",
    testsan_id: { _id: "template-1", testType: "Нэг сонголттой", question: "<p>Туршилтын асуулт</p>", answers: [{ _id: "a1", answer: "Туршилтын хариулт" }] },
    studAnswers: [],
  };
  const second = { ...question, _id: "q2" };
  let status = "Ажиллаж байна";
  let saved = false;
  let finishAnswer;
  const answerResponse = new Promise((resolve) => { finishAnswer = resolve; });
  const mutations = [];
  const originalGet = AxiosDB.get.getMockImplementation();
  await AxiosDB.put.withImplementation(async (url, payload) => {
    mutations.push(url);
    if (url === "shalgaltdun/working/q1") {
      await answerResponse;
      saved = true;
      return { data: { success: true } };
    }
    if (url === "shalgalt/updateMember/exam-2") {
      status = payload.examStatus;
      return { data: { success: true } };
    }
    throw new Error("Unexpected request");
  }, () => AxiosDB.get.withImplementation(async (url, options) => {
    const current = saved ? { ...question, studAnswers: [{ _id: "a1", value: "" }] } : question;
    if (url === "shalgalt/findOne/exam-2/learner") {
      return { data: { success: true, info: { member_id: "learner", examStatus: status, memberTime: 60000 },
        shalgalt: { _id: examId }, shalgaltdun: [current, second] } };
    }
    if (url === "shalgaltdun/q1") return { data: { shalgaltdun: current } };
    if (url === "shalgaltdun/result/exam-2/learner") {
      return { data: { success: true, shalgaltdun: { contentQuiz: [{ ...current, testsan_id: {
        ...current.testsan_id, answers: [{ _id: "a1", answer: "Нийтлээгүй зөв хариулт", correct: true }],
      } }] } } };
    }
    return originalGet(url, options);
  }, async () => {
    openDashboard("/control/soril/exam-2");
    fireEvent.click(await screen.findByRole("button", { name: "Туршилтын хариулт" }));
    expect(JSON.parse(localStorage.getItem(orderKey)).sort()).toEqual(["q1", "q2"]);
    fireEvent.click(screen.getByRole("button", { name: "Дуусгах", exact: true }));
    fireEvent.click(await screen.findByRole("button", { name: "Тиймээ би итгэлтэй байна" }));
    expect(mutations).toEqual(["shalgaltdun/working/q1"]);
    finishAnswer();
    expect(await screen.findByRole("heading", { name: "Таны гүйцэтгэл" })).toBeInTheDocument();
    expect(screen.getByText("Даалгаврын хариултууд нийтлэгдээгүй байна.")).toBeInTheDocument();
    expect(screen.queryByText("Нийтлээгүй зөв хариулт")).not.toBeInTheDocument();
    expect(mutations).toEqual(["shalgaltdun/working/q1", "shalgalt/updateMember/exam-2"]);
  }));
});

test("a university teacher can sign in using a formatted Mongolian phone number", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  AxiosDB.post.mockResolvedValueOnce({ data: { token: mockToken("teacher", "teacher-1") } });
  openDashboard("/login");

  fireEvent.click(await screen.findByRole("radio", { name: "Их сургуулийн багш" }));
  const identifier = screen.getByRole("textbox", { name: "Утасны дугаар эсвэл имэйл" });
  expect(identifier).toHaveAttribute("type", "text");
  fireEvent.change(identifier, { target: { value: "123" } });
  fireEvent.change(screen.getByLabelText("Нууц үг", { exact: true }), { target: { value: "example-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Нэвтрэх", exact: true }));
  expect(await screen.findByRole("alert")).toHaveTextContent("8 оронтой утасны дугаараа оруулна уу.");

  fireEvent.change(identifier, { target: { value: "+976 9911-2233" } });
  fireEvent.click(screen.getByRole("button", { name: "Нэвтрэх", exact: true }));

  expect(await screen.findByRole("heading", { name: "Нийт үзүүлэлт" })).toBeInTheDocument();
  expect(AxiosDB.post).toHaveBeenLastCalledWith("teachers/login", {
    email: "99112233",
    loginName: "99112233",
    phone: "99112233",
    phone1: "99112233",
    password: "example-password",
  });
});

test("a university teacher can still sign in by email", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  AxiosDB.post.mockResolvedValueOnce({ data: { token: mockToken("teacher", "teacher-1") } });
  openDashboard("/login");

  fireEvent.click(await screen.findByRole("radio", { name: "Их сургуулийн багш" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Утасны дугаар эсвэл имэйл" }), {
    target: { value: "teacher@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Нууц үг", { exact: true }), { target: { value: "example-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Нэвтрэх", exact: true }));

  expect(await screen.findByRole("heading", { name: "Нийт үзүүлэлт" })).toBeInTheDocument();
  expect(AxiosDB.post).toHaveBeenLastCalledWith("teachers/login", {
    email: "teacher@example.test",
    loginName: "teacher@example.test",
    password: "example-password",
  });
});
