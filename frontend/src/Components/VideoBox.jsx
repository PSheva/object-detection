import React, { useRef, useState, useEffect } from "react";
import "/src/css/VideoBox.css";

const VideoBox = ({ video, setSidebarContent, deleteVideo, displayedTags = [], updateRecognizedTags }) => {
  const timelineRefs = useRef({})
  const videoRef = useRef(null);

  const [responseJson, setResponseJson] = useState(null);
  const [classTimelines, setClassTimelines] = useState({});
  const [currentFrameObjects, setCurrentFrameObjects] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (responseJson && Array.isArray(responseJson.video_analysis)) {
      generateTimelines(responseJson.video_analysis);
    }
  }, [responseJson]);

  const generateTimelines = (videoAnalysis) => {
    const timelines = {};
    videoAnalysis.forEach((frame) => {
      frame.objects.forEach((obj) => {
        const objectClass = obj["object-class"];
        if (!timelines[objectClass]) {
          timelines[objectClass] = [];
        }
        timelines[objectClass].push(frame.time);
      });
    });
    setClassTimelines(timelines);
  };

  const updateBoundingBoxes = () => {
    if (!responseJson) return;
    const currentTime = videoRef.current?.currentTime || 0;
    const frame = responseJson.video_analysis.find(
      (frame) => Math.abs(frame.time - currentTime) < 0.1
    );
    if (!frame) return;
    setCurrentFrameObjects(
      frame.objects.filter((obj) => displayedTags.includes(obj["object-class"]))
    );
  };

  const [progress, setProgress] = useState(0);
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  
  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current && videoRef.current.duration) {
        const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(newProgress);
      }
    };
  
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("timeupdate", updateProgress);
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", updateProgress);
      }
    };
  }, []);
  

  const jumpToNextTime = (times) => {
    if (!videoRef.current) return;
    
    const nextIndex = times.findIndex(time => time > videoRef.current.currentTime);
    if (nextIndex !== -1) {
      videoRef.current.currentTime = times[nextIndex];
      setCurrentObjectIndex(nextIndex);
    }
  };
  
  const jumpToPreviousTime = (times) => {
    if (!videoRef.current) return;
    
    const prevIndex = [...times].reverse().findIndex(time => time < videoRef.current.currentTime);
    if (prevIndex !== -1) {
      videoRef.current.currentTime = times[times.length - 1 - prevIndex];
      setCurrentObjectIndex(times.length - 1 - prevIndex);
    }
  };
  

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("timeupdate", updateBoundingBoxes);
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", updateBoundingBoxes);
      }
    };
  }, [responseJson, displayedTags]);

  const handleJsonUpload = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      alert("No file selected.");
      return;
    }
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json || !json.video_analysis || !Array.isArray(json.video_analysis)) {
          throw new Error("Invalid JSON format. Missing 'video_analysis' key.");
        }

        console.log("✅ JSON loaded successfully:", json);
        setResponseJson(json);
        setSidebarContent(json);
        generateTimelines(json.video_analysis);

        const recognizedTags = new Set();
        json.video_analysis.forEach(frame => {
          frame.objects.forEach(obj => recognizedTags.add(obj["object-class"]));
        });

        // ✅ Передаємо recognizedTags у PlayManager
        updateRecognizedTags(Array.from(recognizedTags));

        alert("JSON report loaded successfully.");
      } catch (error) {
        console.error("❌ JSON Parse Error:", error.message);
        alert("Invalid JSON format: " + error.message);
      }
    };

    reader.readAsText(file);
  };

  const handleSendVideo = async () => {
    if (!video.file) {
      alert("No video file selected.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", video.file);

    try {
      // const response = await fetch("http://localhost:8000/upload-video/", {
        const response = await fetch("http://198.71.51.17/api/upload-video/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      const json = await response.json();
      setResponseJson(json);
      setSidebarContent(json);
      generateTimelines(json.video_analysis);

      const recognizedTags = new Set();
        json.video_analysis.forEach(frame => {
          frame.objects.forEach(obj => recognizedTags.add(obj["object-class"]));
        });

        // ✅ Передаємо recognizedTags у PlayManager
        updateRecognizedTags(Array.from(recognizedTags));


      alert("Video processed successfully.");
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Завантаження JSON у Sidebar
  const handleShowJson = () => {
    if (responseJson) {
      setSidebarContent(responseJson);
    } else {
      alert("No JSON data available. Please process a video first.");
    }
  };

  // ✅ Завантаження JSON-звіту
  const handleDownloadJson = () => {
    if (!responseJson) {
      alert("No JSON data available to download.");
      return;
    }

    const jsonBlob = new Blob([JSON.stringify(responseJson, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(jsonBlob);
    link.download = "video-analysis-result.json";
    link.click();
  };



  const [videoSize, setVideoSize] = useState({ width: 1, height: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const overlayRef = useRef(null);

const checkFullscreen = () => {
  const fullscreenElement = document.fullscreenElement || 
                            document.webkitFullscreenElement || 
                            document.mozFullScreenElement || 
                            document.msFullscreenElement;
  
  setIsFullscreen(fullscreenElement === videoRef.current);

  // Якщо ми в повноекрані, перемістити overlay в контейнер відео
  if (fullscreenElement && overlayRef.current) {
    fullscreenElement.appendChild(overlayRef.current);
  } else {
    videoRef.current.parentElement.insertBefore(overlayRef.current, videoRef.current.nextSibling);
  }
};

useEffect(() => {
  const updateSize = () => {
    if (!videoRef.current) return;

    const rect = videoRef.current.getBoundingClientRect();
    setVideoSize({
      width: rect.width,
      height: rect.height,
    });
  };

  document.addEventListener("fullscreenchange", () => {
    checkFullscreen();
    updateSize();
  });
  document.addEventListener("webkitfullscreenchange", () => {
    checkFullscreen();
    updateSize();
  });
  document.addEventListener("mozfullscreenchange", () => {
    checkFullscreen();
    updateSize();
  });
  document.addEventListener("MSFullscreenChange", () => {
    checkFullscreen();
    updateSize();
  });

  window.addEventListener("resize", updateSize);
  updateSize();

  return () => {
    document.removeEventListener("fullscreenchange", updateSize);
    document.removeEventListener("webkitfullscreenchange", updateSize);
    document.removeEventListener("mozfullscreenchange", updateSize);
    document.removeEventListener("MSFullscreenChange", updateSize);
    window.removeEventListener("resize", updateSize);
  };
}, []);

  
  
  

  return (
    <div className="video-box-container">
      <div className="video-content">
        <video ref={videoRef} controls>
          <source src={video.url || ""} type="video/mp4" />
        </video>
        <div
            className={`overlay ${isFullscreen ? "fullscreen-overlay" : ""}`}
            ref={overlayRef} // Додаємо ref для керування положенням у DOM
          >
            {currentFrameObjects.map((obj, index) => (
              <div
                key={index}
                className="bounding-box"
                style={{
                  left: `${obj.frame_coordinates[0] * videoSize.width}px`,
                  top: `${obj.frame_coordinates[1] * videoSize.height}px`,
                  width: `${(obj.frame_coordinates[2] - obj.frame_coordinates[0]) * videoSize.width}px`,
                  height: `${(obj.frame_coordinates[3] - obj.frame_coordinates[1]) * videoSize.height}px`,
                }}
              >
                {obj["object-class"]}
              </div>
            ))}
          </div>


      </div>

      <div className="video-controls">
        <button onClick={() => videoRef.current?.play()}>Play</button>
        <button onClick={() => videoRef.current?.pause()}>Pause</button>
        <button onClick={() => { videoRef.current.pause(); videoRef.current.currentTime = 0; }}>Stop</button>
        <button onClick={() => {
            console.log("🛑 Клік на Delete у відео:", video.url);
            if (typeof deleteVideo === "function") {
              deleteVideo(video.url);
            } else {
              console.error("❌ deleteVideo не є функцією!");
            }
          }} style={{ backgroundColor: "red" }}>
            Delete
          </button>



        <button onClick={handleSendVideo} disabled={uploading}>
          {uploading ? "Sending..." : "Send"}
        </button>
        <button onClick={handleShowJson} style={{ backgroundColor: responseJson ? "green" : "" }}>
          Show JSON
        </button>
      </div>



      {responseJson && Object.keys(classTimelines).length > 0 && (
      <div className="timelines">
        {Object.entries(classTimelines).map(([objectClass, times], index) => (
          <div key={index} className="timeline-wrapper">
            
            {/* Назва об'єкта */}
            <h4 className="timeline-title">{objectClass}</h4>

            {/* Контейнер для таймлайну та кнопок */}
            <div className="timeline-container">
              <button className="timeline-btn" onClick={() => jumpToPreviousTime(times)}>◀</button>
              
              <div 
                className="timeline"
                ref={(el) => (timelineRefs.current[objectClass] = el)} // ✅ Додаємо ref
                onClick={(e) => {
                  if (!videoRef.current || !videoRef.current.duration || !timelineRefs.current[objectClass]) return;

                  const timelineRect = timelineRefs.current[objectClass].getBoundingClientRect();
                  const clickX = e.clientX - timelineRect.left;
                  const relativePosition = clickX / timelineRect.width; // ✅ Правильний розрахунок
                  const newTime = relativePosition * videoRef.current.duration;

                  console.log(`🎯 Click at ${clickX}px / ${timelineRect.width}px → ${newTime}s`);
                  videoRef.current.currentTime = newTime;
                }}
              >
                {/* Прогрес-бар, що фарбує таймлайн */}
                <div className="timeline-progress" style={{ width: `${progress}%` }}></div>
                
                {/* Маркери розпізнаних об'єктів */}
                {times.map((time, idx) => (
                  <div
                    key={idx}
                    className="timeline-marker"
                    style={{ left: `${(time / videoRef.current.duration) * 100}%` }}
                  ></div>
                ))}
              </div>

              <button className="timeline-btn" onClick={() => jumpToNextTime(times)}>▶</button>
            </div>

          </div>
        ))}
      </div>
    )}





      <div className="file-upload">
        <label>
          Upload JSON Report:
          <input type="file" accept=".json" onChange={handleJsonUpload} />
        </label>
      </div>
      <button onClick={handleDownloadJson} disabled={!responseJson} style={{ backgroundColor: responseJson ? "green" : "" }}>
        Download JSON
      </button>
    </div>
  );
};

export default VideoBox;

