import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import MainContext from "../../Context/MainContext";

export default function useExamEnrollment(includeTeacher = false) {
  const { user, suragchStateOne, studentStateOne, bagshStateOne, teacherOne, addExamMember } = useContext(MainContext);
  const navigate = useNavigate();
  const [pendingExam, setPendingExam] = useState(null);

  const enroll = async (exam) => {
    if (pendingExam) return;
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/e/${exam._id}` } } });
      return;
    }

    const allowedRoles = ["suragch", "Student", "bagsh"];
    if (includeTeacher) allowedRoles.push("teacher");
    if (!allowedRoles.includes(user.role)) {
      toast.error("Таны эрх таарахгүй байна.");
      return;
    }

    const learner = suragchStateOne?.suragch;
    const student = studentStateOne?.student;
    const profiles = {
      suragch: { ready: suragchStateOne?.success, school: learner?.surguuli?.ner, group: learner?.angi?.butenNer },
      Student: { ready: studentStateOne?.success, school: student?.school_id?.name, group: student?.class_id?.name },
      bagsh: { ready: bagshStateOne?.success, school: bagshStateOne?.bagsh?.surguuli?.ner, group: "Багш" },
      teacher: { ready: teacherOne?.success, school: teacherOne?.teacher?.school?.name, group: "Их сургуулийн багш" },
    };
    const profile = profiles[user.role];
    if (!profile.ready) {
      toast.error("Хэрэглэгчийн мэдээлэл бэлэн болоогүй байна. Дахин оролдоно уу.");
      return;
    }

    const allowedAimag = Array.isArray(exam.aimag) ? exam.aimag : [];
    if (user.role === "suragch" && allowedAimag.length > 0 && !allowedAimag.includes(learner?.city)) {
      toast.error("Таны аймаг энэ сорилын бүртгэлд хамрагдахгүй байна.");
      return;
    }

    setPendingExam(exam._id);
    try {
      await addExamMember(exam._id, {
        _id: user.id,
        member_name: user.name,
        member_role: user.role,
        member_school: profile.school,
        member_class: profile.group,
        startTime: "",
        endTime: "",
        examStatus: "Хуваарилсан",
      }, true);
    } finally {
      setPendingExam(null);
    }
  };

  return { enroll, pendingExam };
}
