import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CrewStatusCard() {
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const cardRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  // 🟣 Toggle collapse
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  // 🟢 Start dragging
  const handleDragStart = (e) => {
    if (!collapsed) return;

    setDragging(true);
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    offset.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  // 🟠 Drag move
  const handleDrag = (e) => {
    if (!dragging || !collapsed) return;

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    setPosition({
      x: clientX - offset.current.x,
      y: clientY - offset.current.y,
    });
  };

  // 🔴 Stop dragging
  const handleDragEnd = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchmove", handleDrag);
      document.addEventListener("touchend", handleDragEnd);
    } else {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDrag);
      document.removeEventListener("touchend", handleDragEnd);
    }
  }, [dragging]);

  return (
    <div
      ref={cardRef}
      className={`fixed transition-all duration-300 ease-in-out shadow-lg ${
        collapsed
          ? "w-14 h-14 rounded-full bg-white flex items-center justify-center cursor-grab active:cursor-grabbing"
          : "max-w-md w-full bg-white rounded-2xl p-4 flex items-center justify-between"
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      {/* Expanded View */}
      {!collapsed && (
        <>
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="font-semibold text-gray-900 text-sm">
                Pending
              </span>
            </div>
            <p className="text-gray-500 text-sm truncate">
              Crew incomplete — waiting for more guests
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&h=100&q=80"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="bg-neutral-800 text-white text-xs px-3 py-1.5 rounded-full hover:bg-neutral-700">
              View Meal
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </>
      )}

      {/* Collapsed View */}
      {collapsed && (
        <div onClick={() => setCollapsed(false)}>
          <img
            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=100&h=100&q=80"
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover shadow-md"
          />
        </div>
      )}
    </div>
  );
}
