import React, { useState, useRef } from 'react';
import VideoBox from './VideoBox';
import '/src/css/PlayManager.css';

const PlayManager = ({ setSidebarContent }) => {
  const [videos, setVideos] = useState([]);
  const fileInputRef = useRef(null);

  const handleVideoUpload = (event) => {
    const newVideos = Array.from(event.target.files).map((file) => ({
      file: file,
      url: URL.createObjectURL(file),
      json: null,
      tags: []
    }));
    setVideos((prevVideos) => [...prevVideos, ...newVideos]);
    event.target.value = null;
  };

  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = JSON.parse(e.target.result);
      setSidebarContent(json);
    };
    reader.readAsText(file);
  };

  const extractTags = (json) => {
    const tags = new Set();
    for (const frame of Object.values(json)) {
      frame.forEach((obj) => {
        tags.add(obj.label);
      });
    }
    return Array.from(tags);
  };

  const deleteVideo = (index) => {
    setVideos((prevVideos) => prevVideos.filter((_, i) => i !== index));
  };

  const deleteAllVideos = () => {
    setVideos([]);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const playAllVideos = () => {
    document.querySelectorAll('video').forEach((video) => video.play());
  };

  const pauseAllVideos = () => {
    document.querySelectorAll('video').forEach((video) => video.pause());
  };

  const stopAllVideos = () => {
    document.querySelectorAll('video').forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  };

  return (
    <div className='play-manager'>
      {/* Загальні кнопки управління */}
      <div className='general-buttons'>
        <button onClick={handleClick}>Upload Video</button>
        <input
          ref={fileInputRef}
          type='file'
          accept='video/*'
          multiple
          onChange={handleVideoUpload}
          style={{ display: 'none' }}
        />
        <button onClick={playAllVideos}>Play All</button>
        <button onClick={pauseAllVideos}>Pause All</button>
        <button onClick={stopAllVideos}>Stop All</button>
        <button onClick={deleteAllVideos}>Delete All</button>
      </div>

      {/* Контейнер для відео */}
      <div className='video-container'>
        {videos.map((video, index) => (
          <div key={index} className='video-box-wrapper'>
            <VideoBox
              video={video}
              setSidebarContent={setSidebarContent}
              deleteVideo={() => deleteVideo(index)}
            />
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default PlayManager;
