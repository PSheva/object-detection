import React, { useState, useRef } from 'react';
import VideoBox from './VideoBox';
import '/src/css/PlayManager.css';

const PlayManager = ({
  setSidebarContent,
  displayedTags = [],
  filteredTags = [],
}) => {
  const [videos, setVideos] = useState([]);
  const fileInputRef = useRef(null);

  console.log('🔄 Рендер PlayManager');
  console.log('🛠️ Поточні filteredTags:', filteredTags);
  console.log('📊 Всього відео:', videos.length);

  const filteredVideos = videos.map((video) => {
    if (!video.recognizedTags || video.recognizedTags.length === 0) {
      // console.log(🚫 Відео без розпізнаних тегів: ${video.url} → ${filteredTags.length === 0 ? "ЗАЛИШАЄМО" : "ПРИХОВУЄМО"});
      return { ...video, isVisible: filteredTags.length === 0 };
    }

    // console.log(📽️ Відео: ${video.url} | 🏷️ Розпізнані теги: ${video.recognizedTags.join(", ")});

    const matches =
      filteredTags.length === 0 ||
      filteredTags.some((tag) => video.recognizedTags.includes(tag));
    console.log(matches ? '✅ Відео ВИДИМЕ' : '❌ Відео ПРИХОВАНЕ');

    return { ...video, isVisible: matches };
  });

  const handleVideoUpload = (event) => {
    const newVideos = Array.from(event.target.files).map((file) => ({
      file: file,
      url: URL.createObjectURL(file),
      json: null,
      recognizedTags: [],
      isVisible: true,
    }));
    setVideos((prevVideos) => [...prevVideos, ...newVideos]);
    event.target.value = null;
  };

  const updateRecognizedTags = (videoUrl, recognizedTags) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.url === videoUrl ? { ...video, recognizedTags } : video
      )
    );
  };

  const playAllVideos = () =>
    document.querySelectorAll('video').forEach((video) => video.play());
  const pauseAllVideos = () =>
    document.querySelectorAll('video').forEach((video) => video.pause());
  const stopAllVideos = () =>
    document.querySelectorAll('video').forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });

  const deleteVideo = (videoUrl) => {
    console.log('🗑 Видаляємо відео з URL:', videoUrl);
    setVideos((prevVideos) => {
      console.log(
        '📋 Відео ДО видалення:',
        prevVideos.map((v) => v.url)
      );
      const updatedVideos = prevVideos.filter(
        (video) => video.url !== videoUrl
      );
      console.log(
        '✅ Відео ПІСЛЯ видалення:',
        updatedVideos.map((v) => v.url)
      );
      return [...updatedVideos]; // СТВОРЮЄМО НОВИЙ МАСИВ, ЩОБ РЕАКТ БАЧИВ ОНОВЛЕННЯ
    });
  };

  const handleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (container?.requestFullscreen) {
      container.requestFullscreen();
    } else if (container?.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container?.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container?.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
  };

  const deleteAllVideos = () => setVideos([]);

  return (
    <div className="player-manager">
      <div className="general-buttons">
        <button onClick={() => fileInputRef.current.click()}>
          Upload Video
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoUpload}
          style={{ display: 'none' }}
        />
        <button onClick={playAllVideos}>Play All</button>
        <button onClick={pauseAllVideos}>Pause All</button>
        <button onClick={stopAllVideos}>Stop All</button>
        <button onClick={deleteAllVideos} style={{ backgroundColor: 'red' }}>
          Delete All
        </button>
      </div>
      <div className="video-container">
        {filteredVideos.map((video) => (
          <div
            key={video.url}
            className="video-box-wrapper"
            style={{ display: video.isVisible ? 'block' : 'none' }}
          >
            <VideoBox
              video={video}
              setSidebarContent={setSidebarContent}
              displayedTags={displayedTags}
              updateRecognizedTags={(recognizedTags) =>
                updateRecognizedTags(video.url, recognizedTags)
              }
              deleteVideo={() => deleteVideo(video.url)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayManager;
