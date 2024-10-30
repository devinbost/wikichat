"use client";
import { FormEvent, useEffect, useState } from "react";

interface UserModalProps {
  user_id?: string;
  username?: string;
  role?: string;
  onClose: () => void;
  onSubmit: (user: Partial<{ user_id: string; email: string; role: string }>) => void;
  title?: string;
  btnText?: string;
  modalType?: string;
}

const UserModal: React.FC<UserModalProps> = ({
  user_id,
  username,
  role,
  onClose,
  onSubmit,
  title,
  btnText,
}) => {
  const [formEmail, setFormEmail] = useState(username || "");
  const [formRole, setFormRole] = useState(role || "");
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    setFormEmail(username || "");
    setFormRole(role || "");
  }, [username, role]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/getRoles");
        const data = await response.json();
        setRoles(data.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ user_id, email: formEmail, role: formRole });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email:</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Role:</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              required
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="" disabled>
                Select Role
              </option>
              {roles.map((roleItem) => (
                <option key={roleItem} value={roleItem}>
                  {roleItem}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-4 py-2 bg-gray-300 text-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;