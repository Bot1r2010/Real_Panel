"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  const token = localStorage.getItem("AccessToken");

  const getUsers = async () => {
    try {
      const token = localStorage.getItem("AccessToken");

      const { data } = await axios.get(
        "https://api.magnateshop.uz/api/v1/users?page=1&limit=12",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(data);

      setUsers(data.items);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.firstName || ""} ${user.lastName || ""} ${user.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-8 overflow-hidden overflow-y-auto bg-gray-100 w-full h-[920px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500">
            Jami foydalanuvchilar: {filteredUsers.length}
          </p>
        </div>

        <button className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700">
          Add User
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="w-80 border rounded-xl px-4 py-2 outline-none focus:border-red-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600">
                      {(user.firstName || "U")[0]}
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        {user.firstName} {user.lastName}
                      </h2>

                      <p className="text-sm text-gray-500">{user.id}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4">{user.email}</td>

                <td className="p-4">{user.role}</td>

                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/user/${user.id}`}
                      className="px-3 py-2 rounded-lg bg-green-600 text-white"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEdit(true);
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[450px]">
            <h2 className="text-2xl font-bold mb-5">Edit User</h2>

            <input
              className="w-full border p-3 rounded-xl mb-3"
              defaultValue={selectedUser?.firstName}
            />

            <input
              className="w-full border p-3 rounded-xl mb-3"
              defaultValue={selectedUser?.lastName}
            />

            <input
              className="w-full border p-3 rounded-xl mb-5"
              defaultValue={selectedUser?.email}
            />

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl">
                Save
              </button>

              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 bg-gray-200 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

