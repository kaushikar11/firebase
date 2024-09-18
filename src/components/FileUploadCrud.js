// src/components/FileUploadCrud.js
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const FileUploadCrud = () => {
  const [data, setData] = useState([]);
  const [newName, setNewName] = useState("");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

  const collectionRef = collection(db, "items");

  // Fetch data from Firestore
  const fetchData = async () => {
    const querySnapshot = await getDocs(collectionRef);
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setData(items);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create new item
  const handleCreate = async () => {
    let fileUrl = "";
    if (file) {
      const fileRef = ref(storage, `files/${file.name}`);
      await uploadBytes(fileRef, file);
      fileUrl = await getDownloadURL(fileRef);
    }

    await addDoc(collectionRef, { name: newName, fileUrl });
    setNewName("");
    setFile(null);
    fetchData();
  };

  // Update item
  const handleUpdate = async (id) => {
    const docRef = doc(db, "items", id);
    await updateDoc(docRef, { name: newName });
    setNewName("");
    fetchData();
  };

  // Delete item
  const handleDelete = async (id) => {
    const docRef = doc(db, "items", id);
    await deleteDoc(docRef);
    fetchData();
  };

  return (
    <div>
      <h2>CRUD with Firestore & File Upload</h2>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Enter name"
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleCreate}>Add</button>

      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <p>{item.name}</p>
            {item.fileUrl && (
              <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                View File
              </a>
            )}
            <button onClick={() => handleUpdate(item.id)}>Update</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploadCrud;
