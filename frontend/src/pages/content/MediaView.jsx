import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MediaView = () => {
    const [media, setMedia] = useState([]);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const response = await axios.get('/api/media');
                setMedia(response.data);
            } catch (error) {
                console.error('Error fetching media', error);
            }
        };

        fetchMedia();
    }, []);

    return (
        <div>
            <h2>Media List</h2>
            <Link to="/create-media">Add New Media</Link>
            <ul>
                {media.map((item) => (
                    <li key={item._id}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <p>Type: {item.fileType}</p>
                        <p>Uploaded At: {new Date(item.uploadedAt).toLocaleString()}</p>
                        <Link to={`/edit-media/${item._id}`}>Edit</Link> | 
                        <Link to={`/delete-media/${item._id}`}>Delete</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MediaView;
