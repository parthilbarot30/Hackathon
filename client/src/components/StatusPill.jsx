export default function StatusPill({ status }) {
  // Default Gray Style
  let styles = "bg-gray-100 text-gray-600 border-gray-200";

  // Match the exact strings from your PostgreSQL 'status' columns
  if (['Available', 'Idle', 'On Duty', 'Done', 'Delivered'].includes(status)) {
    // Green Theme (Success/Active)
    styles = "bg-brand-teal/10 text-brand-teal border-brand-teal/20";
  } else if (['On Trip', 'Dispatched', 'On way', 'Pending'].includes(status)) {
    // Orange Theme (In Progress)
    styles = "bg-brand-orange/10 text-brand-orange border-brand-orange/20";
  } else if (['In Shop', 'Suspended', 'Delayed', 'Critical'].includes(status)) {
    // Red Theme (Alert/Issues)
    styles = "bg-red-50 text-red-600 border-red-200";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${styles}`}>
      {status || "Unknown"}
    </span>
  );
}