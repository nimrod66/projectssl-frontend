"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/app/staff/auth/api";
import Badge from "@/app/components/ui/Badge";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Event { date: string; title: string; type: string; status: string; id: number; }

const typeColors: Record<string, string> = { task: "bg-indigo-500", contract_end: "bg-red-500" };
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/calendar?year=${year}&month=${month}`).then(r => setEvents(r.data)).catch(() => {});
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDow }, (_, i) => i);

  const eventsByDay = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach(e => { const d = e.date; if (!map[d]) map[d] = []; map[d].push(e); });
    return map;
  }, [events]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100"><FiChevronLeft /></button>
          <span className="font-semibold text-gray-900 min-w-[140px] text-center">{monthNames[month-1]} {year}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100"><FiChevronRight /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {blanks.map(i => <div key={`b-${i}`} className="border-r border-b border-gray-100 min-h-[80px] p-1 bg-gray-50/50" />)}
          {days.map(d => {
            const ds = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dayEvents = eventsByDay[ds] || [];
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDay;
            return (
              <div key={d} onClick={() => setSelectedDay(ds)}
                className={`border-r border-b border-gray-100 min-h-[80px] p-1 cursor-pointer transition hover:bg-indigo-50 ${isSelected ? "bg-indigo-50 ring-1 ring-indigo-300" : ""} ${isToday ? "bg-amber-50" : ""}`}>
                <p className={`text-xs font-semibold mb-1 ${isToday ? "w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center" : "text-gray-600"}`}>{d}</p>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${typeColors[e.type] || "bg-gray-400"}`} />
                      <p className="text-[10px] text-gray-600 truncate">{e.title}</p>
                    </div>
                  ))}
                  {dayEvents.length > 3 && <p className="text-[10px] text-gray-400">+{dayEvents.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (eventsByDay[selectedDay] || []).length > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">{selectedDay}</h2>
          <div className="space-y-2">
            {eventsByDay[selectedDay].map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className={`w-3 h-3 rounded-full shrink-0 ${typeColors[e.type] || "bg-gray-400"}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{e.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{e.type}{e.status ? ` · ${e.status}` : ""}</p>
                </div>
                <Badge variant={e.type === "contract_end" ? "danger" : "info"}>{e.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
