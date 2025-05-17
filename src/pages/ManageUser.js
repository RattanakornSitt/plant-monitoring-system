import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  addDoc,
  where,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import "./css/ManageUser.css";

function ManageUser() {
  const db = getFirestore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchType, setSearchType] = useState("username");
  const [searchInput, setSearchInput] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
  const [editUserId, setEditUserId] = useState(null);
  const [editUser, setEditUser] = useState({ username: "", email: "", password: "" });
  const [showAddCameraForm, setShowAddCameraForm] = useState(null);
  const [newCamera, setNewCamera] = useState({ product: "", cameraName: "" });
  const [editingCamera, setEditingCamera] = useState(null);
  const [editedCamera, setEditedCamera] = useState({ product: "", cameraName: "" });

  const fetchUsers = async () => {
    const userRef = collection(db, "USER");
    const q = query(userRef);
    const snapshot = await getDocs(q);
    const userData = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const cameraSnapshot = await getDocs(
        query(collection(db, "CAMERA"), where("userId", "==", docSnap.id))
      );
      const cameras = cameraSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { id: docSnap.id, ...docSnap.data(), cameras };
    }));
    setUsers(userData);
  };

  const searchUsers = async () => {
    const userRef = collection(db, "USER");
    const q = query(userRef, where(searchType, "==", searchInput));
    const snapshot = await getDocs(q);
    const userData = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const cameraSnapshot = await getDocs(
        query(collection(db, "CAMERA"), where("userId", "==", docSnap.id))
      );
      const cameras = cameraSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { id: docSnap.id, ...docSnap.data(), cameras };
    }));
    setUsers(userData);
  };

  const handleAddUser = async () => {
    await addDoc(collection(db, "USER"), newUser);
    setShowAddUserForm(false);
    setNewUser({ username: "", email: "", password: "" });
    await fetchUsers();
    alert("User added!");
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user and all their cameras?");
    if (!confirmDelete) return;

    const cameraSnapshot = await getDocs(
      query(collection(db, "CAMERA"), where("userId", "==", userId))
    );
    const deletePromises = cameraSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "CAMERA", docSnap.id))
    );
    await Promise.all(deletePromises);

    await deleteDoc(doc(db, "USER", userId));
    await fetchUsers();
    alert("User and related cameras deleted!");
  };

  const handleEditUser = async () => {
    const userRef = doc(db, "USER", editUserId);
    await updateDoc(userRef, editUser);
    setShowEditUserForm(false);
    setEditUserId(null);
    await fetchUsers();
    alert("User updated!");
  };

  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditUser({ username: user.username, email: user.email, password: user.password || "" });
    setShowEditUserForm(true);
  };

  const handleDeleteCamera = async (cameraId) => {
    await deleteDoc(doc(db, "CAMERA", cameraId));
    await fetchUsers();
  };

  const handleAddCamera = async (userId, username) => {
    if (!newCamera.product || !newCamera.cameraName) {
      alert("Please fill in all camera fields.");
      return;
    }

    await addDoc(collection(db, "CAMERA"), {
      userId,
      username,
      product: Number(newCamera.product),
      name: newCamera.cameraName
    });

    setNewCamera({ product: "", cameraName: "" });
    setShowAddCameraForm(null);
    await fetchUsers();
    alert("Camera added!");
  };

  const handleUpdateCamera = async () => {
    if (!editingCamera) return;
    const camRef = doc(db, "CAMERA", editingCamera.id);
    await updateDoc(camRef, {
      product: Number(editedCamera.product),
      name: editedCamera.cameraName // แก้ตรงนี้ให้ตรงกับชื่อ field จริงใน Firestore
    });
    setEditingCamera(null);
    setEditedCamera({ product: "", cameraName: "" });
    await fetchUsers();
    alert("Camera updated!");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="manage-user-container">
      <button className="back-button" onClick={() => navigate('/pages/AdminDashboard')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <h1>Manage Users</h1>

      <div className="search-bar">
        <select onChange={(e) => setSearchType(e.target.value)}>
          <option value="username">Username</option>
          <option value="email">Email</option>
          <option value="userId">User ID</option>
        </select>
        <input
          type="text"
          style={{ width: "250px" }}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Search by ${searchType}`}
        />
        <button onClick={searchUsers}>Search</button>
        <button onClick={fetchUsers}>Show All</button>
        <button onClick={() => setShowAddUserForm(true)}>Add User</button>
      </div>

      {showAddUserForm && (
        <div className="add-user-form">
          <input placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
          <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <input placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <button onClick={handleAddUser}>Confirm Add</button>
          <button onClick={() => setShowAddUserForm(false)}>Cancel</button>
        </div>
      )}

      {showEditUserForm && (
        <div className="edit-user-form">
          <input placeholder="Username" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} />
          <input placeholder="Email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
          <input placeholder="Password" type="password" value={editUser.password} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} />
          <button onClick={handleEditUser}>Save</button>
          <button onClick={() => setShowEditUserForm(false)}>Cancel</button>
        </div>
      )}

      <table className="user-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Devices</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                {u.cameras.map((cam) => (
                  <div key={cam.id} className="camera-entry">
                    <div><strong>Device:</strong> {cam.product}</div>
                    <div><strong>Device Name:</strong> {cam.name}</div>
                    <button onClick={() => handleDeleteCamera(cam.id)}>🗑️</button>
                    <button onClick={() => {
                      setEditingCamera(cam);
                      setEditedCamera({ product: cam.product, cameraName: cam.name });
                    }}>✏️</button>
                  </div>
                ))}
                {showAddCameraForm === u.id ? (
                  <div className="add-camera-form">
                    <input
                      placeholder="Device (number)"
                      value={newCamera.product}
                      onChange={(e) => setNewCamera({ ...newCamera, product: e.target.value })}
                    />
                    <input
                      placeholder="Device Name"
                      value={newCamera.cameraName}
                      onChange={(e) => setNewCamera({ ...newCamera, cameraName: e.target.value })}
                    />
                    <button onClick={() => handleAddCamera(u.id, u.username)}>Confirm</button>
                    <button onClick={() => setShowAddCameraForm(null)}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddCameraForm(u.id)}>➕ Add Device</button>
                )}
              </td>
              <td>
                <button onClick={() => handleEditClick(u)}>✏️ Edit</button>
                <button onClick={() => handleDeleteUser(u.id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingCamera && (
        <div className="edit-camera-form">
          <h3>Editing Device</h3>
          <input
            placeholder="Product"
            value={editedCamera.product}
            onChange={(e) => setEditedCamera({ ...editedCamera, product: e.target.value })}
          />
          <input
            placeholder="Camera Name"
            value={editedCamera.cameraName}
            onChange={(e) => setEditedCamera({ ...editedCamera, cameraName: e.target.value })}
          />
          <button onClick={handleUpdateCamera}>Save</button>
          <button onClick={() => setEditingCamera(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default ManageUser;
