"use client";
import { useState } from "react";

export default function UploadImage() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (data.url) setUrl(data.url);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Subir imagen
        </button>
      </form>

      {url && (
        <div className="mt-4">
          <p>✅ Imagen subida:</p>
          <img src={url} alt="subida" className="w-48 rounded" />
        </div>
      )}
    </div>
  );
}
