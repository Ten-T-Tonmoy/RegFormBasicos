import React, { useState } from "react";
import useUploadStore from "../store/uploadStore";

const ImageUpload = () => {
  const [preview, setPreview] = useState(null);
  const { uploadImage, uploadedImage, uploading, error } = useUploadStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadImage(file);
        alert("Image uploaded successfully!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Image</h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {uploading ? "Uploading..." : "Choose Image"}
        </label>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {uploadedImage && (
        <div className="mt-4">
          <img
            src={uploadedImage.url}
            alt="Uploaded"
            className="w-full rounded-lg shadow-lg"
          />
          <p className="text-sm text-gray-600 mt-2 break-all">
            URL: {uploadedImage.url}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
