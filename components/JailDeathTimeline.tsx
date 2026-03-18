import type { JailTimelineEvent } from "@/lib/types";

type JailDeathTimelineProps = {
  events: JailTimelineEvent[];
};

function getDotColor(type: JailTimelineEvent["type"]) {
  switch (type) {
    case "death":
      return "bg-red-500 ring-red-900";
    case "legal":
      return "bg-jacket-amber ring-yellow-900";
    case "ethics":
      return "bg-orange-500 ring-orange-900";
    case "election":
      return "bg-zinc-500 ring-zinc-800";
    case "milestone":
      return "bg-blue-500 ring-blue-900";
    default:
      return "bg-zinc-500 ring-zinc-800";
  }
}

function getTextColor(type: JailTimelineEvent["type"]) {
  switch (type) {
    case "death":
      return "text-red-300";
    case "legal":
      return "text-zinc-300";
    case "ethics":
      return "text-orange-300";
    case "election":
      return "text-zinc-400 italic";
    case "milestone":
      return "text-blue-300";
    default:
      return "text-zinc-300";
  }
}

function getTypeLabel(type: JailTimelineEvent["type"]) {
  switch (type) {
    case "death":
      return { label: "Death in Custody", classes: "bg-red-900/50 text-red-300" };
    case "legal":
      return { label: "Legal Action", classes: "bg-yellow-900/40 text-yellow-400" };
    case "ethics":
      return { label: "Ethics", classes: "bg-orange-900/40 text-orange-400" };
    case "election":
      return { label: "Election", classes: "bg-zinc-800 text-zinc-400" };
    case "milestone":
      return { label: "Milestone", classes: "bg-blue-900/40 text-blue-400" };
    default:
      return { label: type, classes: "bg-zinc-800 text-zinc-400" };
  }
}

export default function JailDeathTimeline({ events }: JailDeathTimelineProps) {
  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[5.5rem] top-2 bottom-2 w-px bg-zinc-700" aria-hidden="true" />

      {events.map((event, i) => {
        const dotColor = getDotColor(event.type);
        const textColor = getTextColor(event.type);
        const typeInfo = getTypeLabel(event.type);

        return (
          <div key={`${event.year}-${i}`} className="relative flex items-start gap-4 py-3">
            {/* Year */}
            <div className="w-20 shrink-0 text-right">
              <span className="font-mono text-sm font-bold text-jacket-amber">{event.year}</span>
            </div>

            {/* Dot */}
            <div className="relative z-10 mt-1 shrink-0">
              <div className={`h-3 w-3 rounded-full ring-2 ring-offset-1 ring-offset-black ${dotColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <p className={`text-sm leading-snug ${textColor}`}>{event.event}</p>
              <span className={`inline-block rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${typeInfo.classes}`}>
                {typeInfo.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
