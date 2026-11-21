import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";
import AxiosDB from "./AxiosDB";
import { MainStore } from "./Context/MainContext";

vi.mock("./AxiosDB", () => ({
  default: {
    get: vi.fn(async () => ({ data: { success: true, logoutTime: 60000, niit: {}, address: [] } })),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const openDashboard = (path = "/control") => render(
  <MemoryRouter initialEntries={[path]}>
    <MainStore><App /></MainStore>
  </MemoryRouter>
);

afterEach(() => {
  localStorage.clear();
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

test("opens the complete exam catalog directly from the header and filters every page", async () => {
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
    fireEvent.click(within(mainNav).getByRole("link", { name: "Сорил", exact: true }));
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

function mockToken(role, id) {
  return `e30.${btoa(JSON.stringify({ role, id, name: "Test user" }))}.test`;
}

test("loads the student profile after signing in from a link", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const token = mockToken("Student", "student-1");
  openDashboard(`/tlogin/${token}`);

  expect(await screen.findByRole("heading", { name: "Нийт үзүүлэлт" })).toBeInTheDocument();
  await waitFor(() => expect(AxiosDB.get).toHaveBeenCalledWith("students/student-1", {
    headers: { Authorization: `Bearer ${token}` },
  }));
  expect(localStorage.getItem("token")).toBe(token);
});

test("opens a completed exam from the school student list", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.setItem("token", mockToken("surguuli", "school-1"));

  const requests = [];
  const originalGet = AxiosDB.get.getMockImplementation();
  await AxiosDB.get.withImplementation(async (url, options) => {
    requests.push(url);
    const shalgalt = { _id: "exam-1", name: "Математикийн сорил" };
    const info = { member_id: "student-1", examStatus: "Дууссан" };
    if (url === "shalgalt/member/student-1") return { data: { shalgaltuud: [{ shalgalt, info }] } };
    if (url === "shalgalt/findOne/exam-1/student-1") return { data: { success: true, shalgalt, info } };
    if (url === "shalgaltdun/result/exam-1/student-1") {
      return { data: { success: true, shalgaltdun: { unelgee: { dun: 85 } } } };
    }
    return originalGet(url, options);
  }, async () => {
    openDashboard("/control/suragch/student-1");
    fireEvent.click(await screen.findByRole("button", { name: "Сорилын үр дүн" }));
    expect(await screen.findByRole("heading", { name: "Таны гүйцэтгэл" })).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
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
    if (url === "shalgaltdun/result/exam-2/learner") return { data: { success: true, shalgaltdun: {} } };
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
