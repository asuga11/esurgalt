import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import API from '../services/api';
import { collectNotices, mergeNotices, readStoredNotices } from '../services/activity';

const LearningActivityContext = createContext(null);

async function getCourses(memberId, token, signal) {
  const response = await API.getMemberCourses(memberId, token, signal);
  const courses = (response?.data ?? response)?.surgaltuud;
  if (!Array.isArray(courses)) throw new Error('Сургалтын мэдээлэл буруу байна.');
  return courses;
}

export function LearningActivityProvider({ memberId, token, children }) {
  const storageKey = 'esurgalt.activity.v1:' + memberId;
  const [saved, setSaved] = useState({ ready: false, entries: [] });
  const [overview, setOverview] = useState({ exams: null, courses: null, loading: true, error: false });
  const request = useRef(null);
  const writes = useRef(Promise.resolve());

  useEffect(() => {
    if (!memberId) return;
    let active = true;
    AsyncStorage.getItem(storageKey).then(readStoredNotices).catch(() => []).then((entries) => {
      if (active) setSaved({ ready: true, entries });
    });
    return () => { active = false; };
  }, [memberId, storageKey]);

  useEffect(() => {
    if (!saved.ready || !memberId) return;
    const snapshot = JSON.stringify(saved.entries);
    writes.current = writes.current.then(() => AsyncStorage.setItem(storageKey, snapshot)).catch(() => {});
  }, [memberId, storageKey, saved]);

  const refresh = useCallback(async () => {
    if (!saved.ready || !memberId || !token || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setOverview((current) => ({ ...current, loading: true, error: false }));

    try {
      const [exams, courses] = await Promise.allSettled([
        API.getMemberExamList(memberId, token, controller.signal),
        getCourses(memberId, token, controller.signal),
      ]);
      if (controller.signal.aborted) return;

      const examData = exams.status === 'fulfilled' ? exams.value : null;
      const courseData = courses.status === 'fulfilled' ? courses.value : null;
      setOverview((current) => ({
        exams: examData ?? current.exams,
        courses: courseData ?? current.courses,
        loading: false,
        error: examData === null || courseData === null,
      }));
      const incoming = collectNotices(examData ?? [], courseData ?? []);
      setSaved((current) => {
        const entries = mergeNotices(current.entries, incoming);
        return entries === current.entries ? current : { ...current, entries };
      });
    } finally {
      if (request.current === controller) request.current = null;
    }
  }, [memberId, saved.ready, token]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => () => {
    request.current?.abort();
    request.current = null;
  }, [memberId, token]);

  const markRead = (id) => {
    setSaved((current) => ({
      ...current,
      entries: current.entries.map((item) => item.id === id && !item.read ? { ...item, read: true } : item),
    }));
  };
  const markAllRead = () => {
    setSaved((current) => ({
      ...current,
      entries: current.entries.map((item) => item.read ? item : { ...item, read: true }),
    }));
  };

  return (
    <LearningActivityContext.Provider value={{
      ...overview,
      entries: saved.entries,
      unread: saved.entries.filter((item) => !item.read).length,
      refresh,
      markRead,
      markAllRead,
    }}>
      {children}
    </LearningActivityContext.Provider>
  );
}

export const useLearningActivity = () => useContext(LearningActivityContext);
