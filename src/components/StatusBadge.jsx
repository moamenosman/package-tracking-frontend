const LABELS = {
  PENDING: "Pending",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  UNASSIGNED: "Unassigned",
  OFFERED: "Offered",
  ACCEPTED: "Accepted",
};

export default function StatusBadge({ value }) {
  return <span className={`badge badge-${value}`}>{LABELS[value] || value}</span>;
}
