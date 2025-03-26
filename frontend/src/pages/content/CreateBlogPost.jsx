import React, { useState } from "react";
import axios from "axios";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";

const BlogForm = ({ onSubmit }) => {
    const navigate = useNavigate();
    useUserAuth(); // Ensures user authentication
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "",
        featuredImage: "",
        authorEmail: "",
        publishDate: ""
    });
    const [errors, setErrors] = useState({});

    // Validation Function
    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.content) newErrors.content = "Content is required";
        if (!formData.category) newErrors.category = "Category is required";
        if (!formData.authorEmail || !/\S+@\S+\.\S+/.test(formData.authorEmail)) {
            newErrors.authorEmail = "Valid author email is required";
        }
        if (!formData.publishDate) newErrors.publishDate = "Publish date is required";
        
        // Date validation: Ensure the date is not in the past
        const selectedDate = new Date(formData.publishDate);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set time to midnight for comparison

        if (selectedDate < currentDate) {
            newErrors.publishDate = "Publish date cannot be in the past";
        }

        if (formData.featuredImage && !/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/i.test(formData.featuredImage)) {
            newErrors.featuredImage = "Please enter a valid image URL (e.g., .jpg, .png, .gif)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submitting
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem("token"); // Retrieve token from localStorage

            if (!token) {
                console.error("No authentication token found. Please log in.");
                return;
            }

            const response = await axios.post(
                "http://localhost:4000/api/blogposts/create",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Attach token to request
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Blog post created:", response.data);

            // Call onSubmit if it is provided
            if (onSubmit && typeof onSubmit === "function") {
                onSubmit(response.data);
            }

            // Navigate to the blog post view page
            navigate('/blog');
        } catch (error) {
            console.error("Error creating blog post:", error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Create Blog Post</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="Title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        className="w-full p-4 border rounded-lg shadow-lg" 
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>

                <div className="mb-4">
                    <textarea 
                        name="content" 
                        placeholder="Content" 
                        value={formData.content} 
                        onChange={handleChange} 
                        className="w-full p-4 border rounded-lg shadow-lg" 
                    />
                    {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                </div>

                <div className="mb-4">
                    <input 
                        type="text" 
                        name="category" 
                        placeholder="Category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="w-full p-4 border rounded-lg shadow-lg" 
                    />
                    {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>

                <div className="mb-4">
                    <input 
                        type="url" 
                        name="featuredImage" 
                        placeholder="Image URL" 
                        value={formData.featuredImage} 
                        onChange={handleChange} 
                        className="w-full p-4 border rounded-lg shadow-lg" 
                    />
                    {errors.featuredImage && <p className="text-red-500 text-sm">{errors.featuredImage}</p>}
                </div>

                <div className="mb-4">
                    <input 
                        type="email" 
                        name="authorEmail" 
                        placeholder="Author Email" 
                        value={formData.authorEmail} 
                        onChange={handleChange} 
                        className="w-full p-4 border rounded-lg shadow-lg" 
                    />
                    {errors.authorEmail && <p className="text-red-500 text-sm">{errors.authorEmail}</p>}
                </div>

                <div className="mb-4">
                    <input 
                        type="date" 
                        name="publishDate" 
                        value={formData.publishDate} 
                        onChange={handleChange} 
                        className="w-full p-4 border rounded-lg shadow-lg" 
                    />
                    {errors.publishDate && <p className="text-red-500 text-sm">{errors.publishDate}</p>}
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white p-4 rounded-lg shadow-lg hover:bg-blue-600">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default BlogForm;
